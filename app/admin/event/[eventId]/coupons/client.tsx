'use client'
import { Button } from "@/components/ui/button";
import { VENUE } from "@/lib/globals";
import type { Database } from "@/utils/supabase/database.types";
import { CalendarDays, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteCoupon } from "./actions";
import { CouponForm } from "./coupon-form";
import CouponList from "./coupon-list";

type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

interface CouponPageProps {
    data: {
        coupon: Database["public"]["Tables"]["coupons"]["Row"];
        usages: number;
    }[]
    handleSubmit: (data: {
        couponId?: number;
        amount: number;
        code: string;
        type: string;
    }) => Promise<void>;
    handleDelete: (coupon: Coupon) => Promise<void>;
}

export default function CouponPage({
    data,
    handleSubmit,
    handleDelete,
}: CouponPageProps) {
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);


    const handleEdit = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
    };

    const handleSubmitCouponForm = async (data: {
        couponId?: number;
        amount: number;
        code: string;
        type: string;
    }) => {
        await handleSubmit(data);
        setSelectedCoupon(null);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <CouponForm onSubmit={handleSubmitCouponForm} coupon={selectedCoupon} />
            <CouponList data={data} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
    );
}
