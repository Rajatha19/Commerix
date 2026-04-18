'use client'

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import toast from "react-hot-toast"
import { Save, RotateCcw } from "lucide-react"
import { DEFAULT_FOOTER_CONFIG } from "@/lib/footerDefaults"

const buildEmptyConfig = () => ({
    electronics: { ...DEFAULT_FOOTER_CONFIG.electronics },
    fashion: { ...DEFAULT_FOOTER_CONFIG.fashion },
})

const normalizeConfig = (raw) => {
    if (!raw || typeof raw !== "object") return buildEmptyConfig()
    if (raw.electronics || raw.fashion) {
        return {
            electronics: { ...DEFAULT_FOOTER_CONFIG.electronics, ...(raw.electronics || {}) },
            fashion: { ...DEFAULT_FOOTER_CONFIG.fashion, ...(raw.fashion || {}) },
        }
    }

    // Legacy flat
    const base = { ...DEFAULT_FOOTER_CONFIG.electronics, ...raw }
    const fashionBrand =
        raw.brandDescriptionFashion || DEFAULT_FOOTER_CONFIG.fashion.brandDescription

    return {
        electronics: { ...DEFAULT_FOOTER_CONFIG.electronics, ...base },
        fashion: {
            ...DEFAULT_FOOTER_CONFIG.fashion,
            ...base,
            brandDescription: fashionBrand,
        },
    }
}

