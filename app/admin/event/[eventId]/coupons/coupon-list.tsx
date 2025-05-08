'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Database } from '@/utils/supabase/database.types'
import { Pencil, Trash2 } from "lucide-react"

type Coupon = Database["public"]["Tables"]["coupons"]["Row"]


interface CouponListProps {
    data: {
        coupon: Coupon
        usages: number
    }[]
    onEdit: (coupon: Coupon) => void
    onDelete: (coupon: Coupon) => void
}

export default function CouponList({ data, onEdit, onDelete }: CouponListProps) {

    const typeMap = {
        '1': "Gast",
        '2': "Sponsor",
    }

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bestehende Coupons</h2>
            <div className="flex flex-col gap-4 w-full">
                {data.map((entry) => (
                    <div key={entry.coupon.id} className="flex justify-between items-center bg-gray-100 p-4 rounded-lg flex-col md:flex-row">
                        <div className="flex flex-col">
                            <p className="text-gray-600">Code: {entry.coupon.code}</p>
                            {entry.coupon.type === '1' && <p className="text-gray-600 font-semibold">Dieser Coupon erhöht die Menge an Tickets von 90% auf 100%.</p>}
                            {entry.coupon.type === '2' && <p className="text-gray-600">Gesamt: {entry.coupon.amount}</p>}
                            {entry.coupon.type === '2' && <p className="text-gray-600">Noch Verfügbar: {entry.coupon.amount - entry.usages}</p>}
                            {entry.coupon.type === '2' && <p className="text-gray-600 font-semibold">Dieser Coupon wird eingelöst, um Tickets kostenfrei zu erhalten.</p>}
                            <p className="text-lg font-semibold mt-2">Typ: {typeMap[entry.coupon.type as keyof typeof typeMap]}</p>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <Button variant="outline" onClick={() => onEdit(entry.coupon)}>
                                <Pencil className="h-4 w-4" />
                                <span className="text-sm">Bearbeiten</span>
                            </Button>
                            <Button variant="outline" onClick={() => onDelete(entry.coupon)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="text-sm">Löschen</span>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 