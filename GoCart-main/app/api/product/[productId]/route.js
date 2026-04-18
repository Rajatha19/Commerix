import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/product/[productId] – Public product by ID.
 * Visible to everyone — no status or store filtering applied.
 */
export async function GET(request, { params }) {
    try {
        const { productId } = await params;
        if (!productId) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                rating: {
                    select: {
                        createdAt: true,
                        rating: true,
                        review: true,
                        user: { select: { name: true, image: true } },
                    },
                },
                store: true,
            },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("[api/product/[productId]]", error);
        return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }
}
