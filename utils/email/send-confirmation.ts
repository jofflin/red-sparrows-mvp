"use server";
import { EmailTemplate } from "@/components/email-template";
import { VENUE } from "@/lib/globals";
import { logo } from "@/utils/logo";
import type { Database } from "@/utils/supabase/database.types";
import type { Template } from "@pdfme/common";
import { generate } from "@pdfme/generator";
import { barcodes, image, text } from "@pdfme/schemas";
import moment from 'moment-timezone';
import { PDFDocument } from "pdf-lib";
import { Resend } from "resend";
moment.locale('de');
const resend = new Resend(process.env.RESEND_API_KEY);

const template: Template = {
	schemas: [
		{
			title: {
				type: "text",
				position: { x: 25, y: 80 },
				width: 150,
				height: 18.7,
				fontSize: 24,
				fontColor: "#000000",
				fontName: "Roboto",
			},
			qr: {
				type: "qrcode",
				position: { x: 25, y: 150 },
				backgroundColor: "#ffffff",
				barColor: "#000000",
				width: 50,
				height: 50,
				rotate: 0,
				opacity: 1,
			},
			event: {
				type: "text",
				position: { x: 25, y: 100 },
				width: 150,
				height: 10,
				fontSize: 14,
				fontName: "Roboto",
			},
			location: {
				type: "text",
				position: { x: 25, y: 120 },
				width: 150,
				height: 10,
				fontSize: 28,
				fontName: "Roboto",
			},
			"code-text": {
				type: "text",
				position: { x: 25, y: 220 },
				width: 100,
				height: 20,
				fontSize: 36,
				fontName: "Roboto",
			},
			"sg-logo": {
				type: "image",
				icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
				content: logo,
				position: { x: 110, y: 10 },
				width: 65,
				height: 20,
				rotate: 0,
				opacity: 1,
			},
			info: {
				type: "text",
				position: { x: 25, y: 250 },
				width: 150,
				height: 10,
				fontSize: 10,
				fontName: "Roboto",
			},
			// gameImage: {
			// 	type: "image",
			// 	icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
			// 	position: { x: 22.63, y: 35.61 },
			// 	width: 151.34,
			// 	height: 34.4,
			// 	rotate: 0,
			// 	opacity: 1,
			// },
			// edeka: {
			// 	type: "image",
			// 	icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
			// 	content: edeka,
			// 	position: { x: 85.99, y: 136.09 },
			// 	width: 90,
			// 	height: 25,
			// 	rotate: 0,
			// 	opacity: 1,
			// },
			// klaus: {
			// 	type: "image",
			// 	icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
			// 	content: klaus,
			// 	position: { x: 86.35, y: 165.73 },
			// 	width: 25,
			// 	height: 25,
			// 	rotate: 0,
			// 	opacity: 1,
			// },
			// sparkasse: {
			// 	type: "image",
			// 	icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
			// 	position: { x: 118.84, y: 166.47 },
			// 	content: sparkasse,
			// 	width: 25,
			// 	height: 25,
			// 	rotate: 0,
			// 	opacity: 1,
			// },
			// vgw: {
			// 	type: "image",
			// 	icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
			// 	position: { x: 153.45, y: 166.15 },
			// 	content: vgw,
			// 	width: 25,
			// 	height: 25,
			// 	rotate: 0,
			// 	opacity: 1,
			// },
			// bauverein: {
			// 	type: "image",
			// 	icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
			// 	position: { x: 86.82, y: 195.84 },
			// 	content: bauverein,
			// 	width: 25,
			// 	height: 25,
			// 	rotate: 0,
			// 	opacity: 1,
			// },
			// baur: {
			// 	type: "image",
			// 	icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
			// 	content: baur,
			// 	position: { x: 153.93, y: 196.26 },
			// 	width: 25,
			// 	height: 25,
			// 	rotate: 0,
			// 	opacity: 1,
			// },
		},
	],
	basePdf:
		"data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDM4Cj4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVGwMDHUszRSKErlCtfiyuMK5AIAXQ8GCgplbmRzdHJlYW0KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL01lZGlhQm94IFswIDAgNTk1LjQ0IDg0MS45Ml0KL1Jlc291cmNlcyA8PAo+PgovQ29udGVudHMgNSAwIFIKL1BhcmVudCAyIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzQgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL3RyYXBwZWQgKGZhbHNlKQovQ3JlYXRvciAoU2VyaWYgQWZmaW5pdHkgRGVzaWduZXIgMS4xMC40KQovVGl0bGUgKFVudGl0bGVkLnBkZikKL0NyZWF0aW9uRGF0ZSAoRDoyMDIyMDEwNjE0MDg1OCswOScwMCcpCi9Qcm9kdWNlciAoaUxvdmVQREYpCi9Nb2REYXRlIChEOjIwMjIwMTA2MDUwOTA5WikKPj4KZW5kb2JqCjYgMCBvYmoKPDwKL1NpemUgNwovUm9vdCAxIDAgUgovSW5mbyAzIDAgUgovSUQgWzwyODhCM0VENTAyOEU0MDcyNERBNzNCOUE0Nzk4OUEwQT4gPEY1RkJGNjg4NkVERDZBQUNBNDRCNEZDRjBBRDUxRDlDPl0KL1R5cGUgL1hSZWYKL1cgWzEgMiAyXQovRmlsdGVyIC9GbGF0ZURlY29kZQovSW5kZXggWzAgN10KL0xlbmd0aCAzNgo+PgpzdHJlYW0KeJxjYGD4/5+RUZmBgZHhFZBgDAGxakAEP5BgEmFgAABlRwQJCmVuZHN0cmVhbQplbmRvYmoKc3RhcnR4cmVmCjUzMgolJUVPRgo=",
};

