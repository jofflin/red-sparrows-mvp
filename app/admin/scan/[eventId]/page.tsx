'use server'

import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server";
import { AdminTicketScanComponent } from "@/components/admin-ticket-scan";

export default async function ScanPage({ params }: { params: { eventId: string } }) {
  const supabase = createClient();

  const { data: event, error: eventError, status: eventStatus } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.eventId)
    .single();

  const { data: tickets, error: ticketError, status: ticketStatus } = await supabase
    .from("tickets")
    .select("*")
    .eq("event_id", params.eventId)
    .not('bought_at', 'is', null);

  if (eventError || eventStatus !== 200 || ticketError || ticketStatus !== 200) {
    console.error(eventError);
    redirect("/error");
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="icon" className="hover:bg-gray-200">
                <Link href="/admin/scan">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Ticket Scan</h1>
            </div>
          </div>
        </header>
        <main className="">
          <AdminTicketScanComponent 
            initialTickets={tickets} 
            event={event} 
          />
        </main>
      </div>
    </div>
  );
}
