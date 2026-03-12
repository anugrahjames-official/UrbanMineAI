"use server";

import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { getCurrentMarketPricesContext } from "@/services/metals";

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

    // Fetch dynamic market data context from Metals.Dev API (via our service)
    const marketContext = await getCurrentMarketPricesContext();

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
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-lite" });

    const prompt = `
    Analyze these images of a SINGLE e-waste item (captured from different angles) for recycling purposes. 
    Identify the components, estimate rare earth element (REE) yield, and provide a grading.
    
    MARKET CONTEXT:
    ${marketContext}
    
    INSTRUCTIONS:
    1. Identify the primary material composition of the item.
    2. Use the provided MARKET CONTEXT prices to calculate a realistic "estimatedValue" per kg. 
    3. For REE content, extremely small values are valuable. DO NOT round to 0g or $0.00. Show precise decimals (e.g., 0.004g, 0.012g). For "estimatedValue", use up to 6 decimal places if needed to show non-zero value (e.g. $0.000420).
    
    Return ONLY a JSON object with the following structure:
    {
      "classification": "Main component name (e.g., Laptop Motherboard)",
      "category": "Broad E-Waste category (e.g., PCB, Battery, Screen, Cable, Whole Unit, Mixed, Other)",
      "grade": "Quality grade (e.g., Grade A, High Grade PCB)",
      "condition": "Physical condition (e.g., Intact, Damaged)",
      "estimatedValue": "Price per kg in USD (e.g., $5.42)",
      "totalValue": "Total estimated value of the item in USD (e.g., $12.50)",
      "weight": "Estimated weight in kg (e.g., 0.5 kg)", 
      "description": "A concise, professional description of the item (max 30 words), mentioning visible features and condition.",
      "reeContent": [
        { 
          "name": "Element name (e.g., Gold)", 
          "value": "Yield (e.g., 0.005g)", 
          "percentage": 0-100,
          "estimatedValue": "Calculated value of this element in USD (e.g., $0.30)"
        }
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

    // Recalculate Total Value to fix hallucinations where Total == Per Kg regardless of weight
    if (analysis.estimatedValue && analysis.weight) {
        const pricePerKg = parseFloat(analysis.estimatedValue.toString().replace(/[^0-9.]/g, '')) || 0;
        const weightKg = parseFloat(analysis.weight.toString().replace(/[^0-9.]/g, '')) || 0;

        if (pricePerKg > 0 && weightKg > 0) {
            const total = pricePerKg * weightKg;
            // Format as currency
            analysis.totalValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(total);
        }
    }

    return {
        ...analysis,
        image_url: uploadedUrls[0], // Primary image
        additional_images: uploadedUrls.slice(1) // Other angles
    };
}

interface ItemData {
    image_url: string;
    additional_images?: string[]; // New field for slideshow
    classification?: string;
    category?: string; // New field
    grade?: string;
    condition?: string;
    estimatedValue?: string | number;
    totalValue?: string | number; // New field for total item value
    weight?: string;
    reeContent?: Array<{ name: string; value: string; percentage: number; estimatedValue?: string }>;
    title?: string;
    description?: string;
    location?: string;
    duration?: string;
    packaging?: string;
    logistics?: string;
    confidence?: number;
}

export async function saveItem(itemData: ItemData, status: "listed" | "pending" = "listed") {
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
            // Check if schema supports title/description/location explicitly, otherwise likely in metadata or strict columns
            // Based on ListingCard, we use metadata.title, so let's put it there primarily, but maybe root too?
            // Let's assume schema is flexible or we rely on metadata for these extras if columns don't exist.
            // But 'location' is often a root column for geospatial. 
            // Implementation Plan said: "Ensure location is saved to the items table column (if exists) or metadata."
            // I'll put them in metadata for safety, and 'location' in root IF it exists (Supabase ignores extra fields? No, it errors).
            // Safest bet for 'location' without schema check is metadata, UNLESS we know for sure.
            // However, ListingCard checked `item.location`. 
            // Let's try to put location in root. If it fails, user will report error. 
            // Actually, I'll put it in metadata AND try to update the user's location if it's their default? No.
            // Let's stick to metadata for flexible fields to avoid SQL errors if columns miss.
            // WAIT - ListingCard: `const location = item.location || item.users?.location`. 
            // If I save to metadata.location, I should update ListingCard to check there too.
            // ListingCard: `const metadata = item.metadata || {}; ... const location = item.location || item.users?.location ...`
            // It does NOT check metadata.location. 
            // I should update ListingCard to check `metadata.location` as well? 
            // OR I should assume `items` has `location`. 
            // Let's look at `marketplace.ts` `fetchListings` again. users join has location. 
            // I'll save to `metadata` for now to be safe, and update `ListingCard` to read from `metadata.location` as first priority. 
            // AND I will try to pass `title` and `description` in metadata.
            metadata: {
                ...itemData,
                title: itemData.title || itemData.classification,
                category: itemData.category, // Save category
                location: itemData.location,
                duration: itemData.duration || "24h",
                packaging: itemData.packaging || "Box",
                logistics: itemData.logistics || "Shipping",
                start_time: new Date().toISOString(),
                additional_images: itemData.additional_images,
                confidence: itemData.confidence || 0.95,
                yields: itemData.reeContent, // map reeContent to yields for BidModal compatibility
            },
            status: status,
        });

    if (error) {
        console.error("Save Error:", error);
        throw new Error("Failed to save item: " + error.message);
    }

    revalidatePath("/dealer/inventory");
    revalidatePath("/marketplace"); // Update marketplace too
    revalidatePath("/dealer/dashboard");

    return { success: true };
}
