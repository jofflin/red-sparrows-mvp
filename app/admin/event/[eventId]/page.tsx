import { Button } from "@/components/ui/button";
import { VENUE } from "@/lib/globals";
import { createClient } from "@/utils/supabase/server";
import { CalendarDays, MapPin, Users } from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UpdateEventForm } from "./components/UpdateEventForm";
import TicketTable from "./ticket-table";
moment.locale("de");

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
		data: categories,
		error: categoryError,
		status: categoryStatus,
		statusText: categoryStatusText,
	} = await supabase.from("ticket_categories").select("*");

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
		categoryError ||
		categoryStatus !== 200 ||
		couponError ||
		couponStatus !== 200
	) {
		console.error(eventError);
		redirect("/error");
	}

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
							{moment(event.start_time).format("DD.MM.YYYY HH:mm")}
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
			<UpdateEventForm event={event} />
			{/* <SeasonTicketBlocker seats={seats} eventId={event.id} /> */}
			<div className="my-4" />
			<TicketTable tickets={tickets} categories={categories} coupons={coupons} />
		</div>
	);
}
