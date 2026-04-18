'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import FashionFeaturedSection from '@/components/fashion/FashionFeaturedSection'
import FashionDealsSection from '@/components/fashion/FashionDealsSection'
import FashionRecommendedSection from '@/components/fashion/FashionRecommendedSection'

const CATEGORIES = [
    { name: 'Outerwear', image: '/cat-outerwear.png' },
    { name: 'Dresses', image: '/cat-dresses.png' },
    { name: 'Bags', image: '/cat-bags.png' },
    { name: 'Knitwear', image: '/cat-knitwear.png' },
    { name: 'Bottoms', image: '/cat-bottoms.png' },
    { name: 'Shoes', image: '/cat-shoes.png' },
    { name: 'Jewelry', image: '/cat-jewelry.png' },
    { name: 'Accessories', image: '/cat-accessories.png' },
    { name: 'Tops', image: '/cat-tops.png' },
]

export default function FashionPageClient() {
    return (
        <div className="min-h-screen bg-[#faf5f0]">

            {/* ═══════════ Hero Section — full viewport ═══════════ */}
            <section className="relative h-screen flex items-center overflow-hidden -mt-20 pt-20">
                {/* Subtle warm radial glow */}
                <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#8B6914]/[0.04] blur-[140px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#faf5f0] to-transparent pointer-events-none z-[1]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                    {/* Left content */}
                    <div className="flex-1 max-w-xl lg:max-w-none">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8B6914]/[0.08] border border-[#8B6914]/15 text-[#8B6914] text-sm font-medium mb-6">
                                <span className="text-base">✦</span> Spring/Summer 2026
                            </span>
                        </motion.div>

                        <motion.h1
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#2d1810] leading-[1.05] mb-6"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                        >
                            Elegance{' '}
                            <span className="italic font-serif text-[#8B6914]">Redefined</span>
                        </motion.h1>

                        <motion.p
                            className="text-lg text-[#8B7355] max-w-md mb-8 leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                        >
                            Discover our curated collection of timeless pieces crafted with the finest materials.
                        </motion.p>

                        <motion.div
                            className="flex gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                        >
                            <Link
                                href="/fashion/shop"
                                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#8B6914] text-white rounded-xl font-semibold text-sm hover:bg-[#7a5c12] transition shadow-lg shadow-[#8B6914]/20"
                            >
                                Shop Collection <ArrowRight size={16} />
                            </Link>
                            <Link
                                href="/fashion/stores"
                                className="inline-flex items-center gap-2 px-7 py-3.5 bg-transparent text-[#2d1810] rounded-xl font-semibold text-sm border border-[#2d1810]/20 hover:bg-[#2d1810]/[0.04] transition"
                            >
                                View All
                            </Link>
                        </motion.div>
                    </div>

                    {/* Right image */}
                    <motion.div
                        className="flex-1 w-full max-w-xl lg:max-w-[520px]"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                    >
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#8B6914]/10 border border-[#d4c4a8]/30">
                            <Image
                                src="/fashion-hero.png"
                                alt="Fashion Collection"
                                width={800}
                                height={500}
                                className="w-full h-auto object-cover"
                                priority
                            />
                        </div>
                    </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════ Shop by Category ═══════════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <motion.div
                    className="flex items-center justify-between mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#2d1810] italic font-serif">Shop by Category</h2>
                    <Link href="/fashion/shop" className="text-sm font-medium text-[#8B6914] hover:text-[#7a5c12] flex items-center gap-1 transition">
                        View all <ArrowRight size={14} />
                    </Link>
                </motion.div>
                <div className="relative">
                    {/* Fade masks on both sides */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[#faf5f0] to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#faf5f0] to-transparent z-10 pointer-events-none" />
                    <div className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar pb-2 px-2">
                        {CATEGORIES.map((cat, i) => (
                            <motion.div
                                key={cat.name}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                className="flex-shrink-0"
                            >
                                <Link
                                    href={`/fashion/shop?category=${encodeURIComponent(cat.name)}`}
                                    className="group block w-[140px] sm:w-[160px] overflow-hidden rounded-2xl border border-[#d4c4a8]/30 bg-white hover:border-[#8B6914]/30 hover:shadow-[0_8px_30px_-8px_rgba(139,105,20,0.12)] transition-all duration-300"
                                >
                                    <div className="relative aspect-[4/3] bg-[#f5ede3] overflow-hidden">
                                        <Image
                                            src={cat.image}
                                            alt={cat.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="160px"
                                        />
                                    </div>
                                    <div className="px-3 py-2.5 text-center">
                                        <span className="text-sm font-semibold text-[#2d1810] group-hover:text-[#8B6914] transition-colors duration-200">{cat.name}</span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ Featured Products ═══════════ */}
            <FashionFeaturedSection />

            {/* ═══════════ Deals of the Day ═══════════ */}
            <FashionDealsSection />

            {/* ═══════════ Recommended for You ═══════════ */}
            <FashionRecommendedSection />

            {/* Bottom spacer */}
            <div className="h-12" />
        </div>
    )
}
