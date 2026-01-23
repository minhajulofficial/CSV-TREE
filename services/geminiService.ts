
import { GoogleGenAI, Type } from "@google/genai";
import { AppSettings, APIKeyRecord } from "../types";

/**
 * Robustly parses JSON from AI response, handling potential markdown wrappers or prefixes.
 */
const parseAIResponse = (text: string) => {
  try {
    // Attempt direct parse first
    return JSON.parse(text);
  } catch (e) {
    // Look for JSON block in markdown (```json ... ```)
    const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/{[\s\S]*}/);
    if (match) {
      try {
        return JSON.parse(match[1] || match[0]);
      } catch (innerError) {
        throw new Error("AI returned invalid JSON structure.");
      }
    }
    throw new Error("Could not find valid JSON in AI response.");
  }
};

export const processImageWithGemini = async (imageBase64: string, settings: AppSettings, fileName: string, customKeys?: Record<string, APIKeyRecord>) => {
  try {
    const mimeType = imageBase64.match(/data:([^;]+);base64/)?.[1] || "image/jpeg";
    const base64Data = imageBase64.split(',')[1];

    // Priority 1: User's custom Gemini Key
    // Priority 2: System environment variable
    let targetKey = process.env.API_KEY;
    
    if (customKeys) {
      const userKey = Object.values(customKeys).find(k => k.provider === 'Gemini');
      if (userKey) targetKey = userKey.key;
    }

    if (!targetKey) {
      throw new Error("Missing Gemini API Key. Please configure it in settings.");
    }

    const ai = new GoogleGenAI({ apiKey: targetKey });
    
    let systemPrompt = "";
    let responseSchema: any = {};

    if (settings.mode === 'Metadata') {
      systemPrompt = `
        Act as a professional microstock metadata expert. 
        Analyze the provided visual data and the filename: "${fileName}".
        
        Generate metadata optimized for ${settings.platform} SEO.
        
        Rules:
        1. Title: Natural language, engaging, ${settings.minTitle} to ${settings.maxTitle} words.
        2. Keywords: Exactly ${settings.maxKeywords} tags. ${settings.singleWordKeywords ? 'Each tag MUST be a single word (no spaces).' : ''}
        3. Categories: Provide exactly 2 appropriate microstock categories (e.g., 'Abstract', 'Nature', 'Business').
        4. Description: Accurate summary, ${settings.minDesc} to ${settings.maxDesc} words.
        
        OUTPUT FORMAT: You MUST return ONLY a JSON object. No extra text.
      `;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          categories: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: { type: Type.STRING }
        },
        required: ["title", "keywords", "description", "categories"]
      };
    } else {
      systemPrompt = `Analyze this asset (Filename: ${fileName}) and reverse-engineer it into a highly detailed generative AI prompt for DALL-E 3 or Midjourney. Return ONLY a JSON object: { "prompt": "..." }`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          prompt: { type: Type.STRING }
        },
        required: ["prompt"]
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: systemPrompt },
          { inlineData: { mimeType: mimeType, data: base64Data } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.15,
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI returned empty response.");
    
    return parseAIResponse(text);
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};
