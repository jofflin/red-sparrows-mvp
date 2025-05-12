import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { HOMEPAGE_URL, VENUE } from "@/lib/globals";
import { createClient } from "@/utils/supabase/server";
import {
	ArrowRight,
	Calendar,
	CalendarDays,
	MapPin,
	Ticket,
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { redirect } from "next/navigation";
moment.locale("de");

export default async function Home() {
	const supabase = createClient();

	const { data, error, count, status, statusText } = await supabase
		.from("events")
		.select("*")
		// event presale end date is in the future
		.gt("end_time", moment().toISOString())
		.order("start_time", { ascending: true });
	if (error || status !== 200) {
		console.error(error);
		redirect("/error");
	}

	/** Genaue Ticket Kategorie bei Mail
	 * Logo in PDF
	 * Freie Platzwahl info kaufseite und mail
	 */

	const truncateDescription = (description: string, maxLength: number) => {
		if (description.length <= maxLength) return description;
		return `${description.slice(0, maxLength)}...`;
	};

	return (
		<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24">
			{data.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<Calendar className="h-16 w-16 text-secondary-500 mb-4" />
					<h2 className="text-2xl font-semibold text-secondary-700 mb-2">
						Keine Veranstaltungen
					</h2>
					<p className="text-secondary-800 max-w-md mb-6">
						Aktuell sind keine bevorstehenden Veranstaltungen geplant. Schau
						bald wieder vorbei!
					</p>
					<Button asChild variant="outline">
						<Link target="_blank" href={HOMEPAGE_URL}>
							Zur Vereinsseite
						</Link>
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{data.map((event) => (
						<Card key={event.id} className="flex flex-col">
							<CardHeader>
								<CardTitle>{event.name}</CardTitle>
							</CardHeader>
							<CardContent className="flex-grow">
								<div className="space-y-4">
									<div className="flex items-center text-sm text-gray-500">
										<CalendarDays className="mr-2 h-4 w-4 text-secondary-500" />
										{moment(event.start_time).format("DD.MM.YYYY HH:mm")}{" "}
										Uhr
									</div>
									<div className="flex items-center text-sm text-gray-500">
										<Ticket className="mr-2 h-4 w-4 text-secondary-500" />
										VVK bis:{" "}
										{moment(event.presale_end).format("DD.MM.YYYY HH:mm")}{" "}
										Uhr
									</div>
									<div className="flex items-center text-sm text-gray-500">
										<MapPin className="mr-2 h-4 w-4 text-secondary-500" />
										{VENUE}
									</div>
									<p className="text-secondary-800 line-clamp-3">
										{truncateDescription(event.description, 100)}
									</p>
									<div className="flex flex-wrap gap-2">
										<span className="inline-block bg-secondary-500/20 text-secondary-800 rounded-full px-3 py-1 text-sm font-medium">
											#Heimspiel
										</span>
										<span className="inline-block bg-secondary-500/20 text-secondary-800 rounded-full px-3 py-1 text-sm font-medium">
											#Sparrows
										</span>
										<span className="inline-block bg-secondary-500/20 text-secondary-800 rounded-full px-3 py-1 text-sm font-medium">
											#Support
										</span>
									</div>
								</div>
							</CardContent>
							<CardFooter>
								{moment(event.presale_start).isAfter(moment()) ? (
									<div className="w-full text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
										Vorverkauf startet am{" "}
										{moment(event.presale_start).format("DD.MM.YYYY HH:mm")}{" "}
										Uhr
									</div>
								) : moment(event.presale_end).isAfter(moment()) ? (
									<Button asChild className="w-full">
										<Link
											href={`/event/${event.id}`}
											className="flex items-center justify-center"
										>
											Tickets kaufen
											<ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</Button>
								) : (
									<div className="w-full text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
										Verkauf beendet am{" "}
										{moment(event.presale_end).format("DD.MM.YYYY HH:mm")}{" "}
										Uhr
									</div>
								)}
							</CardFooter>
						</Card>
					))}
				</div>
			)}
		</main>
	);
}
