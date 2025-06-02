

// 🔍 Función que valida y asegura que la variable de entorno exista
function getEnvVar(name: string): string {
  const value = Deno.env.get(name) ?? ""; // Si es null, asignamos una cadena vacía
  if (!value) {
    throw new Error(`❌ La variable de entorno ${name} no está definida`);
  }
  return value;
}

const clientId = getEnvVar("EBAY_CLIENT_ID");
const clientSecret = getEnvVar("EBAY_CLIENT_SECRET");

const credentials = btoa(`${clientId}:${clientSecret}`);

let cachedToken: string = ""; // Inicializado como cadena vacía en lugar de null
let tokenExpiry = 0;

async function getEbayToken(): Promise<string> {
  const now = Date.now();

  // Si el token sigue siendo válido, lo reutilizamos
  if (cachedToken && now < tokenExpiry - 60000) {
    console.log("🔄 Usando token en caché.");
    return cachedToken;
  }

  console.log("🚀 Solicitando nuevo token de eBay...");
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
    throw new Error(`❌ Error obteniendo token de eBay: ${res.status} - ${errorText}`);
  }

  const data = await res.json();

  cachedToken = data.access_token || ""; // Asegurar que nunca sea `null`
  tokenExpiry = now + (data.expires_in ?? 3600) * 1000; // Manejo seguro del tiempo de expiración

  console.log(`✅ Nuevo token generado. Expira en ${Math.floor((data.expires_in ?? 3600) / 60)} minutos.`);

  return cachedToken;
}

async function searchProducts(query: string) {
  const token = await getEbayToken();
  const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=12`;

  console.log("🔍 Buscando productos con URL:", url);

  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`❌ Error al obtener productos desde eBay: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  console.log("📦 Productos recibidos:", JSON.stringify(data.itemSummaries, null, 2));

  return data.itemSummaries || [];
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const query = url.searchParams.get("query")?.trim();

  console.log("📡 Petición recibida:", req.url);
  console.log("🔍 Parámetro `query` recibido:", query);

  if (!query) {
    console.warn("⚠️ Parámetro `query` vacío en el backend.");
    return new Response(JSON.stringify({ error: "Query parameter 'query' is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const products = await searchProducts(query);
    console.log("✅ Productos obtenidos correctamente.");

    return new Response(JSON.stringify(products), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // 👈 Permite llamadas desde el frontend
      },
    });

  }catch (error) {
    const errMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("❌ Error al procesar la petición:", errMessage);

    return new Response(JSON.stringify({ error: errMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
}
}
