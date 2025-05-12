
import { Button } from "@/components/ui/button";
import { VENUE } from "@/lib/globals";
import type { Database } from "@/utils/supabase/database.types";
import { createClient } from "@/utils/supabase/server";
import { CalendarDays, MapPin, Users } from "lucide-react";
import moment from "moment-timezone";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createCoupon, deleteCoupon, updateCoupon } from "./actions";
import CouponPage from "./client";
moment.locale("de");

type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

export default async function EventDetailPage({
    params,
}: { params: { eventId: string } }) {
    const supabase = createClient();

    const {
        data: event,
        error: eventError,
        status: eventStatus,
        statusText: eventStatusText,
    } = await supabase
        .from("events")
        .select("*")
        .eq("id", params.eventId)
        .single();

    const {
        data: tickets,
        error: ticketError,
        status: ticketStatus,
        statusText: ticketStatusText,
    } = await supabase
        .from("tickets")
        .select("*")
        .eq("event_id", params.eventId)
        .not("bought_at", "is", null);

    const {
        data: coupons,
        error: couponError,
        status: couponStatus,
        statusText: couponStatusText,
    } = await supabase.from("coupons").select("*").eq("eventId", params.eventId);

    if (
        eventError ||
        eventStatus !== 200 ||
        ticketError ||
        ticketStatus !== 200 ||
        couponError ||
        couponStatus !== 200
    ) {
        console.error(eventError);
        redirect("/error");
    }

    const handleSubmit = async (data: {
        amount: number;
        code: string;
        type: string;
        couponId?: number;
    }) => {
        'use server'
        if (data.couponId) {
            await updateCoupon({ ...data, couponId: data.couponId, eventId: event.id });
        } else {
            await createCoupon({ ...data, eventId: event.id });
        }
    };


    const handleDelete = async (coupon: Coupon) => {
        'use server'
        await deleteCoupon({ couponId: coupon.id, eventId: event.id });
    };
    const data = coupons.map(coupon => ({
        coupon,
        usages: tickets.filter(ticket => ticket.couponId === coupon.id).length,
    }));

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex justify-between">
                    <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
                    <Button asChild variant="outline">
                        <Link href="/admin">Dashboard</Link>
                    </Button>
                </div>
                <div className="flex flex-wrap gap-6 mb-6">
                    <div className="flex items-center">
                        <CalendarDays className="mr-2 h-5 w-5 text-gray-500" />
                        <span>
                            {moment.tz(event.start_time, "Europe/Berlin").format("DD.MM.YYYY HH:mm")}
                        </span>
                    </div>
                    <div className="flex items-center">
                        <MapPin className="mr-2 h-5 w-5 text-gray-500" />
                        <span>{VENUE}</span>
                    </div>
                    <div className="flex items-center">
                        <Users className="mr-2 h-5 w-5 text-gray-500" />
                        <span>{tickets.length} Tickets verkauft</span>
                    </div>
                </div>
            </div>
            <CouponPage
                data={data}
                handleSubmit={handleSubmit}
                handleDelete={handleDelete}
            />
        </div>
    );
}
