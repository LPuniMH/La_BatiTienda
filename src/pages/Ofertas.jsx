import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, doc, setDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

function Ofertas({ usuarioActual }) {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [toast, setToast] = useState({ visible: false, mensaje: '' });
  const tiempoUltimoCarrito = useRef(0);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        let arrProds = [];
        querySnapshot.forEach((d) => arrProds.push(d.data()));
        const ofertas = arrProds.filter(p => p.precio > 15000).sort((a, b) => b.precio - a.precio);
        setProductos(ofertas);
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
    try {
      if (carrito.includes(codigo)) {
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
        {productos.map(prod => {
          const enCarrito = carrito.includes(prod.codigo);
          const precioConDescuento = Math.trunc(prod.precio * 0.8);

          return (
            <div className="card border-warning" key={prod.codigo}>
              <div className="card-visual">
                <div className="position-absolute top-0 start-0 bg-danger text-white px-2 py-1 m-2 rounded fw-bold shadow" style={{zIndex: 10}}>
                  -20% OFF
                </div>
                {prod.imagen ? (
                  <img src={prod.imagen} alt={prod.nombre} className="card-img" />
                ) : (
                  <span className="card-icono">{prod.nombre.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h3 className="card-titulo mt-3">{prod.nombre}</h3>
              <hr className="card-divisor" />
              <div className="card-footer flex-column align-items-start gap-1">
                <span className="text-decoration-line-through small fw-bold" style={{ color: '#dcb4ff' }}>Precio normal: ${prod.precio}</span>
                <span className="card-precio text-warning fs-4 fw-bold">Aprox. ${precioConDescuento}</span>
              </div>
              <button className={`btn-agregar mt-3 ${enCarrito ? 'btn-agregado' : 'btn-warning text-dark'}`} onClick={(e) => alternarCarrito(e, prod.codigo)}>
                {enCarrito ? 'Quitar del carrito' : 'Aprovechar Oferta'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="toast-container-fixed">
        <div className={`toast-custom d-flex align-items-center ${toast.visible ? 'show' : ''}`}>
          <span className="material-symbols-outlined me-2 text-amarillo">info</span>
          <span>{toast.mensaje}</span>
        </div>
      </div>
    </div>
  );
}

export default Ofertas;