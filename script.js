// ─── Estado del carrito ──────────────────────────────────────────────────────
let carrito = JSON.parse(localStorage.getItem("vp_carrito") || "[]").map(
  (i) => ({ key: i.key ?? `${i.id}_`, ...i })
);

function guardarCarrito() {
  localStorage.setItem("vp_carrito", JSON.stringify(carrito));
}

function calcularTotal() {
  return carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}

function actualizarHeaderCarrito() {
  const total = calcularTotal();
  const cantidad = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  const totalEl = document.getElementById("carrito-total-header");
  const badge = document.getElementById("carrito-badge");
  if (totalEl) totalEl.textContent = `Q${total.toFixed(2)}`;
  if (badge) {
    badge.textContent = cantidad;
    badge.style.display = cantidad > 0 ? "inline-flex" : "none";
  }

  const barra = document.getElementById("carrito-barra");
  if (barra) {
    if (cantidad > 0) {
      barra.classList.add("visible");
      document.body.classList.add("carrito-barra-activa");
      const el = barra.querySelector("#carrito-barra-cantidad");
      const tot = barra.querySelector("#carrito-barra-total");
      if (el) el.textContent = `${cantidad} ${cantidad === 1 ? "producto" : "productos"}`;
      if (tot) tot.textContent = `Q${total.toFixed(2)}`;
    } else {
      barra.classList.remove("visible");
      document.body.classList.remove("carrito-barra-activa");
    }
  }
}

function agregarAlCarrito(producto, opcion = null) {
  const key = `${producto.id}_${opcion || ""}`;
  const existing = carrito.find((i) => i.key === key);
  if (existing) {
    existing.cantidad += 1;
  } else {
    carrito.push({
      key,
      id: producto.id,
      nombre: producto.nombre,
      subcategoria: producto.subcategoria,
      precio: producto.precio_descuento ?? producto.precio,
      cantidad: 1,
      opcion,
    });
  }
  guardarCarrito();
  actualizarHeaderCarrito();
}

function cambiarCantidad(key, delta) {
  const item = carrito.find((i) => i.key === key);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) carrito = carrito.filter((i) => i.key !== key);
  guardarCarrito();
  actualizarHeaderCarrito();
  renderCarritoPanel();
}

function quitarDelCarrito(key) {
  carrito = carrito.filter((i) => i.key !== key);
  guardarCarrito();
  actualizarHeaderCarrito();
  renderCarritoPanel();
}

function vaciarCarrito() {
  if (!confirm("¿Vaciar todo el carrito?")) return;
  carrito = [];
  guardarCarrito();
  actualizarHeaderCarrito();
  renderCarritoPanel();
}

function renderCarritoPanel() {
  const itemsEl = document.getElementById("carrito-items");
  const ordenarBtn = document.getElementById("carrito-ordenar-btn");
  const totalEl = document.getElementById("carrito-total-panel");
  const vaciarBtn = document.getElementById("carrito-vaciar-btn");
  if (!itemsEl) return;

  const total = calcularTotal();
  if (totalEl) totalEl.textContent = `Q${total.toFixed(2)}`;
  if (ordenarBtn) ordenarBtn.disabled = carrito.length === 0;
  if (vaciarBtn) vaciarBtn.style.display = carrito.length > 0 ? "inline-block" : "none";

  if (carrito.length === 0) {
    itemsEl.innerHTML = `
      <div class="carrito-vacio">
        <p>Tu carrito está vacío 🛒</p>
        <p class="small">Agrega productos desde el menú</p>
      </div>`;
    return;
  }

  itemsEl.innerHTML = carrito
    .map((item) => {
      const subtotal = item.precio * item.cantidad;
      const subcat = item.subcategoria
        ? ` <span class="carrito-item-sub">· ${item.subcategoria}</span>`
        : "";
      const opcionHTML = item.opcion
        ? `<div class="carrito-item-opcion">${item.opcion}</div>`
        : "";
      return `
      <div class="carrito-item">
        <div class="carrito-item-info">
          <div class="carrito-item-nombre">${item.nombre}${subcat}</div>
          ${opcionHTML}
          <div class="carrito-item-precio">Q${item.precio.toFixed(2)} c/u</div>
        </div>
        <div class="carrito-item-controles">
          <button class="btn-cantidad btn-menos" data-key="${item.key}" aria-label="Reducir cantidad">−</button>
          <span class="carrito-cantidad">${item.cantidad}</span>
          <button class="btn-cantidad btn-mas" data-key="${item.key}" aria-label="Aumentar cantidad">+</button>
          <button class="btn-quitar" data-key="${item.key}" aria-label="Quitar ${item.nombre}">🗑</button>
        </div>
        <div class="carrito-item-subtotal">Q${subtotal.toFixed(2)}</div>
      </div>`;
    })
    .join("");
}

