import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { VENUE } from "@/lib/globals";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/utils/supabase/database.types";
import {
	CalendarDays,
	PlusCircle,
	QrCode,
	Ticket,
	Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const fetchCache = "force-no-store";

export default async function EventOverviewPage() {
	const supabase = createClient();
	const now = new Date();

	const { data, error, status } = await supabase
		.from("events")
		.select("*")
		.order("start_time", { ascending: true });

	// Ticket with bought_at set are considered as sold
	const {
		data: ticketData,
		error: ticketError,
		status: ticketStatus,
	} = await supabase.from("tickets").select("*").not("bought_at", "is", null);

	if (error || status !== 200) {
		console.error(error);
		redirect("/error");
	}

	const events = data as Database["public"]["Tables"]["events"]["Row"][];
	const pastEvents = events.filter((event) => new Date(event.end_time) < now);
	const upcomingEvents = events.filter(
		(event) =>
			new Date(event.start_time) > now && new Date(event.presale_start) < now,
	);
	const futureEvents = events.filter(
		(event) => new Date(event.presale_start) > now,
	);

	const calculateTicketSold = (
		event: Database["public"]["Tables"]["events"]["Row"],
	) => {
		const tickets =
			ticketData as Database["public"]["Tables"]["tickets"]["Row"][];
		const ticketsSold = tickets.filter(
			(ticket) => ticket.event_id === event.id,
		).length;

		return ticketsSold;
	};

	const eventCards = (
		events: Database["public"]["Tables"]["events"]["Row"][],
	) => {
		if (events.length === 0) {
			return <p className="text-gray-500">Keine Events</p>;
		}

		return events.map((event) => (
			<Card key={event.id} className="flex flex-col">
				<CardHeader>
					<CardTitle>{event.name}</CardTitle>
				</CardHeader>
				<CardContent className="flex-grow">
					<div className="space-y-4">
						<div className="flex items-center text-sm text-gray-500">
							<CalendarDays className="mr-2 h-4 w-4" />
							{new Date(event.start_time).toLocaleDateString("de-DE", {
								year: "numeric",
								month: "long",
								day: "numeric",
								timeZone: "Europe/Berlin",
							})}
						</div>
						<div className="flex items-center text-sm text-gray-500">
							<Users className="mr-2 h-4 w-4" />
							<span>{VENUE}</span>
						</div>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>Tickets verkauft</span>
								<span>
									{calculateTicketSold(event)} / {event.tickets}
								</span>
							</div>
							<Progress
								value={
									(calculateTicketSold(event) / event.tickets) * 100
								}
							/>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col gap-2 w-full">
					<Button variant="outline" className="w-full" asChild>
						<Link href={`/admin/event/${event.id}`} >
							<Ticket className="mr-2 h-4 w-4" />
							Event verwalten
						</Link>
					</Button>
					<Button variant="outline" className="w-full" asChild>
						<Link href={`/admin/event/${event.id}/coupons`}>
							<Ticket className="mr-2 h-4 w-4" />
							Coupons verwalten
						</Link>
					</Button>
				</CardFooter>
			</Card>
		));
	};

	return (
		<div className="min-h-screen">
			<header className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between">
					<h1 className="text-3xl font-bold leading-tight text-gray-900">
						Event Overview
					</h1>
					<Button asChild variant="outline">
						<Link href="/">Startseite</Link>
					</Button>
				</div>
			</header>
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex justify-between items-center mb-6 flex-wrap">
					<h2 className="text-2xl font-semibold text-gray-800">
						Aktuelle Events / Events im VVK
					</h2>
					<div className="gap-2 flex flex-row flex-wrap">
						<Button asChild>
							<Link href="/admin/event">
								<PlusCircle className="mr-2 h-4 w-4" />
								Neues Event
							</Link>
						</Button>
						<Button asChild>
							<Link href="/admin/category">
								<Ticket className="mr-2 h-4 w-4" />
								Ticket Kategorien
							</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/admin/scan">
								<QrCode className="mr-2 h-4 w-4" />
								Tickets scannen
							</Link>
						</Button>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{eventCards(upcomingEvents)}
				</div>
				<h2 className="text-2xl font-semibold text-gray-800 w-full mb-4 mt-8">
					Geplante Events
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{eventCards(futureEvents)}
				</div>
				<h2 className="text-2xl font-semibold text-gray-800 w-full  mb-4 mt-8">
					Vergangene Events
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{eventCards(pastEvents)}
				</div>
			</main>
		</div>
	);
}
