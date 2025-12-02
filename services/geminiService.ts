import { GoogleGenAI, Type } from "@google/genai";
import { NewSupplementInput } from "../types";

const apiKey = process.env.API_KEY || ''; // Ensure API key is set in environment

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey });

/**
 * Parses unstructured text to extract supplement information.
 */
export const parseSupplementText = async (text: string): Promise<NewSupplementInput[]> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const modelId = "gemini-2.5-flash"; // Fast and efficient for text extraction

  const prompt = `
    Analyze the following text which describes a health or supplement regimen.
    Extract all supplements, medications, or vitamins mentioned.
    
    For each item, identify:
    - name: The name of the supplement (translate to English or keep in user's language if specific).
    - dosage: The amount to take (e.g., "500mg", "1 pill"). If not specified, estimate or put "As directed".
    - frequency: When to take it (e.g., "Morning", "Daily", "After workout").
    - reminderTime: If a specific time is mentioned (e.g. "at 8am", "20:00"), extract it in "HH:MM" 24-hour format. If no specific time, leave empty.
    - notes: Any specific instructions (e.g., "Take with food").
    - category: Classify as 'vitamin', 'medicine', 'protein', or 'other'.

    Input text: "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              dosage: { type: Type.STRING },
              frequency: { type: Type.STRING },
              reminderTime: { type: Type.STRING, description: "Time in HH:MM format" },
              notes: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['vitamin', 'medicine', 'protein', 'other'] }
            },
            required: ["name", "category"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    const parsedData = JSON.parse(jsonText) as NewSupplementInput[];
    return parsedData;

  } catch (error) {
    console.error("Error parsing supplement text with Gemini:", error);
    throw new Error("Failed to interpret text. Please try again or enter manually.");
  }
};