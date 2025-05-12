import { type NextRequest, NextResponse } from "next/server";

import { sendConfirmation } from "@/utils/email/send-confirmation";
import { createClient } from "@/utils/supabase/server";
import moment from "moment";
import { headers } from "next/headers";
import { Resend } from "resend";
import type Stripe from "stripe";
import stripe from "../../../utils/stripe";
moment.locale("de");

const secret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest, res: NextResponse) {
	const supabase = createClient();
	const body: string = await req.text();
	const sig = headers().get("stripe-signature");
	if (!sig) {
		throw new Error("No stripe signature");
	}
	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(body, sig, secret);
	} catch (err) {
		return NextResponse.json(
			{ error: `Webhook Error: ${err}` },
			{ status: 400 },
		);
	}
	switch (event.type) {
		case "checkout.session.expired": {
			const session = event.data.object;
			await supabase
				.from("purchaseSession")
				.delete()
				.eq("stripeCheckout", session.id);
			// Send an email to the customer asking them to retry their order
			// emailCustomerAboutFailedPayment(session);
			break;
		}
		case "checkout.session.completed": {
			const session = event.data.object;
			// Save an order in your database, marked as 'awaiting payment'
			await createOrder(session);

			// Check if the order is paid (for example, from a card payment)
			//
			// A delayed notification payment will have an `unpaid` status, as
			// you're still waiting for funds to be transferred from the customer's
			// account.
			if (session.payment_status === "paid") {
				return await fulfillOrder(session);
			}

			break;
		}

		case "checkout.session.async_payment_succeeded": {
			const session = event.data.object;

			// Fulfill the purchase...
			return await fulfillOrder(session);
		}

		case "checkout.session.async_payment_failed": {
			const session = event.data.object;

			// Send an email to the customer asking them to retry their order
			emailCustomerAboutFailedPayment(session);

			break;
		}
	}
	// The only events are from a single paument process
	return NextResponse.json({ received: true });
}

const fulfillOrder = async (session: Stripe.Checkout.Session) => {
	const supabase = createClient();
	await supabase
		.from("purchaseSession")
		.update({
			paid_at: moment().toISOString(),
			email: session.customer_details?.email,
		})
		.eq("stripe_session_id", session.id);
	// get all tickets from the session
	const { data: tickets } = await supabase
		.from("tickets")
		.select("*")
		.eq("session_id", session.id);
	if (!tickets || tickets.length === 0) {
		console.log("No tickets to fulfill");
		return;
	}

	const { data: events } = await supabase
		.from("events")
		.select("*")

	if (!events) {
		console.error("No event found");
		return;
	}

	const { data: categories } = await supabase
		.from("ticket_categories")
		.select("*")

	if (!categories) {
		console.error("No categories found");
		return;
	}

	return await sendConfirmation({
		events,
		tickets,
		email: session.customer_details?.email as string,
		name: session.customer_details?.name as string,
		categories,
	});
};

const createOrder = async (session: Stripe.Checkout.Session) => {
	const supabase = createClient();
	console.log("sessionId", session.id);
	// const data = await supabase
	//   .from("purchaseSession")
	//   .update({ paid_at: new Date().toISOString() })
	//   .eq("stripe_session_id", session.id);
	// console.log("purchaseSession", data);
	const tickets = await supabase
		.from("tickets")
		.update({
			bought_at: moment().toISOString(),
		})
		.eq("session_id", session.id);
	console.log("tickets", tickets);
};

const emailCustomerAboutFailedPayment = (session: Stripe.Checkout.Session) => {
	// TODO: fill me in
	console.log("Emailing customer", session);
};
