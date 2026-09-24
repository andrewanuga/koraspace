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

import { updateUserPersona } from "@/app/dashboard/actions";

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
/*                            WORKSPACE PROVIDER                              */
/* -------------------------------------------------------------------------- */

export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

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
        /*
         * Fetch current user profile via our NextAuth-backed /api/me endpoint.
         * This replaces the old supabase.auth.getUser() + profile query pattern.
         */
        const res = await fetch("/api/me");

        if (res.status === 401 || res.status === 404) {
          if (!isMountedRef.current) return;
          setWorkspaces([]);
          setActiveWorkspaceId(null);
          setIsLoading(false);
          router.replace("/login");
          return;
        }

        if (!res.ok) {
          console.error("[WorkspaceProvider] /api/me returned", res.status);
          if (!isMountedRef.current) return;
          setIsLoading(false);
          return;
        }

        const { user: profile, memberships } = await res.json();

        if (profile && isMountedRef.current) {
          setPersonaState(profile.persona || "creator");
          setPlan(profile.plan || "free");
        }

        /* ----------------------- Build workspace list ----------------------- */

        const loadedWorkspaces: Workspace[] = [];

        /*
          Personal workspace — every user gets their own Koraspace.
        */
        if (profile) {
          loadedWorkspaces.push({
            id: profile.id,
            name: profile.full_name
              ? `${profile.full_name}'s Space`
              : "My Space",
            role: "owner",
            isPersonal: true,
          });
        }

        /*
          Collaborative workspaces from workspace_members.
        */
        if (memberships) {
          for (const member of memberships) {
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
    [router]
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
        /*
          updateUserPersona is a server action that reads the session
          internally — no need to fetch the user here.
        */
        const updateError = !(await updateUserPersona(newPersona));

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

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-persona", persona);
    }
  }, [persona]);

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 HOOKS                                      */
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

export function usePersonaTheme() {
  const { persona } = useWorkspace();
  const isMarketer = persona === "marketer";
  const isCreator = persona === "creator";

  return useMemo(
    () => ({
      persona,
      isMarketer,
      isCreator,
      brandColor: isMarketer ? "var(--kora-blue)" : "var(--kora-pink)",
      brandHex: isMarketer ? "#3b82f6" : "#ec4899",
      brandHover: isMarketer ? "#2563eb" : "#db2777",
      brandSoft: isMarketer
        ? "rgba(59, 130, 246, 0.12)"
        : "rgba(236, 72, 153, 0.12)",
      brandBorder: isMarketer
        ? "rgba(59, 130, 246, 0.28)"
        : "rgba(236, 72, 153, 0.28)",
      brandShadow: isMarketer
        ? "0 8px 24px rgba(59, 130, 246, 0.18)"
        : "0 8px 24px rgba(236, 72, 153, 0.18)",
    }),
    [persona, isMarketer, isCreator]
  );
}