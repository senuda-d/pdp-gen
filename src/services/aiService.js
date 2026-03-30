import promptMarkdown from "../data/prompt.md?raw";
import samplePDP from "../data/personal_development_planfor_sample.md?raw";

/**
 * Service to generate a Personal Development Plan using Vercel Serverless Function
 * This version hides the API Key from the frontend.
 */

export const generatePDP = async (userAnswers) => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userAnswers,
        promptMarkdown,
        samplePDP,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate your plan.");
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error generating PDP:", error);
    throw error;
  }
};

export const generatePDPStream = async function* (userAnswers) {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userAnswers,
        promptMarkdown,
        samplePDP,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to start stream");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop(); // Keep last incomplete line

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              yield data.text;
            }
          } catch (e) {
            console.error("Error parsing stream chunk:", e);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error generating PDP stream:", error);
    throw error;
  }
};
