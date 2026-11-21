import { useState, useEffect, useRef } from 'react';
import { doc, setDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import ProductoCard from '../components/ProductoCard';
import ToastNotificacion from '../components/ToastNotificacion';

const API_PRODUCTOS_URL = import.meta.env.VITE_API_PRODUCTOS_URL || 'http://localhost:8081';

function Ofertas({ usuarioActual }) {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [toast, setToast] = useState({ visible: false, mensaje: '' });
  const tiempoUltimoCarrito = useRef(0);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch(`${API_PRODUCTOS_URL}/api/productos`);
        if (res.ok) {
          const arrProds = await res.json();
          const ofertas = arrProds.filter(p => p.precio > 15000).sort((a, b) => b.precio - a.precio);
          setProductos(ofertas);
        }
      } catch (error) {
        console.error(error);
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    if (usuarioActual) {
      const unsubscribe = onSnapshot(doc(db, "usuarios", usuarioActual.uid), (docSnap) => {
        if (docSnap.exists()) setCarrito(docSnap.data().carrito || []);
      });
      return () => unsubscribe();
    } else {
      setCarrito([]);
    }
  }, [usuarioActual]);

  const mostrarToast = (mensaje) => {
    setToast({ visible: true, mensaje });
    setTimeout(() => setToast({ visible: false, mensaje: '' }), 3000);
  };

  const alternarCarrito = async (e, codigo) => {
    e.stopPropagation();
    if (!usuarioActual) return mostrarToast("Debes iniciar sesión para comprar.");
    const ahora = Date.now();
    if (ahora - tiempoUltimoCarrito.current < 2000) return;
    tiempoUltimoCarrito.current = ahora;

    const docRef = doc(db, "usuarios", usuarioActual.uid);
    const estaAgregado = carrito.includes(codigo);
    if (!estaAgregado) {
      const prod = productos.find(p => p.codigo === codigo);
      if (prod && prod.stock <= 0) {
        return mostrarToast("Este producto está agotado.");
      }
    }

    try {
      if (estaAgregado) {
        await setDoc(docRef, { carrito: arrayRemove(codigo) }, { merge: true });
        mostrarToast("Producto eliminado del carrito.");
      } else {
        await setDoc(docRef, { carrito: arrayUnion(codigo) }, { merge: true });
        mostrarToast("¡Producto añadido al carrito!");
      }
    } catch (error) {
      mostrarToast("Error de conexión.");
    }
  };

  return (
    <div className="contenedor-principal">
      <div className="bg-warning text-dark p-4 rounded mb-4 text-center shadow border border-warning border-3">
        <h1 className="fw-bold mb-2">¡Bati-Ofertas Exclusivas!</h1>
        <p className="mb-0 fs-5">Aplica el cupón <strong>HEROE20</strong> en tu carrito para hacer válido el <strong>20% de descuento</strong> en estos productos premium.</p>
      </div>

      <div id="contenedorProductos">
        {productos.map(prod => (
          <ProductoCard
            key={prod.codigo}
            producto={prod}
            enCarrito={carrito.includes(prod.codigo)}
            esOferta={true}
            onAlternarCarrito={alternarCarrito}
          />
        ))}
      </div>

      <ToastNotificacion toast={toast} />
    </div>
  );
}

export default Ofertas;