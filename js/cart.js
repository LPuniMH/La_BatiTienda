import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    sendPasswordResetEmail, 
    deleteUser,
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc,
    arrayRemove,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

const tituloBienvenida = document.getElementById("tituloBienvenida");
const fotoPerfil = document.getElementById("fotoPerfil");
const inputNombre = document.getElementById("inputNombre");
const inputCorreo = document.getElementById("inputCorreo");

const btnMenuCarrito = document.getElementById("btnMenuCarrito");
const btnMenuWishlist = document.getElementById("btnMenuWishlist");
const btnMenuCuenta = document.getElementById("btnMenuCuenta");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

const seccionCarrito = document.getElementById("seccionCarrito");
const seccionWishlist = document.getElementById("seccionWishlist");
const seccionCuenta = document.getElementById("seccionCuenta");

const btnMostrarCorreo = document.getElementById("btnMostrarCorreo");
const iconoCorreo = document.getElementById("iconoCorreo");
const btnGuardarNombre = document.getElementById("btnGuardarNombre");
const mensajeNombre = document.getElementById("mensajeNombre");
const btnCambiarPassword = document.getElementById("btnCambiarPassword");
const mensajePassword = document.getElementById("mensajePassword");
const btnBorrarDefinitivo = document.getElementById("btnBorrarDefinitivo");
const errorBorrado = document.getElementById("errorBorrado");
const toastNotificacion = document.getElementById("toastNotificacion");
const toastMensaje = document.getElementById("toastMensaje");

const listaCarrito = document.getElementById("listaCarrito");
const carritoVacio = document.getElementById("carritoVacio");
const checkoutCarrito = document.getElementById("checkoutCarrito");
const precioTotal = document.getElementById("precioTotal");
const inputCupon = document.getElementById("inputCupon");
const btnAplicarCupon = document.getElementById("btnAplicarCupon");
const mensajeCupon = document.getElementById("mensajeCupon");
const btnHacerPedido = document.getElementById("btnHacerPedido");

const listaWishlist = document.getElementById("listaWishlist");
const wishlistVacia = document.getElementById("wishlistVacia");

let usuarioActual = null;
let toastTimeout;
let carritoCodigos = [];
let wishlistCodigos = [];
let porcentajeDescuento = 0;
let subtotalSinDescuento = 0;

let tiempoUltimoCarrito = 0;
let tiempoUltimaWishlist = 0;

const cuponesDisponibles = {
    "BATI67": 67,
    "HEROE20": 20,
    "VILLANO50": 50
};

function mostrarToast(mensaje) {
    toastMensaje.textContent = mensaje;
    toastNotificacion.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastNotificacion.classList.remove("show");
    }, 3000);
}

function calcularTotal() {
    let totalConDescuento = subtotalSinDescuento;
    if (porcentajeDescuento > 0) {
        const montoDescontar = (subtotalSinDescuento * porcentajeDescuento) / 100;
        totalConDescuento = Math.trunc(subtotalSinDescuento - montoDescontar);
    }
    precioTotal.textContent = totalConDescuento;
}

function renderizarCarrito() {
    listaCarrito.innerHTML = "";
    subtotalSinDescuento = 0;

    if (carritoCodigos.length === 0) {
        listaCarrito.appendChild(carritoVacio);
        carritoVacio.classList.remove("d-none");
        checkoutCarrito.classList.add("d-none");
        return;
    }

    carritoVacio.classList.add("d-none");
    checkoutCarrito.classList.remove("d-none");

    carritoCodigos.forEach(codigo => {
        const productoInfo = productos.find(p => p.codigo === codigo);
        if (!productoInfo) return;

        subtotalSinDescuento += productoInfo.precio;

        const itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";
        
        const visual = productoInfo.imagen 
            ? `<img src="${productoInfo.imagen}" alt="${productoInfo.nombre}" class="cart-item-img">`
            : `<div class="cart-item-icono">${productoInfo.nombre.charAt(0).toUpperCase()}</div>`;

        itemDiv.innerHTML = `
            ${visual}
            <div class="cart-item-info">
                <h4 class="h6 mb-1 text-white fw-bold">${productoInfo.nombre}</h4>
                <p class="mb-0 text-amarillo fw-bold">$${productoInfo.precio}</p>
            </div>
            <button class="btn-eliminar-item" data-codigo="${codigo}" aria-label="Eliminar del carrito">
                <span class="material-symbols-outlined">delete</span>
            </button>
        `;
        listaCarrito.appendChild(itemDiv);
    });

    calcularTotal();
}

