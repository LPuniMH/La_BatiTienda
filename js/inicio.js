import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

const contenedorInicio = document.getElementById("contenedorInicio");
const toastNotificacion = document.getElementById("toastNotificacion");
const toastMensaje = document.getElementById("toastMensaje");

let usuarioActual = null;
let toastTimeout;
let carritoUsuario = [];
let wishlistUsuario = [];
let tiempoUltimoCarrito = 0;
let tiempoUltimaWishlist = 0;
let modalProductoInstancia = null;

onAuthStateChanged(auth, async (user) => {
    if ((user && user.emailVerified) || (user && user.providerData.some(p => p.providerId === 'google.com'))) {
        usuarioActual = user;
        try {
            const docRef = doc(db, "usuarios", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                carritoUsuario = data.carrito || [];
                wishlistUsuario = data.wishlist || [];
            }
        } catch (error) {
            console.error(error);
        }
        generarFilasInicio();
    } else {
        usuarioActual = null;
        carritoUsuario = [];
        wishlistUsuario = [];
        generarFilasInicio();
    }
});

function mostrarToast(mensaje) {
    if (!toastNotificacion) return;
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

function mezclarArray(array) {
    let indiceActual = array.length, indiceAleatorio;
    while (indiceActual !== 0) {
        indiceAleatorio = Math.floor(Math.random() * indiceActual);
        indiceActual--;
        [array[indiceActual], array[indiceAleatorio]] = [array[indiceAleatorio], array[indiceActual]];
    }
    return array;
}

function crearFila(tituloTexto, listaProductos, enlaceVerMas) {
    const fila = document.createElement("div");
    fila.className = "fila-categoria";

    const titulo = document.createElement("h2");
    titulo.className = "fila-titulo text-amarillo fw-bold";
    titulo.textContent = tituloTexto;
    fila.appendChild(titulo);

    const scrollContainer = document.createElement("div");
    scrollContainer.className = "scroll-horizontal";

    listaProductos.forEach(producto => {
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
        scrollContainer.appendChild(caja);
    });

    const tarjetaVerMas = document.createElement("a");
    tarjetaVerMas.href = enlaceVerMas;
    tarjetaVerMas.className = "tarjeta-ver-mas";
    tarjetaVerMas.innerHTML = `<span>Ver más &#10140;</span>`;
    
    scrollContainer.appendChild(tarjetaVerMas);
    fila.appendChild(scrollContainer);
    contenedorInicio.appendChild(fila);
}

function generarFilasInicio() {
    contenedorInicio.innerHTML = "";

    // 1. Fila de Novedades (Últimos 5 productos agregados al archivo)
    const ultimosProductos = productos.slice(-5).reverse();
    if (ultimosProductos.length > 0) {
        crearFila("Novedades", ultimosProductos, "catalogo.html");
    }

    // 2. Filas de Categorías Aleatorias
    for (const [nombreCategoria, datosCategoria] of Object.entries(mapaCategorias)) {
        const productosDeCategoria = productos.filter(producto => datosCategoria.codigos.includes(producto.codigo));
        if (productosDeCategoria.length === 0) continue;

        const productosMezclados = mezclarArray([...productosDeCategoria]);
        const productosMostrar = productosMezclados.slice(0, 5);

        crearFila(datosCategoria.titulo, productosMostrar, `catalogo.html?cat=${nombreCategoria}`);
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