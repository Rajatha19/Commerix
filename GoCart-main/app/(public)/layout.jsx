'use client'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { useUser, useAuth } from "@clerk/nextjs";
import { fetchCart, uploadCart } from "@/lib/features/cart/cartSlice";
import { fetchAddress } from "@/lib/features/address/addressSlice";
import { fetchUserRatings } from "@/lib/features/rating/ratingSlice";
import { fetchWishlist, clearWishlist } from "@/lib/features/wishlist/wishlistSlice";
import { AskAiProvider, useAskAi } from "@/contexts/AskAiContext";
import { usePathname, useSearchParams } from "next/navigation";

const HEADER_OFFSET = 100;
const NAVBAR_HEIGHT = 80;

function PublicLayoutContent({ children }) {
    const dispatch = useDispatch();
    const { user } = useUser();
    const { getToken } = useAuth();
    const { cartItems } = useSelector((state) => state.cart);
    const { isOpen } = useAskAi();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isFashion = pathname?.startsWith('/fashion') || searchParams?.get('from') === 'fashion';

    useEffect(() => {
        document.body.style.backgroundColor = isFashion ? '#faf5f0' : '#0a0a0b';
        document.body.style.color = isFashion ? '#2d1810' : '';
        return () => {
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
        };
    }, [isFashion]);

    useEffect(() => {
        dispatch(fetchProducts({}));
    }, []);

    useEffect(() => {
        if (user) {
            dispatch(fetchCart({ getToken }));
            dispatch(fetchAddress({ getToken }));
            dispatch(fetchUserRatings({ getToken }));
            dispatch(fetchWishlist({ getToken }));
        } else {
            dispatch(clearWishlist());
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            dispatch(uploadCart({ getToken }));
        }
    }, [cartItems]);

    return (
        <>
            <Navbar />
            <div
                className="transition-[padding-top] duration-200"
                style={{ paddingTop: NAVBAR_HEIGHT }}
            >
                {children}
                <Footer />
            </div>
            <aside
                id="ask-ai-drawer"
                className={`fixed right-0 z-[100] w-[420px] border-l backdrop-blur-xl rounded-l-[28px] overflow-hidden
                    transition-[transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${isFashion
                        ? 'border-[#d4c4a8]/50 bg-[#faf5f0]/[0.98]'
                        : 'border-zinc-700/50 bg-[#0a0a0b]/[0.98]'
                }`}
                style={{
                    top: HEADER_OFFSET,
                    height: `calc(100vh - ${HEADER_OFFSET}px)`,
                    transform: isOpen ? "translateX(0)" : "translateX(100%)",
                    boxShadow: isOpen
                        ? (isFashion
                            ? "-12px 0 40px -8px rgba(45,24,16,0.12), -4px 0 16px -4px rgba(0,0,0,0.06)"
                            : "-12px 0 40px -8px rgba(0,0,0,0.35), -4px 0 16px -4px rgba(0,0,0,0.2)")
                        : "none",
                }}
                aria-hidden={!isOpen}
            />
        </>
    );
}

export default function PublicLayout({ children }) {
    return (
        <AskAiProvider>
            <PublicLayoutContent>{children}</PublicLayoutContent>
        </AskAiProvider>
    );
}
