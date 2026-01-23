
import { AppSettings } from "../types";

/**
 * Processes an image using Groq (Llama 3.2 Vision) to extract microstock metadata or generate prompts.
 */
export const processImageWithGroq = async (imageBase64: string, settings: AppSettings, apiKey: string) => {
  if (!apiKey) throw new Error("API Key missing for Groq processing.");

  const base64Data = imageBase64.split(',')[1];

  let systemPrompt = "";
  if (settings.mode === 'Metadata') {
    systemPrompt = `
      Act as a microstock metadata expert. Analyze the image and return ONLY a JSON object.
      Required Format:
      {
        "title": "SEO title (${settings.minTitle}-${settings.maxTitle} words)",
        "keywords": ["tag1", "tag2", ... exactly ${settings.maxKeywords} items],
        "categories": ["Category1", "Category2"],
        "description": "Summary (${settings.minDesc}-${settings.maxDesc} words)"
      }
      Target: ${settings.platform}.
      ${settings.singleWordKeywords ? 'Keywords must be single words only.' : ''}
    `;
  } else {
    systemPrompt = `Analyze this image and provide a highly detailed Generative AI prompt. Return ONLY JSON: { "prompt": "..." }`;
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
      throw new Error(err.error?.message || "Groq API error.");
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Groq Error:", error);
    throw error;
  }
};
