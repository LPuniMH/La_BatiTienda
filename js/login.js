import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
        window.location.href = "cart.html";
    }
});

const formularioLogin = document.getElementById("loginForm");
const inputUsuario = document.getElementById("usuario");
const inputPassword = document.getElementById("password");
const botonTogglePassword = document.getElementById("togglePassword");
const iconoTogglePassword = document.getElementById("iconoTogglePassword");
const botonIngresar = document.getElementById("botonIngresar");
const botonGoogle = document.getElementById("botonGoogle");
const feedbackLogin = document.getElementById("loginFeedback");
const errorUsuario = document.getElementById("errorUsuario");
const errorPassword = document.getElementById("errorPassword");
const linkModo = document.getElementById("linkModo");
const textoModo = document.getElementById("textoModo");
const opcionesLogin = document.getElementById("opcionesLogin");
const contenedorPassword = document.getElementById("contenedorPassword");
const linkRecuperar = document.getElementById("linkRecuperar");

let modoRegistro = false;
let modoRecuperar = false;

function esCorreoValido(texto) {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(texto);
}

function esPasswordValida(texto) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(texto);
}

function mostrarError(input, elementoError, mensaje) {
    if(input) input.classList.toggle("login-input-invalido", Boolean(mensaje));
    if(elementoError) elementoError.textContent = mensaje || "";
}

function mostrarFeedback(mensaje, tipo) {
    feedbackLogin.textContent = mensaje;
    feedbackLogin.classList.remove("login-feedback-exito", "login-feedback-error");
    if (tipo) {
        feedbackLogin.classList.add(tipo === "exito" ? "login-feedback-exito" : "login-feedback-error");
    }
}

function actualizarInterfaz() {
    mostrarFeedback("", "");
    mostrarError(inputUsuario, errorUsuario, "");
    mostrarError(inputPassword, errorPassword, "");

    if (modoRecuperar) {
        document.querySelector(".login-title").textContent = "Recuperar contraseña";
        document.querySelector(".login-subtitle").textContent = "Te enviaremos un enlace seguro";
        botonIngresar.textContent = "Enviar correo";
        contenedorPassword.classList.add("d-none");
        opcionesLogin.classList.add("d-none");
        botonGoogle.classList.add("d-none");
        textoModo.textContent = "¿Recordaste tu contraseña?";
        linkModo.textContent = "Inicia sesión";
    } else if (modoRegistro) {
        document.querySelector(".login-title").textContent = "Crear cuenta";
        document.querySelector(".login-subtitle").textContent = "Únete a la Baticueva";
        botonIngresar.textContent = "Registrarse";
        contenedorPassword.classList.remove("d-none");
        opcionesLogin.classList.add("d-none");
        botonGoogle.classList.remove("d-none");
        textoModo.textContent = "¿Ya tienes cuenta?";
        linkModo.textContent = "Inicia sesión";
    } else {
        document.querySelector(".login-title").textContent = "Iniciar sesión";
        document.querySelector(".login-subtitle").textContent = "Entra a tu cuenta para seguir comprando";
        botonIngresar.textContent = "Ingresar";
        contenedorPassword.classList.remove("d-none");
        opcionesLogin.classList.remove("d-none");
        botonGoogle.classList.remove("d-none");
        textoModo.textContent = "¿No tienes cuenta?";
        linkModo.textContent = "Regístrate";
    }
}

function alternarModoGlobal(e) {
    e.preventDefault();
    if (modoRecuperar) {
        modoRecuperar = false;
        modoRegistro = false;
    } else {
        modoRegistro = !modoRegistro;
    }
    actualizarInterfaz();
}

function activarRecuperacion(e) {
    e.preventDefault();
    modoRecuperar = true;
    modoRegistro = false;
    actualizarInterfaz();
}

async function manejarEnvioLogin(evento) {
    evento.preventDefault();
    let esValido = true;
    const email = inputUsuario.value.trim();
    const password = inputPassword.value;

    if (email === "" || !esCorreoValido(email)) {
        mostrarError(inputUsuario, errorUsuario, "Ingresa un correo válido");
        esValido = false;
    } else {
        mostrarError(inputUsuario, errorUsuario, "");
    }

    if (!modoRecuperar) {
        if (!esPasswordValida(password)) {
            mostrarError(inputPassword, errorPassword, "Mínimo 6 caracteres, 1 mayúscula, 1 minúscula y 1 número");
            esValido = false;
        } else {
            mostrarError(inputPassword, errorPassword, "");
        }
    }

    if (!esValido) return;

    botonIngresar.disabled = true;
    botonIngresar.textContent = "Procesando...";
    mostrarFeedback("", "");

    try {
        if (modoRecuperar) {
            await sendPasswordResetEmail(auth, email);
            mostrarFeedback("Correo de recuperación enviado. Revisa tu bandeja.", "exito");
            setTimeout(() => {
                modoRecuperar = false;
                actualizarInterfaz();
            }, 3000);
        } else if (modoRegistro) {
            const credencial = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(credencial.user);
            await signOut(auth);
            mostrarFeedback("¡Cuenta creada! Revisa tu correo para verificarla antes de ingresar.", "exito");
            setTimeout(() => {
                modoRegistro = false;
                actualizarInterfaz();
            }, 3000);
        } else {
            const credencial = await signInWithEmailAndPassword(auth, email, password);
            if (!credencial.user.emailVerified) {
                await signOut(auth);
                mostrarFeedback("Debes verificar tu correo antes de ingresar.", "error");
            } else {
                mostrarFeedback("¡Ingreso exitoso!", "exito");
            }
        }
    } catch (error) {
        let mensajeError = "Ocurrió un error. Intenta nuevamente.";
        if (error.code === 'auth/email-already-in-use') mensajeError = "Este correo ya está registrado.";
        if (error.code === 'auth/invalid-credential') mensajeError = "Correo o contraseña incorrectos.";
        mostrarFeedback(mensajeError, "error");
    }
    
    botonIngresar.disabled = false;
    if (modoRecuperar) botonIngresar.textContent = "Enviar correo";
    else if (modoRegistro) botonIngresar.textContent = "Registrarse";
    else botonIngresar.textContent = "Ingresar";
}

async function manejarIngresoGoogle() {
    const provider = new GoogleAuthProvider();
    botonGoogle.disabled = true;
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        mostrarFeedback("El inicio de sesión con Google fue cancelado o falló.", "error");
        botonGoogle.disabled = false;
    }
}

botonTogglePassword.addEventListener("click", () => {
    const esTexto = inputPassword.type === "text";
    inputPassword.type = esTexto ? "password" : "text";
    iconoTogglePassword.textContent = esTexto ? "visibility" : "visibility_off";
});

formularioLogin.addEventListener("submit", manejarEnvioLogin);
botonGoogle.addEventListener("click", manejarIngresoGoogle);
linkModo.addEventListener("click", alternarModoGlobal);
linkRecuperar.addEventListener("click", activarRecuperacion);

inputUsuario.addEventListener("input", () => mostrarError(inputUsuario, errorUsuario, ""));
inputPassword.addEventListener("input", () => mostrarError(inputPassword, errorPassword, ""));