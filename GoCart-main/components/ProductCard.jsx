'use client'
import { StarIcon, Heart, ShoppingCart, MoreVertical, ShieldAlert, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, removeFromCart } from '@/lib/features/cart/cartSlice'
import { addToWishlist, removeFromWishlist, fetchWishlist, optimisticAdd, optimisticRemove } from '@/lib/features/wishlist/wishlistSlice'
import { useAuth, useUser } from '@clerk/nextjs'
import { usePathname, useRouter } from 'next/navigation'
import { trackBehavior } from '@/lib/behaviorTracker'

const ProductCard = ({ product, showTypeBadge = false, showTrendingBadge = false, productType, storeType: storeTypeProp, size = 'default', isAdmin = false }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
    const dispatch = useDispatch()
    const router = useRouter()
    const { user } = useUser()
    const { getToken } = useAuth()
    const [wishlistLoading, setWishlistLoading] = useState(false)
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false)
    const [localStatus, setLocalStatus] = useState(product?.status || 'active')
    const pathname = usePathname()
    const isFashion = pathname?.startsWith('/fashion')
    const resolvedType = productType || product?.productType || product?.type
    const storeType = storeTypeProp ?? (resolvedType === 'fashion' ? 'fashion' : 'electronics')

    const cartItems = useSelector(state => state.cart.cartItems)
    const wishlistBucket = useSelector(state => state.wishlist[storeType] || { productIds: [] })
    const wishlistIds = wishlistBucket.productIds || []
    const isInCart = !!cartItems[product.id]
    const cartQty = cartItems[product.id] || 0
    const isWishlisted = wishlistIds.includes(product.id)

    const ratingCount = product.rating?.length || 0
    const rating = ratingCount
        ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / ratingCount)
        : 0

    const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0

    const handleQuickAdd = (e) => {
        e.preventDefault()
        e.stopPropagation()
        dispatch(addToCart({ productId: product.id }))
        trackBehavior({ eventType: 'add_to_cart', category: storeType, productId: product.id })
    }

    const handleIncrement = (e) => {
        e.preventDefault()
        e.stopPropagation()
        dispatch(addToCart({ productId: product.id }))
        trackBehavior({ eventType: 'add_to_cart', category: storeType, productId: product.id })
    }

    const handleDecrement = (e) => {
        e.preventDefault()
        e.stopPropagation()
        dispatch(removeFromCart({ productId: product.id }))
    }

    const handleWishlistToggle = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!user) return
        if (wishlistLoading) return
        setWishlistLoading(true)
        if (isWishlisted) {
            dispatch(optimisticRemove({ productId: product.id, storeType }))
            try {
                await dispatch(removeFromWishlist({ productId: product.id, storeType, getToken })).unwrap()
            } catch {
                dispatch(fetchWishlist({ getToken }))
            }
        } else {
            dispatch(optimisticAdd({ productId: product.id, product, storeType }))
            try {
                await dispatch(addToWishlist({ productId: product.id, storeType, getToken })).unwrap()
                trackBehavior({ eventType: 'wishlist', category: storeType, productId: product.id })
            } catch {
                dispatch(optimisticRemove({ productId: product.id, storeType }))
            }
        }
        setWishlistLoading(false)
    }

    const handleCardClick = () => {
        trackBehavior({ eventType: 'click', category: storeType, productId: product.id })
    }

    const handleAdminAction = async (e, action) => {
        e.preventDefault()
        e.stopPropagation()
        setIsAdminMenuOpen(false)
        try {
            const { default: toast } = await import('react-hot-toast');
            const res = await fetch('/api/admin/product/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id, action })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error("API: " + (err.error || "Failed to update product"));
            }
            const newStatus = action === 'disable' ? 'disabled' : 'active';
            setLocalStatus(newStatus);
            toast.success(`Product ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully.`);
        } catch (error) {
            const { default: toast } = await import('react-hot-toast');
            toast.error(error.message || `Failed to ${action} product`);
        }
    }

    return (
        <Link
            href={isFashion ? `/fashion/product/${product.id}` : `/product/${product.id}`}
            onClick={handleCardClick}
            className={`group flex flex-col max-xl:mx-auto rounded-2xl shadow-lg overflow-hidden hover:-translate-y-1.5 transition-all duration-300 ease-out focus:outline-none focus:ring-2 ${isFashion
                ? 'bg-white border border-[#e8ddd0] hover:shadow-[0_0_28px_-5px_rgba(139,105,20,0.15)] hover:border-[#c4a882]/40 focus:ring-[#8B6914]/30 focus:ring-offset-2 focus:ring-offset-[#faf5f0]'
                : 'bg-zinc-800/95 border border-zinc-600/70 hover:shadow-[0_0_28px_-5px_rgba(163,230,53,0.25)] hover:border-lime-400/25 focus:ring-teal-500/40 focus:ring-offset-2 focus:ring-offset-zinc-950'
                } ${size === 'tall' ? 'h-[440px] sm:h-[480px]' : 'h-[400px] sm:h-[440px]'}`}
        >
            <div className={`relative flex-shrink-0 overflow-hidden flex items-center justify-center transition-all duration-300 ease-out ${isFashion ? 'bg-[#f5ede3]' : 'bg-zinc-800/50'
                } ${size === 'tall' ? 'h-72 sm:h-80' : 'h-56 sm:h-72'}`}>
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <Image
                        width={400}
                        height={400}
                        className={`w-auto transition-transform duration-300 ease-out group-hover:scale-105 ${size === 'tall' ? 'max-h-56 sm:max-h-72' : 'max-h-44 sm:max-h-60'}`}
                        src={product.images[0]}
                        alt={product.name}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md border hover:text-red-400 hover:border-red-500/40 transition z-10 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg ${isFashion ? 'bg-white/80 border-[#d4c4a8]/60 text-[#8B7355]' : 'bg-zinc-900/80 border-zinc-600/80 text-zinc-400'
                        }`}
                >
                    <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
                {isAdmin && (
                    <div className="absolute top-3 left-3 z-20">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsAdminMenuOpen(!isAdminMenuOpen)
                            }}
                            className={`w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md border hover:text-rose-500 hover:border-rose-500/40 transition shadow-lg ${isFashion ? 'bg-white/80 border-[#d4c4a8]/60 text-[#2d1810]' : 'bg-zinc-900/80 border-zinc-600/80 text-zinc-300'
                                }`}
                        >
                            <MoreVertical size={18} />
                        </button>
                        {isAdminMenuOpen && (
                            <div className={`absolute left-0 top-full mt-2 w-48 rounded-xl border shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden ${isFashion ? 'bg-white border-[#d4c4a8]/40' : 'bg-zinc-900 border-zinc-700'
                                }`}>
                                <div className={`px-3 py-2 border-b text-xs font-semibold uppercase tracking-wider ${isFashion ? 'border-[#d4c4a8]/40 text-[#8B7355]' : 'border-zinc-800 text-zinc-500'}`}>
                                    Admin Action
                                </div>
                                {localStatus !== 'disabled' ? (
                                    <button
                                        type="button"
                                        onClick={(e) => handleAdminAction(e, 'disable')}
                                        className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-medium transition text-left ${isFashion ? 'text-[#4a3728] hover:bg-[#8B6914]/10' : 'text-zinc-300 hover:bg-zinc-800'}`}
                                    >
                                        <span className="flex items-center gap-2"><ShieldAlert size={16} className="text-emerald-500" /> Disable Product</span>
                                        <div className="w-8 h-4 bg-emerald-500 rounded-full relative flex items-center p-0.5 transition-colors duration-200">
                                            <div className="w-3 h-3 bg-white shadow-sm rounded-full absolute right-0.5 transition-transform duration-200" />
                                        </div>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={(e) => handleAdminAction(e, 'restore')}
                                        className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-medium transition text-left ${isFashion ? 'text-[#4a3728] hover:bg-[#8B6914]/10' : 'text-zinc-400 hover:bg-zinc-800'}`}
                                    >
                                        <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-zinc-500" /> Enable Product</span>
                                        <div className="w-8 h-4 bg-zinc-300 dark:bg-zinc-600 rounded-full relative flex items-center p-0.5 transition-colors duration-200">
                                            <div className="w-3 h-3 bg-white shadow-sm rounded-full absolute left-0.5 transition-transform duration-200" />
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
                <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition duration-300">
                    {product.stock_quantity !== undefined && product.stock_quantity === 0 ? (
                        <div className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-xl">
                            <p className="text-xs font-semibold text-red-400">Out of Stock</p>
                        </div>
                    ) : isInCart ? (
                        <div
                            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-zinc-900 rounded-xl shadow-lg ${isFashion ? 'bg-[#8B6914] text-white shadow-[#8B6914]/20' : 'bg-teal-400 shadow-teal-500/20'
                                }`}
                            onClick={(e) => e.preventDefault()}
                        >
                            <button
                                type="button"
                                onClick={handleDecrement}
                                className={`w-6 h-6 flex items-center justify-center rounded-md transition ${isFashion ? 'hover:bg-[#8B6914]/30' : 'hover:bg-teal-500/30'
                                    }`}
                            >
                                −
                            </button>
                            <span className="min-w-[1.5rem] text-center">{cartQty}</span>
                            <button
                                type="button"
                                onClick={handleIncrement}
                                className={`w-6 h-6 flex items-center justify-center rounded-md transition ${isFashion ? 'hover:bg-[#8B6914]/30' : 'hover:bg-teal-500/30'
                                    }`}
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleQuickAdd}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-zinc-900 rounded-xl shadow-lg transition ${isFashion ? 'bg-[#8B6914] hover:bg-[#7a5c12] text-white shadow-[#8B6914]/20' : 'bg-teal-400 hover:bg-teal-300 shadow-teal-500/20'
                                }`}
                        >
                            <ShoppingCart size={18} /> Quick Add
                        </button>
                    )}
                </div>
            </div>
            <div className="relative flex flex-col flex-1 min-h-0 px-4 pt-2 pb-4 w-full">
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-b-2xl ${isFashion ? 'bg-gradient-to-t from-transparent via-transparent to-[#8B6914]/[0.03]' : 'bg-gradient-to-t from-transparent via-transparent to-lime-400/[0.04]'
                    }`} />
                <p className={`relative text-base font-medium transition line-clamp-3 leading-snug min-h-[3.5rem] ${isFashion ? 'text-[#2d1810] group-hover:text-[#1a0e08]' : 'text-zinc-200 group-hover:text-white'
                    }`}>
                    {product.name}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="flex">
                        {Array(5).fill('').map((_, i) => (
                            <StarIcon
                                key={i}
                                size={14}
                                className="text-transparent mt-0.5"
                                fill={rating >= i + 1 ? (isFashion ? '#8B6914' : '#14b8a6') : (isFashion ? '#d4c4a8' : '#3f3f46')}
                            />
                        ))}
                    </div>
                    <span className={`text-xs ${isFashion ? 'text-[#8B7355]/70' : 'text-zinc-500'}`}>{ratingCount} reviews</span>
                    {discount > 0 && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${isFashion ? 'bg-[#8B6914] text-white' : 'bg-teal-400 text-zinc-900'}`}>
                            {discount}% OFF
                        </span>
                    )}
                    {showTypeBadge && resolvedType && (
                        <span
                            className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-md border ${resolvedType === 'fashion'
                                ? 'text-[#8B6914] border-[#8B6914]/40 bg-[#8B6914]/15'
                                : 'text-teal-300 border-teal-500/40 bg-teal-500/15'
                                }`}
                        >
                            {resolvedType === 'fashion' ? 'Fashion' : 'Electronics'}
                        </span>
                    )}
                    {product.stock_quantity !== undefined && product.stock_quantity > 0 && product.low_stock_threshold !== undefined && product.stock_quantity <= product.low_stock_threshold && (
                        <span className="px-2 py-0.5 text-[10px] font-bold text-yellow-900 bg-yellow-400 rounded-md">
                            {product.stock_quantity} left
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 mt-3">
                    <span className={`text-lg font-bold ${isFashion ? 'text-[#2d1810]' : 'text-white'}`}>{currency}{product.price}</span>
                    {product.mrp && product.mrp > product.price && (
                        <span className={`text-sm line-through ${isFashion ? 'text-[#8B7355]/60' : 'text-zinc-500'}`}>{currency}{product.mrp}</span>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default ProductCard
