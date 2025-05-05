import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<Navbar />
			<main className="pt-16 pb-8">{children}</main>
			<Footer />
		</>
	);
}
