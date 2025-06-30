document.addEventListener("DOMContentLoaded", async () => {
  const catalogo = document.getElementById("catalogo");
  const buscador = document.getElementById("buscador");
  const filtros = document.getElementById("filtros-categorias");

  // opción 1 local
  // const response = await fetch("productos.json");
  // opción 2 desde Google Sheets
  const response = await fetch(
    "https://opensheet.elk.sh/1YNBL2a2AGZOSFVIfJ9hVJQkcR0ZcMz_0KNYxBu1AV1g/VPP"
  );
  const rawData = await response.json();

  // Agrupar por categoría
  const data = [];
  rawData.forEach((producto) => {
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

  // Generar botones de categoría
  const categorias = ["Todas", ...data.map((c) => c.nombre)];
  // filtros.innerHTML = categorias
  //   .map(
  //     (cat) =>
  //       `<button class="btn btn-outline-danger mx-1 my-1" data-cat="${cat}">${cat}</button>`
  //   )
  //   .join("");

  // Generar carrusel de categorías
  const iconosCategoria = {
    Todas: "📋",
    Pizzas: "🍕",
    "Pizza de 1 Ingrediente": "🧀",
    Calzones: "🌯",
    Lasañas: "🍝",
    Alitas: "🍗",
    Bebidas: "🥤",
  };

  // Renderizar el carrusel con íconos
  filtros.innerHTML = categorias
    .map(
      (cat) => `
      <div class="categoria-item${
        cat === "Todas" ? " active" : ""
      }" data-cat="${cat}">
        <span class="categoria-icon">${iconosCategoria[cat] || "🍽️"}</span>
        <div class="categoria-text">${cat}</div>
      </div>
    `
    )
    .join("");

  // Manejo de clics en las categorías
  filtros.addEventListener("click", (e) => {
    const item = e.target.closest(".categoria-item");
    if (item) {
      categoriaSeleccionada = item.dataset.cat.trim();

      // Activar el ítem seleccionado
      filtros
        .querySelectorAll(".categoria-item")
        .forEach((el) => el.classList.remove("active"));
      item.classList.add("active");

      // Renderizar catálogo filtrado
      renderCatalogo(buscador.value.trim().toLowerCase());
    }
  });

  // Fin carrusel de categorías

  filtros.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      categoriaSeleccionada = e.target.dataset.cat;
      renderCatalogo(buscador.value.trim().toLowerCase());
    }
  });

  buscador.addEventListener("input", () => {
    renderCatalogo(buscador.value.trim().toLowerCase());
  });

  //   function renderCatalogo(filtro = "") {
  //     catalogo.innerHTML = "";

  //     const categoriasFiltradas = data.filter((c) =>
  //       categoriaSeleccionada === "Todas"
  //         ? true
  //         : c.nombre === categoriaSeleccionada
  //     );

  //     categoriasFiltradas.forEach((categoria) => {
  //       const productosFiltrados = categoria.productos.filter(
  //         (producto) =>
  //           producto.nombre.toLowerCase().includes(filtro) ||
  //           producto.descripcion.toLowerCase().includes(filtro)
  //       );

  //       if (productosFiltrados.length > 0) {
  //         const seccion = document.createElement("section");
  //         seccion.classList.add("mb-5");

  //         seccion.innerHTML = `
  //               <h2 class="text-danger">${categoria.nombre}</h2>
  //               <div class="row gy-4">
  //                 ${productosFiltrados
  //                   .map((p) => {
  //                     const tieneDescuento =
  //                       p.precio_descuento && p.precio_descuento < p.precio;
  //                     return `
  //                     <div class="col-md-4">
  //                       <div class="producto-card p-3 h-100 d-flex flex-column position-relative">
  //                         ${
  //                           p.promocion
  //                             ? '<span class="promo-badge">¡OFERTA!</span>'
  //                             : ""
  //                         }
  //                         <img src="img/${
  //                           p.imagen
  //                         }" class="producto-img mb-3" alt="${p.nombre}" />
  //                         <h4>${p.nombre}</h4>
  //                         <p>${p.descripcion}</p>
  //                         <div>
  //                           ${
  //                             tieneDescuento
  //                               ? `<span class="precio-original">Q${p.precio.toFixed(
  //                                   2
  //                                 )}</span><span class="precio-descuento">Q${p.precio_descuento.toFixed(
  //                                   2
  //                                 )}</span>`
  //                               : `<strong>Q${p.precio.toFixed(2)}</strong>`
  //                           }
  //                         </div>
  //                         <a
  //                           href="https://wa.me/50247707384?text=Hola%2C%20quiero%20el%20producto%20${encodeURIComponent(
  //                             p.nombre
  //                           )}"
  //                           target="_blank"
  //                           class="btn-whatsapp mt-3"
  //                         >
  //                           Pedir por WhatsApp
  //                         </a>
  //                       </div>
  //                     </div>
  //                   `;
  //                   })
  //                   .join("")}
  //               </div>
  //             `;
  //         catalogo.appendChild(seccion);
  //       }
  //     });
  //   }

  function renderCatalogo(filtro = "") {
    catalogo.innerHTML = "";

    const categoriasFiltradas = data.filter((c) =>
      categoriaSeleccionada === "Todas"
        ? true
        : c.nombre.trim() === categoriaSeleccionada
    );

    categoriasFiltradas.forEach((categoria) => {
      // Filtrar por texto
      const productosFiltrados = categoria.productos.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(filtro) ||
          producto.descripcion.toLowerCase().includes(filtro)
      );

      if (productosFiltrados.length > 0) {
        // Agrupar por subcategoría
        const productosPorSubcat = {};
        productosFiltrados.forEach((p) => {
          const subcat = p.subcategoria?.trim() || "";
          if (!productosPorSubcat[subcat]) productosPorSubcat[subcat] = [];
          productosPorSubcat[subcat].push(p);
        });

        const seccion = document.createElement("section");
        seccion.classList.add("mb-5");
        seccion.innerHTML = `<h2 class="text-danger fw-bold">${categoria.nombre}</h2>`;
        catalogo.appendChild(seccion);

        let primeraSubcat = true;

        Object.entries(productosPorSubcat).forEach(([subcat, productos]) => {
          const subcatTitulo =
            subcat !== ""
              ? // ? `<h4 class="text-primary fw-bold mt-4" style="color:rgb(0, 255, 30);" >${subcat}</h4>`
                `<h4 class="fw-bold mt-4" style="color:#ddd;" >${subcat}</h4>`
              : "";
          const fila = document.createElement("div");
          fila.className = "row gy-4";

          fila.innerHTML = productos
            .map((p) => {
              const tieneDescuento =
                p.precio_descuento && p.precio_descuento < p.precio;

              const precioHTML = tieneDescuento
                ? `<span class="precio-original">Q${p.precio.toFixed(
                    2
                  )}</span> <span class="precio-descuento">Q${p.precio_descuento.toFixed(
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
                <div class="mt-2 precio-container">
                  ${precioHTML}
                </div>
              </div>
            </div>
          `;
            })
            .join("");

          // Insertar línea separadora antes de cada subcategoría (excepto la primera)
          if (!primeraSubcat) {
            const separador = document.createElement("hr");
            separador.className = "subcategoria-separador my-4";
            seccion.appendChild(separador);
          }
          seccion.innerHTML += subcatTitulo;
          seccion.appendChild(fila);
          primeraSubcat = false;
        });
      }
    });
  }

  document.getElementById("btn-prev").addEventListener("click", () => {
    filtros.scrollBy({ left: -200, behavior: "smooth" });
  });
  document.getElementById("btn-next").addEventListener("click", () => {
    filtros.scrollBy({ left: 200, behavior: "smooth" });
  });

  renderCatalogo();
});
