import { askAiChatCompletionsCreate, askAiVisionChatCompletionsCreate } from "@/lib/askAiClient";
import { searchWeb } from "@/lib/webSearch";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const CATEGORIES = ["Mobiles", "Televisions", "Laptops", "Headphones", "Earbuds", "Watches", "Speakers", "Accessories", "Tablets"];
const FASHION_CATEGORIES = ["Men", "Women", "Footwear", "Accessories", "Streetwear", "Luxury"];

function stripMarkdownAndEmojis(text) {
    if (!text || typeof text !== "string") return "";
    return text
        .replace(/\*\*|__|\*|_|`|#|\[|\]|\(|\)/g, " ")
        .replace(/\s+/g, " ")
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
        .trim();
}

function cleanBullets(text) {
    if (!text || typeof text !== "string") return "";
    return text
        .split(/\n/)
        .map((line) => line.replace(/^[\s\-*•·]\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 4)
        .map((line) => (line.startsWith("•") ? line : "• " + line))
        .join("\n");
}

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { searchParams } = new URL(request.url)
        const rawStoreType = searchParams.get('type')
        const storeType = ["electronics", "fashion"].includes(rawStoreType) ? rawStoreType : "electronics"
        const storeId = await authSeller(userId, storeType);
        if (!storeId) {
            return NextResponse.json({ error: "not authorized" }, { status: 401 });
        }
        const categories = storeType === "fashion" ? FASHION_CATEGORIES : CATEGORIES;

        const body = await request.json();
        const images = Array.isArray(body?.images) ? body.images : [];

        if (images.length === 0) {
            return NextResponse.json(
                { error: "Please upload at least one product image first" },
                { status: 400 }
            );
        }

        const userContent = [];

        for (const img of images) {
            const base64 = img.base64;
            const mimeType = img.mimeType || "image/jpeg";
            if (!base64 || typeof base64 !== "string") continue;
            const url = `data:${mimeType};base64,${base64}`;
            userContent.push({ type: "image_url", image_url: { url } });
        }

        if (userContent.length === 0) {
            return NextResponse.json(
                { error: "Could not read product images. Please try again." },
                { status: 400 }
            );
        }

        userContent.push({
            type: "text",
            text: `Based ONLY on the product images above, generate product details.

Output valid JSON with keys: name, description, features, category, search_query.
- "name": your best guess at the real-world product name (brand + model if visible). If you clearly see an Apple logo, the name MUST start with "Apple iPhone". If you see a Samsung logo, start with "Samsung Galaxy". Do NOT invent a brand that is not visible.
- "description": 2–3 plain sentences.
- "features": max 4 short bullet points (plain text, newline-separated).
- "category": exactly one of: ${categories.join(", ")}.
- "search_query": a short, high-signal query string that will be used to look this product up on the web to identify the exact brand/model. Include any visible logo (e.g. Apple, Samsung), series (iPhone, Galaxy), color, camera count, and any visible text or numbers on the device. Do NOT add prices or generic marketing words.`,
        });

        // Vision model call: must go through Gemini (supports image_url content)
        const response = await askAiVisionChatCompletionsCreate({
            messages: [
                {
                    role: "system",
                content: `You are generating product details ONLY based on the provided product images. Do not assume features that are not visually inferable. If uncertain, stay generic but accurate.

Generate STRICTLY:
- Product name: 1 clean line, no emojis, no markdown. If you clearly see an Apple logo, the name MUST start with "Apple iPhone". If you see a Samsung logo, start with "Samsung Galaxy". Do NOT invent a brand that is not visible.
- Short description: 2–3 sentences only. No prices, no offers, no marketing fluff.
- Features: max 4 short bullet points (plain text, newline-separated). Only what you can see or infer from the image.
- Category: exactly one of: ${categories.join(", ")}.
- Search query: a short, high-signal query string to look this exact product up on the web (brand, series, model hints, color, camera count, any visible text).

Rules: NO prices, NO offers, NO emojis, NO markdown symbols, NO hallucinated specs. Output ONLY valid JSON with keys: name, description, features, category, search_query. No code block, no explanation.`,
                },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        });

        const raw = response.choices[0]?.message?.content;
        if (!raw || typeof raw !== "string") {
            return NextResponse.json(
                { error: "AI did not return a valid response" },
                { status: 400 }
            );
        }

        const cleaned = raw.replace(/```json|```/g, "").trim();
        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch {
            return NextResponse.json(
                { error: "AI did not return valid JSON" },
                { status: 400 }
            );
        }

        // First pass result from pure vision
        let category = categories.includes(parsed.category) ? parsed.category : categories[0];
        let name = stripMarkdownAndEmojis(parsed.name || "Product").slice(0, 120);
        let descriptionOnly = stripMarkdownAndEmojis(parsed.description || "").slice(0, 400);
        let featuresText = cleanBullets(parsed.features || "");
        const visionSearchQuery = stripMarkdownAndEmojis(
            parsed.search_query ||
            (category === "Mobiles" ? `${parsed.name || ""} smartphone` : parsed.name || "")
        ).slice(0, 200);

        // Optional second pass: verify / refine using live web data (Serper)
        try {
            const searchQueryParts = [visionSearchQuery, category].filter(Boolean);
            const web = await searchWeb(searchQueryParts.join(" "));

            if (web && Array.isArray(web.organic) && web.organic.length > 0) {
                // Pick a "popular" title from search results for the final product name.
                // Prefer titles that look like concrete product names (e.g. contain brand keywords).
                const titles = web.organic.map((o) => o.title || "").filter(Boolean);
                let popularTitle = titles[0] || "";
                const lowerTitles = titles.map((t) => t.toLowerCase());

                const brandKeywords = ["iphone", "samsung", "galaxy", "pixel", "oneplus", "xiaomi", "redmi", "realme"];
                for (const t of lowerTitles) {
                    if (brandKeywords.some((kw) => t.includes(kw))) {
                        popularTitle = titles[lowerTitles.indexOf(t)];
                        break;
                    }
                }

                if (popularTitle) {
                    name = stripMarkdownAndEmojis(popularTitle).slice(0, 120);
                }

                const webContext = web.organic
                    .slice(0, 5)
                    .map((o, idx) => `Result ${idx + 1}:\nTitle: ${o.title}\nSnippet: ${o.snippet}`)
                    .join("\n\n---\n\n");

                const refineResponse = await askAiVisionChatCompletionsCreate({
                    messages: [
                        {
                            role: "system",
                            content: `You are refining product details by cross-checking them with real products on the web.

Input:
- An initial guess of the product name/description/category that was generated from the product image.
- A few top web search results for that guess (title + snippet) from a shopping-like query.

Goal:
- Use the web results to map the guess to a REAL, existing product if possible (for example, if the guess is "Orange Triple Camera Smartphone" but results clearly show "Apple iPhone 13", correct the name to "Apple iPhone 13").
- Prefer well-known retail product names found in the result titles/snippets (e.g. "Apple iPhone 13 Pro Max", "Apple iPhone 14").
- Correct the model/variant name and brand if needed using the REAL product you find on the web.
- Remove clearly wrong words (e.g. wrong fruit, wrong brand, wrong model number).
- Keep the category within this exact list: ${categories.join(", ")}.

Rules:
- Output STRICTLY valid JSON with keys: name, description, features, category.
- No markdown, no emojis, no extra keys, no explanations.
- Description: 2–3 sentences, no prices, no offers, no marketing fluff.
- Features: max 4 short bullet points (plain text, newline separated).
- If you are not confident after checking the web, keep the original guess and just lightly clean it up.`,
                        },
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: `Original guess from image (may be wrong):\n\n` +
                                        `Name: ${name}\n` +
                                        `Category: ${category}\n` +
                                        `Description: ${descriptionOnly}\n\n` +
                                        `Web search results:\n\n${webContext}\n\n` +
                                        `Return corrected JSON now.`,
                                },
                            ],
                        },
                    ],
                });

                const refineRaw = refineResponse.choices[0]?.message?.content;
                if (refineRaw && typeof refineRaw === "string") {
                    const refineCleaned = refineRaw.replace(/```json|```/g, "").trim();
                    try {
                        const refined = JSON.parse(refineCleaned);
                        const refinedCategory = categories.includes(refined.category) ? refined.category : category;
                        const refinedName = stripMarkdownAndEmojis(refined.name || name).slice(0, 120);
                        const refinedDescriptionOnly = stripMarkdownAndEmojis(refined.description || descriptionOnly).slice(0, 400);
                        const refinedFeaturesText = cleanBullets(refined.features || featuresText || "");

                        // Only overwrite if refined fields look non-empty
                        if (refinedName) name = refinedName;
                        if (refinedDescriptionOnly) descriptionOnly = refinedDescriptionOnly;
                        if (refinedFeaturesText) featuresText = refinedFeaturesText;
                        category = refinedCategory;
                    } catch {
                        // If refinement fails, silently fall back to first pass
                    }
                }
            }
        } catch {
            // If Serper/web refinement fails for any reason, fall back to first pass only
        }

        const description = featuresText ? `${descriptionOnly}\n\n${featuresText}`.trim() : descriptionOnly;

        if (!name && !description && !category) {
            return NextResponse.json(
                { error: "AI could not generate details from the images" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            name: name || "Product",
            description: description || "",
            category,
        });
    } catch (error) {
        const is429 = error?.status === 429 || String(error?.message || "").includes("429");
        if (is429) {
            console.warn("[AI generate] Rate limit (429). Try again later.");
        } else {
            console.error(error);
        }
        const message = is429
            ? "AI rate limit reached. Please try again in a moment."
            : error?.code || error?.message || "AI generation failed";
        return NextResponse.json(
            { error: message },
            { status: is429 ? 429 : 400 }
        );
    }
}
