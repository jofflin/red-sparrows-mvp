'use client'
import { Button } from "@/components/ui/button";
import { VENUE } from "@/lib/globals";
import { logo, template } from "@/utils/logo";
import type { Database } from "@/utils/supabase/database.types";
import { generate } from "@pdfme/generator";
import { barcodes, image, text } from "@pdfme/schemas";
import { Download } from "lucide-react";
import { PDFDocument } from "pdf-lib";

type DownloadButtonProps = {
    tickets: Database["public"]["Tables"]["tickets"]["Row"][];
    events: Database["public"]["Tables"]["events"]["Row"][];
    categories: Database["public"]["Tables"]["ticket_categories"]["Row"][];
};

export default function DownloadButton({ tickets, events, categories }: DownloadButtonProps) {

    const downloadTickets = async () => {
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
                    title: `Tickets für das Spiel am ${new Date(
                        event.start_time,
                    ).toLocaleString("de-DE", {
                        dateStyle: "full",
                        timeStyle: "short",
                        timeZone: "Europe/Berlin",
                    })} Uhr`,
                    event: `${event.name} (${VENUE})`,
                    location: `Ticketkategorie: ${categoryMapper(tickets[i].ticket_category)}`,
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
        const pdfBytes = await pdfDoc.save();


        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        window.open(URL.createObjectURL(blob));

        return pdfBytes;
    };

    return (
        <Button onClick={downloadTickets} className="w-full">
            <Download className="h-4 w-4" />
            Tickets herunterladen
        </Button>
    );
}