import { useState, useEffect } from "preact/hooks";

interface Product {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  permalink: string;
  sellerName: string;
  feedbackScore: number;
  feedbackPercentage: number;
  categoryName: string;
}

function getFavorites(): Product[] {
  const favs = localStorage.getItem("favoritos");
  return favs ? JSON.parse(favs) : [];
}

function getPricePrediction() {
  const trend = Math.random();
  if (trend < 0.45) return { icon: "🔽", text: "Se espera que baje un 5% en las próximas semanas" };
  if (trend < 0.8) return { icon: "➖", text: "El precio se mantendrá estable" };
  return { icon: "🔼", text: "Se espera que suba un 3% en las próximas semanas" };
}

function getVendorStatus(score: number) {
  if (score >= 8) return { emoji: "🟢", text: "Bueno", color: "green" };
  if (score >= 5) return { emoji: "🟡", text: "Normal", color: "orange" };
  return { emoji: "🔴", text: "Malo", color: "red" };
}

export default function FavoriteList() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    setFavorites(getFavorites());
    const sync = () => setFavorites(getFavorites());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const removeFavorite = (id: string) => {
    const newFavs = favorites.filter(f => f.id !== id);
    setFavorites(newFavs);
    localStorage.setItem("favoritos", JSON.stringify(newFavs));
    window.dispatchEvent(new Event("storage"));
  };

  if (!favorites.length) {
    return (
      <div class="favorite-list-container">
        <div class="favorite-list-empty">No tienes productos en favoritos.</div>
      </div>
    );
  }

  return (
    <div class="favorite-list-container">
      <h2 class="favorite-list-title">⭐ Mis Favoritos</h2>
      <button
        class={`favorite-toggle-btn ${showList ? "open" : "closed"}`}
        onClick={() => setShowList(!showList)}
        aria-label={showList ? "Ocultar favoritos" : "Mostrar favoritos"}
      >
        {showList ? "▼" : "►"}
      </button>
      { showList && favorites.map((fav) => {
        const pricePred = getPricePrediction();
        const sales = 5 + Math.floor(Math.random() * 30);
        const vendor = getVendorStatus(fav.feedbackScore ?? 5);
        return (
          <div class="favorite-row" key={fav.id}>
            <img src={fav.thumbnail} alt={fav.title} class="favorite-thumb" />
            <div class="favorite-main-info">
              <a href={fav.permalink} target="_blank" rel="noopener" class="favorite-title">{fav.title}</a>
              <span class="favorite-price">${fav.price}</span>
              <span class="favorite-vendor">{fav.sellerName}</span>
            </div>
            <button
              class="favorite-info-btn"
              onClick={() => setOpenInfo(openInfo === fav.id ? null : fav.id)}
              aria-label="Mostrar información"
            >+</button>
            <button
              class="favorite-remove-btn"
              onClick={() => removeFavorite(fav.id)}
              title="Quitar de favoritos"
            >×</button>
            {openInfo === fav.id && (
              <div class="favorite-extra-info">
                            <button
                  class="favorite-info-close"
                  onClick={() => setOpenInfo(null)}
                  aria-label="Cerrar info"
                  title="Cerrar"
                >×</button>
                <p>{pricePred.icon} <b>{pricePred.text}</b></p>
                <p>💬 Se han realizado <b>{sales}</b> compras este mes.</p>
                <p>
                  👤 Vendedor: <b>{fav.sellerName || "Desconocido"}</b>
                  <span style={{ color: vendor.color, fontWeight: "bold", marginLeft: 6 }}>
                    {vendor.emoji} {vendor.text}
                  </span>
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
