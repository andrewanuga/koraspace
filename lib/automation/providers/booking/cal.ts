import type { AutomationAdapter, ProviderContext } from "../types";

export const calProvider: AutomationAdapter = {
  provider: "cal_com",

  async execute(
    action: string,
    config: Record<string, unknown>,
    context: ProviderContext
  ): Promise<Record<string, unknown>> {
    const apiKey = (context.credentials?.api_key || process.env.CAL_COM_API_KEY) as string | undefined;

    switch (action) {
      case "get_event_types": {
        if (apiKey) {
          try {
            const res = await fetch("https://api.cal.com/v2/event-types", {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "cal-api-version": "2024-08-13",
              },
            });
            if (res.ok) {
              const data = await res.json();
              return {
                provider: "cal_com",
                action: "get_event_types",
                eventTypes: data.data || [],
                status: "success",
              };
            }
          } catch (err) {
            console.error("[Cal.com Provider] Error fetching event types:", err);
          }
        }
        return {
          provider: "cal_com",
          action: "get_event_types",
          eventTypes: [
            { id: 1, title: "15-min Discovery Call", slug: "15min", length: 15 },
            { id: 2, title: "30-min Strategy Session", slug: "strategy-30", length: 30 },
          ],
          status: "mock_fallback",
        };
      }

      case "generate_booking_link": {
        const username = String(config.username || config.calUsername || "koraspace");
        const eventSlug = String(config.eventSlug || config.slug || "15min");
        const attendeeEmail = config.email ? String(config.email) : undefined;
        const attendeeName = config.name ? String(config.name) : undefined;

        let bookingUrl = `https://cal.com/${username}/${eventSlug}`;
        const queryParams = new URLSearchParams();
        if (attendeeEmail) queryParams.set("email", attendeeEmail);
        if (attendeeName) queryParams.set("name", attendeeName);
        if (queryParams.toString()) {
          bookingUrl += `?${queryParams.toString()}`;
        }

        return {
          provider: "cal_com",
          action: "generate_booking_link",
          bookingUrl,
          eventSlug,
          status: "success",
        };
      }

      default:
        throw new Error(`Unsupported Cal.com action: "${action}"`);
    }
  },
};

export const calendlyProvider: AutomationAdapter = {
  provider: "calendly",

  async execute(
    action: string,
    config: Record<string, unknown>,
    context: ProviderContext
  ): Promise<Record<string, unknown>> {
    const apiKey = (context.credentials?.api_key || process.env.CALENDLY_API_KEY) as string | undefined;

    switch (action) {
      case "get_event_types": {
        if (apiKey) {
          try {
            const userRes = await fetch("https://api.calendly.com/users/me", {
              headers: { Authorization: `Bearer ${apiKey}` },
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              const userUri = userData.resource?.uri;
              const typesRes = await fetch(`https://api.calendly.com/event_types?user=${encodeURIComponent(userUri)}`, {
                headers: { Authorization: `Bearer ${apiKey}` },
              });
              if (typesRes.ok) {
                const typesData = await typesRes.json();
                return {
                  provider: "calendly",
                  action: "get_event_types",
                  eventTypes: typesData.collection || [],
                  status: "success",
                };
              }
            }
          } catch (err) {
            console.error("[Calendly Provider] Error:", err);
          }
        }

        return {
          provider: "calendly",
          action: "get_event_types",
          eventTypes: [
            { uri: "https://api.calendly.com/event_types/1", name: "Quick Product Demo", scheduling_url: "https://calendly.com/demo/30min" },
          ],
          status: "mock_fallback",
        };
      }

      case "generate_booking_link": {
        const schedulingUrl = String(config.schedulingUrl || config.url || "https://calendly.com/demo/30min");
        const attendeeEmail = config.email ? String(config.email) : undefined;
        const attendeeName = config.name ? String(config.name) : undefined;

        let bookingUrl = schedulingUrl;
        const queryParams = new URLSearchParams();
        if (attendeeEmail) queryParams.set("email", attendeeEmail);
        if (attendeeName) queryParams.set("name", attendeeName);
        if (queryParams.toString()) {
          bookingUrl += (bookingUrl.includes("?") ? "&" : "?") + queryParams.toString();
        }

        return {
          provider: "calendly",
          action: "generate_booking_link",
          bookingUrl,
          status: "success",
        };
      }

      default:
        throw new Error(`Unsupported Calendly action: "${action}"`);
    }
  },
};
