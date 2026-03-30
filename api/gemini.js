import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userAnswers, promptMarkdown, samplePDP, stream = false } = req.body;

  if (!userAnswers) {
    return res.status(400).json({ error: "Missing user answers" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const finalPrompt = `
      ${promptMarkdown}

      --- SAMPLE PDP FOR STRUCTURE REFERENCE ---
      ${samplePDP}

      --- USER ANSWERS TO QUESTIONS ---
      ${JSON.stringify(userAnswers, null, 2)}

      Please generate the final Personal Development Plan now based on the instructions in the prompt.
    `;

    if (stream) {
      // Vercel supports streaming via Serverless Functions but requires specific headers
      // Note: For heavy streaming applications, Edge Functions are often preferred
      const result = await model.generateContentStream(finalPrompt);
      
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      });

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
      
      res.end();
    } else {
      const result = await model.generateContent(finalPrompt);
      const response = await result.response;
      const text = response.text();
      return res.status(200).json({ text });
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: "Failed to generate PDP", message: error.message });
  }
}
