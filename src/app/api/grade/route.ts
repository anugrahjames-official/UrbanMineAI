import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { image } = await req.json(); // base64 image

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-lite" });

    const prompt = `
      Analyze this e-waste image for recycling purposes. 
      Identify the components, estimate rare earth element (REE) yield, and provide a grading.
      
      Return ONLY a JSON object with the following structure:
      {
        "classification": "Main component name (e.g., Laptop Motherboard)",
        "grade": "Quality grade (e.g., Grade A, High Grade PCB)",
        "condition": "Physical condition (e.g., Intact, Damaged)",
        "estimatedValue": "Price per kg in USD (e.g., $5.42)",
        "reeContent": [
          { "name": "Element name", "value": "Yield in grams or %", "percentage": 0-100 }
        ]
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image.split(",")[1],
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (Gemini sometimes adds markdown blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const gradingData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    return NextResponse.json(gradingData);
  } catch (error) {
    console.error("AI Grading Error:", error);
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}
