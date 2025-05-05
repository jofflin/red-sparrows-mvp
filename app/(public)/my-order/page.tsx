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
import { logos } from "@/utils/email/logos";
import { getPdf } from "@/utils/email/send-confirmation";
import { createClient } from "@/utils/supabase/server";
import { Calendar, CheckCircle, Download, MapPin, Ticket } from "lucide-react";
import Link from "next/link";
import DownloadButton from "./DownloadButton";

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

	const { data: event, error: eventError } = await supabase
		.from("events")
		.select("*")
		.eq("id", tickets[0].event_id)
		.maybeSingle();
	if (eventError) {
		console.error(eventError);
		return <ErrorPage />;
	}
	if (!event) {
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

	// Group tickets by category
	const ticketsByCategory = tickets.reduce(
		(acc, ticket) => {
			const key = `${ticket.ticket_category}`;
			if (!acc[key]) {
				acc[key] = {
					category: ticket.ticket_category,
					count: 0,
				};
			}
			acc[key].count++;
			return acc;
		},
		{} as Record<string, { category: number; count: number }>,
	);

	return (
		<div className="container mx-auto px-4 py-8 max-w-2xl mt-24">
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
					<div className="space-y-4">
						<h3 className="text-xl font-semibold">{event.name}</h3>
						<div className="flex items-center space-x-2 text-gray-600">
							<Calendar className="h-5 w-5 text-secondary-500" />
							<span>
								{new Date(event.start_time).toLocaleString("de-De", {
									dateStyle: "full",
									timeStyle: "short",
									timeZone: "Europe/Berlin",
								})} Uhr
							</span>
						</div>
						<div className="flex items-center space-x-2 text-gray-600">
							<MapPin className="h-5 w-5 text-secondary-500" />
							<span>{VENUE}</span>
						</div>
					</div>
					<div className="space-y-2">
						<h4 className="font-semibold">Tickets:</h4>
						{Object.values(ticketsByCategory).map((group, index) => (
							<div
								key={group.category}
								className="flex justify-between items-center py-2 border-b last:border-0"
							>
								<div className="flex flex-col">
									<span className="font-medium">Freie Platzwahl</span>
									<span className="text-sm text-gray-600">
										{categoryMapper(group.category)}
									</span>
								</div>
								<span className="font-medium text-secondary-500">{group.count}x</span>
							</div>
						))}
					</div>
					<div className="mt-4 p-4 bg-secondary-50 rounded-lg">
						<p className="text-sm text-secondary-700">
							Die Tickets wurden an Ihre E-Mail-Adresse gesendet. Bitte
							überprüfen Sie auch Ihren Spam-Ordner.
						</p>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<DownloadButton tickets={tickets} event={event} categories={categories} logos={logos} />
					<Button variant="outline" className="w-full" asChild>
						<Link href="/">
							<Ticket className="mr-2 h-4 w-4" />
							Mehr Spiele
						</Link>
					</Button>
					<Button variant="outline" className="w-full" asChild>
						<Link target="_blank" href={HOMEPAGE_URL}>
							Zur Homepage
						</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
