import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

export function createClient() {
  // Create a supabase client on the browser with project's credentials
  return createBrowserClient<Database>(
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
