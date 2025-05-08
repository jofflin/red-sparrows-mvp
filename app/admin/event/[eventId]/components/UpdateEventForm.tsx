"use client";

import type { Database } from "@/utils/supabase/database.types";
import { updateEvent } from "../../actions";
import { EventForm } from "../../components/EventForm";

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
