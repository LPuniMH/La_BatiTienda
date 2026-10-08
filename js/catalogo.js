import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, arrayUnion, arrayRemove, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCgumyzzsQy77pJ270BjyO5-aJQJI3ZO4o",
    authDomain: "la-batitienda.firebaseapp.com",
    projectId: "la-batitienda",
    storageBucket: "la-batitienda.firebasestorage.app",
    messagingSenderId: "990894708844",
    appId: "1:990894708844:web:da2a04f4541ab56baa2049"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const contenedorProductos = document.getElementById("contenedorProductos");
const inputBuscar = document.getElementById("buscarProducto");
const selectCategoria = document.getElementById("filtroCategoria");
const parametrosURL = new URLSearchParams(window.location.search);
const categoriaURL = parametrosURL.get('cat');
const toastNotificacion = document.getElementById("toastNotificacion");
const toastMensaje = document.getElementById("toastMensaje");

const inputMinPrecio = document.getElementById("minPrecio");
const inputMaxPrecio = document.getElementById("maxPrecio");
const selectOrdenPrecio = document.getElementById("ordenPrecio");
const btnGuardarFiltros = document.getElementById("btnGuardarFiltros");

let usuarioActual = null;
let toastTimeout;
let carritoUsuario = [];
let wishlistUsuario = [];
let productos = [];
let tiempoUltimoCarrito = 0;
let tiempoUltimaWishlist = 0;
let modalProductoInstancia = null;

let mapaCatNube = {};

onAuthStateChanged(auth, async (user) => {
    if ((user && user.emailVerified) || (user && user.providerData.some(p => p.providerId === 'google.com'))) {
        usuarioActual = user;
        try {
            const docSnap = await getDoc(doc(db, "usuarios", user.uid));
            if (docSnap.exists()) {
                carritoUsuario = docSnap.data().carrito || [];
                wishlistUsuario = docSnap.data().wishlist || [];
            }
        } catch (e) { console.error(e); }
    } else {
        usuarioActual = null;
        carritoUsuario = [];
        wishlistUsuario = [];
    }
    
    try {
        const docCat = await getDoc(doc(db, "configuracion", "categorias"));
        if(docCat.exists()) mapaCatNube = docCat.data();

        const querySnapshot = await getDocs(collection(db, "productos"));
        productos = [];
        querySnapshot.forEach((doc) => productos.push(doc.data()));
        productos.sort((a, b) => a.id - b.id); 
        
        if(document.getElementById("filtroCategoria")){
            selectCategoria.innerHTML = '<option value="todos">Categorías</option>';
            poblarCategorias();
            cargarFiltrosLocales();
            filtrarProductos();
            actualizarTextosCabecera();
        } else if(document.getElementById("contenedorInicio")){
            generarFilasInicio();
        }
    } catch (error) {
        console.error("Error cargando la base de datos:", error);
    }
});

function mostrarToast(mensaje) {
    toastMensaje.textContent = mensaje;
    toastNotificacion.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastNotificacion.classList.remove("show");
    }, 3000);
}

function obtenerInicial(nombre) {
    return nombre.charAt(0).toUpperCase();
}

function cargarFiltrosLocales() {
    inputMinPrecio.value = localStorage.getItem("batitienda_min_precio") || 0;
    inputMaxPrecio.value = localStorage.getItem("batitienda_max_precio") || 5000000;
    selectOrdenPrecio.value = localStorage.getItem("batitienda_orden_precio") || "ninguno";
}

btnGuardarFiltros.addEventListener("click", () => {
    let min = parseInt(inputMinPrecio.value) || 0;
    let max = parseInt(inputMaxPrecio.value) || 5000000;
    
    if (min < 0) min = 0;
    if (max > 5000000) max = 5000000;

    localStorage.setItem("batitienda_min_precio", min);
    localStorage.setItem("batitienda_max_precio", max);
    localStorage.setItem("batitienda_orden_precio", selectOrdenPrecio.value);
    
    const modalEl = document.getElementById('modalFiltrosPrecio');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if(modal) modal.hide();

    filtrarProductos();
});

