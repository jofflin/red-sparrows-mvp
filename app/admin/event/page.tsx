"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Info, LucideMonitorCheck, Plus } from "lucide-react";
import moment from "moment-timezone";
import Link from "next/link";
import { createEvent } from "./actions";
import { EventForm } from "./components/EventForm";
moment.locale("de");

export default function EventCreationPage() {
	const handleSubmit = async (data: {
		eventName: string;
		eventDescription: string;
		startDateTime: string;
		endDateTime: string;
		presaleStart: string;
		presaleEnd: string;
		couponEnd: string;
		tickets: number;
		admissionStart: string;
	}) => {
		await createEvent({
			...data,
			startDateTime: moment.tz(data.startDateTime, "Europe/Berlin").toISOString(),
			endDateTime: moment.tz(data.endDateTime, "Europe/Berlin").toISOString(),
			presaleStart: moment.tz(data.presaleStart, "Europe/Berlin").toISOString(),
			presaleEnd: moment.tz(data.presaleEnd, "Europe/Berlin").toISOString(),
			couponEnd: moment.tz(data.couponEnd, "Europe/Berlin").toISOString(),
			admissionStart: moment.tz(data.admissionStart, "Europe/Berlin").toISOString(),
		});
	};

	return (
		<div className="min-h-screen">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<header className="py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Button
								asChild
								variant="ghost"
								size="icon"
								className="hover:bg-gray-200"
							>
								<Link href="/admin">
									<ArrowLeft className="h-5 w-5" />
								</Link>
							</Button>
							<h1 className="text-3xl font-bold text-gray-900">
								Neues Event erstellen
							</h1>
						</div>
					</div>
				</header>

				<main className="py-8">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2">
							<div className="bg-white rounded-xl shadow-sm">
								<EventForm onSubmit={handleSubmit} />
							</div>
						</div>

						<div className="lg:col-span-1">
							<Card className="sticky top-8 bg-white/80 backdrop-blur-sm border-gray-200">
								<CardHeader className="pb-4">
									<CardTitle className="text-xl font-semibold text-gray-900">
										Hilfestellung
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-4">
										<li className="flex items-start space-x-3">
											<div className="flex-shrink-0 mt-1">
												<Plus className="h-5 w-5 text-secondary-500" />
											</div>
											<span className="text-gray-600">
												Name und Beschreibung wird beim Event angezeigt
											</span>
										</li>
										<li className="flex items-start space-x-3">
											<div className="flex-shrink-0 mt-1">
												<Info className="h-5 w-5 text-secondary-500" />
											</div>
											<span className="text-gray-600">
												Zeitliche Reihenfolge: <br />
												VVK-Start → VVK-Ende → Einlass → Anpfiff
											</span>
										</li>
										<li className="flex items-start space-x-3">
											<div className="flex-shrink-0 mt-1">
												<LucideMonitorCheck className="h-5 w-5 text-secondary-500" />
											</div>
											<span className="text-gray-600">
												Es werden maximal so viele Tickets verkauft, wie
												im Feld "Anzahl Tickets" eingestellt sind.
											</span>
										</li>
									</ul>
								</CardContent>
							</Card>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
