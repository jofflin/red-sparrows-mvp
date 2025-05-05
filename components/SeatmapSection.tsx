"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Database } from "@/utils/supabase/database.types";
import { Info, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type BlockId = "A" | "B" | "C";

type SeatmapSectionProps = {
	event: Database["public"]["Tables"]["events"]["Row"];
};

export default function SeatmapSection({ event }: SeatmapSectionProps) {
	const [selectedBlock, setSelectedBlock] = useState<BlockId | null>(null);

	const blockViews: Record<BlockId, string> = {
		A: "/images/a.jpeg",
		B: "/images/b.jpeg",
		C: "/images/c.jpeg",
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Sitzplan</CardTitle>
				<CardDescription>
					Wählen Sie Ihren Block aus - Klicken Sie auf einen Block für die
					Sitzplatzansicht
				</CardDescription>
			</CardHeader>
			<CardContent className="relative">
				<div className="relative h-60 bg-white rounded-lg border-2 border-gray-200 p-4">
					{/* Eingang Label */}
					<div className="-rotate-90 absolute -translate-x-[33%] -translate-y-1/2 top-1/2 left-0 bg-gray-200 flex items-center justify-center rounded-b-lg">
						<span className="font-semibold text-gray-700 px-2">Eingang</span>
					</div>
					{/* Spielfeld Label */}
					<div className="absolute top-0 bottom-0 left-20 right-20 bg-gray-100 h-32 flex items-center justify-center rounded-b-lg">
						<span className="text-xl font-semibold text-gray-700">
							Spielfeld
						</span>
					</div>
					<div className="absolute bottom-0 left-0 right-0 w-full h-full flex align-bottom items-end justify-between px-8 pb-2 mt-32">
						<div className="flex space-x-2 w-full justify-between ">
							{/* Block A */}
							<div
								onClick={() =>
									setSelectedBlock(selectedBlock === "A" ? null : "A")
								}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										setSelectedBlock(selectedBlock === "A" ? null : "A");
									}
								}}
								className="w-1/3 h-24 bg-primary-100 flex items-center justify-center cursor-pointer hover:bg-primary-200 transition-colors rounded-lg"
							>
								<span className="text-lg font-semibold"> Block A</span>
							</div>

							{/* Block B */}
							<div
								onClick={() =>
									setSelectedBlock(selectedBlock === "B" ? null : "B")
								}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										setSelectedBlock(selectedBlock === "B" ? null : "B");
									}
								}}
								className="w-1/3 h-24 bg-primary-100 flex items-center justify-center cursor-pointer hover:bg-primary-200 transition-colors rounded-lg"
							>
								<span className="text-lg font-semibold"> Block B</span>
							</div>

							{/* Block C */}
							<div
								onClick={() =>
									setSelectedBlock(selectedBlock === "C" ? null : "C")
								}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										setSelectedBlock(selectedBlock === "C" ? null : "C");
									}
								}}
								className="w-1/3 h-24 bg-secondary-200 flex items-center justify-center cursor-pointer hover:bg-secondary-300 transition-colors rounded-lg relative"
							>
								<span className="text-lg font-semibold"> Block C</span>
								<div className="absolute top-0 pt-1 rounded-lg">
									<span className="text-xs font-semibold">Gästefans</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Block View Modal */}
				{selectedBlock && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg p-4 max-w-2xl w-full mx-4 relative">
							<button
								onClick={() => setSelectedBlock(null)}
								type="button"
								aria-label="Schließen"
								className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
							>
								<X className="h-6 w-6" />
							</button>
							<h3 className="text-lg font-semibold mb-2">
								Ansicht von Block {selectedBlock}
							</h3>
							<div className="relative aspect-video w-full">
								<Image
									src={blockViews[selectedBlock]}
									alt={`Ansicht von Block ${selectedBlock}`}
									fill
									className="object-cover rounded-lg"
								/>
							</div>
							{selectedBlock === "C" && (
								<div className="mt-4 p-3 bg-yellow-50 rounded-lg">
									<p className="text-yellow-800 text-sm">
										<strong>Hinweis:</strong> Sie sind Fan des Gastvereins.
										Bitte gehen Sie in Block C.
									</p>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Info text below map */}
				<div className="mt-4 p-3 bg-blue-50 rounded-lg">
					<p className="text-blue-800 text-sm flex items-start">
						<Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
						Klicken Sie auf einen Block, um die Sitzplatzperspektive zu sehen.
						Es ist freie Sitzplatzwahl.
					</p>
				</div>
				<div className="mt-4 p-3 bg-yellow-50 rounded-lg">
					<p className="text-yellow-800 text-sm flex items-start">
						<Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
						Gästefans sollten im Gästeblock platz nehmen. Heimfans haben freie
						Sitzplatzwahl.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
