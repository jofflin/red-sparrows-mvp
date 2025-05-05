import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
	const body: string = await req.text();
	try {
		const response = await deleteTickets(body);
		return NextResponse.json(response);
	} catch (err) {
		return NextResponse.json(
			{ error: `Delete Tickets error Error: ${err}` },
			{ status: 400 },
		);
	}
}

const deleteTickets = async (sessionId: string) => {
	const supabase = createClient();
	return await supabase
		.from("tickets")
		.delete()
		.eq("session_id", sessionId)
		.select("*");
};
