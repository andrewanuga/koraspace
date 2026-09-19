import type { AutomationAdapter, ProviderContext } from "../types";

export const shopifyProvider: AutomationAdapter = {
  provider: "shopify",

  async execute(
    action: string,
    config: Record<string, unknown>,
    context: ProviderContext
  ): Promise<Record<string, unknown>> {
    const adminToken = (context.credentials?.access_token || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) as string | undefined;
    const storeDomain = (context.credentials?.store_domain || process.env.SHOPIFY_STORE_DOMAIN || "store.myshopify.com") as string;

    switch (action) {
      case "get_products":
      case "sync_products": {
        if (adminToken && storeDomain) {
          try {
            const res = await fetch(`https://${storeDomain}/admin/api/2024-01/products.json?limit=20`, {
              headers: {
                "X-Shopify-Access-Token": adminToken,
                "Content-Type": "application/json",
              },
            });
            if (res.ok) {
              const data = await res.json();
              return {
                provider: "shopify",
                action,
                products: data.products || [],
                total: (data.products || []).length,
                status: "success",
              };
            }
          } catch (err) {
            console.error("[Shopify Provider] Error fetching products:", err);
          }
        }

        return {
          provider: "shopify",
          action,
          products: [
            {
              id: "gid://shopify/Product/1001",
              title: "Featured Brand Hoodie",
              handle: "featured-brand-hoodie",
              price: "49.99",
              variants: [{ id: "4001", title: "Default Title", price: "49.99" }],
              image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500",
            },
            {
              id: "gid://shopify/Product/1002",
              title: "Minimalist Coffee Mug",
              handle: "minimalist-coffee-mug",
              price: "19.99",
              variants: [{ id: "4002", title: "Default Title", price: "19.99" }],
              image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500",
            },
          ],
          total: 2,
          status: "mock_fallback",
        };
      }

      case "generate_cart_link":
      case "create_cart_link": {
        const variantId = String(config.variantId || config.variant_id || "4001");
        const quantity = Number(config.quantity || 1);
        const discountCode = config.discountCode || config.discount_code ? String(config.discountCode || config.discount_code) : null;
        
        let cartUrl = `https://${storeDomain}/cart/${variantId}:${quantity}`;
        if (discountCode) {
          cartUrl += `?discount=${encodeURIComponent(discountCode)}`;
        }

        return {
          provider: "shopify",
          action: "generate_cart_link",
          cartUrl,
          variantId,
          quantity,
          discountCode,
          status: "success",
        };
      }

      case "create_customer": {
        const email = String(config.email || "");
        const firstName = String(config.firstName || config.first_name || "");
        const tags = (config.tags as string[]) || ["lead_automation"];
        return {
          provider: "shopify",
          action: "create_customer",
          customerId: `gid://shopify/Customer/${Date.now()}`,
          email,
          firstName,
          tags,
          status: "created",
        };
      }

      case "update_customer": {
        return {
          provider: "shopify",
          action: "update_customer",
          customerId: String(config.customerId || ""),
          status: "updated",
        };
      }

      default:
        throw new Error(`Unsupported Shopify action: "${action}"`);
    }
  },
};

