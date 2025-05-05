"use client";
import { createCheckoutSession } from "@/app/actions/checkout";
import getStripe from "@/utils/get-stripejs";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/utils/supabase/database.types";
import { ShoppingCart } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Checkbox } from "./ui/checkbox";

export type TicketSelectionProps = {
	event: Database["public"]["Tables"]["events"]["Row"];
	ticketTypes: Database["public"]["Tables"]["ticket_categories"]["Row"][];
	tickets: Database["public"]["Tables"]["tickets"]["Row"][];
};

type BlockSelection = {
	category: string;
	amount: number;
}[];

export default function TicketSelection({
	event,
	ticketTypes,
	tickets,
}: TicketSelectionProps) {
	const [ticketSelection, setTicketSelection] = useState<BlockSelection>(
		ticketTypes.map((type) => ({ category: type.name, amount: 0 })),
	);
	const [loading, setLoading] = useState<boolean>(false);
	const [agb, setAgb] = useState<boolean>(false);
	const supabase = createClient();
	const [currentTickets, setCurrentTickets] = useState(tickets);

	const getTotalPrice = () => {
		let total = 0;
		if (ticketSelection.length === 0) return total;
		for (const ticket of ticketSelection) {
			const ticketType = ticketTypes.find(
				(type) => type.name === ticket.category,
			);
			if (ticketType) {
				total += ticket.amount * ticketType.price;
			}
		}
		return total;
	};

	const getRemainingTickets = () => {
		let remaining = event.tickets;
		remaining -= getTotalTickets();
		remaining -= tickets.length;
		return remaining;
	};

	const getTotalTickets = () => {
		let total = 0;
		if (ticketSelection.length === 0) return total;
		for (const ticket of ticketSelection) {
			total += ticket.amount;
		}
		return total;
	};

	supabase
		.channel("tickets")
		.on(
			"postgres_changes",
			{
				event: "*",
				schema: "public",
				table: "tickets",
			},
			(payload) => {
				fetchTickets();
			},
		)
		.subscribe();

	const searchParams = useSearchParams();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const wasCanceled = searchParams.get("canceled");
		const sessionId = searchParams.get("session_id");
		if (wasCanceled === "true" && sessionId) {
			fetch("/api/delete", {
				method: "POST",
				body: sessionId,
			}).then(async (response) => {
				if (!response.ok) {
					console.error("Error deleting tickets");
				}
				setCurrentTickets(
					currentTickets.filter((ticket) => {
						return ticket.session_id.toString() !== sessionId;
					}),
				);
			});
		}
	}, [searchParams]);

	const fetchTickets = async () => {
		const { data, error } = await supabase
			.from("tickets")
			.select()
			.eq("event_id", event.id);
		if (error) {
			console.error(error.message);
			return;
		}
		if (!data) {
			console.error("No Data");
			return;
		}
		setCurrentTickets(data);
	};

	const sendForm = async () => {
		setLoading(true);
		try {
			const session = await createCheckoutSession({
				eventId: event.id,
				ticketSelection,
				prices: ticketTypes,
			});

			const stripe = await getStripe();
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			const { error } = await stripe!.redirectToCheckout({
				sessionId: session.id,
			});

			if (error) {
				console.warn(error.message);
				setLoading(false);
			}
		} catch (error) {
			console.error("Checkout failed:", error);
			setLoading(false);
		}
	};
	return (
		<div className="space-y-4">
			{/* Sticky Cart Summary - Simplified */}
			<Card className="sticky top-0 z-10 bg-white shadow-lg">
				<CardContent className="py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<ShoppingCart className="h-5 w-5 text-secondary-600" />
							<span className="font-medium">Warenkorb</span>
						</div>
						<span className="text-lg font-semibold">
							{getTotalPrice().toFixed(2)}€
						</span>
					</div>
					{getTotalTickets() > 0 && (
						<div className="mt-3 space-y-2 text-sm text-gray-600">
							<div className="flex wrap flex-wrap">
								{ticketSelection
									.filter((t) => t.amount !== 0)
									.map((t) => (
										<div
											key={t.category}
											className="flex items-center bg-secondary-500 text-white rounded-full px-2 py-1 mr-2 mb-2"
										>
											<span>{t.amount}x</span>
											<span className="ml-1 flex-nowrap text-nowrap">
												{t.category}
											</span>
											<span className="ml-1">
												{t.amount *
													(ticketTypes.find((type) => type.name === t.category)
														?.price || 0)}
												€
											</span>
										</div>
									))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="pb-3">
					<CardTitle>Ticketauswahl</CardTitle>
					<CardDescription>
						Noch {event.tickets - tickets.length} Tickets verfügbar
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							{ticketTypes.map((type) => (
								<div key={type.id}>
									<label
										htmlFor={type.name}
										className="block text-sm font-medium mb-2"
									>
										{type.name} ({type.price}€)
									</label>
									<input
										id={type.name}
										type="number"
										min="0"
										value={
											ticketSelection.find((t) => t.category === type.name)
												?.amount || 0
										}
										onChange={(e) => {
											const amount = Number.parseInt(e.target.value);
											const allowed = event.tickets - tickets.length;
											const newTickets = ticketSelection.map((t) =>
												t.category === type.name
													? {
														...t,
														amount,
													}
													: t,
											);
											const remaining =
												allowed -
												newTickets.reduce((acc, t) => acc + t.amount, 0);

											if (remaining < 0) {
												setTicketSelection(
													ticketSelection.map((t) =>
														t.category === type.name
															? {
																...t,
																amount: amount + remaining,
															}
															: t,
													),
												);
												return;
											}
											setTicketSelection(newTickets);
										}}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
									/>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Checkout - Simplified */}
			<Card>
				<CardContent className="pt-6">
					<div className="space-y-4">
						<div className="flex items-center">
							<Checkbox
								id="agb"
								checked={agb}
								onCheckedChange={(checked) => setAgb(checked as boolean)}
							/>
							<label htmlFor="agb" className="ml-2">
								Ich stimme den{" "}
								<a className="text-secondary-500 hover:underline" href="/agb">
									AGB
								</a>{" "}
								zu
							</label>
						</div>
						<button
							onClick={sendForm}
							type="button"
							disabled={loading || !agb || getTotalTickets() === 0}
							className="w-full p-2 text-lg font-semibold rounded-lg text-white bg-secondary-600 hover:bg-secondary-600/80 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
						>
							{loading ? "Ladevorgang..." : "Zur Kasse"}
						</button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
