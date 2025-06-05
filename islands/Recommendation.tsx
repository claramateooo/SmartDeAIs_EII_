import { useState } from "preact/hooks";

const monthNames = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

const recommendationsData = [
  {
    category: "Moda y Accesorios",
    bestMonth: 7,
    trend: [3,4,5,4,3,1,1,2,2,3,2,2],
  },
  {
    category: "Calzado",
    bestMonth: 11,
    trend: [4,4,5,4,3,2,2,2,2,2,1,1],
  },
  {
    category: "Electrodomésticos",
    bestMonth: 1,
    trend: [1,1,2,3,3,4,4,5,5,4,3,2],
  },
  {
    category: "Hogar",
    bestMonth: 12,
    trend: [1,3,4,5,4,3,3,3,2,2,2,1],
  },
  {
    category: "Deportes",
    bestMonth: 9,
    trend: [5,5,4,3,3,2,2,2,1,1,3,4],
  },
  {
    category: "Tecnología",
    bestMonth: 7,
    trend: [3,3,2,2,1,1,1,2,3,4,4,3],
  },
];

export default function Recommendation() {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const currentMonth = new Date().getMonth(); // 0-indexed

  function getSituationLevel(trend: number[], month: number) {
    const value = trend[month];
    if (value <= 2) return { text: "Muy buena", color: "#16a34a" };
    if (value === 3) return { text: "Normal", color: "#eab308" };
    return { text: "Muy mala", color: "#dc2626" };
  }

  function getRecommendation(bestMonth: number) {
    if (bestMonth - 1 === currentMonth) return "¡Este es el mejor mes para comprar!";
    const diff = (bestMonth - 1 - currentMonth + 12) % 12;
    if (diff <= 2) return "¡Muy pronto será el mejor momento!";
    if (diff >= 9) return "¡Acaba de pasar el mejor momento!";
    return "No es el mejor momento, pero puedes encontrar ofertas.";
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

          {recommendationsData.map(({ category, bestMonth, trend }) => {
            const situation = getSituationLevel(trend, currentMonth);
            return (
              <div key={category} class="recommendation-row">
                <div class="category-label">{category}</div>
                {/* Barra de meses */}
                <div class="timeline-box">
                <div class="timeline-bar">
                  {trend.map((level, i) => {
                    let color = "#16a34a"; // verde
                    if (level === 2) color = "#a3e635";
                    if (level === 3) color = "#eab308";
                    if (level === 4) color = "#f59e42";
                    if (level === 5) color = "#dc2626";
                    const isCurrent = i === currentMonth;
                    const isBest = i === bestMonth - 1;
                    return (
                      <div key={i} class="timeline-segment" style={{
                        background: color,
                        border: isCurrent ? "2.5px solid #3b82f6" : "1px solid #e5e7eb",
                        position: "relative",
                        height: isCurrent ? "22px" : "16px",
                        marginTop: isBest ? "0" : "8px"
                      }}>
                        {isBest && (
                          <span class="timeline-best" title="Mejor mes">⭐</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                </div>
                {/* Etiquetas de meses */}
                <div class="timeline-months">
                  {monthNames.map((name, i) => (
                    <span
                      key={i}
                      style={{
                        color: i === currentMonth ? "#3b82f6" : "#6b7280",
                        fontWeight: i === currentMonth ? 700 : 400
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
                {/* Situación actual */}
                <div class="situation-text" style={{ color: situation.color }}>
                  <strong>Situación actual:</strong> {situation.text}
                </div>
                <div class="recommendation-text">
                  <strong>Recomendación:</strong> {getRecommendation(bestMonth)}
                </div>
                {/* Botón "Más" */}
                <button
                  class="btn-more"
                  onClick={() =>
                    setExpandedCategory(expandedCategory === category ? null : category)
                  }
                >
                  {expandedCategory === category ? "▲ Ocultar evolución" : "Más"}
                </button>
                {/* Gráfico de tendencia */}
                {expandedCategory === category && (
                  <div class="trend-graph">
                    <div class="trend-graph-bar-container">
                      {trend.map((level, i) => (
                        <div
                          key={i}
                          class={`trend-graph-bar${i === currentMonth ? " current" : ""}`}
                          style={{
                            height: `${(6 - level) * 10}px`,
                            background: i === currentMonth ? "#3b82f6" : "#a5b4fc"
                          }}
                          title={monthNames[i]}
                        ></div>
                      ))}
                    </div>
                    <div class="trend-graph-months">
                      {monthNames.map((m, i) =>
                        <span key={i}>{(i === 0 || i === 5 || i === 11) ? m : ""}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
