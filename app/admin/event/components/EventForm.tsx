"use client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/utils/supabase/database.types";
import { useEffect, useState } from "react";

type Event = Database["public"]["Tables"]["events"]["Row"];

interface EventFormProps {
	event?: Event;
	onSubmit: (data: {
		eventName: string;
		eventDescription: string;
		startDateTime: string;
		endDateTime: string;
		presaleStart: string;
		presaleEnd: string;
		admissionStart: string;
		tickets: number;
	}) => Promise<void>;
	submitLabel?: string;
}

export function EventForm({
	event,
	onSubmit,
	submitLabel = "Event erstellen",
}: EventFormProps) {
	const [eventName, setEventName] = useState(event?.name || "");
	const [eventDescription, setEventDescription] = useState(
		event?.description || "",
	);
	const [startDateTime, setStartDateTime] = useState(
		event?.start_time
			? new Date(event.start_time).toISOString().slice(0, 16)
			: new Date().toISOString().slice(0, 16),
	);
	const [endDateTime, setEndDateTime] = useState(
		event?.end_time
			? new Date(event.end_time).toISOString().slice(0, 16)
			: new Date().toISOString().slice(0, 16),
	);

	const [presaleStart, setPresaleStart] = useState(
		event?.presale_start
			? new Date(event.presale_start).toISOString().slice(0, 16)
			: new Date().toISOString().slice(0, 16),
	);
	const [presaleEnd, setPresaleEnd] = useState(
		event?.presale_end
			? new Date(event.presale_end).toISOString().slice(0, 16)
			: new Date().toISOString().slice(0, 16),
	);
	const [admissionStart, setAdmissionStart] = useState(
		event?.admission_start
			? new Date(event.admission_start).toISOString().slice(0, 16)
			: new Date().toISOString().slice(0, 16),
	);
	const [tickets, setTickets] = useState(event?.tickets || 100);
	const [error, setError] = useState("");

	// Update end time whenever start time changes
	useEffect(() => {
		if (startDateTime) {
			const start = new Date(startDateTime);
			const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
			setEndDateTime(end.toISOString().slice(0, 16));
		}
	}, [startDateTime]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (
			!eventName ||
			!eventDescription ||
			!startDateTime ||
			!presaleStart ||
			!presaleEnd ||
			!admissionStart
		) {
			setError("Bitte fülle alle Felder aus");
			return;
		}

		const priceNumA = Number(tickets);

		if (Number.isNaN(priceNumA) || priceNumA <= 0) {
			setError("Anzahl Tickets muss größer als 0 sein");
			return;
		}

		const start = new Date(startDateTime);
		const presaleStartDate = new Date(presaleStart);
		const presaleEndDate = new Date(presaleEnd);
		const admissionStartDate = new Date(admissionStart);
		if (presaleStartDate >= presaleEndDate) {
			setError("VVK-Start muss vor VVK-Ende liegen");
			return;
		}

		if (presaleEndDate >= start) {
			setError("VVK-Ende muss vor der Startzeit liegen");
			return;
		}

		if (admissionStartDate >= start) {
			setError("Einlass muss vor der Startzeit liegen");
			return;
		}

		await onSubmit({
			eventName,
			eventDescription,
			startDateTime,
			endDateTime,
			presaleStart,
			presaleEnd,
			admissionStart,
			tickets: priceNumA,
		});
	};

	return (
		<Card className="flex-grow">
			<CardHeader>
				<CardTitle className="text-2xl">
					{event ? "Event bearbeiten" : "Neues Event"}
				</CardTitle>
			</CardHeader>
			<form onSubmit={handleSubmit}>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-1 gap-6">
						{" "}
						<Label htmlFor="event-name" className="text-lg">
							Event Name
						</Label>
						<Input
							id="event-name"
							placeholder="Sparrows vs. ..."
							value={eventName}
							onChange={(e) => setEventName(e.target.value)}
							required
							className="text-lg"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="event-description" className="text-lg">
							Event Beschreibung
						</Label>
						<Textarea
							id="event-description"
							placeholder="Beschreibung des Events"
							value={eventDescription}
							onChange={(e) => setEventDescription(e.target.value)}
							required
							className="min-h-[100px] text-lg"
						/>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<Label htmlFor="presale-start" className="text-lg">
								VVK Start
							</Label>
							<Input
								id="presale-start"
								type="datetime-local"
								value={presaleStart}
								onChange={(e) => setPresaleStart(e.target.value)}
								required
								className="text-lg"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="presale-end" className="text-lg">
								VVK Ende
							</Label>
							<Input
								id="presale-end"
								type="datetime-local"
								value={presaleEnd}
								onChange={(e) => setPresaleEnd(e.target.value)}
								required
								className="text-lg"
							/>
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<Label htmlFor="admission-start" className="text-lg">
								Einlass
							</Label>
							<Input
								id="admission-start"
								type="datetime-local"
								value={admissionStart}
								onChange={(e) => setAdmissionStart(e.target.value)}
								required
								className="text-lg"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="start-time" className="text-lg">
								Anpfiff
							</Label>
							<Input
								id="start-time"
								type="datetime-local"
								value={startDateTime}
								onChange={(e) => setStartDateTime(e.target.value)}
								required
								className="text-lg"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="tickets" className="text-lg">
							Anzahl Tickets
						</Label>
						<Input
							id="tickets"
							type="number"
							min="1"
							value={tickets}
							onChange={(e) => setTickets(Number(e.target.value))}
							required
							className="text-lg"
						/>
					</div>
					{error && <div className="text-red-500 text-sm">{error}</div>}
				</CardContent>
				<CardFooter>
					<Button type="submit" size="lg" className="w-full text-lg">
						{submitLabel}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
