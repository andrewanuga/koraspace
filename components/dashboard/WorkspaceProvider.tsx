"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "cookies-next";

import { createClient } from "@/lib/supabase/client";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type WorkspaceRole =
  | "owner"
  | "admin"
  | "manager"
  | "member";

export type Persona = "creator" | "marketer";

export type Plan =
  | "free"
  | "pro"
  | "premium"
  | "advanced"
  | "team";

export type Workspace = {
  id: string;
  name: string;
  role: WorkspaceRole;
  isPersonal: boolean;
};

type WorkspaceContextType = {
  /* Workspaces */

  workspaces: Workspace[];

  activeWorkspace: Workspace | null;

  activeWorkspaceId: string | null;

  setActiveWorkspace: (id: string) => Promise<void>;

  isLoading: boolean;

  isSwitchingWorkspace: boolean;

  refreshWorkspaces: () => Promise<void>;

  /* User mode */

  persona: Persona;

  setPersona: (persona: Persona) => Promise<boolean>;

  isSwitchingPersona: boolean;

  /* Subscription */

  plan: Plan;

  hasCreatorMode: boolean;

  hasMarketerMode: boolean;

  canSwitchModes: boolean;

  /* Permissions */

  isOwner: boolean;

  isAdmin: boolean;

  canManageWorkspace: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

const WORKSPACE_COOKIE = "koraspace_active_workspace";

/* -------------------------------------------------------------------------- */
/*                              PLAN CAPABILITIES                             */
/* -------------------------------------------------------------------------- */

/*
  Centralized subscription logic.

  This means your UI components never need to do:

  plan === "advanced" || plan === "team"

  Instead they can use:

  hasMarketerMode
*/

function getPlanCapabilities(plan: Plan) {
  const normalizedPlan = plan.toLowerCase() as Plan;

  const marketerPlans: Plan[] = [
    "premium",
    "advanced",
    "team",
  ];

  return {
    hasCreatorMode: true,

    hasMarketerMode: marketerPlans.includes(normalizedPlan),

    canSwitchModes: marketerPlans.includes(normalizedPlan),
  };
}

/* -------------------------------------------------------------------------- */
/*                              PROFILE DATA TYPE                             */
/* -------------------------------------------------------------------------- */

type ProfileData = {
  id: string;
  full_name: string | null;
  persona: Persona | null;
  plan: Plan | null;
};

/* -------------------------------------------------------------------------- */
/*                            WORKSPACE PROVIDER                              */
/* -------------------------------------------------------------------------- */

export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  /*
    Keep Supabase client stable.

    We do not want a new client instance on every render.
  */

  const supabaseRef = useRef(createClient());

  const supabase = supabaseRef.current;

  /* -------------------------------- States -------------------------------- */

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const [activeWorkspaceId, setActiveWorkspaceId] =
    useState<string | null>(null);

  const [persona, setPersonaState] =
    useState<Persona>("creator");

  const [plan, setPlan] =
    useState<Plan>("free");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSwitchingWorkspace, setIsSwitchingWorkspace] =
    useState(false);

  const [isSwitchingPersona, setIsSwitchingPersona] =
    useState(false);

  const isMountedRef = useRef(true);

  /* ------------------------------------------------------------------------ */
  /*                            MOUNT SAFETY                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                           LOAD WORKSPACES                                */
  /* ------------------------------------------------------------------------ */

  const loadWorkspaces = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setIsLoading(true);
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (!isMountedRef.current) return;

          setWorkspaces([]);
          setActiveWorkspaceId(null);

          return;
        }

        /* -------------------------- Load profile -------------------------- */

        const { data: rawProfile, error: profileError } =
          await supabase
            .from("profiles")
            .select("id, full_name, persona, plan")
            .eq("id", user.id)
            .single();

        const profile = rawProfile as ProfileData | null;

        if (profileError) {
          console.error(
            "[WorkspaceProvider] Failed to load profile:",
            profileError.message
          );
        }

        if (profile && isMountedRef.current) {
          setPersonaState(profile.persona || "creator");

          setPlan(profile.plan || "free");
        }

        /* --------------------- Load collaborative workspaces --------------------- */

        const { data: members, error: membersError } =
          await supabase
            .from("workspace_members")
            .select(`
              workspace_id,
              role
            `)
            .eq("user_id", user.id);

        if (membersError) {
          console.error(
            "[WorkspaceProvider] Failed to load workspaces:",
            membersError.message
          );
        }

        /* ----------------------- Build workspace list ----------------------- */

        const loadedWorkspaces: Workspace[] = [];

        /*
          Personal workspace.

          Every user gets their own personal KoraSpace workspace.
        */

        if (profile) {
          loadedWorkspaces.push({
            id: profile.id,

            name:
              profile.full_name
                ? `${profile.full_name}'s Space`
                : "My Space",

            role: "owner",

            isPersonal: true,
          });
        }

        /*
          Collaborative workspaces.

          Note:
          Right now we only have workspace_id and role.

          Ideally your database should have a real
          `workspaces` table containing:

          id
          name
          owner_id
          avatar_url
          created_at

          Until then we generate a fallback name.
        */

        if (members) {
          for (const member of members) {
            loadedWorkspaces.push({
              id: member.workspace_id,

              name: "Team Workspace",

              role: member.role as WorkspaceRole,

              isPersonal: false,
            });
          }
        }

        if (!isMountedRef.current) return;

        setWorkspaces(loadedWorkspaces);

        /* ------------------- Restore active workspace ------------------- */

        const savedWorkspaceId =
          getCookie(WORKSPACE_COOKIE) as string | undefined;

        const savedWorkspaceExists =
          savedWorkspaceId &&
          loadedWorkspaces.some(
            (workspace) =>
              workspace.id === savedWorkspaceId
          );

        if (savedWorkspaceExists) {
          setActiveWorkspaceId(savedWorkspaceId);

          return;
        }

        /*
          Prefer personal workspace as default.
        */

        const personalWorkspace =
          loadedWorkspaces.find(
            (workspace) => workspace.isPersonal
          );

        const defaultWorkspace =
          personalWorkspace ||
          loadedWorkspaces[0] ||
          null;

        if (defaultWorkspace) {
          setActiveWorkspaceId(defaultWorkspace.id);

          setCookie(
            WORKSPACE_COOKIE,
            defaultWorkspace.id,
            {
              path: "/",
              maxAge: 60 * 60 * 24 * 30,
              sameSite: "lax",
            }
          );
        }
      } catch (error) {
        console.error(
          "[WorkspaceProvider] Unexpected workspace error:",
          error
        );
      } finally {
        if (isMountedRef.current && !options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [supabase]
  );

  /* ------------------------------------------------------------------------ */
  /*                               INITIAL LOAD                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  /* ------------------------------------------------------------------------ */
  /*                         ACTIVE WORKSPACE                                 */
  /* ------------------------------------------------------------------------ */

  const setActiveWorkspace = useCallback(
    async (workspaceId: string) => {
      const workspaceExists = workspaces.some(
        (workspace) => workspace.id === workspaceId
      );

      if (!workspaceExists) {
        console.warn(
          "[WorkspaceProvider] Attempted to switch to invalid workspace:",
          workspaceId
        );

        return;
      }

      if (workspaceId === activeWorkspaceId) {
        return;
      }

      setIsSwitchingWorkspace(true);

      try {
        /*
          Update immediately for responsive UI.
        */

        setActiveWorkspaceId(workspaceId);

        /*
          Persist selection.
        */

        setCookie(
          WORKSPACE_COOKIE,
          workspaceId,
          {
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
            sameSite: "lax",
          }
        );

        /*
          Refresh server components.

          This allows server-side queries to read
          the workspace cookie.
        */

        router.refresh();
      } catch (error) {
        console.error(
          "[WorkspaceProvider] Failed to switch workspace:",
          error
        );
      } finally {
        if (isMountedRef.current) {
          setIsSwitchingWorkspace(false);
        }
      }
    },
    [
      workspaces,
      activeWorkspaceId,
      router,
    ]
  );

  /* ------------------------------------------------------------------------ */
  /*                              PERSONA SWITCH                              */
  /* ------------------------------------------------------------------------ */

  const setPersona = useCallback(
    async (newPersona: Persona): Promise<boolean> => {
      /*
        Prevent unnecessary updates.
      */

      if (newPersona === persona) {
        return true;
      }

      /*
        Check subscription capability.

        This is important.

        UI restrictions should exist in the provider too,
        not just the button component.
      */

      const capabilities =
        getPlanCapabilities(plan);

      if (
        newPersona === "marketer" &&
        !capabilities.hasMarketerMode
      ) {
        return false;
      }

      setIsSwitchingPersona(true);

      const previousPersona = persona;

      /*
        Optimistic update.
      */

      setPersonaState(newPersona);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error(
            userError?.message ||
              "User session not found"
          );
        }

        const { error: updateError } =
          await supabase
            .from("profiles")
            .update({
              persona: newPersona,
            })
            .eq("id", user.id);

        if (updateError) {
          throw updateError;
        }

        /*
          Refresh dashboard server components
          so the correct mode data loads.
        */

        router.refresh();

        return true;
      } catch (error) {
        /*
          Rollback optimistic update.
        */

        console.error(
          "[WorkspaceProvider] Failed to switch persona:",
          error
        );

        if (isMountedRef.current) {
          setPersonaState(previousPersona);
        }

        return false;
      } finally {
        if (isMountedRef.current) {
          setIsSwitchingPersona(false);
        }
      }
    },
    [
      persona,
      plan,
      router,
      supabase,
    ]
  );

  /* ------------------------------------------------------------------------ */
  /*                           REFRESH FUNCTION                               */
  /* ------------------------------------------------------------------------ */

  const refreshWorkspaces = useCallback(async () => {
    await loadWorkspaces({
      silent: true,
    });
  }, [loadWorkspaces]);

  /* ------------------------------------------------------------------------ */
  /*                           DERIVED WORKSPACE                              */
  /* ------------------------------------------------------------------------ */

  const activeWorkspace = useMemo(() => {
    return (
      workspaces.find(
        (workspace) =>
          workspace.id === activeWorkspaceId
      ) || null
    );
  }, [
    workspaces,
    activeWorkspaceId,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                           PLAN CAPABILITIES                              */
  /* ------------------------------------------------------------------------ */

  const capabilities = useMemo(
    () => getPlanCapabilities(plan),
    [plan]
  );

  /* ------------------------------------------------------------------------ */
  /*                              PERMISSIONS                                 */
  /* ------------------------------------------------------------------------ */

  const permissions = useMemo(() => {
    const role = activeWorkspace?.role;

    return {
      isOwner: role === "owner",

      isAdmin:
        role === "owner" ||
        role === "admin",

      canManageWorkspace:
        role === "owner" ||
        role === "admin" ||
        role === "manager",
    };
  }, [activeWorkspace]);

  /* ------------------------------------------------------------------------ */
  /*                              CONTEXT VALUE                               */
  /* ------------------------------------------------------------------------ */

  const value = useMemo<WorkspaceContextType>(
    () => ({
      /* Workspaces */

      workspaces,

      activeWorkspace,

      activeWorkspaceId,

      setActiveWorkspace,

      isLoading,

      isSwitchingWorkspace,

      refreshWorkspaces,

      /* Persona */

      persona,

      setPersona,

      isSwitchingPersona,

      /* Plan */

      plan,

      hasCreatorMode:
        capabilities.hasCreatorMode,

      hasMarketerMode:
        capabilities.hasMarketerMode,

      canSwitchModes:
        capabilities.canSwitchModes,

      /* Permissions */

      isOwner:
        permissions.isOwner,

      isAdmin:
        permissions.isAdmin,

      canManageWorkspace:
        permissions.canManageWorkspace,
    }),
    [
      workspaces,
      activeWorkspace,
      activeWorkspaceId,
      setActiveWorkspace,
      isLoading,
      isSwitchingWorkspace,
      refreshWorkspaces,
      persona,
      setPersona,
      isSwitchingPersona,
      plan,
      capabilities,
      permissions,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 HOOK                                       */
/* -------------------------------------------------------------------------- */

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      "useWorkspace must be used within a WorkspaceProvider"
    );
  }

  return context;
}