import Recommendation from "../islands/Recommendation.tsx";

export default function RecommendationSection() {
  return (
<section class="recommendation-section">
      <div class="recommendation-card">
        <img
          src="https://img.freepik.com/free-vector/thoughtful-woman-with-laptop-looking-big-question-mark_1150-39362.jpg?semt=ais_hybrid&w=740"
          alt="Cuándo es mejor comprar"
          class="recommendation-image"
        />
        <div class="recommendation-content">
          <h2 class="recommendation-title">¿Cuándo es mejor comprar?</h2>
          <p class="recommendation-preview">
            En esta sección te ayudamos a descubrir <strong>el mejor momento para comprar por categoría</strong>, analizando tendencias y ofertas activas. Aprovecha nuestros consejos y compra siempre al mejor precio.
          </p>
        </div>

        {/* Contenedor para centrar el island abajo */}
        <div class="recommendation-island-bottom">
          <Recommendation />
        </div>
      </div>
    </section>
  );
}
