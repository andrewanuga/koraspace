export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  [key: string]: any;
}

export function createClient() {
  const channelObj = {
    on: (...args: any[]) => channelObj,
    subscribe: (...args: any[]) => channelObj,
    unsubscribe: () => {}
  };

  return {
    auth: {
      getUser: async (): Promise<{ data: { user: SupabaseUser | null }; error: any }> => ({ 
        data: { user: null as SupabaseUser | null }, 
        error: null as any 
      }),
      getSession: async (): Promise<{ data: { session: any }; error: any }> => ({ 
        data: { session: null }, 
        error: null as any 
      }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: null, error: null as any }),
      signUp: async () => ({ data: null, error: null as any }),
      signOut: async () => ({ error: null as any }),
      resetPasswordForEmail: async (email: string, options?: any) => ({ data: null, error: null as any }),
      updateUser: async (attributes: any) => ({ data: null, error: null as any }),
      exchangeCodeForSession: async (code: string) => ({ data: null, error: null as any })
    },
    channel: (name: string, ...args: any[]) => channelObj,
    removeChannel: (channel: any) => {},
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: any) => ({ data: { path }, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: `/uploads/${path}` } }),
        remove: async (paths: string[]) => ({ data: paths, error: null })
      })
    },
    from: (table: string) => {
      return {
        select: (cols?: string) => ({
          eq: (col: string, val: any) => ({
            limit: (n: number) => ({
              single: async () => ({ data: null as any, error: null as any })
            }),
            order: (col: string, opts?: any) => Promise.resolve({ data: [] as any[], error: null as any }),
            single: async () => ({ data: null as any, error: null as any })
          }),
          order: (col: string, opts?: any) => Promise.resolve({ data: [] as any[], error: null as any }),
          limit: (n: number) => Promise.resolve({ data: [] as any[], error: null as any })
        }),
        insert: (data: any) => ({
          select: async () => ({ data: null as any, error: null as any })
        }),
        update: (data: any) => ({
          eq: async () => ({ data: null as any, error: null as any })
        }),
        delete: () => ({
          eq: async () => ({ data: null as any, error: null as any })
        })
      } as any;
    }
  };
}
