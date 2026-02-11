"use client"

import { useState } from "react"
import { WindowConfig } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function ArchivedManager({
    windows,
    onChange,
}: {
    windows: WindowConfig[]
    onChange: (windows: WindowConfig[]) => void
}) {
    const [savingId, setSavingId] = useState<number | null>(null)
    const archived = windows.filter((w) => w.isArchived)

    const unarchive = async (window: WindowConfig) => {
        setSavingId(window.id)
        try {
            const res = await fetch("/api/windows", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...window, isArchived: false }),
            })
            if (!res.ok) {
                alert("Failed to unarchive window")
                return
            }
            const updated = (await res.json()) as WindowConfig
            onChange(windows.map((w) => (w.id === updated.id ? updated : w)))
        } finally {
            setSavingId(null)
        }
    }

    if (archived.length === 0) {
        return <div className="text-sm text-gray-500">No archived windows.</div>
    }

    return (
        <div className="space-y-3">
            {archived.map((w) => (
                <div key={w.id} className="flex items-center justify-between p-3 border rounded bg-gray-50">
                    <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{w.label}</span>
                        <span className="text-xs text-gray-500">({w.key})</span>
                        <Badge variant="outline" className="text-xs">
                            {w.type}
                        </Badge>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => unarchive(w)} disabled={savingId === w.id}>
                        Unarchive
                    </Button>
                </div>
            ))}
        </div>
    )
}
