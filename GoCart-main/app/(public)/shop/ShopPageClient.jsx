'use client'

import { Suspense, useState, useMemo, useEffect, useRef } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon, Filter, ChevronDown, X } from "lucide-react"
import { PRODUCT_BRANDS } from "@/lib/brands"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import SectionTitle from "@/components/home/SectionTitle"
import SectionCarousel from "@/components/home/SectionCarousel"
import { trackBehavior } from "@/lib/behaviorTracker"

function getProductRating(product) {
  const ratingCount = product.rating?.length || 0
  if (ratingCount === 0) return 0
  return product.rating.reduce((acc, curr) => acc + curr.rating, 0) / ratingCount
}

function normalizeText(value) {
  if (!value) return ''
  return value.toString().toLowerCase()
}

function tokenizeSearch(query) {
  return query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
}

function getSearchText(product) {
  const fields = [product.name, product.description, product.category, product.brand, product.store?.name, product.store?.username]
  return fields.map(normalizeText).join(' ')
}

function getProductBaseKey(product) {
  const brand = normalizeText(product.brand)
  const category = normalizeText(product.category)
  const rawName = normalizeText(product.name)

  if (!rawName) return [brand, category, product.id].filter(Boolean).join('|')

  const STOP_WORDS = new Set(['with', 'and', 'for', 'of', 'by', 'the', 'a', 'an', 'new', 'latest', 'edition', 'series', 'model'])
  const tokens = rawName
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token))
    .slice(0, 6)

  const coreName = tokens.join(' ') || rawName
  return [brand, category, coreName].filter(Boolean).join('|')
}

function scoreProductForListing(product) {
  const ratingCount = product.rating?.length || 0
  const avgRating = getProductRating(product)

  const trustTone = product.store?.trustAnalysis?.tone
  let trustBoost = 0
  if (trustTone === 'positive') trustBoost = 0.5
  else if (trustTone === 'caution') trustBoost = -0.3

  let stockBoost = 0
  if (typeof product.stock_quantity === 'number') {
    stockBoost = product.stock_quantity > 0 ? 0.3 : -1
  } else if (product.inStock === false) {
    stockBoost = -1
  }

  const ratingScore = avgRating * 2
  const volumeScore = Math.min(ratingCount / 20, 3)

  return ratingScore + volumeScore + trustBoost + stockBoost
}

function dedupeProductsForListing(products) {
  if (!Array.isArray(products)) return []
  const bestByKey = new Map()

  for (const product of products) {
    const key = getProductBaseKey(product)
    const existing = bestByKey.get(key)
    if (!existing) {
      bestByKey.set(key, product)
      continue
    }

    const existingScore = scoreProductForListing(existing)
    const newScore = scoreProductForListing(product)
    if (newScore > existingScore) {
      bestByKey.set(key, product)
    }
  }

  return Array.from(bestByKey.values())
}

function normalizeCategoryForGroup(category) {
  if (!category) return 'Other'
  const c = category.trim()
  if (c === 'Watches') return 'Watch'
  if (['Headphones', 'Earbuds', 'Earphones'].includes(c)) return 'Earbuds and Headphones'
  if (c === 'Appliances') return 'Tablets'
  return c
}

const CATEGORY_ORDER = ['Mobiles', 'Televisions', 'Laptops', 'Tablets', 'Earbuds and Headphones', 'Speakers', 'Watch', 'Accessories', 'Air Conditioners', 'Coolers', 'Fans', 'Vacuum Cleaners', 'Grooming', 'Other']
function sortCategoryKeys(keys) {
  return [...keys].sort((a, b) => {
    const i = CATEGORY_ORDER.indexOf(a)
    const j = CATEGORY_ORDER.indexOf(b)
    if (i !== -1 && j !== -1) return i - j
    if (i !== -1) return -1
    if (j !== -1) return 1
    return a.localeCompare(b)
  })
}

const PRICE_RANGES = [
  { label: 'Under ₹100', min: 0, max: 100 },
  { label: '₹100 – ₹300', min: 100, max: 300 },
  { label: '₹300 – ₹600', min: 300, max: 600 },
  { label: '₹600+', min: 600, max: Infinity },
]

const RATING_OPTIONS = [
  { label: '4+ Stars', value: 4 },
  { label: '3+ Stars', value: 3 },
  { label: '2+ Stars', value: 2 },
]

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
  { label: 'Newest', value: 'newest' },
]

