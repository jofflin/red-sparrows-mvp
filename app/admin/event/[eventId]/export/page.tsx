import { Button } from "@/components/ui/button";
import { VENUE } from "@/lib/globals";
import { createClient } from "@/utils/supabase/server";
import { CalendarDays, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import DownloadButton from "./download";

export default async function EventExportPage({
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
		data: sessions,
		error: sessionError,
		status: sessionStatus,
		statusText: sessionStatusText,
	} = await supabase
		.from("purchaseSession")
		.select("*")
		.not("paid_at", "is", null);

	const {
		data: categories,
		error: categoryError,
		status: categoryStatus,
		statusText: categoryStatusText,
	} = await supabase.from("ticket_categories").select("*");

	if (
		sessionError ||
		sessionStatus !== 200 ||
		eventError ||
		eventStatus !== 200 ||
		ticketError ||
		ticketStatus !== 200 ||
		categoryError ||
		categoryStatus !== 200
	) {
		console.error(eventError, sessionError, ticketError, categoryError);
		redirect("/error");
	}

	// create csv file for download
	const csv: Array<Array<string | number | null>> = [];
	for (const session of sessions) {
		const sessionTickets = tickets.filter(
			(ticket) => ticket.session_id === session.stripe_session_id,
		);
		if (sessionTickets.length === 0) {
			continue;
		}
		const row = [
			session.id,
			sessionTickets.filter(
				(ticket) => ticket.ticket_category === 1,
			).length,
			sessionTickets.filter((ticket) => ticket.ticket_category === 2).length,
			sessionTickets.filter((ticket) => ticket.ticket_category === 3).length,
			session.paid_at &&
			new Date(session.paid_at).toLocaleString("de-DE", {
				dateStyle: "full",
				timeStyle: "short",
				timeZone: "Europe/Berlin",
			}),
		];
		csv.push(row);
	}
	const csvPrefix =
		"data:text/csv;charset=utf-8," +
		"Kunde,Tickets Block A/default,Tickets Block B,Tickets Block C,Bezahlt am\n";
	const csvContent = csvPrefix + csv.map((row) => row.join(",")).join("\n");

	// download csv file button styled, also a return button
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
							{new Date(event.start_time).toLocaleString("de-DE", {
								dateStyle: "full",
								timeStyle: "short",
								timeZone: "Europe/Berlin",
							})}
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
				<div className="flex justify-end">
					<DownloadButton csvContent={csvContent} />
				</div>
			</div>
		</div>
	);
}
