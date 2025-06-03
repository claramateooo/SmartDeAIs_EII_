import { useState } from "preact/hooks";

type PerfilComprador = "Cazador de gangas" | "Premium" | "Eco-friendly" | "Personalizado";

function asignarPerfil({
  selectedPrice,
  selectedShippingMax,
  selectedMinDiscount,
}: {
  selectedPrice: string,
  selectedShippingMax: string,
  selectedMinDiscount: string
}): { perfil: PerfilComprador, emoji: string, descripcion: string } {
  // Puedes personalizar la lógica de perfil según el envío si lo deseas
  if (selectedShippingMax === "0") {
    return {
      perfil: "Premium",
      emoji: "👑",
      descripcion: "Solo productos con envío gratis y vendedores top."
    };
  }
  if (selectedMinDiscount === "40") {
    return {
      perfil: "Cazador de gangas",
      emoji: "🎯",
      descripcion: "Productos con grandes descuentos y alertas de precio."
    };
  }
  if (selectedShippingMax === "10") {
    return {
      perfil: "Eco-friendly",
      emoji: "🌱",
      descripcion: "Productos con envío asequible y marcas sostenibles."
    };
  }
  return {
    perfil: "Personalizado",
    emoji: "✨",
    descripcion: "Selección adaptada a tus respuestas."
  };
}

export default function TestButton() {
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedShippingMax, setSelectedShippingMax] = useState(""); // Nuevo estado

  const handleTest = () => setShowForm(true);
  const closeForm = () => setShowForm(false);

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    const selectedFeedbackImportance = (document.querySelector('select[name="feedback_importance"]') as HTMLSelectElement)?.value;
    const selectedMinDiscount = (document.querySelector('select[name="min_discount"]') as HTMLSelectElement)?.value;

    if (!selectedPrice || !selectedShippingMax || !selectedFeedbackImportance || !selectedMinDiscount) {
      alert("Por favor, completa todos los campos antes de enviar el test.");
      return;
    }

    // 1. Se asigna el perfil y se guarda en localStorage
    const perfilAsignado = asignarPerfil({
      selectedPrice,
      selectedShippingMax,
      selectedMinDiscount,
    });
    localStorage.setItem("perfilComprador", JSON.stringify(perfilAsignado));

    // 2. Se construye la query de búsqueda
    let query = "?test=true";

    // Precio
    if (selectedPrice === "lt50") {
      query += "&priceLessThan=50";
    } else if (selectedPrice === "lt100") {
      query += "&priceGreaterThan=50&priceLessThan=100";
    } else if (selectedPrice === "gt100") {
      query += "&priceGreaterThan=100";
    }

    // Envío máximo
    if (selectedShippingMax !== "") {
      query += `&shippingCostMax=${selectedShippingMax}`;
    }

    // Feedback: solo número de valoraciones mínimas
    if (selectedFeedbackImportance === "high") {
      query += "&feedbackScoreMin=500";
    } else if (selectedFeedbackImportance === "medium") {
      query += "&feedbackScoreMin=100";
    } else if (selectedFeedbackImportance === "low") {
      query += "&feedbackScoreMin=10";
    }

    // Descuento mínimo
    if (selectedMinDiscount !== "") {
      query += `&discountPercentageMin=${selectedMinDiscount}`;
    }

    setFormSubmitted(true);

    setTimeout(() => {
      window.location.href = "/shopping" + query;
    }, 2000);
  };

  return (
    <div class="test-container">
      <img 
        src="https://www.coopersystem.com.br/wp-content/uploads/2019/04/o-que-%C3%A9-um-software-sob-medida.png" 
        alt="Test GIF" 
        class="gif-background"
      />

      <div class="test-content">
        {!formSubmitted ? (
          <button onClick={handleTest} class="button-test">
            Realizar Test de Personalización
          </button>
        ) : (
          <div class="modal-overlay">
            <div class="modal-form text-center">
              <h3 class="text-lg font-semibold">¡Resultados almacenados correctamente!</h3>
              <p class="text-sm mt-2">Te llevamos a las mejores ofertas según tu perfil ✨</p>
            </div>
          </div>
        )}
      </div>

      {showForm && !formSubmitted && (
        <div class="modal-overlay">
          <div class="modal-form">
            <button class="close-button" onClick={closeForm}>✖</button>
            <h2 class="form-title">Personaliza tu experiencia de compra</h2>
            <form onSubmit={handleSubmit}>
              <label>Presupuesto estimado por producto:</label>
              <select 
                value={selectedPrice} 
                onChange={(e) => setSelectedPrice(e.currentTarget.value)}
                required
              >
                <option value="">Selecciona una opción</option>
                <option value="lt50">Menos de 50€</option>
                <option value="lt100">Entre 50€ - 100€</option>
                <option value="gt100">Más de 100€</option>
              </select>
              <label>¿Cuánto estás dispuesto a pagar por el envío?</label>
              <select 
                name="shipping_max" 
                value={selectedShippingMax}
                onChange={(e) => setSelectedShippingMax(e.currentTarget.value)}
                required
              >
                <option value="">Selecciona una opción</option>
                <option value="0">Envío gratis</option>
                <option value="5">Hasta 5€</option>
                <option value="10">Hasta 10€</option>
              </select>
              <label>¿Cuántas valoraciones mínimas debe tener el vendedor?</label>
              <select name="feedback_importance" required>
                <option value="">Selecciona una opción</option>
                <option value="low">Al menos 10</option>
                <option value="medium">Al menos 100</option>
                <option value="high">Al menos 500</option>
              </select>
              <label>¿Qué descuento mínimo te gustaría ver?</label>
              <select name="min_discount" required>
                <option value="">Selecciona una opción</option>
                <option value="10">10%</option>
                <option value="20">20%</option>
                <option value="40">40%</option>
              </select>
              <button type="submit" class="button-submit mt-4">
                Enviar respuestas
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
