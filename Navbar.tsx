import { useState } from "preact/hooks";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>

      <nav className={`navbar ${isOpen ? "open" : ""}`}>
        <ul className="nav-links">
          <li>
            <a href="/">
              <img src="https://cdn-icons-png.flaticon.com/128/1946/1946488.png" alt="Inicio" className="icon" />
              Inicio
            </a>
          </li>
          <li>
            <a href="/shopping">
              <img src="https://cdn-icons-png.flaticon.com/128/3931/3931294.png" alt="Buscar productos" className="icon" />
              Buscar productos
            </a>
          </li>
          <li>
            <a href="/AboutUs">
              <img src="https://cdn-icons-png.flaticon.com/128/864/864685.png" alt="Sobre nosotros" className="icon" />
              Sobre nosotros
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}
