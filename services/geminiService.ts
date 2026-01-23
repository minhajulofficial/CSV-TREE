
import { GoogleGenAI, Type } from "@google/genai";
import { AppSettings, APIKeyRecord } from "../types";

/**
 * Parses and validates JSON output from Gemini responses.
 * Ensuring categories are always treated as an array.
 */
const parseAIResponse = (text: string | undefined) => {
  if (!text) throw new Error("AI returned empty content.");
  try {
    const trimmed = text.trim();
    const data = JSON.parse(trimmed);
    
    // Safety check for categories
    if (data.categories && !Array.isArray(data.categories)) {
      data.categories = [String(data.categories)];
    }
    
    return data;
  } catch (e) {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/{[\s\S]*}/);
    if (match) {
      try {
        const data = JSON.parse(match[1] || match[0]);
        if (data.categories && !Array.isArray(data.categories)) {
          data.categories = [String(data.categories)];
        }
        return data;
      } catch (innerError) {
        throw new Error("Invalid metadata format received from AI.");
      }
    }
    throw new Error("Failed to extract structured data from response.");
  }
};

export const processImageWithGemini = async (imageBase64: string, settings: AppSettings, fileName: string, customKeys?: Record<string, APIKeyRecord>) => {
  try {
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const mimeType = "image/jpeg";

    let targetKey = process.env.API_KEY;
    if (customKeys) {
      const userKey = Object.values(customKeys).find(k => k.provider === 'Gemini');
      if (userKey && userKey.key) targetKey = userKey.key;
    }

    if (!targetKey) throw new Error("No Gemini API key available.");

    const ai = new GoogleGenAI({ apiKey: targetKey });
    
    let promptText = "";
    let schema: any = {};

    if (settings.mode === 'Metadata') {
      promptText = `
        CORE MISSION: Extract professional microstock metadata for ${settings.platform}. 
        Asset Name: "${fileName}".
        
        CONSTRAINTS:
        1. TITLE: Descriptive SEO-friendly (${settings.minTitle}-${settings.maxTitle} words).
        2. KEYWORDS: Exactly ${settings.maxKeywords} relevant tags. ${settings.singleWordKeywords ? 'STRICT: Single-word only.' : ''}
        3. DESCRIPTION: Technical visual summary (${settings.minDesc}-${settings.maxDesc} words).
        4. CATEGORIES: Provide at least 2 relevant stock categories (e.g., Nature, Technology, People).
        
        Return the result in JSON format ONLY.
      `;

      schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          categories: { type: Type.ARRAY, items: { type: Type.STRING }, description: "At least 2 stock categories" },
          description: { type: Type.STRING }
        },
        required: ["title", "keywords", "categories", "description"]
      };
    } else {
      promptText = `Analyze this visual asset and generate a high-fidelity creative prompt (medium, style, lighting, composition).`;
      schema = {
        type: Type.OBJECT,
        properties: {
          prompt: { type: Type.STRING }
        },
        required: ["prompt"]
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText },
            { inlineData: { mimeType: mimeType, data: base64Data } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1,
      }
    });

    return parseAIResponse(response.text);
  } catch (error: any) {
    console.error("Gemini Core Error:", error);
    let msg = error.message || "Unknown vision error.";
    if (msg.includes("400") || msg.includes("INVALID_ARGUMENT")) {
      msg = "Gemini was unable to process this image. It may be too complex or blocked by safety filters.";
    }
    throw new Error(msg);
  }
};
