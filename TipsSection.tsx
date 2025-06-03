export default function TipsAhorroSection() {
    const tips = [
      "Aprovecha las rebajas de enero y julio para conseguir grandes descuentos en moda y hogar.",
      "Compra tecnología justo después de grandes eventos como Black Friday o Prime Day: suelen bajar aún más.",
      "Revisa la información del producto antes de comprar para ahorrar y verificar tu compra."
    ];
  
    return (
      <section class="tips-ahorro-section">
        <div class="tip-container">
        <h2 class="tips-title"> Tips Ahorro</h2>
        <div class="tips-cards">
          {tips.map((tip, idx) => (
            <div class="tip-card" key={idx}>
              <img
                src="https://img.freepik.com/vector-gratis/mujer-pensando-idea_24908-81732.jpg"
                alt="Tip de ahorro"
                class="tip-image"
              />
              <div class="tip-overlay">
                <span>{tip}</span>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>
    );
  }
  