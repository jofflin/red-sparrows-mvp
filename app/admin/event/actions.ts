"use server";

import { createClient } from "@/utils/supabase/server";
import moment from "moment-timezone";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
moment.locale("de");
export async function createEvent({
	eventName,
	eventDescription,
	startDateTime,
	endDateTime,
	presaleStart,
	presaleEnd,
	couponEnd,
	tickets,
	admissionStart,
}: {
	eventName: string;
	eventDescription: string;
	startDateTime: string;
	endDateTime: string;
	presaleStart: string;
	presaleEnd: string;
	couponEnd: string;
	tickets: number;
	admissionStart: string;
}) {
	const supabase = createClient();

	console.log(startDateTime, endDateTime, presaleStart, presaleEnd, couponEnd, admissionStart);
	// Convert to UTC timestamps
	const startTime = moment.tz(startDateTime, "Europe/Berlin").toISOString();
	const endTime = moment.tz(endDateTime, "Europe/Berlin").toISOString();
	const presaleStartTime = moment.tz(presaleStart, "Europe/Berlin").toISOString();
	const presaleEndTime = moment.tz(presaleEnd, "Europe/Berlin").toISOString();
	const admissionStartTime = moment.tz(admissionStart, "Europe/Berlin").toISOString();

	const { error } = await supabase.from("events").insert({
		name: eventName,
		description: eventDescription,
		start_time: startTime,
		end_time: endTime,
		presale_start: presaleStartTime,
		presale_end: presaleEndTime,
		coupon_end: couponEnd,
		admission_start: admissionStartTime,
		tickets,
	});

	if (error) {
		console.error("Error creating event:", error);
		redirect("/error");
	}

	revalidatePath("/admin", "page");
	redirect("/admin");
}

export async function updateEvent({
	id,
	eventName,
	eventDescription,
	startDateTime,
	endDateTime,
	presaleStart,
	presaleEnd,
	couponEnd,
	tickets,
	admissionStart,
}: {
	id: number;
	eventName: string;
	eventDescription: string;
	startDateTime: string;
	endDateTime: string;
	presaleStart: string;
	presaleEnd: string;
	couponEnd: string;
	tickets: number;
	admissionStart: string;
}) {
	const supabase = createClient();

	// Convert to UTC timestamps
	const startTime = moment.tz(startDateTime, "Europe/Berlin").toISOString();
	const endTime = moment.tz(endDateTime, "Europe/Berlin").toISOString();
	const presaleStartTime = moment.tz(presaleStart, "Europe/Berlin").toISOString();
	const presaleEndTime = moment.tz(presaleEnd, "Europe/Berlin").toISOString();
	const admissionStartTime = moment.tz(admissionStart, "Europe/Berlin").toISOString();


	const { error } = await supabase
		.from("events")
		.update({
			name: eventName,
			description: eventDescription,
			start_time: startTime,
			end_time: endTime,
			presale_start: presaleStartTime,
			presale_end: presaleEndTime,
			coupon_end: couponEnd,
			admission_start: admissionStartTime,
			tickets,
		})
		.eq("id", id);

	if (error) {
		console.error("Error updating event:", error);
		redirect("/error");
	}

	revalidatePath("/admin", "page");
	redirect("/admin");
}
