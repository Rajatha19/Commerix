'use client'

import React from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { getBestSellers } from '@/lib/homeProductFilters'
import SectionTitle from './SectionTitle'
import SectionCarousel from './SectionCarousel'
import ProductCard from '@/components/ProductCard'

export default function FeaturedProductsSection() {
  const products = useSelector((state) => state.product.list)
  const featured = getBestSellers(products, 12)

  if (featured.length === 0) return null

  return (
    <section className="relative py-14 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionTitle
          title="Featured Products"
          subtitle="Top-rated picks handpicked for you"
          href="/shop"
        />
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <SectionCarousel step={320}>
            {featured.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[280px] sm:w-[300px] snap-start">
                <ProductCard product={product} size="tall" />
              </div>
            ))}
          </SectionCarousel>
        </motion.div>
      </div>
    </section>
  )
}
