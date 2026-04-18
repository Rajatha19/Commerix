const BASE_CONFIG = {
    brandDescription:
        "Your destination for the latest gadgets. From smartphones and smartwatches to accessories — all in one place.",
    productsSectionTitle: "PRODUCTS",
    websiteSectionTitle: "WEBSITE",
    contactSectionTitle: "CONTACT",
    productsLinks: [
        { text: "Earphones", path: "/shop?category=Earbuds" },
        { text: "Headphones", path: "/shop?category=Headphones" },
        { text: "Smartphones", path: "/shop" },
        { text: "Laptops", path: "/shop?category=Laptops" },
    ],
    websiteLinks: [
        { text: "Home", path: "/" },
        { text: "Privacy Policy", path: "/" },
        { text: "Become Plus Member", path: "/pricing" },
        { text: "Create Your Store", path: "/create-store" },
    ],
    contactLinks: {
        phone: { text: "+1-212-456-7890", path: "/" },
        email: { text: "contact@example.com", path: "/" },
        address: { text: "794 Francisco, 94102", path: "/" },
    },
    trustBadges: [
        { label: "Secure Payment", desc: "100% secured" },
        { label: "Free Shipping", desc: "On orders ₹99+" },
        { label: "Easy Returns", desc: "7 days return" },
    ],
    socialLinks: {
        facebook: "https://www.facebook.com",
        instagram: "https://www.instagram.com",
        twitter: "https://twitter.com",
        linkedin: "https://www.linkedin.com",
    },
    copyrightText: "Copyright 2025 © gocart. All rights reserved.",
}

export const DEFAULT_FOOTER_CONFIG = {
    electronics: {
        ...BASE_CONFIG,
    },
    fashion: {
        ...BASE_CONFIG,
        brandDescription:
            "Your destination for timeless fashion. From outerwear and dresses to accessories — curated for elegance.",
    },
}

