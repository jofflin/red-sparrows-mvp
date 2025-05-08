"use server";

import type { Database } from "@/utils/supabase/database.types";
import { createClient } from "@/utils/supabase/server";

export async function getCoupon(
    couponCode: string,
    eventId: number,
): Promise<{ coupon: Database["public"]["Tables"]["coupons"]["Row"], used: number } | null> {
    const supabase = createClient();
    const { data: coupon, error: couponError, status: couponStatus } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .eq("eventId", eventId)
        .maybeSingle();

    if (couponError || couponStatus !== 200 || !coupon) {
        return null;
    }

    const { data: tickets, error: ticketsError, status: ticketsStatus } = await supabase
        .from("tickets")
        .select("*")
        .eq("event_id", eventId)

    if (ticketsError || ticketsStatus !== 200 || !tickets) {
        return null;
    }

    const used = tickets.filter((ticket) => ticket.couponId === coupon.id).length;

    return {
        coupon: coupon,
        used: used,
    };
}
