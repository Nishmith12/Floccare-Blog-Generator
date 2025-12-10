import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, tone } = await req.json();

    // 1. Basic Validation (Security Best Practice)
    if (!prompt) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Dynamic Temperature (AI Engineering)
    // Professional = Lower temp (more deterministic/factual)
    // Storyteller = Higher temp (more creative/random)
    let temperature = 0.7;
    if (tone === "Professional") temperature = 0.3;
    if (tone === "Storyteller") temperature = 0.9;

    // 3. Configure generation parameters
    const generationConfig = {
      temperature: temperature,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192, // Ensure enough space for 1000+ words
    };

    // 4. Safety Settings (Prevent over-blocking on health topics)
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
    
    // 5. Generate with the advanced config
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `
        You are an expert blog writer with a specific style: ${tone || "Professional"}.
        
        Task: Write a comprehensive 1000-word blog post.
        Topic: "${prompt}"
        
        Requirements:
        - Use Markdown formatting (# for Title, ## for Headers).
        - Tone: ${tone || "Professional and Technical"}.
        - Structure: Introduction, 4-5 Deep Sections, Conclusion.
        - STRICTLY ensure the content is long (approx 1000 words).
      `}]}],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    const text = response.text();

    return NextResponse.json({ output: text });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}