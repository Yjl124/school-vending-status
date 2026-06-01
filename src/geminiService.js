// Retrieve the backend API URL (defaults to localhost:3001 in development)
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

// Check if Gemini is configured on the backend server
export const isGeminiConfigured = async () => {
  try {
    const response = await fetch(`${getApiUrl()}/api/status`);
    if (!response.ok) return false;
    const data = await response.json();
    return !!data.geminiReady;
  } catch (e) {
    console.error("Failed to query Gemini backend status:", e);
    return false;
  }
};

// Proxy image analysis request to the backend server
export const analyzeVendingMachineImage = async (base64Image) => {
  try {
    const response = await fetch(`${getApiUrl()}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ base64Image })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in analyzeVendingMachineImage proxy request:", error);
    throw error;
  }
};
