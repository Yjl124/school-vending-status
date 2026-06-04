import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load env variables
dotenv.config();
dotenv.config({ path: '.env.local' });

// Initialize Gemini client once at startup
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit to accept base64 image data

app.post('/api/analyze', async (req, res) => {
  const { base64Image } = req.body;
  if (!base64Image) {
    return res.status(400).json({ error: "Missing base64Image in request body" });
  }

  if (!genAI) {
    return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured on the server." });
  }

  try {
    // Extract raw base64 data and mime type
    let cleanBase64 = base64Image;
    let mimeType = "image/jpeg";
    
    const match = base64Image.match(/^data:([^;]+);base64,(.*)$/);
    if (match) {
      mimeType = match[1];
      cleanBase64 = match[2];
    }

    const prompt = `
      Analyze this image of a school vending machine. The vending machine consists of 6 rows (shelves) of items.
      The rows and their corresponding slot ID mappings are as follows:
      - Row 6 (Top Shelf): 60, 61, 62, 63, 64, 65, 66, 67 (8 slots, left-to-right)
      - Row 5 (Second Shelf): 50, 51, 52, 53, 54, 55, 56, 57 (8 slots, left-to-right)
      - Row 4 (Third Shelf): 40, 41, 42, 43, 44, 45, 46, 47 (8 slots, left-to-right)
      - Row 3 (Fourth Shelf): 30, 31, 32, 33, 34, 35, 36, 37 (8 slots, left-to-right)
      - Row 2 (Fifth Shelf): 20, 21, 22, 23, 24, 25, 26, 27 (8 slots, left-to-right)
      - Row 1 (Bottom Shelf): 11, 13, 15, 17 (4 slots, left-to-right)

      For each of the 44 slot IDs, determine if the item in that slot is "in stock" (at least one item is present) or "sold out" (empty).
      CRITICAL INSTRUCTIONS for accuracy:
      - Look closely at the metal coils. If you only see an empty metal coil and the back of the machine, the slot is EMPTY (false).
      - Beware of glare, reflections on the glass, or shadows. These are NOT items.
      - If the slot is empty or clearly sold out: set to false.
      - If a physical item is visible inside the coil: set to true.

      Return a strict, valid JSON object mapping every single slot ID (from the list of 44 IDs above) to its stock status (boolean true/false).
      Example Output:
      {
        "60": false,
        "61": false,
        "62": true,
        "63": true,
        "64": false,
        "65": true,
        "66": true,
        "67": true,
        "50": true,
        "51": true,
        "52": true,
        "53": true,
        "54": true,
        "55": true,
        "56": true,
        "57": true,
        "40": true,
        "41": true,
        "42": false,
        "43": false,
        "44": true,
        "45": false,
        "46": false,
        "47": true,
        "30": true,
        "31": false,
        "32": false,
        "33": false,
        "34": true,
        "35": true,
        "36": true,
        "37": true,
        "20": true,
        "21": true,
        "22": true,
        "23": true,
        "24": true,
        "25": true,
        "26": true,
        "27": true,
        "11": false,
        "13": true,
        "15": true,
        "17": true
      }

      Respond ONLY with the raw JSON object. Do not include markdown blocks or any other text.
    `;

    // Attempt to generate content using fallback models
    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash"];
    let result = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting analysis with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json"
          }
        });
        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType
            }
          }
        ]);
        break; // Successfully generated content, stop loop
      } catch (err) {
        console.warn(`Model ${modelName} failed or was unavailable:`, err.message || err);
        lastError = err;
      }
    }

    if (!result) {
      throw lastError || new Error("All generative AI models failed to respond.");
    }

    const textResponse = result.response.text().trim();
    console.log("Raw Gemini Response from backend:", textResponse);

    let jsonText = textResponse;
    const jsonMatch = textResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    const parsedData = JSON.parse(jsonText);
    
    // Flatten the parsed data just in case it's nested
    const flattenObject = (obj) => {
      let res = {};
      for (const i in obj) {
        if (typeof obj[i] === 'object' && !Array.isArray(obj[i]) && obj[i] !== null) {
          const temp = flattenObject(obj[i]);
          for (const j in temp) {
            res[j] = temp[j];
          }
        } else {
          res[i] = obj[i];
        }
      }
      return res;
    };
    const flatData = flattenObject(parsedData);
    
    // Validate slot IDs
    const requiredKeys = [
      "60", "61", "62", "63", "64", "65", "66", "67",
      "50", "51", "52", "53", "54", "55", "56", "57",
      "40", "41", "42", "43", "44", "45", "46", "47",
      "30", "31", "32", "33", "34", "35", "36", "37",
      "20", "21", "22", "23", "24", "25", "26", "27",
      "11", "13", "15", "17"
    ];
    
    const validatedData = {};
    requiredKeys.forEach(key => {
      if (key in flatData) {
        let val = flatData[key];
        if (typeof val === 'string') {
          validatedData[key] = val.toLowerCase() === 'true';
        } else {
          validatedData[key] = Boolean(val);
        }
      }
    });

    res.json(validatedData);
  } catch (error) {
    console.error("Gemini API Error in backend:", error);
    res.status(500).json({ error: error.message || "An error occurred during Gemini analysis." });
  }
});

app.get('/api/status', (req, res) => {
  res.json({ geminiReady: !!process.env.GEMINI_API_KEY });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Secure Gemini proxy server running on port ${PORT}`);
});

// Trigger redeployment: 2026-06-04T08:20:10+09:00
