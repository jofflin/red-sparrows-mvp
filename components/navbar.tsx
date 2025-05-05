import { HOMEPAGE_URL } from "@/lib/globals";
import { Home, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

export default function Navbar() {
	return (
		<nav className="fixed top-0 z-50 w-full border-b bg-white shadow-sm">
			<div className="w-full flex h-16 items-center justify-between px-4">
				<Link href="/" className="flex items-center space-x-2">
					<Ticket className="w-6 text-secondary-500" />
					{/* hide span on mobile */}
					<span className="text-xl font-semibold hidden md:block text-secondary-500">
						Red Sparrows Ticketshop
					</span>
				</Link>
				<div className="flex items-center space-x-4">
					<Button variant="ghost" asChild>
						<Link href="/" className="flex items-center space-x-2">
							<Ticket className="h-4 w-4" />
							<span>Alle Spiele</span>
						</Link>
					</Button>
					<Button variant="ghost" asChild>
						<Link
							href={HOMEPAGE_URL}
							target="_blank"
							className="flex items-center space-x-2"
						>
							<Home className="h-4 w-4" />
							<span>Zur Homepage</span>
						</Link>
					</Button>
				</div>
			</div>
		</nav>
	);
}
