document.addEventListener("DOMContentLoaded", async () => {
  const catalogo = document.getElementById("catalogo");
  const filtros = document.getElementById("filtros-categorias");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");

  // opción 1 local
  // const response = await fetch("productos.json");
  // opción 2 desde Google Sheets
  const response = await fetch(
    "https://opensheet.elk.sh/1YNBL2a2AGZOSFVIfJ9hVJQkcR0ZcMz_0KNYxBu1AV1g/VPP"
  );
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
    Pollo: "🍗",
    Pizzas: "🍕",
    "Pizza de 1 Ingrediente": "🍕",
    "Pizza de Especialidad": "🍕",
    "Otras Pizzas": "🍕",
    Calzones: "🌯",
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
      <div class="fw-bold mt-1 text-white small">${cat}</div>
    </div>
  `;
    })
    .join("");

  actualizarFlechasCarrusel();

  filtros.addEventListener("click", (e) => {
    const target = e.target.closest(".categoria-item");
    if (target?.dataset.cat) {
      categoriaSeleccionada = target.dataset.cat;
      document
        .querySelectorAll(".categoria-item")
        .forEach((el) => el.classList.remove("activa"));
      target.classList.add("activa");
      renderCatalogo();
    }
  });

  btnNext.addEventListener("click", () => {
    filtros.scrollLeft += 200;
  });

  btnPrev.addEventListener("click", () => {
    filtros.scrollLeft -= 200;
  });

  function actualizarFlechasCarrusel() {
    const hayOverflow = filtros.scrollWidth > filtros.clientWidth;
    btnPrev.style.display = hayOverflow ? "block" : "none";
    btnNext.style.display = hayOverflow ? "block" : "none";
  }

  window.addEventListener("resize", actualizarFlechasCarrusel);

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
      seccion.innerHTML = `<h2 class="text-danger fw-bold">${categoria.nombre}</h2>`;
      catalogo.appendChild(seccion);

      let primeraSubcat = true;

      Object.entries(productosPorSubcat).forEach(([subcat, productos]) => {
        if (!primeraSubcat) {
          const separador = document.createElement("hr");
          separador.className = "subcategoria-separador my-4";
          seccion.appendChild(separador);
        }

        const subcatTitulo = subcat
          ? `<h4 class="fw-bold mt-4" style="color:#ddd;">${subcat}</h4>`
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
                  p.promocion ? '<span class="promo-badge">¡OFERTA!</span>' : ""
                }
                <img src="img/${p.imagen}" class="producto-img mb-3" alt="${
              p.nombre
            }" />
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
});
