"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCoupon({
	eventId,
	amount,
	code,
	type,
}: {
	eventId: number;
	amount: number;
	code: string;
	type: string;
}) {
	const supabase = createClient();
	const { error } = await supabase.from("coupons").insert({
		eventId: Number(eventId),
		amount,
		code,
		type,
	});

	if (error) {
		console.error("Error creating coupon:", error);
		redirect("/error");
	}

	revalidatePath(`/admin/event/${eventId}/coupons`, "page");
	redirect(`/admin/event/${eventId}/coupons`);
}

export async function updateCoupon({
	couponId,
	amount,
	code,
	type,
	eventId,
}: {
	couponId: number;
	eventId: number;
	amount: number;
	code: string;
	type: string;
}) {
	const supabase = createClient();

	const { error } = await supabase
		.from("coupons")
		.update({
			amount,
			code,
			type,
		})
		.eq("id", couponId);

	if (error) {
		console.error("Error updating coupon:", error);
		redirect("/error");
	}

	revalidatePath(`/admin/event/${eventId}/coupons`, "page");
	redirect(`/admin/event/${eventId}/coupons`);
}

export async function deleteCoupon({
	couponId,
	eventId,
}: {
	couponId: number;
	eventId: number;
}) {
	const supabase = createClient();

	const { error } = await supabase.from("coupons").delete().eq("id", couponId);

	if (error) {
		console.error("Error deleting coupon:", error);
		redirect("/error");
	}

	revalidatePath(`/admin/event/${eventId}/coupons`, "page");
	redirect(`/admin/event/${eventId}/coupons`);
}