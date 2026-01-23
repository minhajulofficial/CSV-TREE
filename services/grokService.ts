
import { AppSettings } from "../types";

export const validateGrokKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey || apiKey.trim() === "") return false;
  try {
    // Attempt to fetch models to verify key validity
    const response = await fetch("https://api.x.ai/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error("Grok validation failed:", error);
    return false;
  }
};

export const processImageWithGrok = async (imageBase64: string, settings: AppSettings, apiKey: string) => {
  if (!apiKey) throw new Error("Grok API Key missing. Please provide it in your profile settings.");

  const mimeType = imageBase64.match(/data:([^;]+);base64/)?.[1] || "image/jpeg";
  const base64Data = imageBase64.split(',')[1];

  let systemPrompt = "";
  if (settings.mode === 'Metadata') {
    systemPrompt = `
      You are an expert microstock metadata generator. Analyze the provided image.
      Output exactly in JSON format:
      {
        "title": "SEO title (${settings.minTitle}-${settings.maxTitle} words)",
        "keywords": ["tag1", "tag2", ... exactly ${settings.maxKeywords} tags],
        "categories": ["Category1", "Category2"],
        "description": "Detailed description (${settings.minDesc}-${settings.maxDesc} words)"
      }
      Target Platform: ${settings.platform}. 
      ${settings.singleWordKeywords ? 'Keywords MUST be single words.' : ''}
    `;
  } else {
    systemPrompt = `
      You are a visual engineer. Analyze this image and reverse-engineer it into a detailed generative AI prompt.
      Output exactly in JSON format: { "prompt": "..." }
    `;
  }

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "grok-vision-beta",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: systemPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || `Grok API error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Grok Processing Error:", error);
    throw error;
  }
};
