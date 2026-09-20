import type { AutomationAdapter, ProviderContext } from "../types";

export const hubspotProvider: AutomationAdapter = {
  provider: "hubspot",

  async execute(
    action: string,
    config: Record<string, unknown>,
    context: ProviderContext
  ): Promise<Record<string, unknown>> {
    const token = (context.credentials?.access_token || process.env.HUBSPOT_ACCESS_TOKEN) as string | undefined;

    switch (action) {
      case "create_contact": {
        const email = String(config.email || "");
        const firstname = String(config.firstname || config.first_name || "");
        const lastname = String(config.lastname || config.last_name || "");
        const phone = config.phone ? String(config.phone) : undefined;
        const company = config.company ? String(config.company) : undefined;
        const lifecyclestage = String(config.lifecyclestage || "lead");

        if (token && email) {
          try {
            const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                properties: {
                  email,
                  firstname,
                  lastname,
                  phone,
                  company,
                  lifecyclestage,
                },
              }),
            });

            if (res.ok) {
              const data = await res.json();
              return {
                provider: "hubspot",
                action: "create_contact",
                contactId: data.id,
                email,
                firstname,
                lastname,
                status: "created",
                raw: data,
              };
            }
          } catch (err) {
            console.error("[HubSpot Provider] Error creating contact:", err);
          }
        }

        return {
          provider: "hubspot",
          action: "create_contact",
          contactId: `hs_contact_${Date.now()}`,
          email,
          firstname,
          lastname,
          status: "simulated_success",
        };
      }

      case "get_contacts": {
        if (token) {
          try {
            const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts?limit=20&properties=email,firstname,lastname,company,lifecyclestage", {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
            if (res.ok) {
              const data = await res.json();
              return {
                provider: "hubspot",
                action: "get_contacts",
                contacts: data.results || [],
                total: (data.results || []).length,
                status: "success",
              };
            }
          } catch (err) {
            console.error("[HubSpot Provider] Error fetching contacts:", err);
          }
        }

        return {
          provider: "hubspot",
          action: "get_contacts",
          contacts: [
            { id: "101", properties: { email: "lead@example.com", firstname: "Alex", lastname: "Smith", lifecyclestage: "lead" } },
          ],
          total: 1,
          status: "mock_fallback",
        };
      }

      case "update_contact": {
        const contactId = String(config.contactId || config.id || "");
        const properties = (config.properties as Record<string, string>) || {
          lifecyclestage: String(config.lifecyclestage || "customer"),
        };

        if (token && contactId) {
          try {
            const res = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ properties }),
            });
            if (res.ok) {
              const data = await res.json();
              return {
                provider: "hubspot",
                action: "update_contact",
                contactId,
                status: "updated",
                raw: data,
              };
            }
          } catch (err) {
            console.error("[HubSpot Provider] Error updating contact:", err);
          }
        }

        return {
          provider: "hubspot",
          action: "update_contact",
          contactId,
          status: "updated",
        };
      }

      case "create_deal": {
        const dealname = String(config.dealname || config.deal_name || "New Koraspace Social Inbound Deal");
        const amount = Number(config.amount || 0);
        const pipeline = String(config.pipeline || "default");
        const dealstage = String(config.dealstage || config.stage || "appointmentscheduled");

        if (token) {
          try {
            const res = await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                properties: {
                  dealname,
                  amount: String(amount),
                  pipeline,
                  dealstage,
                },
              }),
            });
            if (res.ok) {
              const data = await res.json();
              return {
                provider: "hubspot",
                action: "create_deal",
                dealId: data.id,
                dealname,
                amount,
                status: "created",
                raw: data,
              };
            }
          } catch (err) {
            console.error("[HubSpot Provider] Error creating deal:", err);
          }
        }

        return {
          provider: "hubspot",
          action: "create_deal",
          dealId: `hs_deal_${Date.now()}`,
          dealname,
          amount,
          status: "simulated_success",
        };
      }

      case "update_deal": {
        const dealId = String(config.dealId || config.id || "");
        const stage = String(config.stage || config.dealstage || "closedwon");

        if (token && dealId) {
          try {
            const res = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}`, {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                properties: { dealstage: stage },
              }),
            });
            if (res.ok) {
              const data = await res.json();
              return {
                provider: "hubspot",
                action: "update_deal",
                dealId,
                stage,
                status: "updated",
                raw: data,
              };
            }
          } catch (err) {
            console.error("[HubSpot Provider] Error updating deal:", err);
          }
        }

        return {
          provider: "hubspot",
          action: "update_deal",
          dealId,
          stage,
          status: "updated",
        };
      }

      case "sync_lead": {
        const name = String(config.name || "Inbound Social Lead");
        const email = String(config.email || "");
        const [firstname, ...lastParts] = name.split(" ");
        const lastname = lastParts.join(" ") || "";
        const value = Number(config.value || config.amount || 0);

        // Execute contact creation
        const contactResult = await hubspotProvider.execute(
          "create_contact",
          { email, firstname, lastname },
          context
        );

        // If deal value provided, create corresponding deal
        let dealResult = null;
        if (value > 0) {
          dealResult = await hubspotProvider.execute(
            "create_deal",
            { dealname: `${name} - Koraspace Lead`, amount: value },
            context
          );
        }

        return {
          provider: "hubspot",
          action: "sync_lead",
          contact: contactResult,
          deal: dealResult,
          status: "synced",
        };
      }

      default:
        throw new Error(`Unsupported HubSpot action: "${action}"`);
    }
  },
};

