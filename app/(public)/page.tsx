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
	Mail,
	MapPin,
	Ticket,
} from "lucide-react";
import moment from "moment-timezone";
import Link from "next/link";
import { redirect } from "next/navigation";
moment.locale("de");

export default async function Home() {
	const supabase = createClient();

	const { data, error, count, status, statusText } = await supabase
		.from("events")
		.select("*")
		// event presale end date is in the future
		.gt("end_time", moment.tz("Europe/Berlin").toISOString())
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
			{/* <Card className="bg-secondary-50 mb-8">
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
			</Card> */}
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
										{moment.tz(event.start_time, "Europe/Berlin").format("DD.MM.YYYY HH:mm")}{" "}
										Uhr
									</div>
									<div className="flex items-center text-sm text-gray-500">
										<Ticket className="mr-2 h-4 w-4 text-secondary-500" />
										VVK bis:{" "}
										{moment.tz(event.presale_end, "Europe/Berlin").format("DD.MM.YYYY HH:mm")}{" "}
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
								{moment.tz(event.presale_start, "Europe/Berlin").isAfter(moment.tz("Europe/Berlin")) ? (
									<div className="w-full text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
										Vorverkauf startet am{" "}
										{moment.tz(event.presale_start, "Europe/Berlin").format("DD.MM.YYYY HH:mm")}{" "}
										Uhr
									</div>
								) : moment.tz(event.presale_end, "Europe/Berlin").isAfter(moment.tz("Europe/Berlin")) ? (
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
										{moment.tz(event.presale_end, "Europe/Berlin").format("DD.MM.YYYY HH:mm")}{" "}
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
