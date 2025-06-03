import { useState } from "preact/hooks";

interface RecommendationProps {
    currentCategory?: string;
  }
export default function Recommendation() {
  const [showRecommendations, setShowRecommendations] = useState(false);

  const recommendationsData = [
    { category: "Moda y Accesorios", bestMonth: 11 },
    { category: "Calzado", bestMonth: 10 },
    { category: "Electrodomésticos", bestMonth: 1 },
    { category: "Hogar", bestMonth: 12 },
    { category: "Deportes", bestMonth: 9 },
    { category: "Tecnología", bestMonth: 7 },
  ];

  const currentMonth = new Date().getMonth() + 1;

  function getPosition(bestMonth: number) {
    let diff = bestMonth - currentMonth;
    if (diff < 0) diff += 12;
    return diff;
  }

  return (
    <div class="recommendation-container">
      {!showRecommendations && (
        <button
          onClick={() => setShowRecommendations(true)}
          class="btn-recommendation"
          aria-expanded={showRecommendations}
        >
           Ver recomendación de compra
        </button>
      )}

      {showRecommendations && (
        <div class="recommendations-bar">
          <button
            class="close-recommendation"
            onClick={() => setShowRecommendations(false)}
            aria-label="Cerrar recomendaciones"
          >
            🞩
          </button>

          {recommendationsData.map(({ category, bestMonth }) => {
            const pos = getPosition(bestMonth);
            const segments = Array.from({ length: 12 }, (_, i) => {
              let color = "";
              if (i <= 3) color = "#22c55e";
              else if (i <= 7) color = "#eab308";
              else color = "#dc2626";
              if (i === pos) color = "#3b82f6";

              return (
                <span
                  key={i}
                  class="bar-segment"
                  style={{ backgroundColor: color }}
                />
              );
            });

            const monthNames = [
              "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
              "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ];

            return (
              <div key={category} class="recommendation-row">
                <div class="category-label"> {category}</div>
                <div class="bar-wrapper">
                  <span class="bar-extreme good">Muy buena</span>
                  <div class="bar-container">{segments}</div>
                  <span class="bar-extreme bad">Muy mala</span>
                </div>
                <div class="best-month-text">
                  🔎 Mejor mes para comprar: <strong>{monthNames[bestMonth - 1]}</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
