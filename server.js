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
      Analyze this image of a school vending machine. The vending machine consists of a 4x3 grid of slots containing snacks and drinks.
      The slots are mapped as follows:
      - Row A (Top Row): A1, A2, A3, A4 (left-to-right)
      - Row B (Middle Row): B1, B2, B3, B4 (left-to-right)
      - Row C (Bottom Row): C1, C2, C3, C4 (left-to-right)

      For each of the 12 slot IDs (A1 to C4), determine if the item in that slot is "in stock" (at least one item is present in the slot) or "sold out" (the slot is empty or a sold out message/tag is present).
      - If items are visible: set to true.
      - If the slot is empty or clearly sold out: set to false.

      Return a strict, valid JSON object mapping every slot ID (from A1 to C4) to its stock status (boolean).
      Example Output:
      {
        "A1": true,
        "A2": true,
        "A3": false,
        "A4": true,
        "B1": true,
        "B2": false,
        "B3": true,
        "B4": true,
        "C1": true,
        "C2": true,
        "C3": true,
        "C4": false
      }

      Do not include any explanation, intro text, markdown block wraps, or formatting other than the valid JSON object itself. Respond ONLY with raw JSON.
    `;

    // Attempt to generate content using fallback models
    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash"];
    let result = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting analysis with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
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
    
    // Validate slot IDs
    const requiredKeys = [
      "A1", "A2", "A3", "A4",
      "B1", "B2", "B3", "B4",
      "C1", "C2", "C3", "C4"
    ];
    
    const validatedData = {};
    requiredKeys.forEach(key => {
      if (key in parsedData) {
        validatedData[key] = Boolean(parsedData[key]);
      } else {
        validatedData[key] = true;
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
