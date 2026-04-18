'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import CategoriesMarquee from '@/components/CategoriesMarquee'
import BrandsCarousel from '@/components/home/BrandsCarousel'
import FeaturedProductsSection from '@/components/home/FeaturedProductsSection'
import DealsOfTheDaySection from '@/components/home/DealsOfTheDaySection'
import AiRecommendedSection from '@/components/home/AiRecommendedSection'
import PromoBanner from '@/components/home/PromoBanner'
import NewsletterSection from '@/components/home/NewsletterSection'

export default function HomePageClient() {
  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* ═══════════════════════════════════════════════════════
          HERO — full viewport, extends behind the navbar
          ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden -mt-20 pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#040610] via-[#060814] to-[#0a0818]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_40%,rgba(6,182,212,0.06),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_70%,rgba(139,92,246,0.04),transparent_60%)]" />

        <div className="absolute top-1/2 right-[5%] -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-cyan-500/[0.08] blur-[160px] pointer-events-none" />
        <div className="absolute top-[25%] right-[18%] w-[450px] h-[450px] rounded-full bg-purple-500/[0.06] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[15%] left-[5%] w-[350px] h-[350px] rounded-full bg-cyan-500/[0.04] blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0b] to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_24px_-5px_rgba(6,182,212,0.18)]">
                <Sparkles size={15} className="text-cyan-400" />
                <span className="text-sm font-medium text-cyan-300 tracking-wide">New Collection 2026</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.8rem] font-bold leading-[1.04] tracking-tight">
                <span className="text-white">The Future of</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">Technology</span>
              </h1>

              <p className="text-lg sm:text-xl text-zinc-400 max-w-lg leading-relaxed">
                Discover cutting-edge devices engineered for performance.
                Premium tech, reimagined.
              </p>

              <div className="flex flex-wrap items-center gap-5 pt-3">
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold text-base shadow-[0_0_35px_-5px_rgba(6,182,212,0.45)] hover:shadow-[0_0_45px_-5px_rgba(6,182,212,0.65)] transition-all duration-300 hover:scale-[1.02]"
                >
                  Explore Now
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center px-8 py-4 rounded-full border border-white/[0.12] text-zinc-300 hover:text-white hover:border-white/25 hover:bg-white/[0.03] font-medium text-base transition-all duration-300"
                >
                  View All
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[22rem] h-[22rem] sm:w-[26rem] sm:h-[26rem] rounded-full bg-cyan-500/[0.14] blur-[100px] animate-neon-breathe" />
              </div>
              <div className="absolute top-0 right-0 pointer-events-none">
                <div className="w-64 h-64 rounded-full bg-purple-500/[0.09] blur-[80px]" />
              </div>

              <div className="relative animate-hero-float w-full max-w-[580px] lg:max-w-[640px]">
                <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden border border-white/[0.07] shadow-[0_24px_80px_-15px_rgba(0,0,0,0.6),0_0_70px_-15px_rgba(6,182,212,0.14)]">
                  <div className="absolute inset-0 rounded-3xl shadow-[inset_0_2px_30px_rgba(0,0,0,0.4)] z-10 pointer-events-none" />
                  <Image
                    src="/hero-showcase.png"
                    alt="Premium tech — futuristic headphones with neon glow"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 580px, 640px"
                    priority
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-44 h-44 rounded-full bg-cyan-400/20 blur-[55px] pointer-events-none" />
                <div className="absolute -top-6 -left-6 w-36 h-36 rounded-full bg-purple-400/15 blur-[45px] pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Sections — clean dark backgrounds, no grids
          ═══════════════════════════════════════════════════════ */}
      <CategoriesMarquee />
      <FeaturedProductsSection />
      <DealsOfTheDaySection />
      <AiRecommendedSection />
      <PromoBanner />
      <BrandsCarousel />
      <NewsletterSection />
    </div>
  )
}