export const sendConfirmation = async ({
	email,
	events,
	name,
	tickets,
	categories,
}: {
	tickets: Database["public"]["Tables"]["tickets"]["Row"][];
	events: Database["public"]["Tables"]["events"]["Row"][];
	email: string;
	name: string;
	categories: Database["public"]["Tables"]["ticket_categories"]["Row"][];
}) => {
	const pdfs: Uint8Array[] = [];

	const categoryMapper = (id: number) => {
		const category = categories.find((c) => c.id === id);
		return category?.name || "Normal";
	};

	for (let i = 0; i < tickets.length; i++) {
		const event = events.find((e) => e.id === tickets[i].event_id);
		if (!event) {
			console.error("Event not found");
			continue;
		}
		const inputs = [
			{
				title: `Tickets für das Spiel am ${moment.tz(
					event.start_time,
					"Europe/Berlin"
				).format("DD.MM.YYYY HH:mm")} Uhr`,
				event: `${event.name} (${VENUE})`,
				location: `Ticketkategorie: ${categoryMapper(tickets[i].ticket_category)} ${tickets[i].isMember ? "(Mitgliederticket)" : ""}`,
				info: "Bitte zeigen Sie diesen QR-Code beim Einlass vor.\nErmäßigungen sind nur mit gültigem Ausweis gültig\n\nAGB: https://red-sparrows.getnono.de/agb\nDatenschutz: https://red-sparrows.getnono.de/impressum\nImpressum: https://red-sparrows.getnono.de/impressum",
				qr: tickets[i].scan_id || "",
				"code-text": tickets[i].scan_id || "",
				"sg-logo": logo,
				// edeka: edeka,
				// klaus: klaus,
				// sparkasse: sparkasse,
				// vgw: vgw,
				// bauverein: bauverein,
				// baur: baur,
				// gameImage: imageMapper(5),
			},
		];

		pdfs.push(
			await generate({
				inputs,
				template,
				plugins: {
					text,
					qrcode: barcodes.qrcode,
					image,
				},
			}),
		);
	}

	const pdfDoc = await PDFDocument.create();
	for (const pdf of pdfs) {
		const pdfBytes = await PDFDocument.load(pdf);
		const copiedPages = await pdfDoc.copyPages(
			pdfBytes,
			pdfBytes.getPageIndices(),
		);
		for (const page of copiedPages) {
			pdfDoc.addPage(page);
		}
	}
	const pdfBytes = await pdfDoc.saveAsBase64();

	const { data, error } = await resend.emails.send({
		from: "Ticketshop Red Sparrows <red-sparrows-tickets@getnono.app>",
		to: [email],
		subject: "Ihre Tickets",
		react: EmailTemplate({
			name,
			location: VENUE,
		}),
		html: `Hallo, ${name}!\n\nSie haben Tickets für die Red Sparrows erworben.\nOrt: ${VENUE}\nWir freuen uns darauf, Sie dort zu sehen!\nBitte beachten Sie, dass das Ticket in Form eines QR Codes vorliegt. Diesen können Sie an der Veranstaltung vorzeigen.\nZudem benötigen Sie einen gültigen Lichtbildausweis, ihre Dauerkarte oder je nach Kategorie eine Identifikationsform.`,
		attachments: [
			{
				content: pdfBytes,
				filename: "tickets.pdf",
			},
		],
	});
	if (error) {
		return Response.json({ error });
	}

	return Response.json(data);
};