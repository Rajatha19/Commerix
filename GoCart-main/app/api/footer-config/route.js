import prisma from "@/lib/prisma"
import authAdmin from "@/middlewares/authAdmin"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { DEFAULT_FOOTER_CONFIG } from "@/lib/footerDefaults"

const CONFIG_KEY_FOOTER = "footer_config"

const withDefaults = (raw) => {
    // Already in new shape
    if (raw && (raw.electronics || raw.fashion)) {
        return {
            electronics: { ...DEFAULT_FOOTER_CONFIG.electronics, ...(raw.electronics || {}) },
            fashion: { ...DEFAULT_FOOTER_CONFIG.fashion, ...(raw.fashion || {}) },
        }
    }

    // Legacy flat shape (single config + optional brandDescriptionFashion)
    if (raw && typeof raw === "object") {
        const base = { ...DEFAULT_FOOTER_CONFIG.electronics, ...raw }
        const fashionBrand =
            raw.brandDescriptionFashion || DEFAULT_FOOTER_CONFIG.fashion.brandDescription

        return {
            electronics: {
                ...DEFAULT_FOOTER_CONFIG.electronics,
                ...base,
            },
            fashion: {
                ...DEFAULT_FOOTER_CONFIG.fashion,
                ...base,
                brandDescription: fashionBrand,
            },
        }
    }

    return { ...DEFAULT_FOOTER_CONFIG }
}

export async function GET() {
    try {
        const row = await prisma.assistantConfig.findUnique({
            where: { key: CONFIG_KEY_FOOTER },
        })

        if (!row?.value) {
            return NextResponse.json({ config: DEFAULT_FOOTER_CONFIG })
        }

        try {
            const parsed = JSON.parse(row.value)
            const normalized = withDefaults(parsed)
            return NextResponse.json({ config: normalized })
        } catch {
            return NextResponse.json({ config: DEFAULT_FOOTER_CONFIG })
        }
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error?.message || "Failed to load footer config" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const { userId } = getAuth(req)
        const isAdmin = await authAdmin(userId)
        if (!isAdmin) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 })
        }

        const body = await req.json()
        const incoming = body?.config && typeof body.config === "object" ? body.config : {}
        const merged = withDefaults(incoming)

        await prisma.assistantConfig.upsert({
            where: { key: CONFIG_KEY_FOOTER },
            create: { key: CONFIG_KEY_FOOTER, value: JSON.stringify(merged) },
            update: { value: JSON.stringify(merged) },
        })

        return NextResponse.json({ message: "Saved", config: merged })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error?.message || "Failed to save footer config" }, { status: 500 })
    }
}