function ShopContent() {
  const searchParams = useSearchParams()
  const search = searchParams.get('search')
  const categoryParam = searchParams.get('category')
  const brandParam = searchParams.get('brand')
  const router = useRouter()
  const pathname = usePathname()
  const isFashion = pathname?.startsWith('/fashion')
  const basePath = isFashion ? '/fashion/shop' : '/shop'
  const fashionCategories = useMemo(() => new Set(['Men', 'Women', 'Footwear', 'Accessories', 'Streetwear', 'Luxury']), [])
  const products = useSelector(state => state.product.list)
  const [filterCategory, setFilterCategory] = useState(categoryParam || '')
  const [filterBrand, setFilterBrand] = useState(brandParam || '')
  const [filterPriceRange, setFilterPriceRange] = useState(null)
  const [filterRating, setFilterRating] = useState('')
  const [sortBy, setSortBy] = useState('relevance')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => { setFilterCategory(categoryParam || '') }, [categoryParam])
  useEffect(() => { setFilterBrand(brandParam || '') }, [brandParam])

  const categoryTrackedRef = useRef(null)
  const searchTrackedRef = useRef(null)
  const category = isFashion ? 'fashion' : 'electronics'
  useEffect(() => {
    if (search && search.trim()) {
      const key = `${category}:${search.trim()}`
      if (searchTrackedRef.current !== key) {
        searchTrackedRef.current = key
        trackBehavior({ eventType: 'search', category, payload: { searchQuery: search.trim() } })
      }
    }
  }, [search, category])
  useEffect(() => {
    if (filterCategory && filterCategory.trim()) {
      const key = `${category}:${filterCategory.trim()}`
      if (categoryTrackedRef.current !== key) {
        categoryTrackedRef.current = key
        trackBehavior({ eventType: 'category_browse', category, payload: { categoryName: filterCategory.trim() } })
      }
    }
  }, [filterCategory, category])

  const scopedProducts = useMemo(() => {
    const scoped = products.filter((product) => {
      const resolvedType = product.productType || product.store?.storeType
      if (resolvedType) return resolvedType === (isFashion ? 'fashion' : 'electronics')
      return isFashion ? fashionCategories.has(product.category) : !fashionCategories.has(product.category)
    })
    return dedupeProductsForListing(scoped)
  }, [products, isFashion, fashionCategories])

  const categories = useMemo(() => {
    const cats = new Set()
    scopedProducts.forEach((p) => {
      if (p.category) {
        let nc = p.category === 'Watches' ? 'Watch' : p.category
        if (['Headphones', 'Earbuds', 'Earphones'].includes(nc)) nc = 'Earbuds and Headphones'
        if (nc === 'Appliances') nc = 'Tablets'
        cats.add(nc)
      }
    })
    return sortCategoryKeys(Array.from(cats))
  }, [scopedProducts])

  const filteredProducts = useMemo(() => {
    let result = scopedProducts
    if (search) {
      const tokens = tokenizeSearch(search)
      if (tokens.length > 0) {
        const scored = result.map((product) => {
          const haystack = getSearchText(product)
          const matches = tokens.filter((token) => haystack.includes(token))
          return { product, matchCount: matches.length }
        })
        const allTokensMatch = scored.filter((item) => item.matchCount === tokens.length)
        const anyTokenMatch = scored.filter((item) => item.matchCount > 0)
        const list = allTokensMatch.length > 0 ? allTokensMatch : anyTokenMatch
        result = list.sort((a, b) => b.matchCount - a.matchCount).map((item) => item.product)
      }
    }
    if (filterCategory) {
      let normalizedFilter = filterCategory.toLowerCase() === 'watch' ? ['watch', 'watches'] : [filterCategory.toLowerCase()]
      if (filterCategory.toLowerCase() === 'earbuds and headphones') normalizedFilter = ['headphones', 'earbuds', 'earphones']
      if (filterCategory.toLowerCase() === 'tablets') normalizedFilter = ['tablets', 'appliances']
      result = result.filter((p) => normalizedFilter.includes((p.category || '').toLowerCase()))
    }
    if (filterBrand) {
      result = result.filter((p) => (p.brand || '').trim() === filterBrand.trim())
    }
    if (filterPriceRange) {
      result = result.filter((p) => p.price >= filterPriceRange.min && (filterPriceRange.max === Infinity || p.price <= filterPriceRange.max))
    }
    if (filterRating) {
      const minRating = parseFloat(filterRating)
      if (!isNaN(minRating)) result = result.filter((p) => getProductRating(p) >= minRating)
    }

    if (sortBy === 'price_asc') result = [...result].sort((a, b) => a.price - b.price)
    else if (sortBy === 'price_desc') result = [...result].sort((a, b) => b.price - a.price)
    else if (sortBy === 'rating') result = [...result].sort((a, b) => getProductRating(b) - getProductRating(a))
    else if (sortBy === 'newest') result = [...result].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

    return result
  }, [scopedProducts, search, filterCategory, filterBrand, filterPriceRange, filterRating, sortBy])

  const clearFilters = () => { setFilterCategory(''); setFilterBrand(''); setFilterPriceRange(null); setFilterRating(''); setSortBy('relevance') }
  const hasActiveFilters = filterCategory || filterBrand || filterPriceRange || filterRating

  const productsByCategory = useMemo(() => {
    if (!brandParam) return null
    const map = {}
    filteredProducts.forEach((p) => {
      const key = normalizeCategoryForGroup(p.category)
      if (!map[key]) map[key] = []
      map[key].push(p)
    })
    return map
  }, [brandParam, filteredProducts])

  const brandViewCategories = useMemo(() => {
    if (!productsByCategory) return []
    return sortCategoryKeys(Object.keys(productsByCategory))
  }, [productsByCategory])

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

  /* ── Sidebar content (shared between desktop sidebar and mobile drawer) ── */
  const filterSidebar = (
    <div className="space-y-8">
      {/* Category */}
      <div>
        <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isFashion ? 'text-[#8B7355]' : 'text-zinc-400'}`}>Category</h3>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => setFilterCategory('')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${!filterCategory
                ? (isFashion ? 'bg-[#8B6914]/10 text-[#8B6914] font-semibold' : 'bg-cyan-500/15 text-cyan-300 font-semibold')
                : (isFashion ? 'text-[#8B7355] hover:text-[#2d1810] hover:bg-[#8B6914]/[0.05]' : 'text-zinc-400 hover:text-white hover:bg-white/5')
                }`}
            >
              All
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${filterCategory === cat
                  ? (isFashion ? 'bg-[#8B6914]/10 text-[#8B6914] font-semibold' : 'bg-cyan-500/15 text-cyan-300 font-semibold')
                  : (isFashion ? 'text-[#8B7355] hover:text-[#2d1810] hover:bg-[#8B6914]/[0.05]' : 'text-zinc-400 hover:text-white hover:bg-white/5')
                  }`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isFashion ? 'text-[#8B7355]' : 'text-zinc-400'}`}>Price Range</h3>
        <ul className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const active = filterPriceRange && filterPriceRange.min === range.min && filterPriceRange.max === range.max
            return (
              <li key={range.label}>
                <button
                  type="button"
                  onClick={() => setFilterPriceRange(active ? null : range)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${active
                    ? (isFashion ? 'bg-[#8B6914]/10 text-[#8B6914] font-semibold' : 'bg-cyan-500/15 text-cyan-300 font-semibold')
                    : (isFashion ? 'text-[#8B7355] hover:text-[#2d1810] hover:bg-[#8B6914]/[0.05]' : 'text-zinc-400 hover:text-white hover:bg-white/5')
                    }`}
                >
                  {range.label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Minimum Rating */}
      <div>
        <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isFashion ? 'text-[#8B7355]' : 'text-zinc-400'}`}>Minimum Rating</h3>
        <ul className="space-y-1">
          {RATING_OPTIONS.map((opt) => {
            const active = filterRating === String(opt.value)
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => setFilterRating(active ? '' : String(opt.value))}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${active
                    ? (isFashion ? 'bg-[#8B6914]/10 text-[#8B6914] font-semibold' : 'bg-cyan-500/15 text-cyan-300 font-semibold')
                    : (isFashion ? 'text-[#8B7355] hover:text-[#2d1810] hover:bg-[#8B6914]/[0.05]' : 'text-zinc-400 hover:text-white hover:bg-white/5')
                    }`}
                >
                  {opt.label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className={`w-full text-sm font-medium py-2 rounded-lg border transition ${isFashion ? 'text-[#8B6914] border-[#8B6914]/30 hover:bg-[#8B6914]/10' : 'text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10'
            }`}
        >
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <div className={`min-h-[70vh] mx-4 sm:mx-6 ${isFashion ? 'bg-[#faf5f0]' : 'bg-[#0a0a0b]'}`}>
      <div className="max-w-7xl mx-auto py-6">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <button onClick={() => router.push(basePath)} className={`flex items-center gap-2 transition ${isFashion ? 'text-[#8B7355] hover:text-[#8B6914]' : 'text-zinc-400 hover:text-teal-400'}`}>
              {(search || categoryParam || brandParam) && <MoveLeftIcon size={20} />}
              <h1 className={`text-2xl sm:text-3xl font-bold ${isFashion ? 'text-[#2d1810]' : 'text-zinc-100'}`}>{isFashion ? 'Collection' : 'All Products'}</h1>
            </button>
            <p className={`text-sm mt-1 ${isFashion ? 'text-[#8B7355]' : 'text-zinc-500'}`}>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border transition cursor-pointer ${isFashion ? 'bg-white border-[#d4c4a8]/40 text-[#8B7355] hover:text-[#2d1810] hover:bg-[#f5ede3]' : 'bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
            >
              <Filter size={18} />
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-teal-400" />}
            </button>
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`appearance-none px-4 py-2 pr-9 rounded-xl border text-sm outline-none cursor-pointer ${isFashion ? 'bg-white border-[#d4c4a8]/40 text-[#2d1810] focus:border-[#8B6914]/50' : 'bg-zinc-800/80 border-zinc-700/80 text-zinc-300 focus:border-teal-500/50'
                  }`}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Mobile filter drawer ── */}
        {showMobileFilters && (
          <div className={`lg:hidden mb-6 p-5 rounded-xl border animate-fade-in ${isFashion ? 'bg-white border-[#d4c4a8]/30' : 'bg-zinc-900/80 border-zinc-700/60'}`}>
            {filterSidebar}
          </div>
        )}

        {/* ── Brand category view ── */}
        {productsByCategory && brandViewCategories.length > 0 ? (
          <div className="space-y-12 sm:space-y-16 pb-16">
            {brandViewCategories.map((categoryLabel) => {
              const list = productsByCategory[categoryLabel] || []
              if (list.length === 0) return null
              const sectionTitle = brandParam ? `${brandParam} ${categoryLabel}` : categoryLabel
              return (
                <section key={categoryLabel} className="relative py-12 overflow-hidden rounded-2xl">
                  <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
                    <SectionTitle title={sectionTitle} subtitle={`${list.length} product${list.length !== 1 ? 's' : ''}`} />
                    <motion.div
                      className="mt-10"
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                      <SectionCarousel step={320}>
                        {list.map((product) => (
                          <div key={product.id} className="flex-shrink-0 w-[280px] sm:w-[300px] snap-start">
                            <ProductCard product={product} size="tall" />
                          </div>
                        ))}
                      </SectionCarousel>
                    </motion.div>
                  </div>
                </section>
              )
            })}
          </div>
        ) : (
          /* ── Standard view: sidebar + grid ── */
          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 no-scrollbar">
              {filterSidebar}
            </aside>

            {/* Product grid */}
            <div className="flex-1 min-w-0">
              {(search || categoryParam || hasActiveFilters) && (
                <p className={`text-sm mb-4 ${isFashion ? 'text-[#8B7355]' : 'text-zinc-500'}`}>
                  {[search && `Search: "${search}"`, categoryParam && `Category: ${categoryParam}`, hasActiveFilters && 'Filters applied'].filter(Boolean).join(' · ')}
                </p>
              )}

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mb-16">
                  {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
              ) : (
                <p className={`text-center py-16 ${isFashion ? 'text-[#8B7355]' : 'text-zinc-500'}`}>No products match your filters.</p>
              )}
            </div>
          </div>
        )}

        {productsByCategory && brandViewCategories.length === 0 && (
          <p className="text-center text-zinc-500 py-12">No products for this brand.</p>
        )}
      </div>
    </div>
  )
}

export default function ShopPageClient() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-zinc-500">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  )
}