function renderizarProductos(listaProductos) {
    contenedorProductos.innerHTML = "";

    listaProductos.forEach(function (producto) {
        const caja = document.createElement("div");
        caja.className = "card";
        caja.dataset.codigo = producto.codigo;

        const enWishlist = wishlistUsuario.includes(producto.codigo);
        const enCarrito = carritoUsuario.includes(producto.codigo);

        caja.innerHTML = `
            <div class="card-visual">
              <button class="btn-wishlist ${enWishlist ? 'active' : ''}" data-codigo="${producto.codigo}" aria-label="Añadir a lista de deseos">
                  <span class="material-symbols-outlined">star</span>
              </button>
              ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}" class="card-img">` 
                                : `<span class="card-icono">${obtenerInicial(producto.nombre)}</span>`
                  }
              <span class="card-codigo">${producto.codigo}</span>
            </div>
           
            <span class="card-categoria">${producto.categoria}</span>
            <h3 class="card-titulo">${producto.nombre}</h3>
            <p class="card-descripcion">${producto.descripcion}</p>

            <hr class="card-divisor">

            <div class="card-footer">
                <span class="card-precio">$${producto.precio}</span>
                <span class="card-stock ${producto.stock <= 5 ? "stock-bajo" : ""}">
                    ${producto.stock <= 5 ? "¡Últimas unidades!" : "Stock: " + producto.stock}
                </span>
            </div>

            <button class="btn-agregar ${enCarrito ? 'btn-agregado' : ''}" data-codigo="${producto.codigo}">
                ${enCarrito ? 'Quitar del carrito' : 'Agregar al carrito'}
            </button>
        `;

        contenedorProductos.appendChild(caja);
    });
}

function poblarCategorias() {
    const todasLasCategorias = productos.map(producto => producto.categoria);
    const categoriasUnicas = [...new Set(todasLasCategorias)];
    categoriasUnicas.forEach(categoria => {
        const opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.textContent = categoria;
        selectCategoria.appendChild(opcion);
    });
}

function filtrarProductos() {
    const texto = inputBuscar.value.toLowerCase();
    const filtroElegido = selectCategoria.value;
    
    const minP = parseInt(localStorage.getItem("batitienda_min_precio")) || 0;
    const maxP = parseInt(localStorage.getItem("batitienda_max_precio")) || 5000000;
    const ordenP = localStorage.getItem("batitienda_orden_precio") || "ninguno";

    let productosFiltrados = productos.filter(function (producto) {
        const coincideNombre = producto.nombre.toLowerCase().includes(texto);
        const coincideFiltro = filtroElegido === "todos" || producto.categoria === filtroElegido;
        const coincidePrecio = producto.precio >= minP && producto.precio <= maxP;
        
        let coincideCategoriaPrincipal = true;
        if (categoriaURL && mapaCatNube[categoriaURL]) {
            coincideCategoriaPrincipal = mapaCatNube[categoriaURL].codigos.includes(producto.codigo);
        }

        return coincideNombre && coincideFiltro && coincidePrecio && coincideCategoriaPrincipal;
    });

    if (ordenP === "asc") productosFiltrados.sort((a, b) => a.precio - b.precio);
    if (ordenP === "desc") productosFiltrados.sort((a, b) => b.precio - a.precio);

    renderizarProductos(productosFiltrados);
}

function activarEnlaceNavbar() {
    const intervaloNav = setInterval(() => {
        const enlaces = document.querySelectorAll('.main-navigation .nav-link');
        if (enlaces.length > 0) {
            clearInterval(intervaloNav);
            const rutaActual = window.location.pathname;
            enlaces.forEach(enlace => {
                const href = enlace.getAttribute('href');
                if (categoriaURL && href.includes(`cat=${categoriaURL}`)) {
                    enlace.classList.add('active');
                } else if (!categoriaURL && rutaActual.includes('catalogo.html') && href === 'catalogo.html') {
                    enlace.classList.add('active');
                }
            });
        }
    }, 100);
}

function actualizarTextosCabecera() {
    const tituloElemento = document.getElementById("tituloCatalogo");
    const descElemento = document.getElementById("descCatalogo");
    if (categoriaURL && mapaCatNube[categoriaURL]) {
        tituloElemento.textContent = mapaCatNube[categoriaURL].titulo;
        descElemento.textContent = mapaCatNube[categoriaURL].descripcion;
    } else {
        tituloElemento.textContent = "Nuestro catálogo";
        descElemento.textContent = "Kuromi, anime, figuras, peluches y superhéroes";
    }
}

function abrirModalProducto(codigo) {
    const producto = productos.find(p => p.codigo === codigo);
    if (!producto) return;

    document.getElementById("modalProdTitulo").textContent = producto.nombre;
    document.getElementById("modalProdCodigo").textContent = producto.codigo;
    document.getElementById("modalProdMarca").textContent = producto.marca;
    document.getElementById("modalProdModelo").textContent = producto.modelo;
    document.getElementById("modalProdCategoria").textContent = producto.categoria;
    document.getElementById("modalProdPrecio").textContent = `$${producto.precio}`;
    document.getElementById("modalProdDesc").textContent = producto.descripcion;
    
    const stockEl = document.getElementById("modalProdStock");
    stockEl.textContent = `Stock disponible: ${producto.stock}`;
    if (producto.stock <= 5) {
        stockEl.classList.add("text-danger", "fw-bold");
    } else {
        stockEl.classList.remove("text-danger", "fw-bold");
    }

    const imgContenedor = document.getElementById("modalProdImagenContenedor");
    imgContenedor.innerHTML = producto.imagen 
        ? `<img src="${producto.imagen}" alt="${producto.nombre}">` 
        : `<span class="card-icono text-white">${obtenerInicial(producto.nombre)}</span>`;

    const btnWish = document.getElementById("modalBtnWishlist");
    const btnCarr = document.getElementById("modalBtnCarrito");
    
    btnWish.dataset.codigo = producto.codigo;
    btnCarr.dataset.codigo = producto.codigo;

    if (wishlistUsuario.includes(producto.codigo)) {
        btnWish.classList.add("active");
    } else {
        btnWish.classList.remove("active");
    }

    if (carritoUsuario.includes(producto.codigo)) {
        btnCarr.classList.add("btn-agregado");
        btnCarr.textContent = "Quitar del carrito";
    } else {
        btnCarr.classList.remove("btn-agregado");
        btnCarr.textContent = "Agregar al carrito";
    }

    if (!modalProductoInstancia) {
        modalProductoInstancia = new bootstrap.Modal(document.getElementById('modalProducto'));
    }
    modalProductoInstancia.show();
}

function actualizarBotonesGlobales(codigo, tipoAccion, estaAgregado) {
    if (tipoAccion === "carrito") {
        const botones = document.querySelectorAll(`.btn-agregar[data-codigo="${codigo}"]`);
        botones.forEach(btn => {
            if (estaAgregado) {
                btn.classList.add("btn-agregado");
                btn.textContent = "Quitar del carrito";
            } else {
                btn.classList.remove("btn-agregado");
                btn.textContent = "Agregar al carrito";
            }
        });
    } else {
        const botones = document.querySelectorAll(`.btn-wishlist[data-codigo="${codigo}"]`);
        botones.forEach(btn => {
            if (estaAgregado) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
    }
}

document.body.addEventListener("click", async (e) => {
    const btnCarrito = e.target.closest(".btn-agregar");
    const btnWishlist = e.target.closest(".btn-wishlist");
    const clickEnTarjeta = e.target.closest(".card");

    if (btnCarrito || btnWishlist) {
        if (!usuarioActual) {
            mostrarToast("Debes iniciar sesión para realizar esta acción.");
            return;
        }

        const ahora = Date.now();
        const esCarrito = !!btnCarrito;
        const botonSeleccionado = btnCarrito || btnWishlist;
        const codigoProducto = botonSeleccionado.dataset.codigo;
        
        if (esCarrito) {
            if (ahora - tiempoUltimoCarrito < 2000) {
                mostrarToast("Por favor, espera 2 segundos antes de volver a modificar tu carrito.");
                return;
            }
            tiempoUltimoCarrito = ahora;
        } else {
            if (ahora - tiempoUltimaWishlist < 1000) {
                mostrarToast("Por favor, espera 1 segundo antes de volver a modificar tu lista.");
                return;
            }
            tiempoUltimaWishlist = ahora;
        }

        const campo = esCarrito ? "carrito" : "wishlist";
        const arregloLocal = esCarrito ? carritoUsuario : wishlistUsuario;
        const yaEstaAgregado = arregloLocal.includes(codigoProducto);
        const docRef = doc(db, "usuarios", usuarioActual.uid);

        try {
            if (yaEstaAgregado) {
                await setDoc(docRef, { [campo]: arrayRemove(codigoProducto) }, { merge: true });
                const indice = arregloLocal.indexOf(codigoProducto);
                if (indice > -1) arregloLocal.splice(indice, 1);
                
                actualizarBotonesGlobales(codigoProducto, campo, false);
                mostrarToast(esCarrito ? "Producto eliminado del carrito." : "Producto eliminado de tu lista de deseos.");
            } else {
                await setDoc(docRef, { [campo]: arrayUnion(codigoProducto) }, { merge: true });
                arregloLocal.push(codigoProducto);
                
                actualizarBotonesGlobales(codigoProducto, campo, true);
                mostrarToast(esCarrito ? "¡Producto añadido al carrito!" : "¡Producto añadido a tu lista de deseos!");
            }
        } catch (error) {
            mostrarToast("Ocurrió un error de conexión. Intenta nuevamente.");
        }
    } else if (clickEnTarjeta) {
        abrirModalProducto(clickEnTarjeta.dataset.codigo);
    }
});

inputBuscar.addEventListener("input", filtrarProductos);
selectCategoria.addEventListener("change", filtrarProductos);

activarEnlaceNavbar();