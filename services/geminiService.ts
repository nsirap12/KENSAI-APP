
import { GoogleGenAI, Type } from "@google/genai";

export const suggestDescriptions = async (keyword: string): Promise<string[]> => {
  if (!keyword.trim()) {
    return [];
  }
  
  // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    console.error("API_KEY environment variable not set");
    return [];
  }
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    // Using 'gemini-3-flash-preview' for basic text tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 professional-sounding service descriptions for a price quote, based on the keyword: "${keyword}". Each description should be a single, concise phrase, ready to be used in an invoice.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            descriptions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
          },
        },
      },
    });

    const jsonString = response.text;
    if (!jsonString) return [];
    
    const parsed = JSON.parse(jsonString);
    
    if (parsed && Array.isArray(parsed.descriptions)) {
      return parsed.descriptions;
    }
    
    return [];

  } catch (error) {
    console.error("Error fetching suggestions from Gemini API:", error);
    return [];
  }
};
