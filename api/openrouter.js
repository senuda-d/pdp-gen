export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { userAnswers, promptMarkdown, samplePDP, stream = false, model = "google/gemini-2.5-flash:free" } = await request.json();

    if (!userAnswers) {
      return new Response(JSON.stringify({ error: "Missing user answers" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API Key is not configured." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const finalPrompt = `
      ${promptMarkdown}

      --- SAMPLE PDP FOR STRUCTURE REFERENCE ---
      ${samplePDP}

      --- USER ANSWERS TO QUESTIONS ---
      ${JSON.stringify(userAnswers, null, 2)}

      Please generate the final Personal Development Plan now based on the instructions in the prompt.
    `;

    const requestBody = {
      model: model, 
      messages: [{ role: "user", content: finalPrompt }],
      stream: stream,
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://pdp-gen.local", // Optional: provide your site URL
        "X-Title": "PDP Generator", // Optional: provide your site title
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter API error:", response.status, errText);
      let errorMsg = "Failed to generate PDP";
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error && parsed.error.message) {
          errorMsg = parsed.error.message;
        }
      } catch (e) {
        // use default error Msg
      }
      return new Response(JSON.stringify({ error: "Failed to generate PDP", message: errorMsg }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (stream) {
      // Stream the response directly since OpenRouter's SSE format is supported by aiService.js
      return new Response(response.body, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    } else {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ text }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Handler Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process request", message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}