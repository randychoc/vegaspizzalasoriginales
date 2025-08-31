document.addEventListener("DOMContentLoaded", async () => {
  const catalogo = document.getElementById("catalogo");
  const filtros = document.getElementById("filtros-categorias");
  const scrollInit = document.getElementById("scrollInit");

  const response = await fetch("productos.json");
  const rawData = await response.json();

  const data = [];
  rawData.forEach((producto) => {
    if (producto.mostrarProducto?.toLowerCase() !== "si") return;

    let categoria = data.find((c) => c.nombre === producto.categoria);
    if (!categoria) {
      categoria = { nombre: producto.categoria, productos: [] };
      data.push(categoria);
    }

    categoria.productos.push({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      subcategoria: producto.subcategoria?.trim() || "",
      precio: parseFloat(producto.precio),
      precio_descuento: producto.precio_descuento
        ? parseFloat(producto.precio_descuento)
        : null,
      promocion:
        producto.promocion?.toLowerCase() === "sí" ||
        producto.promocion?.toLowerCase() === "si",
      imagen: producto.imagen,
    });
  });

  let categoriaSeleccionada = "Todas";

  const categorias = ["Todas", ...data.map((c) => c.nombre)];
  const iconosCategoria = {
    Todas: "📋",
    // "Pollo y Hamburguesas": "🍗🍔",
    Pizzas: "🍕",
    "Pizza de 1 Ingrediente": "🍕",
    "Pizza de Especialidad": "🍕",
    "Otras Pizzas": "🍕",
    Calzones: "🥟",
    Lasañas: "🍝",
    Alitas: "🍗",
    Bebidas: "🥤",
  };

  filtros.innerHTML = categorias
    .map((cat) => {
      const icono = iconosCategoria[cat] || "🍽️";
      return `
    <div class="categoria-item" data-cat="${cat}">
      <button class="btn categoria-icono">
        ${icono}
      </button>
      <div class="fw-light mt-1 text-white small">${cat}</div>
    </div>
  `;
    })
    .join("");

  filtros.addEventListener("click", (e) => {
    const target = e.target.closest(".categoria-item");
    if (target?.dataset.cat) {
      categoriaSeleccionada = target.dataset.cat;
      document
        .querySelectorAll(".categoria-item")
        .forEach((el) => el.classList.remove("activa"));
      target.classList.add("activa");
      renderCatalogo();
      scrollInit.scrollIntoView({ behavior: "smooth" });
    }
  });

  const divPollo = document.createElement("div");
  divPollo.className = "categoria-item";
  divPollo.textContent = "🍗 Pollo y Hamburguesas";
  divPollo.innerHTML = `
  <button class="btn categoria-icono">🍗🍔</button>
  <div class="fw-light mt-1 text-white small">Pollo y Hamburguesas</div>
`;
  divPollo.addEventListener("click", () => {
    mostrarSeccionPollo();
  });
  document.getElementById("filtros-categorias").appendChild(divPollo);

  function renderCatalogo() {
    catalogo.innerHTML = "";

    const categoriasFiltradas = data.filter((c) =>
      categoriaSeleccionada === "Todas"
        ? true
        : c.nombre === categoriaSeleccionada
    );

    categoriasFiltradas.forEach((categoria) => {
      const productosPorSubcat = {};
      categoria.productos.forEach((p) => {
        const subcat = p.subcategoria || "";
        if (!productosPorSubcat[subcat]) productosPorSubcat[subcat] = [];
        productosPorSubcat[subcat].push(p);
      });

      const seccion = document.createElement("section");
      seccion.classList.add("mb-5");
      seccion.innerHTML = `<h2 class="titulos">${categoria.nombre}</h2>`;
      catalogo.appendChild(seccion);

      let primeraSubcat = true;

      Object.entries(productosPorSubcat).forEach(([subcat, productos]) => {
        if (!primeraSubcat) {
          const separador = document.createElement("hr");
          separador.className = "subcategoria-separador";
          seccion.appendChild(separador);
        }

        const subcatTitulo = subcat
          ? `<h4 class="subtitulos" >${subcat}</h4>`
          : "";

        const fila = document.createElement("div");
        fila.className = "row gy-4";
        fila.innerHTML = productos
          .map((p) => {
            const tieneDescuento =
              p.precio_descuento && p.precio_descuento < p.precio;

            const precioHTML = tieneDescuento
              ? `<span class="precio-original">Q${p.precio.toFixed(2)}</span>
               <span class="precio-descuento">Q${p.precio_descuento.toFixed(
                 2
               )}</span>`
              : `<strong>Q${p.precio.toFixed(2)}</strong>`;

            return `
              <div class="col-md-4">
                  <div class="producto-card p-3 h-100 d-flex flex-column position-relative">
                    ${
                      p.promocion
                        ? '<span class="promo-badge">¡OFERTA!</span>'
                        : ""
                    }
                    <picture class="mb-3">
                      <source srcset="img/${p.imagen.replace(
                        /\.(jpg|jpeg|png)$/i,
                        ".webp"
                      )}" type="image/webp">
                      <img src="img/${p.imagen}" class="producto-img" alt="${
              p.nombre
            }" loading="lazy" />
                    </picture>
                    <h4>${p.nombre}</h4>
                    <p>${p.descripcion}</p>
                    <div class="mt-2 precio-container">${precioHTML}</div>
                  </div>
              </div>`;
          })
          .join("");

        seccion.innerHTML += subcatTitulo;
        seccion.appendChild(fila);
        primeraSubcat = false;
      });
    });
  }

  renderCatalogo();

  function mostrarSeccionPollo() {
    const catalogo = document.getElementById("catalogo");
    catalogo.innerHTML = `
    <div class="row g-3">
      ${[1, 2, 3, 4]
        .map(
          (i) => `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow">
            <img src="img/pollo${i}.jpg" class="card-img-top" alt="Pollo ${i}" loading="lazy">
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
    document
      .getElementById("scrollInit")
      .scrollIntoView({ behavior: "smooth" });
  }
});
