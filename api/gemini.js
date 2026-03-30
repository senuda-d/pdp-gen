import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  runtime: 'edge',
};

// Initialize once
let genAI;

export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { userAnswers, promptMarkdown, samplePDP, stream = false } = await request.json();

    if (!userAnswers) {
      return new Response(JSON.stringify({ error: "Missing user answers" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured in Vercel environment variables." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!genAI) {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const finalPrompt = `
      ${promptMarkdown}

      --- SAMPLE PDP FOR STRUCTURE REFERENCE ---
      ${samplePDP}

      --- USER ANSWERS TO QUESTIONS ---
      ${JSON.stringify(userAnswers, null, 2)}

      Please generate the final Personal Development Plan now based on the instructions in the prompt.
    `;

    if (stream) {
      const result = await model.generateContentStream(finalPrompt);
      const encoder = new TextEncoder();

      const customStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`));
            }
            controller.close();
          } catch (e) {
            controller.error(e);
          }
        }
      });

      return new Response(customStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    } else {
      const result = await model.generateContent(finalPrompt);
      const response = await result.response;
      const text = response.text();
      return new Response(JSON.stringify({ text }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate PDP", message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}