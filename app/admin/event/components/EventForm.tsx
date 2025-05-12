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
import moment from "moment";
import { useEffect, useState } from "react";

moment.locale("de");

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
		couponEnd: string;
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
			? moment(event.start_time).format("YYYY-MM-DDTHH:mm")
			: moment().format("YYYY-MM-DDTHH:mm"),
	);
	console.log(startDateTime);
	console.log(event?.start_time);
	const [endDateTime, setEndDateTime] = useState(
		event?.end_time
			? moment(event.end_time).format("YYYY-MM-DDTHH:mm")
			: moment().format("YYYY-MM-DDTHH:mm"),
	);

	const [presaleStart, setPresaleStart] = useState(
		event?.presale_start
			? moment(event.presale_start).format("YYYY-MM-DDTHH:mm")
			: moment().format("YYYY-MM-DDTHH:mm"),
	);
	const [presaleEnd, setPresaleEnd] = useState(
		event?.presale_end
			? moment(event.presale_end).format("YYYY-MM-DDTHH:mm")
			: moment().format("YYYY-MM-DDTHH:mm"),
	);
	const [admissionStart, setAdmissionStart] = useState(
		event?.admission_start
			? moment(event.admission_start).format("YYYY-MM-DDTHH:mm")
			: moment().format("YYYY-MM-DDTHH:mm"),
	);
	const [couponEnd, setCouponEnd] = useState(
		event?.coupon_end
			? moment(event.coupon_end).format("YYYY-MM-DDTHH:mm")
			: moment().format("YYYY-MM-DDTHH:mm"),
	);
	const [tickets, setTickets] = useState(event?.tickets || 100);
	const [error, setError] = useState("");

	// Update end time whenever start time changes
	useEffect(() => {
		if (startDateTime) {
			const start = moment(startDateTime);
			const end = start.add(2, "hours");
			setEndDateTime(end.format("YYYY-MM-DDTHH:mm"));
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
			!admissionStart ||
			!couponEnd
		) {
			setError("Bitte fülle alle Felder aus");
			return;
		}

		const priceNumA = Number(tickets);

		if (Number.isNaN(priceNumA) || priceNumA <= 0) {
			setError("Anzahl Tickets muss größer als 0 sein");
			return;
		}

		const start = moment(startDateTime);
		const presaleStartDate = moment(presaleStart);
		const presaleEndDate = moment(presaleEnd);
		const admissionStartDate = moment(admissionStart);
		const couponEndDate = moment(couponEnd);
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

		if (couponEndDate >= start) {
			setError("Coupon-Ende muss vor der Startzeit liegen");
			return;
		}

		await onSubmit({
			eventName,
			eventDescription,
			startDateTime,
			endDateTime,
			presaleStart,
			presaleEnd,
			couponEnd,
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
							<Label htmlFor="coupon-end" className="text-lg">
								Coupons verfügbar bis
							</Label>
							<Input
								id="coupon-end"
								type="datetime-local"
								value={couponEnd}
								onChange={(e) => setCouponEnd(e.target.value)}
								required
								className="text-lg"
							/>
						</div>
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
