"use server";

import stripe from "@/utils/stripe";
import type { Database } from "@/utils/supabase/database.types";
import { createClient } from "@/utils/supabase/server";
import moment from "moment";
import { headers } from "next/headers";
import type Stripe from "stripe";

moment.locale("de");
type BlockTicket = Database["public"]["Tables"]["tickets"]["Row"];

type CheckoutData = {
	couponId: number | null;
	couponType: string | null;
	eventId: number;
	prices: Database["public"]["Tables"]["ticket_categories"]["Row"][];
	ticketSelection: {
		category: string;
		amount: number;
	}[];
};


export async function createCheckoutSession(
	data: CheckoutData,
): Promise<Stripe.Checkout.Session> {
	const headersList = headers();
	const origin = headersList.get("origin");
	if (!origin) throw new Error("No origin found");

	const lineItems = createLineItems({
		prices: data.prices,
		ticketSelection: data.ticketSelection,
	});

	const session = await createStripeSession(lineItems, origin, data.eventId);
	const isReserved = await reserveTickets({
		sessionId: session.id,
		eventId: data.eventId,
		prices: data.prices,
		ticketSelection: data.ticketSelection,
		couponId: data.couponId,
		couponType: data.couponType,
	});

	if (!isReserved) {
		throw new Error("Failed to reserve tickets");
	}

	return session;
}

const createStripeSession = async (
	lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
	origin: string,
	eventId: number,
) => {
	const params: Stripe.Checkout.SessionCreateParams = {
		line_items: lineItems,
		mode: "payment",
		expires_at: Math.floor(Date.now() / 1000) + 60 * 30, // 30 minutes
		success_url: `${origin}/my-order?success=true&session_id=${"{CHECKOUT_SESSION_ID}"}`,
		cancel_url: `${origin}/event/${eventId}?canceled=true&session_id=${"{CHECKOUT_SESSION_ID}"}`,
	};

	const session = await stripe.checkout.sessions.create(params);
	return session;
};

const createLineItems = (data: {
	prices: Database["public"]["Tables"]["ticket_categories"]["Row"][];
	ticketSelection: { category: string; amount: number }[];
}): Stripe.Checkout.SessionCreateParams.LineItem[] => {
	let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

	for (const ticket of data.ticketSelection) {
		const price = data.prices.find((p) => p.name === ticket.category);
		if (price) {
			lineItems.push({
				price_data: {
					currency: "eur",
					product_data: {
						name: `Ticket - ${price.name}`,
					},
					unit_amount: price.price * 100,
				},
				quantity: ticket.amount,
			});
		}
	}
	lineItems = lineItems.filter((item) => item.quantity && item.quantity > 0);

	return lineItems;
};

const reserveTickets = async ({
	sessionId,
	eventId,
	prices,
	couponId,
	couponType,
	ticketSelection,
}: {
	sessionId: string;
	eventId: number;
	couponId: number | null;
	couponType: string | null;
	prices: Database["public"]["Tables"]["ticket_categories"]["Row"][];
	ticketSelection: { category: string; amount: number }[];
}): Promise<boolean> => {
	const supabase = createClient();
	const now = moment().toISOString();

	// Create purchase session
	const { error: sessionError } = await supabase
		.from("purchaseSession")
		.insert({
			stripe_session_id: sessionId,
			created_at: now
		});

	if (sessionError) {
		console.error("Failed to create purchase session:", sessionError);
		return false;
	}

	// Create block tickets
	const tickets: Omit<BlockTicket, "id">[] = [];
	for (const ticket of ticketSelection) {
		const price = prices.find((p) => p.name === ticket.category);
		if (price) {
			if (ticket.category.includes("Dauerkarten")) {
				for (let i = 0; i < ticket.amount; i++) {
					tickets.push({
						event_id: 2,
						ticket_category: price.id,
						session_id: sessionId,
						scan_id: generateRandomString(),
						reserved_until: moment().add(15, "minutes").toISOString(),
						created_at: now,
						bought_at: null,
						redeemed_at: null,
						couponId: (couponId && price.id === 6) ? couponId : couponType === "1" ? couponId : null,
					});
					tickets.push({
						event_id: 4,
						ticket_category: price.id,
						session_id: sessionId,
						scan_id: generateRandomString(),
						reserved_until: moment().add(15, "minutes").toISOString(),
						created_at: now,
						bought_at: null,
						redeemed_at: null,
						couponId: (couponId && price.id === 6) ? couponId : couponType === "1" ? couponId : null,
					});
					tickets.push({
						event_id: 5,
						ticket_category: price.id,
						session_id: sessionId,
						scan_id: generateRandomString(),
						reserved_until: moment().add(15, "minutes").toISOString(),
						created_at: now,
						bought_at: null,
						redeemed_at: null,
						couponId: (couponId && price.id === 6) ? couponId : couponType === "1" ? couponId : null,
					});
				}

			} else {
				// Normal tickets
				for (let i = 0; i < ticket.amount; i++) {
					tickets.push({
						event_id: eventId,
						ticket_category: price.id,
						session_id: sessionId,
						scan_id: generateRandomString(),
						reserved_until: moment().add(15, "minutes").toISOString(),
						created_at: now,
						bought_at: null,
						redeemed_at: null,
						couponId: (couponId && price.id === 6) ? couponId : couponType === "1" ? couponId : null,
					});
				}
			}
		}
	}

	const { error: ticketsError } = await supabase
		.from("tickets")
		.insert(tickets);

	if (ticketsError) {
		console.error("Failed to create tickets:", ticketsError);
		return false;
	}

	return true;
};

const generateRandomString = (length = 5) => {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
};
