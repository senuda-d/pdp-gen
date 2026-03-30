import { GoogleGenerativeAI } from "@google/generative-ai";
import promptMarkdown from "../data/prompt.md?raw";
import samplePDP from "../data/personal_development_planfor_sample.md?raw";

/**
 * Service to generate a Personal Development Plan using Gemini AI
 * Requires VITE_GEMINI_API_KEY in .env
 */
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const generatePDP = async (userAnswers) => {
  try {
    if (!API_KEY) {
      throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    // Using Gemini 2.5 Flash as it is listed as the stable model for this API key.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Construct the final prompt by combining the template, the sample, and the user's answers
    const finalPrompt = `
      ${promptMarkdown}

      --- SAMPLE PDP FOR STRUCTURE REFERENCE ---
      ${samplePDP}

      --- USER ANSWERS TO QUESTIONS ---
      ${JSON.stringify(userAnswers, null, 2)}

      Please generate the final Personal Development Plan now based on the instructions in the prompt.
    `;

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error generating PDP:", error);
    throw error;
  }
};

export const generatePDPStream = async function* (userAnswers) {
  try {
    if (!API_KEY) {
      throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const finalPrompt = `
      ${promptData.prompt}

      --- SAMPLE PDP FOR STRUCTURE REFERENCE ---
      ${samplePDP}

      --- USER ANSWERS TO QUESTIONS ---
      ${JSON.stringify(userAnswers, null, 2)}

      Please generate the final Personal Development Plan now based on the instructions in the prompt.
    `;

    const result = await model.generateContentStream(finalPrompt);
    for await (const chunk of result.stream) {
      if (chunk.text) {
        yield chunk.text();
      }
    }
  } catch (error) {
    console.error("Error generating PDP stream:", error);
    throw error;
  }
};
