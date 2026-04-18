import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const whereClause = {
            inStock: true,
        };

        let products = await prisma.product.findMany({
            where: whereClause,
            include: {
                rating: {
                    select: {
                        createdAt: true, rating: true, review: true,
                        user: { select: { name: true, image: true } }
                    }
                },
                store: {
                    include: {
                        trustAnalysis: {
                            select: {
                                tone: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ products })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }
}