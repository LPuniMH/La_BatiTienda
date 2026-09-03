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
    setDoc 
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
const btnMenuCuenta = document.getElementById("btnMenuCuenta");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const seccionCarrito = document.getElementById("seccionCarrito");
const seccionCuenta = document.getElementById("seccionCuenta");
const btnMostrarCorreo = document.getElementById("btnMostrarCorreo");
const iconoCorreo = document.getElementById("iconoCorreo");
const btnGuardarNombre = document.getElementById("btnGuardarNombre");
const mensajeNombre = document.getElementById("mensajeNombre");
const btnCambiarPassword = document.getElementById("btnCambiarPassword");
const mensajePassword = document.getElementById("mensajePassword");
const btnBorrarDefinitivo = document.getElementById("btnBorrarDefinitivo");
const errorBorrado = document.getElementById("errorBorrado");

let usuarioActual = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
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
            
            if (docSnap.exists() && docSnap.data().nombre) {
                nombreMostrar = docSnap.data().nombre;
            }
            inputNombre.value = nombreMostrar;
        } catch (error) {
            console.error("Error leyendo Firestore:", error);
            inputNombre.value = nombreMostrar;
        }

        tituloBienvenida.textContent = `Bienvenido ${nombreMostrar}`;
    } else {
        window.location.href = "login.html";
    }
});

btnMenuCarrito.addEventListener("click", () => {
    btnMenuCarrito.classList.add("active");
    btnMenuCuenta.classList.remove("active");
    seccionCarrito.classList.remove("d-none");
    seccionCuenta.classList.add("d-none");
});

btnMenuCuenta.addEventListener("click", () => {
    btnMenuCuenta.classList.add("active");
    btnMenuCarrito.classList.remove("active");
    seccionCuenta.classList.remove("d-none");
    seccionCarrito.classList.add("d-none");
});

btnCerrarSesion.addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
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