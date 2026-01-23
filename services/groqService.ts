
import { AppSettings } from "../types";

/**
 * Processes an image using Groq's Llama 3.2 Vision capabilities.
 */
export const processImageWithGroq = async (imageBase64: string, settings: AppSettings, apiKey: string) => {
  if (!apiKey) throw new Error("Groq API key required.");

  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

  let systemPrompt = "";
  if (settings.mode === 'Metadata') {
    systemPrompt = `
      Professional microstock metadata expert for ${settings.platform}.
      Analyze image and return ONLY JSON.
      
      Schema:
      {
        "title": "SEO title (${settings.minTitle}-${settings.maxTitle} words)",
        "keywords": [exactly ${settings.maxKeywords} tags],
        "categories": ["Category 1", "Category 2"],
        "description": "${settings.minDesc}-${settings.maxDesc} words"
      }
      
      Rules:
      - Categories MUST be an array of strings.
      ${settings.singleWordKeywords ? '- Keywords must be single words.' : ''}
    `;
  } else {
    systemPrompt = `Analyze image and return a detailed AI generation prompt as JSON: { "prompt": "..." }`;
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: systemPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Data}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Groq service unavailable.");
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    // Final check for categories array
    if (result.categories && !Array.isArray(result.categories)) {
      result.categories = [String(result.categories)];
    }
    
    return result;
  } catch (error: any) {
    console.error("Groq Processing Error:", error);
    throw new Error(error.message || "Failed to analyze via Groq.");
  }
};
