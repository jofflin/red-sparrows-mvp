import TicketSelection from "@/components/TicketSelection";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { VENUE } from "@/lib/globals";
import { createClient } from "@/utils/supabase/server";
import { CalendarDays, Clock, DoorOpen, Info, Mail, MapPin } from "lucide-react";
import moment from "moment-timezone";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
moment.locale("de");

export default async function EventPage({
	params,
}: {
	params: { eventId: string };
}) {
	const supabase = createClient();

	const {
		data: event,
		error: eventError,
		status: eventStatus,
	} = await supabase
		.from("events")
		.select("*")
		.eq("id", params.eventId)
		.maybeSingle();
	if (eventError || eventStatus !== 200 || !event) {
		console.error(eventError);
		redirect("/error");
	}

	// ticket for the current event that have bought_at set or reserved_until is in the future
	const {
		data: tickets,
		error: ticketError,
		status: ticketStatus,
	} = await supabase
		.from("tickets")
		.select(`
			reserved_until,
			redeemed_at,
			bought_at,
			session_id,
			couponId
		`)
		.eq("event_id", event.id)

	if (ticketError || ticketStatus !== 200) {
		console.error(ticketError);
		redirect("/error");
	}


	const {
		data: coupons,
		error: couponError,
		status: couponStatus,
	} = await supabase
		.from("coupons")
		.select(`
			type,
			amount
		`)
		.eq("eventId", event.id)
		.eq("type", "2")

	if (couponError || couponStatus !== 200) {
		console.error(couponError);
		redirect("/error");
	}

	const {
		data: prices,
		error: priceError,
		status: priceStatus,
	} = await supabase.from("ticket_categories").select("*").neq("id", 6);

	if (priceError || priceStatus !== 200) {
		console.error(priceError);
		redirect("/error");
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-16">
				<div className="lg:col-span-2 space-y-8">
					{/* Event Image */}
					{/* Event Details */}
					<Card className="bg-secondary-50">
						<CardHeader>
							<CardTitle>Info:</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-gray-600">
								Es gab Probleme bei dem Download der Tickets und dem E-Mail Versand. Dies betrifft Tickets, die vor dem 12.05 um 22 Uhr gekauft wurden. Sollten Sie im Laufe der nächsten 24h keine Tickets per E-Mail erhalten, wenden Sie sich bitte an uns.<br />
								Bei Neubestellungen treten keine Probleme auf.
							</p>
							<Button asChild>
								<Link href="mailto:info@getnono.app">
									<Mail className="mr-2 h-4 w-4" />
									info@getnono.app
								</Link>
							</Button>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Event Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-gray-600">{event.description}</p>
							<div className="flex items-center text-sm text-gray-500">
								<MapPin className="mr-2 h-4 w-4 text-secondary-500" />
								<span>{VENUE}</span>
							</div>
							<div className="flex items-center text-sm text-gray-500">
								<CalendarDays className="mr-2 h-4 w-4 text-secondary-500" />
								<span>
									Anpfiff: {moment.tz(event.start_time, "Europe/Berlin").format("DD.MM.YYYY HH:mm")}{" "}
									Uhr
								</span>
							</div>
							<div className="flex items-center text-sm text-gray-500">
								<Clock className="mr-2 h-4 w-4 text-secondary-500" />
								<span>
									Vorverkauf:{" "}
									{moment.tz(event.presale_start, "Europe/Berlin").format("DD.MM.YYYY HH:mm")}{" "}
									bis{" "}
									{moment.tz(event.presale_end, "Europe/Berlin").format("DD.MM.YYYY HH:mm")}{" "}
									Uhr
								</span>
							</div>
							<div className="flex items-center text-sm text-gray-500">
								<DoorOpen className="mr-2 h-4 w-4 text-secondary-500" />
								<span>
									Einlass ab:{" "}
									{moment.tz(event.admission_start, "Europe/Berlin").format("DD.MM.YYYY HH:mm")}{" "}
									Uhr
								</span>
							</div>
						</CardContent>
					</Card>
					<Image
						// src={`/images/${event.id}.jpg`}
						src={`/images/${event.id}.jpg`}
						alt={event.name}
						width={1000}
						height={1000}
						className="w-full h-auto rounded-xl border bg-card text-card-foreground shadow"
					/>

					{/* Seatmap */}
					{/* <SeatmapSection event={event} /> */}

					{/* Ticket Categories - More Compact */}
					<Card>
						<CardHeader className="pb-4">
							<CardTitle>Ticket Kategorien</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="divide-y divide-gray-100">
								{prices.map((price) => (
									<div
										key={price.id}
										className="flex items-center py-3 first:pt-0 last:pb-0"
									>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<Info className="h-4 w-4 text-secondary-600" />
												<h3 className="font-medium">{price.name}</h3>
												<span className="font-semibold text-secondary-600">
													{price.price} €
												</span>
											</div>
											<p className="text-sm text-gray-600 mt-0.5 ml-6">
												{price.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Ticket Selection */}
				<div className="lg:col-span-1">
					<div className="sticky top-20">
						{moment.tz(event.start_time, "Europe/Berlin").isBefore(moment.tz("Europe/Berlin")) ? (
							<Card>
								<CardHeader>
									<CardTitle>Der Vorverkauf hat geendet</CardTitle>
									<CardDescription>
										Der Vorverkauf für dieses Event hat geendet. Tickets sind
										nur noch an der Abendkasse erhältlich.
									</CardDescription>
								</CardHeader>
							</Card>
						) : moment.tz(event.presale_start, "Europe/Berlin").isAfter(moment.tz("Europe/Berlin")) ? (
							<Card>
								<CardHeader>
									<CardTitle>Der Vorverkauf hat noch nicht begonnen</CardTitle>
									<CardDescription>
										Der Vorverkauf für dieses Event hat noch nicht begonnen.
										Bitte warten Sie bis zum{" "}
										{moment.tz(event.presale_start, "Europe/Berlin").format("DD.MM.YYYY HH:mm")}
										Uhr.
									</CardDescription>
								</CardHeader>
							</Card>
						) : (
							<TicketSelection
								couponsData={coupons}
								event={event}
								ticketTypes={prices}
								tickets={tickets}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