export default function AdminFooterPage() {
    const { getToken } = useAuth()
    const [config, setConfig] = useState(buildEmptyConfig)
    const [activeTab, setActiveTab] = useState("electronics")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [resetting, setResetting] = useState(false)

    const fetchConfig = async () => {
        try {
            const { data } = await axios.get("/api/footer-config")
            if (data?.config && typeof data.config === "object") {
                setConfig(normalizeConfig(data.config))
            } else {
                setConfig(buildEmptyConfig())
            }
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to load footer config")
            setConfig(buildEmptyConfig())
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const token = await getToken()
            await axios.post(
                "/api/footer-config",
                { config },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )
            toast.success("Footer updated")
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to save footer")
        } finally {
            setSaving(false)
        }
    }

    const handleReset = () => {
        setResetting(true)
        try {
            setConfig(buildEmptyConfig())
            toast.success("Reset to defaults (not yet saved)")
        } finally {
            setResetting(false)
        }
    }

    useEffect(() => {
        fetchConfig()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[320px]">
                <div className="text-zinc-500">Loading...</div>
            </div>
        )
    }

    const current = config[activeTab] || DEFAULT_FOOTER_CONFIG[activeTab]

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-1">
                    Footer <span className="text-emerald-400">Customization</span>
                </h1>
                <p className="text-sm text-zinc-500">
                    Maintain separate footer content for{" "}
                    <span className="text-emerald-400 font-medium">electronics</span> and{" "}
                    <span className="text-emerald-400 font-medium">fashion</span>. Use the tabs
                    below to switch between variants.
                </p>
            </div>

            <div className="inline-flex rounded-full border border-zinc-700/70 bg-zinc-900/80 p-1 text-xs sm:text-sm">
                {["electronics", "fashion"].map((key) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setActiveTab(key)}
                        className={`px-4 py-1.5 rounded-full font-medium transition ${
                            activeTab === key
                                ? "bg-emerald-500 text-zinc-900 shadow-sm shadow-emerald-500/50"
                                : "text-zinc-400 hover:text-zinc-100"
                        }`}
                    >
                        {key === "electronics" ? "Electronics" : "Fashion"}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-100">Brand description</h2>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">
                                {activeTab === "electronics"
                                    ? "Electronics footer description"
                                    : "Fashion footer description"}
                            </label>
                            <textarea
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                value={current.brandDescription}
                                onChange={(e) =>
                                    setConfig((c) => ({
                                        ...c,
                                        [activeTab]: {
                                            ...c[activeTab],
                                            brandDescription: e.target.value,
                                        },
                                    }))
                                }
                            />
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-100">Link sections</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Products section title
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.productsSectionTitle}
                                    onChange={(e) =>
                                        setConfig((c) => ({
                                            ...c,
                                            [activeTab]: {
                                                ...c[activeTab],
                                                productsSectionTitle: e.target.value,
                                            },
                                        }))
                                    }
                                />
                            </div>
                            {current.productsLinks.map((link, index) => (
                                <div key={index} className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                                            Link label #{index + 1}
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                            value={link.text}
                                            onChange={(e) =>
                                                setConfig((c) => {
                                                    const next = [...c[activeTab].productsLinks]
                                                    next[index] = { ...next[index], text: e.target.value }
                                                    return {
                                                        ...c,
                                                        [activeTab]: {
                                                            ...c[activeTab],
                                                            productsLinks: next,
                                                        },
                                                    }
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                                            Link URL #{index + 1}
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                            value={link.path}
                                            onChange={(e) =>
                                                setConfig((c) => {
                                                    const next = [...c[activeTab].productsLinks]
                                                    next[index] = { ...next[index], path: e.target.value }
                                                    return {
                                                        ...c,
                                                        [activeTab]: {
                                                            ...c[activeTab],
                                                            productsLinks: next,
                                                        },
                                                    }
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Website section title
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.websiteSectionTitle}
                                    onChange={(e) =>
                                        setConfig((c) => ({
                                            ...c,
                                            [activeTab]: {
                                                ...c[activeTab],
                                                websiteSectionTitle: e.target.value,
                                            },
                                        }))
                                    }
                                />
                            </div>
                            {current.websiteLinks.map((link, index) => (
                                <div key={index} className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                                            Link label #{index + 1}
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                            value={link.text}
                                            onChange={(e) =>
                                                setConfig((c) => {
                                                    const next = [...c[activeTab].websiteLinks]
                                                    next[index] = { ...next[index], text: e.target.value }
                                                    return {
                                                        ...c,
                                                        [activeTab]: {
                                                            ...c[activeTab],
                                                            websiteLinks: next,
                                                        },
                                                    }
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                                            Link URL #{index + 1}
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                            value={link.path}
                                            onChange={(e) =>
                                                setConfig((c) => {
                                                    const next = [...c[activeTab].websiteLinks]
                                                    next[index] = { ...next[index], path: e.target.value }
                                                    return {
                                                        ...c,
                                                        [activeTab]: {
                                                            ...c[activeTab],
                                                            websiteLinks: next,
                                                        },
                                                    }
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-100">Contact & trust</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Phone text
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.contactLinks.phone.text}
                                    onChange={(e) =>
                                        setConfig((c) => ({
                                            ...c,
                                            [activeTab]: {
                                                ...c[activeTab],
                                                contactLinks: {
                                                    ...c[activeTab].contactLinks,
                                                    phone: {
                                                        ...c[activeTab].contactLinks.phone,
                                                        text: e.target.value,
                                                    },
                                                },
                                            },
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Phone link URL
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.contactLinks.phone.path}
                                    onChange={(e) =>
                                        setConfig((c) => ({
                                            ...c,
                                            [activeTab]: {
                                                ...c[activeTab],
                                                contactLinks: {
                                                    ...c[activeTab].contactLinks,
                                                    phone: {
                                                        ...c[activeTab].contactLinks.phone,
                                                        path: e.target.value,
                                                    },
                                                },
                                            },
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Email text
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.contactLinks.email.text}
                                    onChange={(e) =>
                                        setConfig((c) => ({
                                            ...c,
                                            [activeTab]: {
                                                ...c[activeTab],
                                                contactLinks: {
                                                    ...c[activeTab].contactLinks,
                                                    email: {
                                                        ...c[activeTab].contactLinks.email,
                                                        text: e.target.value,
                                                    },
                                                },
                                            },
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Email link URL
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.contactLinks.email.path}
                                    onChange={(e) =>
                                        setConfig((c) => ({
                                            ...c,
                                            [activeTab]: {
                                                ...c[activeTab],
                                                contactLinks: {
                                                    ...c[activeTab].contactLinks,
                                                    email: {
                                                        ...c[activeTab].contactLinks.email,
                                                        path: e.target.value,
                                                    },
                                                },
                                            },
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Address text
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.contactLinks.address.text}
                                    onChange={(e) =>
                                        setConfig((c) => ({
                                            ...c,
                                            [activeTab]: {
                                                ...c[activeTab],
                                                contactLinks: {
                                                    ...c[activeTab].contactLinks,
                                                    address: {
                                                        ...c[activeTab].contactLinks.address,
                                                        text: e.target.value,
                                                    },
                                                },
                                            },
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Address link URL
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.contactLinks.address.path}
                                    onChange={(e) =>
                                        setConfig((c) => ({
                                            ...c,
                                            [activeTab]: {
                                                ...c[activeTab],
                                                contactLinks: {
                                                    ...c[activeTab].contactLinks,
                                                    address: {
                                                        ...c[activeTab].contactLinks.address,
                                                        path: e.target.value,
                                                    },
                                                },
                                            },
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Trust badge #1 label
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.trustBadges[0]?.label || ""}
                                    onChange={(e) =>
                                        setConfig((c) => {
                                            const next = [...c[activeTab].trustBadges]
                                            next[0] = { ...(next[0] || {}), label: e.target.value }
                                            return {
                                                ...c,
                                                [activeTab]: {
                                                    ...c[activeTab],
                                                    trustBadges: next,
                                                },
                                            }
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Trust badge #1 description
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.trustBadges[0]?.desc || ""}
                                    onChange={(e) =>
                                        setConfig((c) => {
                                            const next = [...c[activeTab].trustBadges]
                                            next[0] = { ...(next[0] || {}), desc: e.target.value }
                                            return {
                                                ...c,
                                                [activeTab]: {
                                                    ...c[activeTab],
                                                    trustBadges: next,
                                                },
                                            }
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Trust badge #2 label
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.trustBadges[1]?.label || ""}
                                    onChange={(e) =>
                                        setConfig((c) => {
                                            const next = [...c[activeTab].trustBadges]
                                            next[1] = { ...(next[1] || {}), label: e.target.value }
                                            return {
                                                ...c,
                                                [activeTab]: {
                                                    ...c[activeTab],
                                                    trustBadges: next,
                                                },
                                            }
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Trust badge #2 description
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.trustBadges[1]?.desc || ""}
                                    onChange={(e) =>
                                        setConfig((c) => {
                                            const next = [...c[activeTab].trustBadges]
                                            next[1] = { ...(next[1] || {}), desc: e.target.value }
                                            return {
                                                ...c,
                                                [activeTab]: {
                                                    ...c[activeTab],
                                                    trustBadges: next,
                                                },
                                            }
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Trust badge #3 label
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.trustBadges[2]?.label || ""}
                                    onChange={(e) =>
                                        setConfig((c) => {
                                            const next = [...c[activeTab].trustBadges]
                                            next[2] = { ...(next[2] || {}), label: e.target.value }
                                            return {
                                                ...c,
                                                [activeTab]: {
                                                    ...c[activeTab],
                                                    trustBadges: next,
                                                },
                                            }
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Trust badge #3 description
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.trustBadges[2]?.desc || ""}
                                    onChange={(e) =>
                                        setConfig((c) => {
                                            const next = [...c[activeTab].trustBadges]
                                            next[2] = { ...(next[2] || {}), desc: e.target.value }
                                            return {
                                                ...c,
                                                [activeTab]: {
                                                    ...c[activeTab],
                                                    trustBadges: next,
                                                },
                                            }
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-100">Social & copyright</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Facebook URL
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.socialLinks.facebook}
                                    onChange={(e) =>
                                        setConfig((c) => ({
                                            ...c,
                                            [activeTab]: {
                                                ...c[activeTab],
                                                socialLinks: {
                                                    ...c[activeTab].socialLinks,
                                                    facebook: e.target.value,
                                                },
                                            },
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Instagram URL
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.socialLinks.instagram}
                                    onChange={(e) =>
                                        setConfig((c) => ({
                                            ...c,
                                            [activeTab]: {
                                                ...c[activeTab],
                                                socialLinks: {
                                                    ...c[activeTab].socialLinks,
                                                    instagram: e.target.value,
                                                },
                                            },
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Twitter URL
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.socialLinks.twitter}
                                    onChange={(e) =>
                                        setConfig((c) => ({
                                            ...c,
                                            [activeTab]: {
                                                ...c[activeTab],
                                                socialLinks: {
                                                    ...c[activeTab].socialLinks,
                                                    twitter: e.target.value,
                                                },
                                            },
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    LinkedIn URL
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.socialLinks.linkedin}
                                    onChange={(e) =>
                                        setConfig((c) => ({
                                            ...c,
                                            [activeTab]: {
                                                ...c[activeTab],
                                                socialLinks: {
                                                    ...c[activeTab].socialLinks,
                                                    linkedin: e.target.value,
                                                },
                                            },
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Copyright text
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-700/60 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    value={current.copyrightText}
                                    onChange={(e) =>
                                        setConfig((c) => ({
                                            ...c,
                                            [activeTab]: {
                                                ...c[activeTab],
                                                copyrightText: e.target.value,
                                            },
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save changes"}
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={resetting}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-600 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 font-medium text-sm transition disabled:opacity-50"
                    >
                        <RotateCcw className="w-4 h-4" />
                        {resetting ? "Resetting..." : "Reset to defaults"}
                    </button>
                </div>
            </form>
        </div>
    )
}

