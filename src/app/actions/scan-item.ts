"use server";

import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function analyzeImage(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const files = formData.getAll("images") as File[];
    if (!files || files.length === 0) {
        throw new Error("No images provided");
    }

    const uploadedUrls: string[] = [];
    const inlineDataParts = [];

    // 1. Upload all to Supabase & Prepare for Gemini
    for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("items")
            .upload(filePath, file);

        if (uploadError) {
            console.error("Upload Error:", uploadError);
            continue; // Skip failed uploads? Or fail whole batch? Let's skip for now but log.
        }

        const { data: { publicUrl } } = supabase.storage
            .from("items")
            .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);

        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");

        inlineDataParts.push({
            inlineData: {
                data: base64Data,
                mimeType: file.type,
            },
        });
    }

    if (uploadedUrls.length === 0) {
        throw new Error("Failed to upload any images");
    }

    // 2. Analyze with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Analyze these images of a SINGLE e-waste item (captured from different angles) for recycling purposes. 
    Identify the components, estimate rare earth element (REE) yield, and provide a grading.
    
    Return ONLY a JSON object with the following structure:
    {
      "classification": "Main component name (e.g., Laptop Motherboard)",
      "grade": "Quality grade (e.g., Grade A, High Grade PCB)",
      "condition": "Physical condition (e.g., Intact, Damaged)",
      "estimatedValue": "Price per kg in USD (e.g., $5.42)",
      "weight": "Estimated weight in kg (e.g., 0.5 kg)", 
      "reeContent": [
        { "name": "Element name", "value": "Yield (e.g., 0.2g)", "percentage": 0-100 }
      ]
    }
  `;

    const result = await model.generateContent([
        prompt,
        ...inlineDataParts
    ]);

    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    return {
        ...analysis,
        image_url: uploadedUrls[0], // Primary image
        additional_images: uploadedUrls.slice(1) // Other angles
    };
}

interface ItemData {
    image_url: string;
    classification?: string;
    grade?: string;
    condition?: string;
    estimatedValue?: string | number;
    weight?: string;
    reeContent?: Array<{ name: string; value: string; percentage: number }>;
}

export async function saveItem(itemData: ItemData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { error } = await supabase
        .from("items")
        .insert({
            user_id: user.id,
            image_url: itemData.image_url,
            metadata: itemData,
            status: "pending", // Default status
        });

    if (error) {
        console.error("Save Error:", error);
        throw new Error("Failed to save item");
    }

    revalidatePath("/dealer/inventory");
    revalidatePath("/dealer/dashboard");

    return { success: true };
}
