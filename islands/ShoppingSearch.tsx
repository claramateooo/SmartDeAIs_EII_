import { useEffect, useState } from "preact/hooks";
import ProductFilterSidebar from "../islands/ProductFilterSidebar.tsx";
import Recommendation from "./Recommendation.tsx";
import FavoriteList from "./FavoriteList.tsx";

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  thumbnail: string;
  permalink: string;
  sellerName: string;
  feedbackScore: number; 
  feedbackPercentage: number; 
  condition: string;
  conditionId: string;
  categoryName: string;
  categoryId: string;
  allCategories: { categoryId: string; categoryName: string }[]; 
  topRated: boolean; // topRatedBuyingExperience
  discountPercentage?: number; // marketingPrice.discountPercentage (opcional)
  originalPrice?: number; // marketingPrice.originalPrice.value (opcional)
  shippingCost?: number; // 
  thumbnailImages: string[];
}

interface Filters {
  priceLessThan?: number;
  priceGreaterThan?: number;
  category?: string;
  condition?: string;
  conditionId?: string; 
  feedbackPercentageMin?: number;
  feedbackScoreMin?: number;
  shippingCostMax?: number;
  discountPercentageMin?: number;
  onlyTopRated?: boolean;
}

export default function ShoppingSearch() {
  const [inputQuery, setInputQuery] = useState("");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyOffers, setShowOnlyOffers] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showPerfilInfo, setShowPerfilInfo] = useState(false);
  const [vieneDelTest, setVieneDelTest] = useState(false);
  const [perfilComprador, setPerfilComprador] = useState<null | { perfil: string, emoji: string, descripcion: string }>(null);
  // Recupera query desde la URL solo al cargar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get("query") || "";
      setInputQuery(q);
      setQuery(q);
    }
  }, []);
 
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const test = urlParams.has("test");
      setVieneDelTest(test);
  
      if (test) {
        try {
          const perfil = JSON.parse(localStorage.getItem("perfilComprador") || "null");
          setPerfilComprador(perfil);
        } catch {
          setPerfilComprador(null);
        }
      }
    }
  }, []);
  
  // Solo ejecuta búsqueda si se actualiza 'query' (no 'inputQuery')
  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setFilteredProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    const apiUrl = `/api/search?query=${encodeURIComponent(query)}`;

    fetch(apiUrl)
      .then(async (response) => {
        const contentType = response.headers.get("content-type");
        const rawText = await response.text();

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        if (!contentType?.includes("application/json")) throw new Error("La respuesta no es JSON válido.");
        return JSON.parse(rawText);
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const parsedProducts = data.map((item: any) => ({
            id: item.itemId,
            title: item.title,
            price: parseFloat(item.price?.value) ?? 0,
            currency: item.price?.currency ?? "USD",
            thumbnail: item.image?.imageUrl || "",
            permalink: item.itemWebUrl,
            sellerName: item.seller?.username || "Desconocido",
            feedbackScore: item.seller?.feedbackScore ?? 0,
            feedbackPercentage: parseFloat(item.seller?.feedbackPercentage) || 0,
            condition: item.condition || "No especificado",
            conditionId: item.conditionId || "",
            categoryName: item.categories?.[0]?.categoryName || "No clasificado",
            categoryId: item.categories?.[0]?.categoryId || "",
            allCategories: item.categories || [],
            topRated: item.topRatedBuyingExperience ?? false,
            discountPercentage: item.marketingPrice?.discountPercentage
              ? parseFloat(item.marketingPrice.discountPercentage)
              : undefined,
            originalPrice: item.marketingPrice?.originalPrice?.value
              ? parseFloat(item.marketingPrice.originalPrice.value)
              : undefined,
            shippingCost: item.shippingOptions?.[0]?.shippingCost?.value
              ? parseFloat(item.shippingOptions[0].shippingCost.value)
              : undefined,
            thumbnailImages: item.thumbnailImages?.map((img: any) => img.imageUrl) || [],
          }));
          setProducts(parsedProducts);
        } else {
          setError("No se encontraron productos.");
          setProducts([]);
        }
      })
      .catch((err) => {
        setError(`No se pudieron cargar los productos. ${err.message || ""}`);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);

  // Aplica los filtros cuando cambian
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const newQuery = urlParams.get("query") || "";
    if (newQuery !== query) {
      setQuery(newQuery); // sin esto, no se actualiza si vuelven a /shopping con otra query
    }

    const filtered = products.filter((p) => {
      const priceOk =
        (filters.priceLessThan === undefined || p.price < filters.priceLessThan) &&
        (filters.priceGreaterThan === undefined || p.price > filters.priceGreaterThan);
      const categoryOk = !filters.category || p.categoryName === filters.category;
      const conditionOk =
        !filters.conditionId ||
        filters.conditionId.split(",").includes(p.conditionId);

    // Opiniones: cantidad mínima
  const feedbackScoreOk =
    filters.feedbackScoreMin === undefined ||
    p.feedbackScore >= filters.feedbackScoreMin;

// Envío
const shippingOk =
filters.shippingCostMax === undefined ||
(p.shippingCost !== undefined && p.shippingCost <= filters.shippingCostMax);

    
  // Descuento
  const discountOk =
  filters.discountPercentageMin === undefined ||
  (p.discountPercentage !== undefined && p.discountPercentage >= filters.discountPercentageMin);


// Top rated
const topRatedOk =
  !filters.onlyTopRated || p.topRated === true;


      return priceOk && categoryOk && conditionOk  && feedbackScoreOk &&  shippingOk && discountOk  && topRatedOk;
    });

    setFilteredProducts(filtered);
  }, [filters, products]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const triggerSearch = () => {
    if (inputQuery.trim()) {
      const urlParams = new URLSearchParams(window.location.search);
  
      // Construir nuevos parámetros manteniendo los que interesan
      const newParams = new URLSearchParams();
      newParams.set("query", inputQuery.trim());
  
      
    // Añade todos los filtros activos
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        newParams.set(key, String(value));
      }
    });
      // Mantén test=true si viene del test
      if (vieneDelTest) {
        newParams.set("test", "true");
      }
      // Redirigir manteniendo esos parámetros
      window.location.href = `/shopping?${newParams.toString()}`;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      triggerSearch();
    }
  };

  const categories = [...new Set(products.map((p) => p.categoryName))];
  const conditions = [...new Set(products.map((p) => p.condition))];
   // Calcula si hay ofertas en la categoría actual
   const hasOffers =
   filteredProducts.some(p => p.discountPercentage && p.discountPercentage > 20);

 // Para el renderizado de productos (muestra solo ofertas si está activado)
 const productsToShow = showOnlyOffers
   ? filteredProducts.filter(p => p.discountPercentage && p.discountPercentage > 20)
   : filteredProducts;

 // Para favoritos
 const toggleFavorite = (productId: string) => {
  // Actualiza el estado local de IDs favoritos
  setFavorites((prev) =>
    prev.includes(productId)
      ? prev.filter((id) => id !== productId)
      : [...prev, productId]
  );
  
  // Guarda el producto completo en localStorage
  const product = products.find(p => p.id === productId);
  if (product) {
    let favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
    
    // Si ya existe, lo quitamos
    const existingIndex = favs.findIndex((f: any) => f.id === productId);
    if (existingIndex >= 0) {
      favs.splice(existingIndex, 1);
    } else {
      // Si no existe, lo añadimos
      favs.push({
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        sellerName: product.sellerName,
        feedbackScore: product.feedbackScore,
        feedbackPercentage: product.feedbackPercentage,
        categoryName: product.categoryName,
        permalink: product.permalink
        // Añade otros campos que quieras mostrar en favoritos
      });
    }
    
    localStorage.setItem("favoritos", JSON.stringify(favs));
   
    // Opcional: dispara un evento para que otros componentes se enteren
    window.dispatchEvent(new Event("storage"));
  }
};

  
  return (
    <div class="content-wrapper">
      <h2 class="title-find">Busca tu producto</h2>

      <div class="flex gap-4">
        <input
          class="input-search flex-1"
          placeholder="Ej. Reloj"
          value={inputQuery}
          onInput={(e) => setInputQuery((e.target as HTMLInputElement).value)}
          onKeyDown={handleKeyDown}
        />
        <button class="button-search" onClick={triggerSearch}>
          Buscar
        </button>
      </div>
    

      {loading && <p class="mt-6">⏳ Cargando catálogo…</p>}
      {error && <p class="mt-6 text-red-600">{error}</p>}

      
        <div class="shopping-container">
         <div class="sidebar-container">
         {vieneDelTest && perfilComprador && (
            <div class="perfil-personalizado-alert">
              <strong>Resultados personalizados</strong>
              <span class="perfil-tipo">
                Tipo de comprador: <b>{perfilComprador.perfil} {perfilComprador.emoji}</b>
                <button
                  class="perfil-info-btn"
                  onClick={() => setShowPerfilInfo((v) => !v)}
                  aria-label="Más info sobre el perfil"
                >+</button>
              </span>
              {showPerfilInfo && (
                <div class="perfil-info-box">
                  {perfilComprador.descripcion}
                </div>
              )}
            </div>
          )}
          <ProductFilterSidebar
            onFilterChange={handleFilterChange}
            categories={categories}
            conditions={conditions}
          />
           <div class="recommendation-wrapper">
    <FavoriteList /> 
  </div>
        </div>
          <div class="content-container">
              {/* Alerta y Botón de ofertas */}
          {hasOffers && (
            <div>
              <div class="category-discount-alert">
              🛒 ¡Esta categoría tiene varias ofertas con más de 20% de descuento!
              </div>
              <div class="oferta-btn-wrapper">
              <button
                class="category-offer-btn"
                onClick={() => setShowOnlyOffers((prev) => !prev)}
              >
                {showOnlyOffers
                  ? "👀 Ver todos los productos"
                  : "🏷️ Ver solo ofertas en esta categoría"}
              </button>
              </div>
            </div>
          )}
          <div class="products-grid">
          {productsToShow.length > 0 ? (
             productsToShow.map((p) => (
              <div key={p.id} class={`product-card${p.topRated ? " top-rated-highlight" : ""}`}>
                <img src={p.thumbnail} alt={p.title} class="product-image" />
                <h3 class="product-title">{p.title}</h3>
                <p class="product-price">${p.price}</p>
                {p.discountPercentage && p.originalPrice && (
                  <p class="product-discount">
                    💸 Ahorro: <strong>{(p.originalPrice - p.price).toFixed(2)}€</strong> ({p.discountPercentage}%)
                  </p>
                )}
                <p class="product-condition">{p.condition}</p>
                <p class="product-category">Categoría: {p.categoryName}</p>
                {p.topRated && (
                  <span class="top-rated-badge">🥇 TOP Rated</span>
                )}
                <a
                  href={p.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="product-link"
                >
                  Ver en eBay
                </a>
                <button
                class={`favorite-btn${favorites.includes(p.id) ? " active" : ""}`}
                onClick={() => toggleFavorite(p.id)}
                aria-label={favorites.includes(p.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
              >
                {favorites.includes(p.id) ? "⭐" : "☆"}
              </button>
              </div>
            ))
          ) : (
            // Filtros siguen visibles
            !loading && !error && query && (
              <p class="mt-6">⚠️ No se encontraron resultados para “{query}”.</p>
            )
          )}
        </div>
          </div>
        </div>
    </div>
  );
}
