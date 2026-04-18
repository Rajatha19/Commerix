'use client'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Smartphone, Tv, Laptop, Headphones, Tablet, Watch, Sparkles, Scissors, AirVent, Fan, Wind, Package, Speaker, Plug } from 'lucide-react'
import { useState, useRef, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { getElectronicsProducts } from '@/lib/homeProductFilters'

const CATEGORY_CONFIG = {
    'Mobiles': { label: 'Mobiles', path: '/shop?category=Mobiles', icon: Smartphone },
    'Televisions': { label: 'Televisions', path: '/shop?category=Televisions', icon: Tv },
    'Laptops': { label: 'Laptops', path: '/shop?category=Laptops', icon: Laptop },
    'Air Conditioners': { label: 'Air Conditioners', path: '/shop?category=Air Conditioners', icon: AirVent },
    'Coolers': { label: 'Coolers', path: '/shop?category=Coolers', icon: Wind },
    'Fans': { label: 'Fans', path: '/shop?category=Fans', icon: Fan },
    'Vacuum Cleaners': { label: 'Vacuum Cleaners', path: '/shop?category=Vacuum Cleaners', icon: Package },
    'Earbuds and Headphones': { label: 'Earbuds and Headphones', path: '/shop?category=Earbuds and Headphones', icon: Headphones },
    'Accessories': { label: 'Accessories', path: '/shop', icon: Plug },
    'Grooming': { label: 'Grooming', path: '/shop', icon: Scissors },
    'Watch': { label: 'Watch', path: '/shop?category=Watch', icon: Watch },
    'Speakers': { label: 'Speakers', path: '/shop?category=Speakers', icon: Speaker },
    'Tablets': { label: 'Tablets', path: '/shop?category=Tablets', icon: Tablet },
};

const CategoriesMarquee = () => {
    const products = useSelector(state => state.product.list)
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const categories = useMemo(() => {
        const electronicsProducts = getElectronicsProducts(products)

        // Count products per category (normalize Watches to Watch, merge Headphones/Earbuds, merge Appliances to Tablets)
        const categoryCounts = {}
        electronicsProducts.forEach(product => {
            let category = product.category || ''
            if (category) {
                // Normalize "Watches" to "Watch"
                if (category === 'Watches') {
                    category = 'Watch'
                }
                // Merge Headphones and Earbuds into "Earbuds and Headphones"
                if (category === 'Headphones' || category === 'Earbuds' || category === 'Earphones') {
                    category = 'Earbuds and Headphones'
                }
                // Merge Appliances to Tablets
                if (category === 'Appliances') {
                    category = 'Tablets'
                }
                categoryCounts[category] = (categoryCounts[category] || 0) + 1
            }
        })

        // Create a case-insensitive lookup map
        const configMap = {}
        Object.keys(CATEGORY_CONFIG).forEach(key => {
            configMap[key.toLowerCase()] = { ...CATEGORY_CONFIG[key], originalKey: key }
        })

        // Always include all configured categories, even with 0 products
        const fixedCategories = ['Mobiles', 'Televisions', 'Laptops']
        const allConfiguredCategories = Object.keys(CATEGORY_CONFIG).map(key => {
            const normalizedKey = key.toLowerCase()
            const normalizedCounts = Object.keys(categoryCounts).reduce((acc, catName) => {
                acc[catName.toLowerCase()] = categoryCounts[catName]
                return acc
            }, {})

            return {
                name: key,
                originalName: key,
                count: normalizedCounts[normalizedKey] || 0,
                config: CATEGORY_CONFIG[key]
            }
        })

        // Separate fixed categories from all other categories
        const fixed = []
        const otherCategories = []

        allConfiguredCategories.forEach(cat => {
            if (fixedCategories.includes(cat.name)) {
                fixed.push(cat)
            } else {
                // Include all other categories including Tablets
                otherCategories.push(cat)
            }
        })

        // Sort fixed categories by their order
        fixed.sort((a, b) => {
            const indexA = fixedCategories.indexOf(a.name)
            const indexB = fixedCategories.indexOf(b.name)
            return indexA - indexB
        })

        // Get unconfigured categories (categories with products but not in config)
        const unconfigured = []
        Object.keys(categoryCounts).forEach(categoryName => {
            const normalizedName = categoryName.toLowerCase()
            const hasConfig = Object.keys(CATEGORY_CONFIG).some(key => key.toLowerCase() === normalizedName)
            if (!hasConfig) {
                unconfigured.push({
                    name: categoryName,
                    originalName: categoryName,
                    count: categoryCounts[categoryName],
                    config: {
                        label: categoryName,
                        path: `/shop?category=${encodeURIComponent(categoryName)}`,
                        icon: Sparkles // Default icon for unconfigured categories
                    }
                })
            }
        })

        // Combine all non-fixed categories (including Tablets) and sort by product count (descending)
        // This ensures the category with highest product count appears right after Laptops
        const allOtherCategories = [...otherCategories, ...unconfigured]
        allOtherCategories.sort((a, b) => b.count - a.count)

        // Combine: fixed first (Mobiles, Televisions, Laptops), then all other categories sorted by count
        return [...fixed, ...allOtherCategories]
    }, [products])

    const scroll = (dir) => {
        if (!scrollRef.current) return;
        const step = 240;
        scrollRef.current.scrollBy({ left: dir * step, behavior: 'smooth' });
        setTimeout(updateScrollState, 300);
    };

    const updateScrollState = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    return (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <h2 className="text-lg font-semibold text-zinc-100">Shop by Category</h2>
            </motion.div>
            <div className="relative flex items-center">
                {/* Fade masks — only show when there's content scrolled off that side */}
                {canScrollLeft && (
                    <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[#0a0a0b] to-transparent z-[5] pointer-events-none" />
                )}
                {canScrollRight && (
                    <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#0a0a0b] to-transparent z-[5] pointer-events-none" />
                )}
                <button
                    type="button"
                    onClick={() => scroll(-1)}
                    disabled={!canScrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-zinc-400 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors -translate-x-full pr-4"
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={64} strokeWidth={1.5} />
                </button>
                <div
                    ref={scrollRef}
                    onScroll={updateScrollState}
                    className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth snap-x snap-mandatory flex-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {categories.map((cat) => {
                        const Icon = cat.config.icon;
                        return (
                            <Link
                                key={cat.name}
                                href={cat.config.path}
                                className="flex-shrink-0 min-w-[120px] h-[120px] sm:h-[140px] flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/50 to-purple-950/40 border border-slate-700/50 hover:border-slate-600 hover:scale-[1.02] transition-all duration-300 ease-in-out group snap-start"
                            >
                                <div className="flex items-center justify-center w-full h-12 sm:h-14">
                                    <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-white" strokeWidth={1} />
                                </div>
                                <span className="text-xs font-medium tracking-wide text-white text-center">
                                    {cat.config.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
                <button
                    type="button"
                    onClick={() => scroll(1)}
                    disabled={!canScrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-zinc-400 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors translate-x-full pl-4"
                    aria-label="Scroll right"
                >
                    <ChevronRight size={64} strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
};

export default CategoriesMarquee;
