import ErrorPage from "@/app/error/page";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { HOMEPAGE_URL, VENUE } from "@/lib/globals";
import type { Database } from "@/utils/supabase/database.types";
import { createClient } from "@/utils/supabase/server";
import { Calendar, CheckCircle, Home, MapPin, Ticket } from "lucide-react";
import moment from "moment";
import Link from "next/link";
import DownloadButton from "./DownloadButton";
moment.locale("de");

export default async function SuccessPage({
	searchParams,
}: {
	searchParams: {
		success?: string;
		session_id?: string;
	};
}) {
	const { success, session_id } = searchParams;
	const supabase = createClient();
	if (!success) {
		return <ErrorPage />;
	}
	if (!session_id) {
		return <ErrorPage />;
	}

	const { data: tickets, error: ticketError } = await supabase
		.from("tickets")
		.select("*")
		.eq("session_id", session_id);
	if (ticketError) {
		console.error(ticketError);
		return <ErrorPage />;
	}
	if (!tickets) {
		console.error("No data returned from supabase");
		return <ErrorPage />;
	}

	const { data: events, error: eventError } = await supabase
		.from("events")
		.select("*")
	if (eventError) {
		console.error(eventError);
		return <ErrorPage />;
	}
	if (!events) {
		console.error("No data returned from supabase");
		return <ErrorPage />;
	}

	const { data: categories, error: categoriesError } = await supabase
		.from("ticket_categories")
		.select("*");
	if (categoriesError) {
		console.error(categoriesError);
		return <ErrorPage />;
	}
	if (!categories) {
		console.error("No categories returned from supabase");
		return <ErrorPage />;
	}

	// Create category mapper from database
	const categoryMapper = (categoryId: number) => {
		const category = categories.find((c) => c.id === categoryId);
		return category?.name || "Unbekannt";
	};



	let ticketGroups: {
		event: Database["public"]["Tables"]["events"]["Row"],
		tickets: {
			categoryName: string,
			amount: number,
		}[]
	}[] = [];

	for (const event of events) {
		const ticketsForEvent = tickets.filter((ticket) => ticket.event_id === event.id);
		const ticketList: {
			categoryName: string,
			amount: number,
		}[] = [];
		for (const ticket of ticketsForEvent) {
			const category = categoryMapper(ticket.ticket_category);
			const existingTicket = ticketList.find((t) => t.categoryName === category);
			if (existingTicket) {
				existingTicket.amount++;
			} else {
				ticketList.push({
					categoryName: category,
					amount: 1,
				});
			}
		}
		ticketGroups.push({
			event,
			tickets: ticketList,
		});
	}

	ticketGroups = ticketGroups.sort((a, b) => {
		return moment(a.event.start_time).diff(moment(b.event.start_time));
	}).filter((group) => {
		return group.tickets.length > 0;
	});

	return (
		<div className="container mx-auto px-4 py-8 max-w-2xl mt-24 space-y-4">
			<Card className="w-full">
				<CardHeader>
					<div className="flex items-center space-x-2">
						<CheckCircle className="h-6 w-6 text-green-500" />
						<CardTitle className="text-2xl font-bold text-green-700">
							Bestellung Erfolgreich!
						</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<p className="text-lg">
						Vielen Dank für Ihre Bestellung. Ihre Tickets wurden erfolgreich
						gekauft.
					</p>
					<div className="mt-4 p-4 bg-secondary-50 rounded-lg">
						<p className="text-sm text-secondary-700">
							Die Tickets wurden an Ihre E-Mail-Adresse gesendet. Bitte
							überprüfen Sie auch Ihren Spam-Ordner.
						</p>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4 w-full">
					<DownloadButton tickets={tickets} events={events} categories={categories} />
					<Button variant="outline" className="w-full" asChild>
						<Link href="/">
							<Ticket className="mr-2 h-4 w-4 text-secondary-500" />
							Mehr Spiele
						</Link>
					</Button>
					<Button variant="outline" className="w-full" asChild>
						<Link target="_blank" href={HOMEPAGE_URL}>
							<Home className="mr-2 h-4 w-4 text-secondary-500" />
							Zur Homepage
						</Link>
					</Button>
				</CardFooter>
			</Card>
			{ticketGroups.map((group) => (
				<Card key={group.event.id}>
					<CardHeader>
						<CardTitle>{group.event.name}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center space-x-2 text-gray-600">
								<Calendar className="h-5 w-5 text-secondary-500" />
								<span>
									{moment(group.event.start_time).format("DD.MM.YYYY HH:mm")} Uhr
								</span>
							</div>
							<div className="flex items-center space-x-2 text-gray-600">
								<MapPin className="h-5 w-5 text-secondary-500" />
								<span>{VENUE}</span>
							</div>
						</div>
						<div className="space-y-2 mt-4">
							<h4 className="font-semibold">Tickets:</h4>
							{group.tickets.map((ticket) => (
								<div
									key={ticket.categoryName}
									className="flex justify-between items-center py-2 border-b last:border-0"
								>
									<span className="text-md text-gray-600">
										{ticket.categoryName}
									</span>
									<span className="font-medium text-secondary-500">{ticket.amount}x</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
