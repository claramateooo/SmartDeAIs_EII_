import { useState, useEffect } from "preact/hooks";

interface FilterProps {
  onFilterChange: (filters: {
    priceLessThan?: number;
    priceGreaterThan?: number;
    category?: string;
    condition?: string;
    conditionId?: string; 
    feedbackScoreMin?: number;
    shippingCostMax?: number;
    discountPercentageMin?: number;
    onlyTopRated?: boolean;
  }) => void;
  categories: string[];
  conditions: string[];
}

export default function ProductFilterSidebar({
  onFilterChange,
  categories,
  conditions,
}: FilterProps) {
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [filterFromTest, setFilterFromTest] = useState(false);
  const [feedbackScoreMin, setFeedbackScoreMin] = useState<number | undefined>(undefined);
  const [shippingCostMax, setShippingCostMax] = useState<number | undefined>(undefined);
  const [discountPercentageMin, setDiscountPercentageMin] = useState<number | undefined>(undefined);
  const [onlyTopRated, setOnlyTopRated] = useState<boolean>(false);
  const conditionOptions = [
    { value: "", label: "Todas" },
    { value: "1000", label: "Nuevo" },
    { value: "not-new", label: "No nuevo" } // "not-new" es un valor especial para todos menos nuevo
  ];
  
  // Detectar si el filtro viene del test
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
  
    if (urlParams.has("test")) {
      if (urlParams.has("priceGreaterThan") && urlParams.has("priceLessThan")) {
        setSelectedPrice("lt100");
      } else if (urlParams.has("priceLessThan")) {
        setSelectedPrice("lt50");
      } else if (urlParams.has("priceGreaterThan")) {
        setSelectedPrice("gt100");
      }
      if (urlParams.has("condition")) {
        const cond = urlParams.get("condition");
        if (cond === "1000") setSelectedCondition("1000");
        else if (cond && cond.includes("1500")) setSelectedCondition("not-new");
      }
      if (urlParams.has("feedbackScoreMin")) {
        setFeedbackScoreMin(Number(urlParams.get("feedbackScoreMin")));
      }
      if (urlParams.has("discountMin")) {
        setDiscountPercentageMin(Number(urlParams.get("discountMin")));
      }
      setFilterFromTest(true);
    }
  }, []);

  // Aplicar filtros según selección
  useEffect(() => {
    let priceLessThan: number | undefined;
    let priceGreaterThan: number | undefined;
    let conditionId: string | undefined = undefined;

    switch (selectedPrice) {
      case "lt50":
        priceLessThan = 50;
        break;
      case "lt100":
        priceGreaterThan = 50;
        priceLessThan = 100;
        break;
      case "gt100":
        priceGreaterThan = 100;
        break;
    }
      // Lógica para la condición
      if (selectedCondition === "1000") {
        conditionId = "1000";
      } else if (selectedCondition === "not-new") {
        conditionId = "1500,1750,2000,2500,3000,4000,5000,6000";
      }
   
    onFilterChange({
      priceLessThan,
      priceGreaterThan,
      category: selectedCategory || undefined,
      conditionId,
      feedbackScoreMin,
      shippingCostMax,
      discountPercentageMin,
      onlyTopRated,
    });
  }, [selectedPrice, selectedCategory, selectedCondition, feedbackScoreMin, shippingCostMax, discountPercentageMin,  onlyTopRated]);

  // Limpiar todos los filtros del test
  const clearTestFilter = () => {
    setSelectedPrice("");
    setSelectedCategory("");
    setSelectedCondition("");
    setFeedbackScoreMin(undefined);
    setFilterFromTest(false);
  };

  const clearFilter = (type: "price" | "category" | "condition" | "feedbackPercentageMin" | "feedbackScoreMin"  | "shippingCostMax" | "discountPercentageMin" | "originalPriceMin" | "currency") => {
    if (type === "price") setSelectedPrice("");
    if (type === "category") setSelectedCategory("");
    if (type === "condition") setSelectedCondition("");
    if (type === "feedbackScoreMin") setFeedbackScoreMin(undefined);
    if (type === "shippingCostMax") setShippingCostMax(undefined);
    if (type === "discountPercentageMin") setDiscountPercentageMin(undefined);
  };

  const renderFilter = (
    label: string,
    value: string | number | undefined,
    onChange: (e: Event) => void,
    options: { value: string | number; label: string }[],
    type: "price" | "category" | "condition" | "feedbackScoreMin" | "shippingCostMax" | "discountPercentageMin" | "originalPriceMin" 
  ) => (
    <div style={{ marginBottom: "1rem" }}>
      <label class="flex items-center justify-between">
        <span>{label}</span>
        {value !== "" && value !== undefined && (
          <button
            class="clear-filter"
            onClick={() => clearFilter(type)}
            aria-label={`Cerrar filtro ${label}`}
            type="button"
          >
            🞩
          </button>
        )}
      </label>
      <select value={value ?? ""} onChange={onChange}>
        <option value="">Todos</option>
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div class="filter-sidebar">
      <h3 class="text-lg font-semibold">Filtrar por</h3>

      {filterFromTest && (
        <div class="test-filter-banner" style={{ marginBottom: "1rem" }}>
          ✨ Filtros del test aplicados
          <button class="clear-test-filter" onClick={clearTestFilter} style={{ marginLeft: "1rem" }}>
            ✖
          </button>
        </div>
      )}

      {renderFilter(
        "Precio",
        selectedPrice,
        (e) => setSelectedPrice((e.target as HTMLSelectElement).value),
        [
          { value: "lt50", label: "Menor de 50€" },
          { value: "lt100", label: "50€ - 100€" },
          { value: "gt100", label: "Mayor de 100€" },
        ],
        "price"
      )}

      {renderFilter(
        "Categoría",
        selectedCategory,
        (e) => setSelectedCategory((e.target as HTMLSelectElement).value),
        categories.map((cat) => ({ value: cat, label: cat })),
        "category"
      )}

      {renderFilter(
         "Condición",
         selectedCondition,
         (e) => setSelectedCondition((e.target as HTMLSelectElement).value),
         conditionOptions,
         "condition"
      )}


      {renderFilter(
        "Nº mínimo valoraciones",
        feedbackScoreMin,
        (e) => setFeedbackScoreMin(Number((e.target as HTMLSelectElement).value) || undefined),
        [
          { value: 500, label: "500 o más" },
          { value: 100, label: "100 o más" },
          { value: 10, label: "10 o más" },
        ],
        "feedbackScoreMin"
      )}
            {renderFilter(
        "Envío máximo (€)",
        shippingCostMax,
        (e) => setShippingCostMax(Number((e.target as HTMLSelectElement).value) || undefined),
        [
            { value: 0, label: "Envío gratis" },
            { value: 5, label: "Hasta 5€" },
            { value: 10, label: "Hasta 10€" },
        ],
        "shippingCostMax"
        )}

        {renderFilter(
        "Descuento mínimo (%)",
        discountPercentageMin,
        (e) => setDiscountPercentageMin(Number((e.target as HTMLSelectElement).value) || undefined),
        [
            { value: 10, label: "10% o más" },
            { value: 20, label: "20% o más" },
            { value: 40, label: "40% o más" },
        ],
        "discountPercentageMin"
        )}

        <div style={{ marginBottom: "1rem" }}>
  <button
        class={`top-rated-btn${onlyTopRated ? " active" : ""}`}
        onClick={() => setOnlyTopRated(!onlyTopRated)}
        type="button"
    >
        🥇 TOP Rated
    </button>
    </div>

    </div>
  );
}