function renderizarWishlist() {
    listaWishlist.innerHTML = "";

    if (wishlistCodigos.length === 0) {
        listaWishlist.appendChild(wishlistVacia);
        wishlistVacia.classList.remove("d-none");
        return;
    }

    wishlistVacia.classList.add("d-none");

    wishlistCodigos.forEach(codigo => {
        const productoInfo = productos.find(p => p.codigo === codigo);
        if (!productoInfo) return;

        const estaEnCarrito = carritoCodigos.includes(codigo);

        const itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";
        
        const visual = productoInfo.imagen 
            ? `<img src="${productoInfo.imagen}" alt="${productoInfo.nombre}" class="cart-item-img">`
            : `<div class="cart-item-icono">${productoInfo.nombre.charAt(0).toUpperCase()}</div>`;

        itemDiv.innerHTML = `
            ${visual}
            <div class="cart-item-info">
                <h4 class="h6 mb-1 text-white fw-bold">${productoInfo.nombre}</h4>
                <p class="mb-0 text-amarillo fw-bold">$${productoInfo.precio}</p>
            </div>
            <button class="btn-toggle-cart ${estaEnCarrito ? 'agregado' : ''}" data-codigo="${codigo}" aria-label="Alternar en carrito">
                <span class="material-symbols-outlined">shopping_cart</span>
            </button>
            <button class="btn-eliminar-item ms-2" data-codigo="${codigo}" aria-label="Eliminar de lista de deseos">
                <span class="material-symbols-outlined">delete</span>
            </button>
        `;
        listaWishlist.appendChild(itemDiv);
    });
}

onAuthStateChanged(auth, async (user) => {
    if ((user && user.emailVerified) || (user && user.providerData.some(p => p.providerId === 'google.com'))) {
        usuarioActual = user;
        inputCorreo.value = user.email;
        
        if (user.photoURL) {
            fotoPerfil.src = user.photoURL;
            fotoPerfil.classList.remove("d-none");
        }

        let nombreMostrar = user.displayName || "Usuario";

        try {
            const docRef = doc(db, "usuarios", user.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.nombre) nombreMostrar = data.nombre;
                carritoCodigos = data.carrito || [];
                wishlistCodigos = data.wishlist || [];
            }
            inputNombre.value = nombreMostrar;
        } catch (error) {
            console.error(error);
            inputNombre.value = nombreMostrar;
        }

        tituloBienvenida.textContent = `Bienvenido ${nombreMostrar}`;
        renderizarCarrito();
        renderizarWishlist();
    } else {
        window.location.href = "login.html";
    }
});

btnAplicarCupon.addEventListener("click", () => {
    const codigoIngresado = inputCupon.value.trim().toUpperCase();
    if (codigoIngresado === "") {
        porcentajeDescuento = 0;
        mensajeCupon.textContent = "";
        calcularTotal();
        return;
    }

    if (cuponesDisponibles[codigoIngresado]) {
        porcentajeDescuento = cuponesDisponibles[codigoIngresado];
        mensajeCupon.textContent = `¡Cupón del ${porcentajeDescuento}% aplicado!`;
        mensajeCupon.className = "small mt-1 mb-0 text-success fw-bold";
    } else {
        porcentajeDescuento = 0;
        mensajeCupon.textContent = "Cupón inválido.";
        mensajeCupon.className = "small mt-1 mb-0 text-danger fw-bold";
    }
    calcularTotal();
});

