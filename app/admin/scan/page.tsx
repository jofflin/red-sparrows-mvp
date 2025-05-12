import { AdminEventSelectionComponent } from '@/components/admin-event-selection'
import { Button } from "@/components/ui/button"
import { createClient } from '@/utils/supabase/server'
import { ArrowLeft } from "lucide-react"
import moment from 'moment-timezone'
import Link from "next/link"
import { redirect } from 'next/navigation'
moment.locale("de");

export default async function EventScanSelectionPage() {
  const supabase = createClient();

  const { data, error, count, status, statusText } = await supabase
    .from("events")
    .select("*")
    .gt("start_time", moment.tz(new Date().getTime() - 1000 * 60 * 60 * 24 * 30, "Europe/Berlin").toISOString().replace('T', ' ').replace('Z', '+00:00'))
    .lt("start_time", moment.tz(new Date().getTime() + 1000 * 60 * 60 * 48 * 30, "Europe/Berlin").toISOString().replace('T', ' ').replace('Z', '+00:00'))
    .select("*")
    .order("start_time", { ascending: true });
  if (error || status !== 200) {
    console.error(error);
    redirect("/error");
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="icon" className="hover:bg-gray-200">
                <Link href="/admin">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Event Auswahl</h1>
            </div>
          </div>
        </header>
        <main className="py-6">
          <AdminEventSelectionComponent events={data} />
        </main>
      </div>
    </div>
  )
}