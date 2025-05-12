"use client";

import type { Database } from "@/utils/supabase/database.types";
import moment from "moment-timezone";
import { updateEvent } from "../../actions";
import { EventForm } from "../../components/EventForm";
moment.locale("de");
type Event = Database["public"]["Tables"]["events"]["Row"];

interface UpdateEventFormProps {
	event: Event;
}

export function UpdateEventForm({ event }: UpdateEventFormProps) {
	const handleSubmit = async (data: {
		eventName: string;
		eventDescription: string;
		startDateTime: string;
		endDateTime: string;
		presaleStart: string;
		presaleEnd: string;
		couponEnd: string;
		tickets: number;
		admissionStart: string;
	}) => {
		await updateEvent({
			id: event.id,
			...data,
			startDateTime: moment.tz(data.startDateTime, "Europe/Berlin").toISOString(),
			endDateTime: moment.tz(data.endDateTime, "Europe/Berlin").toISOString(),
			presaleStart: moment.tz(data.presaleStart, "Europe/Berlin").toISOString(),
			presaleEnd: moment.tz(data.presaleEnd, "Europe/Berlin").toISOString(),
			couponEnd: moment.tz(data.couponEnd, "Europe/Berlin").toISOString(),
			admissionStart: moment.tz(data.admissionStart, "Europe/Berlin").toISOString(),
		});
	};

	return (
		<div className="mt-8">
			<EventForm
				event={event}
				onSubmit={handleSubmit}
				submitLabel="Event aktualisieren"
			/>
		</div>
	);
}
