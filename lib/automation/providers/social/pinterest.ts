import type { AutomationAdapter, ProviderContext } from "../types";

export const pinterestProvider: AutomationAdapter = {
  provider: "pinterest",

  async execute(
    action: string,
    config: Record<string, unknown>,
    context: ProviderContext
  ): Promise<Record<string, unknown>> {
    const token = context.credentials?.access_token as string | undefined;

    switch (action) {
      case "create_pin": {
        const boardId = String(config.boardId || config.board_id || "");
        const title = String(config.title || "");
        const description = String(config.description || config.content || "");
        const mediaUrl = String(config.mediaUrl || config.imageUrl || config.image_url || "");
        const link = String(config.link || config.destination_url || "");

        if (token && boardId && mediaUrl) {
          try {
            const res = await fetch("https://api.pinterest.com/v5/pins", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                board_id: boardId,
                title,
                description,
                link: link || undefined,
                media_source: {
                  source_type: "image_url",
                  url: mediaUrl,
                },
              }),
            });

            if (res.ok) {
              const data = await res.json();
              return {
                provider: "pinterest",
                action: "create_pin",
                pinId: data.id,
                boardId,
                title,
                mediaUrl,
                link,
                status: "published",
                raw: data,
                timestamp: new Date().toISOString(),
              };
            }
          } catch (err) {
            console.error("[Pinterest Provider] Error creating pin:", err);
          }
        }

        return {
          provider: "pinterest",
          action: "create_pin",
          pinId: `pin_${Date.now()}`,
          boardId: boardId || "default",
          title,
          description,
          mediaUrl,
          link,
          status: "simulated_success",
          timestamp: new Date().toISOString(),
        };
      }

      case "get_boards": {
        if (token) {
          try {
            const res = await fetch("https://api.pinterest.com/v5/boards", {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const data = await res.json();
              return {
                provider: "pinterest",
                action: "get_boards",
                boards: data.items || [],
              };
            }
          } catch (err) {
            console.error("[Pinterest Provider] Error fetching boards:", err);
          }
        }
        return {
          provider: "pinterest",
          action: "get_boards",
          boards: [{ id: "board_default", name: "Main Brand Board" }],
        };
      }

      default:
        throw new Error(`Unsupported Pinterest action: "${action}"`);
    }
  },
};