function generarMensajeWhatsApp() {
  if (carrito.length === 0) return;
  let msg = "Buen día Vegas Pizza, deseo ordenar:\n\n";
  carrito.forEach((item) => {
    const nombre = item.subcategoria
      ? `${item.nombre} - ${item.subcategoria}`
      : item.nombre;
    const opcionStr = item.opcion ? ` (${item.opcion})` : "";
    const subtotal = item.precio * item.cantidad;
    msg += `• ${item.cantidad}x - *${nombre}${opcionStr}*\n`;
    if (item.cantidad > 1)
      msg += `  Precio unitario: Q${item.precio.toFixed(2)}\n`;
    msg += `  Subtotal: Q${subtotal.toFixed(2)}\n\n`;
  });
  msg += `─────────────────\n*Total: Q${calcularTotal().toFixed(2)}*\n\n¡Gracias! 🍕`;
  window.open(
    `https://wa.me/50255727562?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

let _notifTimer = null;
function mostrarNotificacion(texto) {
  const notif = document.getElementById("carrito-notif");
  if (!notif) return;
  notif.textContent = texto;
  notif.classList.add("visible");
  clearTimeout(_notifTimer);
  _notifTimer = setTimeout(() => notif.classList.remove("visible"), 2000);
}

function abrirCarrito() {
  document.getElementById("carrito-panel")?.classList.add("abierto");
  document.getElementById("carrito-overlay")?.classList.add("visible");
  document.body.style.overflow = "hidden";
  renderCarritoPanel();
}

function cerrarCarrito() {
  document.getElementById("carrito-panel")?.classList.remove("abierto");
  document.getElementById("carrito-overlay")?.classList.remove("visible");
  document.body.style.overflow = "";
}

// ─── Catálogo ────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  const catalogo = document.getElementById("catalogo");
  const filtros = document.getElementById("filtros-categorias");
  const scrollInit = document.getElementById("scrollInit");

  catalogo.innerHTML =
    '<p class="text-center text-light py-5">Cargando menú...</p>';

  let rawData;
  try {
    const response = await fetch("productos.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    rawData = await response.json();
  } catch {
    catalogo.innerHTML =
      '<p class="text-center text-danger py-5">Error al cargar el menú. Por favor recarga la página.</p>';
    return;
  }

  const data = [];
  rawData.forEach((producto) => {
    if (producto.mostrarProducto?.toLowerCase() !== "si") return;

    let categoria = data.find((c) => c.nombre === producto.categoria);
    if (!categoria) {
      categoria = { nombre: producto.categoria, productos: [] };
      data.push(categoria);
    }

    categoria.productos.push({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      subcategoria: producto.subcategoria?.trim() || "",
      precio: parseFloat(producto.precio),
      precio_descuento: producto.precio_descuento
        ? parseFloat(producto.precio_descuento)
        : null,
      promocion: producto.promocion?.toLowerCase() === "si",
      imagen: producto.imagen,
      opciones: producto.opciones || null,
    });
  });

  // Inicializar display del carrito en el header
  actualizarHeaderCarrito();

  // Event listeners del carrito
  document
    .getElementById("carrito-header-btn")
    ?.addEventListener("click", abrirCarrito);
  document
    .getElementById("carrito-cerrar")
    ?.addEventListener("click", cerrarCarrito);
  document
    .getElementById("carrito-overlay")
    ?.addEventListener("click", cerrarCarrito);
  document
    .getElementById("carrito-ordenar-btn")
    ?.addEventListener("click", generarMensajeWhatsApp);
  document
    .getElementById("carrito-barra")
    ?.addEventListener("click", abrirCarrito);
  document
    .getElementById("carrito-vaciar-btn")
    ?.addEventListener("click", vaciarCarrito);

  document.getElementById("carrito-items")?.addEventListener("click", (e) => {
    const key = e.target.dataset.key;
    if (!key) return;
    if (e.target.classList.contains("btn-menos")) cambiarCantidad(key, -1);
    else if (e.target.classList.contains("btn-mas")) cambiarCantidad(key, 1);
    else if (e.target.classList.contains("btn-quitar")) quitarDelCarrito(key);
  });

  // Delegación de eventos para botones "Agregar" en las tarjetas
  catalogo.addEventListener("click", (e) => {
    if (!e.target.matches(".btn-agregar-carrito")) return;
    const id = parseInt(e.target.dataset.id);
    let found = null;
    for (const cat of data) {
      found = cat.productos.find((p) => p.id === id);
      if (found) break;
    }
    if (!found) return;
    if (found.opciones?.length) {
      mostrarModalOpciones(found);
    } else {
      agregarAlCarrito(found);
      mostrarNotificacion("Producto agregado 🛒");
    }
  });

  let categoriaSeleccionada = "Todas";

  const categorias = ["Todas", ...data.map((c) => c.nombre)];
  const iconosCategoria = {
    Todas: "📋",
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
    <div class="categoria-item" data-cat="${cat}" role="tab" tabindex="0" aria-selected="false" aria-label="Filtrar por ${cat}">
      <button class="btn categoria-icono" tabindex="-1" aria-hidden="true">
        ${icono}
      </button>
      <div class="fw-light mt-1 text-white small">${cat}</div>
    </div>
  `;
    })
    .join("");

  function setActiveCategoria(el) {
    document.querySelectorAll(".categoria-item").forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    el.classList.add("active");
    el.setAttribute("aria-selected", "true");
  }

  filtros.addEventListener("click", (e) => {
    const target = e.target.closest(".categoria-item");
    if (target?.dataset.cat) {
      categoriaSeleccionada = target.dataset.cat;
      setActiveCategoria(target);
      renderCatalogo();
      scrollInit.scrollIntoView({ behavior: "smooth" });
    }
  });

  filtros.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const target = e.target.closest(".categoria-item");
      if (target?.dataset.cat) {
        e.preventDefault();
        target.click();
      }
    }
  });

  // Marcar "Todas" como activa al cargar
  const todasEl = filtros.querySelector('[data-cat="Todas"]');
  if (todasEl) {
    todasEl.classList.add("active");
    todasEl.setAttribute("aria-selected", "true");
  }

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
          ? `<h4 class="subtitulos">${subcat}</h4>`
          : "";

        const fila = document.createElement("div");
        fila.className = "row gy-4";
        fila.innerHTML = productos
          .map((p) => {
            const tieneDescuento =
              p.precio_descuento && p.precio_descuento < p.precio;

            const precioHTML = tieneDescuento
              ? `<span class="precio-original">Q${p.precio.toFixed(2)}</span>
               <span class="precio-descuento">Q${p.precio_descuento.toFixed(2)}</span>`
              : `<strong>Q${p.precio.toFixed(2)}</strong>`;

            return `
              <div class="col-md-4">
                <div class="producto-card p-3 h-100 d-flex flex-column position-relative">
                  ${p.promocion ? '<span class="promo-badge">¡OFERTA!</span>' : ""}
                  <picture class="mb-3">
                    <source srcset="img/${p.imagen.replace(/\.(jpg|jpeg|png)$/i, ".webp")}" type="image/webp">
                    <img src="img/${p.imagen}" class="producto-img" alt="${p.nombre}" loading="lazy" width="280" height="180" />
                  </picture>
                  <h4>${p.nombre}</h4>
                  <p>${p.descripcion}</p>
                  <div class="mt-2 precio-container">${precioHTML}</div>
                  <button class="btn-agregar-carrito mt-3" data-id="${p.id}">+ Agregar al carrito</button>
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

  function crearModalOpciones() {
    const overlay = document.createElement("div");
    overlay.id = "opciones-overlay";
    overlay.className = "opciones-overlay";
    overlay.innerHTML = `
      <div class="opciones-modal">
        <h3 id="opciones-titulo" class="opciones-titulo"></h3>
        <p class="opciones-subtitulo">Elige una opción</p>
        <div id="opciones-lista" class="opciones-lista"></div>
        <button id="opciones-cancelar" class="opciones-cancelar">Cancelar</button>
      </div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("visible");
    });
    document.getElementById("opciones-cancelar").addEventListener("click", () => {
      overlay.classList.remove("visible");
    });
  }

  function mostrarModalOpciones(producto) {
    const overlay = document.getElementById("opciones-overlay");
    document.getElementById("opciones-titulo").textContent = producto.nombre;
    const lista = document.getElementById("opciones-lista");
    lista.innerHTML = producto.opciones
      .map((op) => `<button class="opcion-btn" data-opcion="${op}">${op}</button>`)
      .join("");

    lista.querySelectorAll(".opcion-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        agregarAlCarrito(producto, btn.dataset.opcion);
        overlay.classList.remove("visible");
        mostrarNotificacion("Producto agregado 🛒");
      });
    });

    overlay.classList.add("visible");
  }

  crearModalOpciones();
  renderCatalogo();

});
