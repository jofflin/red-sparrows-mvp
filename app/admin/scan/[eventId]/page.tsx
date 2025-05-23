'use server'

import { AdminTicketScanComponent } from "@/components/admin-ticket-scan";
import { Button } from "@/components/ui/button"
import { CardDescription } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { ArrowLeft } from "lucide-react"
import moment from "moment-timezone";
import Link from "next/link"
import { redirect } from "next/navigation";
moment.locale("de");
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

  const { data: ticketCategories, error: ticketCategoryError, status: ticketCategoryStatus } = await supabase
    .from("ticket_categories")
    .select("*")

  if (eventError || eventStatus !== 200 || ticketError || ticketStatus !== 200 || ticketCategoryError || ticketCategoryStatus !== 200) {
    console.error(eventError);
    redirect("/error");
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button asChild variant="ghost" size="icon" className="hover:bg-gray-200">
                <Link href="/admin/scan">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-md font-bold text-gray-900">{event.name}</h1>
            </div>
          </div>
        </header>
        <main className="">
          <AdminTicketScanComponent
            initialTickets={tickets}
            event={event}
            ticketCategories={ticketCategories}
          />
        </main>
      </div>
    </div>
  );
}
