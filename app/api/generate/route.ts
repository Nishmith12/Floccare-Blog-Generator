import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Setup Google Client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // FIXED: Switched to "gemini-pro" which is the most stable free model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent(`
      You are an expert technical blog writer.
      Task: Write a comprehensive 1000-word blog post.
      Topic: "${prompt}"
      
      Requirements:
      - Use Markdown formatting (# for Title, ## for Headers).
      - Be highly detailed and professional.
      - STRICTLY ensure the content is long (approx 1000 words).
    `);

    const response = result.response;
    const text = response.text();

    return NextResponse.json({ output: text });

  } catch (error) {
    console.error("Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}