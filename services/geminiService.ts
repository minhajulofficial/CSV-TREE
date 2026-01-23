
import { GoogleGenAI, Type } from "@google/genai";
import { AppSettings } from "../types";

/**
 * Processes an image using Gemini AI to extract microstock metadata or generate prompts.
 * Strictly adheres to using process.env.API_KEY as per security guidelines.
 */
export const processImageWithGemini = async (imageBase64: string, settings: AppSettings) => {
  try {
    const mimeType = imageBase64.match(/data:([^;]+);base64/)?.[1] || "image/jpeg";
    const base64Data = imageBase64.split(',')[1];

    // API key must be obtained exclusively from process.env.API_KEY
    if (!process.env.API_KEY) {
      throw new Error("Gemini API Key is not configured in the environment.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let systemPrompt = "";
    let responseSchema: any = {};

    if (settings.mode === 'Metadata') {
      systemPrompt = `
        Analyze this image for professional microstock metadata (Target: ${settings.platform}).
        Output MUST be in strict JSON format.
        
        Requirements:
        - Title: SEO optimized, natural language, ${settings.minTitle} to ${settings.maxTitle} words.
        - Keywords: Exact array of tags, ${settings.minKeywords} to ${settings.maxKeywords} items.
        - Categories: Exactly 2 appropriate stock categories.
        - Description: Summary of subject matter, ${settings.minDesc} to ${settings.maxDesc} words.
        ${settings.singleWordKeywords ? '- CONSTRAINT: Every keyword must be a single word (no spaces).' : ''}
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
      systemPrompt = "Act as a Prompt Engineering Specialist. Reverse-engineer this image to provide the most effective AI generation prompt (Midjourney/DALL-E style). Output format: { \"prompt\": \"...\" }";
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

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Critical Failure:", error);
    throw new Error(error.message || "Gemini engine failed to respond. Verify your environment configuration.");
  }
};
