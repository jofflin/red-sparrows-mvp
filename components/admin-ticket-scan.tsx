"use client";

import { getEventTickets, updateTicketStatus } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { Database } from "@/utils/supabase/database.types";
import { QuestionMarkIcon } from "@radix-ui/react-icons";
import { type IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { Check, ChevronDown, ChevronUp, QrCode, X } from "lucide-react";
import moment from 'moment-timezone'
import { useState } from "react";
import { toast } from "sonner";
moment.locale("de");

export type AdminTicketScanComponentProps = {
	initialTickets: Database["public"]["Tables"]["tickets"]["Row"][];
	event: Database["public"]["Tables"]["events"]["Row"];
	ticketCategories: Database["public"]["Tables"]["ticket_categories"]["Row"][];
};

export function AdminTicketScanComponent({
	initialTickets,
	event,
	ticketCategories,
}: AdminTicketScanComponentProps) {
	const [lastScannedTicket, setLastScannedTicket] = useState<Database["public"]["Tables"]["tickets"]["Row"] | null>(null);
	const [tickets, setTickets] = useState(initialTickets);
	const [scanningActive, setScanningActive] = useState(false);
	const [manualTicketId, setManualTicketId] = useState("");
	const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

	const scanNewTicket = () => {
		setScanningActive(true);
	};

	const cancelScanning = () => {
		setScanningActive(false);
	};

	const getTicketCategory = (ticketId: number) => {
		const ticketCategory = ticketCategories.find((ticketCategory) => ticketCategory.id === ticketId);
		return ticketCategory?.name;
	};

	const handleSuccessfullScan = (codes: IDetectedBarcode[]) => {
		if (codes.length === 0) {
			toast.error("Kein QR Code erkannt.", {
				richColors: true,
				closeButton: true,
				dismissible: true,
				position: "top-center",
			});
			return;
		}
		const code = codes[0];
		const ticketID = code.rawValue;
		handleTicketScan(ticketID);
	};

	const handleScanError = (error: unknown) => {
		toast.error(`Beim Scannen ist ein Fehler aufgetreten: ${error}`, {
			richColors: true,
			closeButton: true,
			dismissible: true,
			position: "top-center",
		});
	};

	const handleManualEntry = (e: React.FormEvent) => {
		e.preventDefault();
		handleTicketScan(manualTicketId);
		setManualTicketId("");
	};

	const handleTicketScan = (ticketId: string) => {
		setScanningActive(false);
		const ticket = tickets.find((t) => t.scan_id === ticketId);

		if (!ticket) {
			toast.error(`Ticket ${ticketId} nicht gefunden.`, {
				richColors: true,
				closeButton: true,
				dismissible: true,
				position: "top-center",
			});
			return;
		}

		if (ticket.redeemed_at) {
			toast.error(`Ticket ${ticketId}\n wurde bereits gescannt.`, {
				richColors: true,
				closeButton: true,
				dismissible: true,
				position: "top-center",
			});
			return;
		}

		// Auto-validate ticket
		markTicketAsScanned(ticketId);
	};

	const markTicketAsScanned = async (ticketId: string) => {
		const response = await updateTicketStatus(ticketId);
		if (response?.redeemed_at) {
			setTickets(
				tickets.map((ticket) =>
					ticket.scan_id === ticketId
						? { ...ticket, redeemed_at: response.redeemed_at }
						: ticket,
				),
			);
			setLastScannedTicket(response);
			const updatedTickets = await getEventTickets(event.id);
			if (!updatedTickets) return;
			setTickets(updatedTickets);
			toast.success(
				`Ticket ${ticketId} wurde entwertet. Scannen Sie das nächste Ticket.`,
				{
					richColors: true,
					closeButton: true,
					dismissible: true,
					position: "top-center",
				},
			);
		}
	};

	return (
		<div className="space-y-4 mb-4">
			<Card className="shadow-none border-0">
				<CardContent className="p-0">
					<div className="space-y-3">
						<div className="bg-gray-100 w-full">
							<Scanner
								onScan={(barcode) => handleSuccessfullScan(barcode)}
								onError={(error) => handleScanError(error)}
								constraints={{
									facingMode: "environment",
								}}
								// styles={{
								// 	container: {
								// 		width: "100%",
								// 		height: "350px",
								// 		margin: "0 auto",
								// 	},
								// }}
								components={{
									zoom: false
								}}
								paused={!scanningActive}
								allowMultiple={false}
							/>
						</div>
						<div className="px-4 pb-4">
							{scanningActive ? (
								<Button
									onClick={() => cancelScanning()}
									className="w-full bg-secondary-400 hover:bg-secondary-500 text-black h-12 text-lg"
								>
									<QrCode className="mr-2 h-5 w-5" />
									Scannen beenden
								</Button>
							) : (
								<Button
									onClick={() => scanNewTicket()}
									className="w-full bg-secondary-400 hover:bg-secondary-500 text-black h-12 text-lg"
								>
									<QrCode className="mr-2 h-5 w-5" />
									QR Code scannen
								</Button>
							)}
							<div className="mt-4">
								<form onSubmit={handleManualEntry} className="space-y-2">
									<div className="flex space-x-2">
										<Input
											id="manual-ticket-id"
											value={manualTicketId}
											onChange={(e) =>
												setManualTicketId(e.target.value.toLocaleUpperCase())
											}
											placeholder="Ticket ID eingeben"
											className="flex-1 h-12 bg-white border-secondary-400 focus:border-secondary-400 focus:ring-secondary-400"
										/>
										<Button type="submit" variant="outline" className="h-12">
											Überprüfen
										</Button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
			{lastScannedTicket && (
				<Card className="mt-4">
					<CardHeader className="px-4 py-3">
						<CardTitle className="text-lg font-semibold">
							Zuletzt gescanntes Ticket
						</CardTitle>
						<CardDescription className="text-sm">{`ID: ${lastScannedTicket.scan_id}`}</CardDescription>
						<CardDescription className="text-sm">{`Entwertet am: ${moment.tz(lastScannedTicket.redeemed_at, "Europe/Berlin").format("DD.MM.YYYY HH:mm")}`}</CardDescription>
						<CardDescription className="text-sm">{`Kategorie: ${getTicketCategory(lastScannedTicket.ticket_category)}`}</CardDescription>
						{lastScannedTicket.couponId && <CardDescription className="texst-sm">{`Coupon ID: ${lastScannedTicket.couponId}`}</CardDescription>}
					</CardHeader>
				</Card>
			)}

			<Card className="mt-4">
				<CardHeader className="px-4 py-3">
					<CardTitle className="text-lg font-semibold">
						Verkaufte Tickets ({tickets.filter((t) => t.redeemed_at).length} von{" "}
						{tickets.length} gescannt)
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<Collapsible
						open={isCollapsibleOpen}
						onOpenChange={setIsCollapsibleOpen}
					>
						<CollapsibleTrigger asChild>
							<Button
								variant="outline"
								className="w-full rounded-none border-x-0 h-12"
							>
								{isCollapsibleOpen ? (
									<>
										<ChevronUp className="mr-2 h-4 w-4" />
										verkaufte Tickets ausblenden
									</>
								) : (
									<>
										<ChevronDown className="mr-2 h-4 w-4" />
										verkaufte Tickets anzeigen
									</>
								)}
							</Button>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<div className="px-4">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="pl-0">Ticket ID</TableHead>
											<TableHead className="pr-0">Status</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{tickets.map((ticket) => (
											<TableRow key={ticket.id}>
												<TableCell className="pl-0">{ticket.scan_id}</TableCell>
												<TableCell className="pr-0">
													{ticket.redeemed_at ? (
														<span className="flex items-center text-green-600">
															<Check className="mr-1 h-4 w-4" />
															Entwertet
														</span>
													) : (
														<span className="flex items-center text-orange-400">
															<QuestionMarkIcon className="mr-1 h-4 w-4" />
															Noch nicht Gescanned
														</span>
													)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</CollapsibleContent>
					</Collapsible>
				</CardContent>
			</Card>
		</div>
	);
}
