"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { Database } from "@/utils/supabase/database.types";
import {
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import moment from "moment-timezone";
import { useState } from "react";
moment.locale("de");

type SortKey =
	| "ticket_category"
	| "scan_id"
	| "created_at";


interface TicketTableProps {
	tickets: Database["public"]["Tables"]["tickets"]["Row"][];
	categories: Database["public"]["Tables"]["ticket_categories"]["Row"][];
	coupons: Database["public"]["Tables"]["coupons"]["Row"][];
}

export default function TicketTable(props: TicketTableProps) {
	const [sortKey, setSortKey] = useState<SortKey>("created_at");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

	const sortedTickets: Database["public"]["Tables"]["tickets"]["Row"][] = [
		...props.tickets,
	].sort((a, b) => {
		if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1;
		if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1;
		return 0;
	});

	const handleSort = (key: SortKey) => {
		if (key === sortKey) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortKey(key);
			setSortOrder("asc");
		}
	};

	const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
		if (columnKey !== sortKey) return null;
		return sortOrder === "asc" ? (
			<ChevronUp className="ml-2 h-4 w-4" />
		) : (
			<ChevronDown className="ml-2 h-4 w-4" />
		);
	};

	const mapCategory = (id: number) => {
		const category = props.categories.find(
			(category: Database["public"]["Tables"]["ticket_categories"]["Row"]) =>
				category.id === id,
		);
		return category?.name;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Verkaufte Tickets</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead
								className="cursor-pointer"
								onClick={() => handleSort("ticket_category")}
							>
								Kategorie <SortIcon columnKey="ticket_category" />
							</TableHead>
							<TableHead
								className="cursor-pointer"
								onClick={() => handleSort("scan_id")}
							>
								Scan ID <SortIcon columnKey="scan_id" />
							</TableHead>
							<TableHead
							>
								Coupon
							</TableHead>
							<TableHead
								className="cursor-pointer"
								onClick={() => handleSort("created_at")}
							>
								Kaufdatum <SortIcon columnKey="created_at" />
							</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sortedTickets.map((ticket) => (
							<TableRow key={ticket.id}>
								<TableCell>{mapCategory(ticket.ticket_category)}</TableCell>
								<TableCell>{ticket.scan_id}</TableCell>
								<TableCell>{props.coupons.find(coupon => coupon.id === ticket.couponId)?.code || "Kein Coupon"}</TableCell>
								<TableCell>
									{moment.tz(ticket.created_at, "Europe/Berlin").format("DD.MM.YYYY HH:mm")}
								</TableCell>
								<TableCell>
									{ticket.bought_at ? "Gekauft" : "Abgebrochen"}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
