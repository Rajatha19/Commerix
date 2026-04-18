import { askAiVisionChatCompletionsCreate } from "@/lib/askAiClient";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();
        const { image, storeType, fileName } = body;

        if (!image) {
            return NextResponse.json({ error: "Image is required" }, { status: 400 });
        }

        const isFashion = storeType === 'fashion';

        const fashionInstructions = `You are identifying a FASHION/APPAREL item. Return ONE search phrase that a shopping site would use to find this exact item.
- ALWAYS include: color or style + item type (e.g. "Red Hoodie", "Blue High-Waist Jeans", "White Leather Sneakers", "Black Denim Jacket").
- If you can identify brand or design (e.g. Nike, Adidas, vintage), include it: "Nike Air Max Sneakers", "Blue Striped T-Shirt".
- Do NOT return only one word (e.g. not just "Nike" or "Hoodie"). Minimum 2–3 words.
${fileName ? `- HINT: The user uploaded a file named "${fileName}". Use this as a strong hint.` : ''}`;

        const electronicsInstructions = `You are identifying an ELECTRONICS item. Return ONE search phrase that a shopping site would use to find this EXACT product—not other products from the same brand.
- Identify the correct brand and model series accurately. Examples: "Samsung Galaxy S24 Ultra", "Apple iPhone 15 Pro", "Sony WH-1000XM5".
- VERY IMPORTANT: Pay extremely close attention to brand logos (e.g. Apple logo clearly indicates it's an Apple product).
- CONCEPT/LEAKED DEVICES: If the image is a concept render or mockup (like an iPhone 17 mockup), strictly identify its intended device name based on logos and visual style. Do not output "concept text", just the device name (e.g. "iPhone 17 Pro Max").
- IGNORE ACCESSORIES: If the image ONLY shows a device, do NOT include accessory words like "case", "charger", or "cover".
- CRITICAL: Never return only the brand name.
${fileName ? `- VERY STRONG HINT: The user uploaded a file named "${fileName}". If it contains a product name, use that to accurately determine the exact generation or model, especially for unreleased models.` : ''}`;

        const prompt = isFashion ? fashionInstructions : electronicsInstructions;
        const closing = `\n\nReply with ONLY the search phrase, no quotes, no explanation. 2–6 words.`;

        console.log("Asking AI for product name (storeType:", storeType, ")...");

        const response = await askAiVisionChatCompletionsCreate({
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt + closing },
                        {
                            type: "image_url",
                            image_url: {
                                "url": image,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 80,
        });

        let query = (response.choices[0]?.message?.content?.trim() || "")
            .replace(/^['"]|['"]$/g, "")
            .replace(/\n.*/s, "")
            .trim();
        console.log("AI Raw Output:", response.choices[0]?.message?.content);
        console.log("Cleaned Query:", query);

        // Reject single-word brand-only answers so we don't search "samsung" and get TVs + phones
        const singleWordBrands = new Set(["samsung", "apple", "sony", "lg", "nike", "adidas", "xiaomi", "oneplus", "google", "dell", "hp", "lenovo", "asus", "oppo", "vivo", "realme", "nokia", "motorola", "puma", "zara", "hm", "gucci", "prada"]);
        const words = query.toLowerCase().split(/\s+/).filter(Boolean);
        if (words.length === 1 && singleWordBrands.has(words[0])) {
            console.warn("AI returned brand-only query. Using fallback with product type.");
            query = isFashion ? `${words[0]} clothing` : `${words[0]} device`;
        }

        if (!query) {
            console.warn("AI returned empty string. Using fallback.");
            query = isFashion ? "Fashion item" : "Electronics product";
        }

        return NextResponse.json({ query });

    } catch (error) {
        console.error("DEBUG: Full Error Object:", error);

        let errorMessage = error.message || "Unknown error occurred";
        if (errorMessage.includes("401")) errorMessage = "Invalid API Key - Please check .env";
        if (errorMessage.includes("429")) errorMessage = "Rate Limit Exceeded - Try again later";
        if (errorMessage.includes("503")) errorMessage = "AI Service Unavailable";

        return NextResponse.json(
            { error: `Analysis Failed: ${errorMessage}` },
            { status: 500 }
        );
    }
}
