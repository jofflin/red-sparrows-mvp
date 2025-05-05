import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ErrorPage() {
	return (
		<div className="container mx-auto px-4 py-8 max-w-2xl">
			<Card className="w-full">
				<CardHeader>
					<div className="flex items-center space-x-2">
						<AlertTriangle className="h-6 w-6 text-yellow-500" />
						<CardTitle className="text-2xl font-bold text-red-600">
							Oops! Da ist etwas schiefgelaufen.
						</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<p className="text-lg text-gray-600">
						Wir entschuldigen uns für die Unannehmlichkeiten. Bitte versuche es
						erneut.
					</p>
					<div className="mt-4 p-4 bg-yellow-50 rounded-lg">
						<p className="text-sm text-yellow-700">
							Falls das Problem weiterhin besteht, kontaktiere uns bitte unter
							ticketsapp
						</p>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<Button variant="outline" className="w-full" asChild>
						<Link href="/">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Zurück zur Startseite
						</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
