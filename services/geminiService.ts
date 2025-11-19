import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini Client
// NOTE: Accessing process.env.API_KEY directly as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Edits an image using Gemini 2.5 Flash Image (Nano Banana).
 * It sends the original image and a text prompt to the model.
 * 
 * @param base64Image The base64 string of the source image (with or without prefix).
 * @param prompt The text instruction for editing.
 * @returns A promise resolving to the new base64 image string.
 */
export const editImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    // Remove data URL prefix if present to get raw base64
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png', // Assuming PNG for canvas exports
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    // Extract image from response
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData && part.inlineData.data) {
      const newBase64 = `data:image/png;base64,${part.inlineData.data}`;
      return newBase64;
    } else {
      throw new Error("No image data received from Gemini.");
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};