import { supabaseProxy } from "../supabase-proxy";

export function createAdminClient() {
  return {
    ...supabaseProxy,
    auth: {
      getUser: async () => ({ data: { user: { id: "admin" } }, error: null })
    }
  };
}
