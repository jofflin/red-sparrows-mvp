"use client";
import { createCheckoutSession } from "@/app/actions/checkout";
import { getCoupon } from "@/app/actions/coupons";
import { Switch } from "@/components/ui/switch"
import getStripe from "@/utils/get-stripejs";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/utils/supabase/database.types";
import { Group, ShoppingCart, TicketPercent, Users } from "lucide-react";
import moment from 'moment-timezone'
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
moment.locale("de");

export type TicketSelectionProps = {
	event: Database["public"]["Tables"]["events"]["Row"];
	ticketTypes: Database["public"]["Tables"]["ticket_categories"]["Row"][];
	tickets: {
		reserved_until: string;
		redeemed_at: string | null;
		bought_at: string | null;
		couponId: number | null;
		session_id: string;
	}[];
	couponsData: {
		type: string;
		amount: number;
	}[];
};

type TicketSelection = {
	category: string;
	amount: number;
}[];

export default function TicketSelection({
	event,
	ticketTypes,
	tickets,
	couponsData,
}: TicketSelectionProps) {
	const [ticketSelection, setTicketSelection] = useState<TicketSelection>(
		ticketTypes.map((type) => ({ category: type.name, amount: 0 })),
	);
	const [memberTicketSelection, setMemberTicketSelection] = useState<TicketSelection>(
		ticketTypes.map((type) => ({ category: `Mitglied - ${type.name}`, amount: 0 })),
	);
	const [isMember, setIsMember] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [couponCode, setCouponCode] = useState<string>("");
	const [coupon, setCoupon] = useState<{ coupon: Database["public"]["Tables"]["coupons"]["Row"], used: number } | null>();
	const [agb, setAgb] = useState<boolean>(false);
	const supabase = createClient();
	const [currentTickets, setCurrentTickets] = useState(tickets);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!isMember) {
			setMemberTicketSelection(ticketTypes.map((type) => ({ category: `Mitglied - ${type.name}`, amount: 0 })));
		}
	}, [isMember]);

	const getTotalPrice = () => {
		let total = 0;
		for (const ticket of ticketSelection) {
			const ticketType = ticketTypes.find(
				(type) => type.name === ticket.category,
			);
			if (ticketType) {
				total += ticket.amount * ticketType.price;
			}
		}
		for (const ticket of memberTicketSelection) {
			const ticketType = ticketTypes.find(
				(type) => type.name === ticket.category.split(" - ")[1],
			);
			if (ticketType) {
				total += ticket.amount * ticketType.price * 0.5;
			}
		}
		return total;
	};

	const getRemainingTickets = () => {
		let remaining = Math.floor((event.tickets - currentTickets.length) * 0.9);
		remaining = remaining - couponsData.reduce((acc, coupon) => acc + coupon.amount, 0);
		if (coupon && coupon.coupon.type === "1") {
			remaining = event.tickets - currentTickets.length
		}
		if (coupon && coupon.coupon.type === "2") {
			remaining = remaining + coupon.coupon.amount;
		}
		if (moment.tz("Europe/Berlin") > moment.tz(event.coupon_end, "Europe/Berlin")) {
			remaining = event.tickets - currentTickets.length
		}
		return remaining;
	};

	const getTotalTickets = () => {
		let total = 0;
		if (ticketSelection.length === 0 && memberTicketSelection.length === 0) return total;
		const tickets = [...ticketSelection, ...memberTicketSelection];
		for (const ticket of tickets) {
			total += ticket.amount;
		}
		return total;
	};

	const handleCouponApply = async () => {
		const coupon = await getCoupon(couponCode, event.id);
		setCoupon(coupon);
		if (coupon && coupon.coupon.type === "2") {
			// add the TicketSelection with 0
			const hasSponsorticket = ticketSelection.find((t) => t.category === "Sponsorticket");
			if (!hasSponsorticket) {
				setTicketSelection([...ticketSelection, { category: "Sponsorticket", amount: 0 }]);
			}
		} else {
			// remove the TicketSelection with 0
			setTicketSelection(ticketSelection.filter((t) => t.category !== "Sponsorticket"));
		}
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
			if (getTotalTickets() === 0) {
				console.error("No tickets selected");
				setLoading(false);
				return;
			}
			let prices = ticketTypes;
			if (coupon && coupon.coupon.type === "2") {
				prices = [...prices, { id: 6, name: "Sponsorticket", price: 0, created_at: "", description: "" }];
			}
			console.log(ticketSelection, memberTicketSelection);
			const session = await createCheckoutSession({
				eventId: event.id,
				ticketSelection: ticketSelection,
				memberTicketSelection: memberTicketSelection,
				prices,
				couponId: coupon?.coupon.id || null,
				couponType: coupon?.coupon.type || null,
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
					</div>
				</CardContent>
			</Card>
			<Card className="sticky top-0 z-10 bg-white shadow-lg">
				<CardContent className="py-4 flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<TicketPercent className="h-5 w-5 text-secondary-600" />
							<span className="font-medium">Du hast einen Coupon Code?</span>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Input
							type="text"
							placeholder="Code"
							value={couponCode}
							onChange={(e) => setCouponCode(e.target.value)}
						/>
						<Button onClick={handleCouponApply}>Code anwenden</Button>
					</div>
					{coupon && (
						<div className="flex flex-col space-y-2">
							<span className="font-medium">
								Dein Coupon Code ist: {coupon.coupon.code}
							</span>
							{coupon.coupon.type === "2" && (
								<span className="font-medium text-green-500">
									Du hast die Kateogrie Sponsorticket freigeschaltet. Verfügbar: {coupon.coupon.amount - coupon.used} Stück
								</span>
							)}
							{coupon.coupon.type === "1" && (
								<span className="font-medium text-green-500">
									Du hast das Kontingent für die Gastmannschaft freigeschaltet.
								</span>
							)}
						</div>
					)}
					{coupon === null && (
						<div className="flex items-center space-x-2">
							<span className="font-medium text-red-500">
								Der Coupon Code ist ungültig.
							</span>
						</div>
					)}
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="pb-3">
					<CardTitle>Ticketauswahl</CardTitle>
					<CardDescription>
						{getRemainingTickets() < 50 && `Noch ${getRemainingTickets()} Tickets verfügbar`}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							{ticketTypes.map((type) => (
								<div key={type.id} className="h-full flex flex-col justify-between">
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
										max={Math.min(getRemainingTickets(), 50)}
										value={
											ticketSelection.find((t) => t.category === type.name)
												?.amount || 0
										}
										onChange={(e) => {
											const amount = Number.parseInt(e.target.value);
											const allowed = getRemainingTickets();
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
							{coupon && coupon.coupon.type === "2" && (
								<div className="h-full flex flex-col justify-between">
									<label
										htmlFor="Sponsorticket"
										className="block text-sm font-medium mb-2"
									>
										Sponsorticket (0€)
									</label>
									<input
										id="Sponsorticket"
										type="number"
										min="0"
										value={
											ticketSelection.find((t) => t.category === "Sponsorticket")
												?.amount || 0
										}
										max={coupon.coupon.amount - coupon.used}
										onChange={(e) => {
											let amount = Number.parseInt(e.target.value);
											if (amount > coupon.coupon.amount - coupon.used) {
												amount = coupon.coupon.amount - coupon.used;
											}
											const allowed = getRemainingTickets()
											const newTickets = ticketSelection.map((t) =>
												t.category === "Sponsorticket"
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
														t.category === "Sponsorticket"
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
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="sticky top-0 z-10 bg-white shadow-lg">
				<CardContent className="py-4 flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<Users className="h-5 w-5 text-secondary-600" />
							<span className="font-medium">Mitgliedertickets?</span>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Switch checked={isMember} onCheckedChange={setIsMember} />
						<span className="font-medium">Ja, ich möchte Mitgliedertickets kaufen</span>
					</div>
					<span className="font-sm">Exklusiver Mitgliedertarif für Mitglieder des HSG Freiburg e.V.; Mitgliedschaft erforderlich!</span>

					<div className="grid grid-cols-2 gap-4">
						{isMember && ticketTypes.map((type) => (
							<div key={type.id} className="h-full flex flex-col justify-between">
								<label
									htmlFor={type.name}
									className="block text-sm font-medium mb-2"
								>
									{type.name} ({(type.price * (isMember ? 0.5 : 1)).toFixed(2)}€)
								</label>
								<input
									id={type.name}
									type="number"
									min="0"
									max={Math.min(getRemainingTickets(), 50)}
									value={
										memberTicketSelection.find((t) => t.category === `Mitglied - ${type.name}`)
											?.amount || 0
									}
									onChange={(e) => {
										const amount = Number.parseInt(e.target.value);
										const allowed = getRemainingTickets();
										const newTickets = memberTicketSelection.map((t) =>
											t.category === `Mitglied - ${type.name}`
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
											setMemberTicketSelection(
												memberTicketSelection.map((t) =>
													t.category === `Mitglied - ${type.name}`
														? {
															...t,
															amount: amount + remaining,
														}
														: t,
												),
											);
											return;
										}
										setMemberTicketSelection(newTickets);
									}}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
								/>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
			<Card className="sticky top-0 z-10 bg-white shadow-lg">
				<CardContent className="py-4">

					{getTotalTickets() > 0 && (
						<div className="flex flex-col">
							{ticketSelection
								.filter((t) => t.amount !== 0)
								.map((t) => (
									<>
										<div
											key={t.category}
											className="flex justify-between px-2 py-1 mr-2 mb-2"
										>
											<div>
												<span>{t.amount}x</span>
												<span className="ml-1 text-wrap">
													{t.category}
												</span>
											</div>
											<span className="ml-4">
												{t.amount * (
													ticketTypes.find((type) => type.name === t.category)
														?.price || 0
												)}
												€
											</span>
										</div>
									</>
								))}
							{memberTicketSelection
								.filter((t) => t.amount !== 0)
								.map((t) => (
									<div
										key={t.category}
										className="flex justify-between px-2 py-1 mr-2 mb-2"
									>
										<div>
											<span>{t.amount}x</span>
											<span className="ml-1 text-wrap">
												{t.category}
											</span>
										</div>
										<span className="ml-4">
											{
												((ticketTypes.find((type) => type.name === t.category.split(" - ")[1])
													?.price || 0) * 0.5).toFixed(2)}
											€
										</span>
									</div>
								))}
							<hr className="my-2 bg-secondary-500 text-secondary-500" />
						</div>
					)}
					<div className="flex items-center justify-between px-2 ">
						<span className="font-medium">Gesamt</span>
						<span className="font-medium">{getTotalPrice().toFixed(2)}€</span>
					</div>
				</CardContent>
			</Card>

			{/* Checkout - Simplified */}
			<Card className="sticky top-0 z-10 bg-white shadow-lg">
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
