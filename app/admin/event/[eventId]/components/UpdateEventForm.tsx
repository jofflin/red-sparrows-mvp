"use client";

import type { Database } from "@/utils/supabase/database.types";
import moment from "moment";
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
			startDateTime: moment(data.startDateTime).utc().toISOString(),
			endDateTime: moment(data.endDateTime).utc().toISOString(),
			presaleStart: moment(data.presaleStart).utc().toISOString(),
			presaleEnd: moment(data.presaleEnd).utc().toISOString(),
			couponEnd: moment(data.couponEnd).utc().toISOString(),
			admissionStart: moment(data.admissionStart).utc().toISOString(),
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
