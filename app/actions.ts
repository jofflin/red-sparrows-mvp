'use server'

import { createClient } from "@/utils/supabase/server";


export async function updateTicketStatus(id: string) {
  const supabase = createClient();
  console.log('updateTicketStatus', id);
  const { data, error } = await supabase
    .from("tickets")
    .update({ redeemed_at: new Date().toISOString().replace('T', ' ').replace('Z', '+00:00') })
    .eq("scan_id", id)
    .select("*")
    .single();

  if (error) {
    console.error(error);
  }
  return data;
}

export async function getEventTickets(eventId: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("event_id", eventId)
    .not('bought_at', 'is', null)

  if (error) {
    console.error(error);
  }
  return data;
}