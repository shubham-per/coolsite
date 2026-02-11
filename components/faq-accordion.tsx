"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { formatText } from "@/lib/format"


export interface FaqItem {
    id: number
    question: string
    answer: string
    order: number
    isActive: boolean
    customTabKey?: string
}

interface FaqAccordionProps {
    items: FaqItem[]
}

export function FaqAccordion({ items }: FaqAccordionProps) {
    const [openIds, setOpenIds] = useState<number[]>([])

    const toggleItem = (id: number) => {
        setOpenIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        )
    }

    if (items.length === 0) {
        return <div className="text-gray-500 italic">No FAQ items available.</div>
    }

    return (
        <div className="space-y-4">
            {items.map((item) => {
                const isOpen = openIds.includes(item.id)
                return (
                    <div
                        key={item.id}
                        className="rounded-lg overflow-hidden border border-blue-100 dark:border-gray-700 shadow-sm transition-all duration-200"
                    >
                        <button
                            onClick={() => toggleItem(item.id)}
                            className={`w-full text-left px-6 py-4 flex items-center justify-between transition-colors ${isOpen
                                ? "bg-blue-50 dark:bg-gray-800"
                                : "bg-blue-50 hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                                }`}
                        >
                            <span className="font-bold text-gray-800 dark:text-gray-100 text-lg pr-4">{item.question}</span>
                            {isOpen ? (
                                <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                            )}
                        </button>

                        <div
                            className={`bg-white dark:bg-gray-800/60 px-6 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-96 py-6 opacity-100" : "max-h-0 py-0 opacity-0"
                                }`}
                        >
                            <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-200">
                                <div className="text-gray-600 dark:text-gray-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(item.answer) }} />
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
