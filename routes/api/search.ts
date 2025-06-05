// routes/api/search.ts
// ==== Rate limit diario en memoria ====
const EBAY_DAILY_LIMIT = Number(Deno.env.get("EBAY_DAILY_LIMIT") || "5000");
let dailyCount = 0;
let lastReset = Date.now();

function resetIfNeeded() {
  const now = Date.now();
  const msInDay = 24 * 60 * 60 * 1000;
  // Si ha pasado un día, resetea el contador
  if (now - lastReset > msInDay) {
    dailyCount = 0;
    lastReset = now;
  }
}

// ==== Función que valida la variable de entorno y lanza error si no existe ====
function getEnvVar(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`La variable de entorno ${name} no está definida`);
  }
  return value;
}

let cachedToken = "";
let tokenExpiry = 0;

async function getEbayToken(credentials: string): Promise<string> {
  const now = Date.now();

  if (cachedToken && now < tokenExpiry - 60000) {
    console.log("Usando token en caché.");
    return cachedToken;
  }

  console.log("Solicitando nuevo token de eBay...");
  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error obteniendo token de eBay: ${res.status} - ${errorText}`);
  }

  const data = await res.json();

  cachedToken = data.access_token || "";
  tokenExpiry = now + (data.expires_in ?? 3600) * 1000;

  console.log(`Nuevo token generado. Expira en ${Math.floor((data.expires_in ?? 3600) / 60)} minutos.`);

  return cachedToken;
}

async function searchProducts(query: string, credentials: string) {
  const token = await getEbayToken(credentials);

  const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=12`;

  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al obtener productos desde eBay: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return data.itemSummaries || [];
}

export default async function handler(req: Request): Promise<Response> {
  // ==== Rate limit diario ====
  resetIfNeeded();
  if (dailyCount >= EBAY_DAILY_LIMIT) {
    return new Response(
      JSON.stringify({ error: "Límite diario de consultas alcanzado. Intente mañana." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Limit": EBAY_DAILY_LIMIT.toString(),
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
  dailyCount++;

  // ==== Código original ====
  const clientId = getEnvVar("EBAY_CLIENT_ID");
  const clientSecret = getEnvVar("EBAY_CLIENT_SECRET");
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const url = new URL(req.url);
  const query = url.searchParams.get("query")?.trim();

  if (!query) {
    return new Response(JSON.stringify({ error: "Query parameter 'query' is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const products = await searchProducts(query, credentials);

    return new Response(JSON.stringify(products), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "X-RateLimit-Remaining": (EBAY_DAILY_LIMIT - dailyCount).toString(),
        "X-RateLimit-Limit": EBAY_DAILY_LIMIT.toString(),
      },
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Error desconocido";
    return new Response(JSON.stringify({ error: errMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