listaCarrito.addEventListener("click", async (e) => {
    const btnEliminar = e.target.closest(".btn-eliminar-item");
    if (!btnEliminar || !usuarioActual) return;

    const ahora = Date.now();
    if (ahora - tiempoUltimoCarrito < 2000) {
        mostrarToast("Por favor, espera 2 segundos antes de volver a modificar tu carrito.");
        return;
    }
    tiempoUltimoCarrito = ahora;

    const codigoEliminar = btnEliminar.dataset.codigo;
    try {
        const docRef = doc(db, "usuarios", usuarioActual.uid);
        await setDoc(docRef, { carrito: arrayRemove(codigoEliminar) }, { merge: true });
        
        const indice = carritoCodigos.indexOf(codigoEliminar);
        if (indice > -1) carritoCodigos.splice(indice, 1);
        
        renderizarCarrito();
        renderizarWishlist(); 
        mostrarToast("Producto eliminado del carrito.");
    } catch (error) {
        mostrarToast("Error al eliminar el producto.");
    }
});

listaWishlist.addEventListener("click", async (e) => {
    const btnEliminar = e.target.closest(".btn-eliminar-item");
    const btnCart = e.target.closest(".btn-toggle-cart");
    if (!usuarioActual) return;

    const ahora = Date.now();
    const docRef = doc(db, "usuarios", usuarioActual.uid);

    if (btnEliminar) {
        if (ahora - tiempoUltimaWishlist < 1000) {
            mostrarToast("Por favor, espera 1 segundo antes de modificar tu lista.");
            return;
        }
        tiempoUltimaWishlist = ahora;

        const codigo = btnEliminar.dataset.codigo;
        try {
            await setDoc(docRef, { wishlist: arrayRemove(codigo) }, { merge: true });
            const indice = wishlistCodigos.indexOf(codigo);
            if (indice > -1) wishlistCodigos.splice(indice, 1);
            
            renderizarWishlist();
            mostrarToast("Producto eliminado de tu lista de deseos.");
        } catch (error) {
            mostrarToast("Error al eliminar el producto.");
        }
    } else if (btnCart) {
        if (ahora - tiempoUltimoCarrito < 2000) {
            mostrarToast("Por favor, espera 2 segundos antes de modificar tu carrito.");
            return;
        }
        tiempoUltimoCarrito = ahora;

        const codigo = btnCart.dataset.codigo;
        const yaEstaAgregado = carritoCodigos.includes(codigo);

        try {
            if (yaEstaAgregado) {
                await setDoc(docRef, { carrito: arrayRemove(codigo) }, { merge: true });
                const indice = carritoCodigos.indexOf(codigo);
                if (indice > -1) carritoCodigos.splice(indice, 1);
                mostrarToast("Producto eliminado del carrito.");
            } else {
                await setDoc(docRef, { carrito: arrayUnion(codigo) }, { merge: true });
                carritoCodigos.push(codigo);
                mostrarToast("¡Producto añadido al carrito!");
            }
            renderizarCarrito();
            renderizarWishlist();
        } catch (error) {
            mostrarToast("Error al modificar el carrito.");
        }
    }
});

btnHacerPedido.addEventListener("click", async () => {
    if (!usuarioActual || carritoCodigos.length === 0) return;
    
    btnHacerPedido.disabled = true;
    btnHacerPedido.textContent = "Procesando...";

    try {
        const docRef = doc(db, "usuarios", usuarioActual.uid);
        await setDoc(docRef, { carrito: [] }, { merge: true });
        
        carritoCodigos = [];
        porcentajeDescuento = 0;
        inputCupon.value = "";
        mensajeCupon.textContent = "";
        
        renderizarCarrito();
        renderizarWishlist(); 
        mostrarToast("¡Compra realizada con éxito! Revisa tu correo.");
    } catch (error) {
        mostrarToast("Error al procesar la compra. Intenta de nuevo.");
    }

    btnHacerPedido.disabled = false;
    btnHacerPedido.textContent = "Hacer el pedido";
});

