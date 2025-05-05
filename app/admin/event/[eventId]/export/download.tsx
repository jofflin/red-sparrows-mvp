"use client";

import { Button } from "@/components/ui/button";

export default function DownloadButton({ csvContent }: { csvContent: string }) {
	const downloadCSV = () => {
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "user_list.csv");
		document.body.appendChild(link);
		link.click();
	};
	return <Button onClick={downloadCSV}>CSV Export</Button>;
}
