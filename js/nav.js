import { getApps, getApp, initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCgumyzzsQy77pJ270BjyO5-aJQJI3ZO4o",
    authDomain: "la-batitienda.firebaseapp.com",
    projectId: "la-batitienda",
    storageBucket: "la-batitienda.firebasestorage.app",
    messagingSenderId: "990894708844",
    appId: "1:990894708844:web:da2a04f4541ab56baa2049"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

let usuarioLogeado = false;

const navInterval = setInterval(() => {
    const navBtnCarrito = document.getElementById("navBtnCarrito");
    const navMontoCarrito = document.getElementById("navMontoCarrito");
    const navCantidadCarrito = document.getElementById("navCantidadCarrito");

    if (navBtnCarrito) {
        clearInterval(navInterval);

        navBtnCarrito.addEventListener("click", (e) => {
            e.preventDefault();
            if (usuarioLogeado) {
                window.location.href = "cart.html";
            } else {
                window.location.href = "login.html";
            }
        });

        onAuthStateChanged(auth, (user) => {
            if ((user && user.emailVerified) || (user && user.providerData.some(p => p.providerId === 'google.com'))) {
                usuarioLogeado = true;
                
                onSnapshot(doc(db, "usuarios", user.uid), (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const carrito = data.carrito || [];
                        
                        navCantidadCarrito.textContent = carrito.length;
                        
                        let total = 0;
                        if (typeof productos !== "undefined") {
                            carrito.forEach(codigo => {
                                const prod = productos.find(p => p.codigo === codigo);
                                if (prod) total += prod.precio;
                            });
                        }
                        navMontoCarrito.textContent = `$${total}`;
                    }
                });
            } else {
                usuarioLogeado = false;
                navCantidadCarrito.textContent = "0";
                navMontoCarrito.textContent = "$0";
            }
        });
    }
}, 100);