function cambiarSeccion(seccionActiva) {
    btnMenuCarrito.classList.remove("active");
    btnMenuWishlist.classList.remove("active");
    btnMenuCuenta.classList.remove("active");
    
    seccionCarrito.classList.add("d-none");
    seccionWishlist.classList.add("d-none");
    seccionCuenta.classList.add("d-none");

    if (seccionActiva === 'carrito') {
        btnMenuCarrito.classList.add("active");
        seccionCarrito.classList.remove("d-none");
    } else if (seccionActiva === 'wishlist') {
        btnMenuWishlist.classList.add("active");
        seccionWishlist.classList.remove("d-none");
    } else if (seccionActiva === 'cuenta') {
        btnMenuCuenta.classList.add("active");
        seccionCuenta.classList.remove("d-none");
    }
}

btnMenuCarrito.addEventListener("click", () => cambiarSeccion('carrito'));
btnMenuWishlist.addEventListener("click", () => cambiarSeccion('wishlist'));
btnMenuCuenta.addEventListener("click", () => cambiarSeccion('cuenta'));

btnCerrarSesion.addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "index.html";
    } catch (error) {
        console.error(error);
    }
});

btnMostrarCorreo.addEventListener("click", () => {
    if (inputCorreo.type === "password") {
        inputCorreo.type = "text";
        iconoCorreo.textContent = "visibility_off";
    } else {
        inputCorreo.type = "password";
        iconoCorreo.textContent = "visibility";
    }
});

btnGuardarNombre.addEventListener("click", async () => {
    const nuevoNombre = inputNombre.value.trim();
    if (!nuevoNombre || !usuarioActual) return;

    const tiempoActual = Date.now();
    const ultimoCambio = localStorage.getItem("ultimoCambioNombre");
    const cooldownMs = 5 * 60 * 1000; 

    if (ultimoCambio && tiempoActual - parseInt(ultimoCambio) < cooldownMs) {
        const faltanMinutos = Math.ceil((cooldownMs - (tiempoActual - parseInt(ultimoCambio))) / 60000);
        mensajeNombre.textContent = `Debes esperar ${faltanMinutos} minuto(s) para cambiar tu nombre nuevamente.`;
        mensajeNombre.className = "small text-danger mt-1 fw-bold";
        return;
    }

    btnGuardarNombre.disabled = true;
    try {
        await setDoc(doc(db, "usuarios", usuarioActual.uid), { nombre: nuevoNombre }, { merge: true });
        tituloBienvenida.textContent = `Bienvenido ${nuevoNombre}`;
        localStorage.setItem("ultimoCambioNombre", tiempoActual.toString());
        mensajeNombre.textContent = "Nombre guardado con éxito.";
        mensajeNombre.className = "small text-success mt-1 fw-bold";
    } catch (error) {
        mensajeNombre.textContent = "Error al guardar el nombre.";
        mensajeNombre.className = "small text-danger mt-1 fw-bold";
    }
    btnGuardarNombre.disabled = false;
});

btnCambiarPassword.addEventListener("click", async () => {
    if (!usuarioActual) return;
    btnCambiarPassword.disabled = true;
    try {
        await sendPasswordResetEmail(auth, usuarioActual.email);
        mensajePassword.textContent = "Correo de restablecimiento enviado. Revisa tu bandeja.";
        mensajePassword.className = "small text-success mt-1 fw-bold";
    } catch (error) {
        mensajePassword.textContent = "Ocurrió un error al enviar el correo.";
        mensajePassword.className = "small text-danger mt-1 fw-bold";
    }
    setTimeout(() => { btnCambiarPassword.disabled = false; }, 5000);
});

btnBorrarDefinitivo.addEventListener("click", async () => {
    if (!usuarioActual) return;
    btnBorrarDefinitivo.disabled = true;
    btnBorrarDefinitivo.textContent = "Borrando...";
    errorBorrado.textContent = "";

    try {
        await deleteUser(usuarioActual);
        window.location.href = "index.html";
    } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
            errorBorrado.textContent = "Por seguridad, debes cerrar sesión y volver a ingresar para eliminar tu cuenta.";
        } else {
            errorBorrado.textContent = "Ocurrió un error al intentar eliminar la cuenta.";
        }
        btnBorrarDefinitivo.disabled = false;
        btnBorrarDefinitivo.textContent = "Borrar definitivamente";
    }
});