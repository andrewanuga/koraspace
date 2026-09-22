import { supabaseProxy } from "../supabase-proxy";
import { auth } from "@/auth";

export async function createClient() {
  const session = await auth();
  return {
    ...supabaseProxy,
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: any) => ({ data: { path }, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: `/uploads/${path}` } }),
        remove: async (paths: string[]) => ({ data: paths, error: null })
      })
    },
    auth: {
      getUser: async () => ({
        data: { user: session?.user ? { ...session.user, user_metadata: {} } : null },
        error: null
      })
    }
  };
}
