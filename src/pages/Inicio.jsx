import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { doc, setDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import ProductoCard from '../components/ProductoCard';
import ProductoModal from '../components/ProductoModal';
import ToastNotificacion from '../components/ToastNotificacion';
import CargandoBox from '../components/CargandoBox';

const API_PRODUCTOS_URL = import.meta.env.VITE_API_PRODUCTOS_URL || 'http://localhost:8081';

function Inicio({ usuarioActual }) {
  const [productos, setProductos] = useState([]);
  const [categoriasNube, setCategoriasNube] = useState({});
  const [cargando, setCargando] = useState(true);
  const [carrito, setCarrito] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState({ visible: false, mensaje: '' });
  const [productoModal, setProductoModal] = useState(null);

  const tiempoUltimoCarrito = useRef(0);
  const tiempoUltimaWishlist = useRef(0);

  useEffect(() => {
    const cargarBaseDatos = async () => {
      try {
        const [resCat, resProd] = await Promise.all([
          fetch(`${API_PRODUCTOS_URL}/api/categorias`),
          fetch(`${API_PRODUCTOS_URL}/api/productos`)
        ]);
        if (resCat.ok) setCategoriasNube(await resCat.json());
        if (resProd.ok) {
          const arrProds = await resProd.json();
          arrProds.sort((a, b) => a.id - b.id);
          setProductos(arrProds);
        }
      } catch (error) {
        console.error(error);
      }
      setCargando(false);
    };
    cargarBaseDatos();
  }, []);

  useEffect(() => {
    if (usuarioActual) {
      const unsubscribe = onSnapshot(doc(db, "usuarios", usuarioActual.uid), (docSnap) => {
        if (docSnap.exists()) {
          setCarrito(docSnap.data().carrito || []);
          setWishlist(docSnap.data().wishlist || []);
        }
      });
      return () => unsubscribe();
    } else {
      setCarrito([]);
      setWishlist([]);
    }
  }, [usuarioActual]);

  const mostrarToast = (mensaje) => {
    setToast({ visible: true, mensaje });
    setTimeout(() => {
      setToast({ visible: false, mensaje: '' });
    }, 3000);
  };

  const mezclarArray = (array) => {
    let arr = [...array];
    let indiceActual = arr.length, indiceAleatorio;
    while (indiceActual !== 0) {
      indiceAleatorio = Math.floor(Math.random() * indiceActual);
      indiceActual--;
      [arr[indiceActual], arr[indiceAleatorio]] = [arr[indiceAleatorio], arr[indiceActual]];
    }
    return arr;
  };

  const alternarCarrito = async (e, codigo) => {
    e.stopPropagation();
    if (!usuarioActual) return mostrarToast("Debes iniciar sesión para realizar esta acción.");

    const ahora = Date.now();
    if (ahora - tiempoUltimoCarrito.current < 2000) {
      return mostrarToast("Por favor, espera 2 segundos antes de volver a modificar tu carrito.");
    }
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
      mostrarToast("Ocurrió un error de conexión.");
    }
  };

  const alternarWishlist = async (e, codigo) => {
    e.stopPropagation();
    if (!usuarioActual) return mostrarToast("Debes iniciar sesión para realizar esta acción.");

    const ahora = Date.now();
    if (ahora - tiempoUltimaWishlist.current < 1000) {
      return mostrarToast("Por favor, espera 1 segundo antes de volver a modificar tu lista.");
    }
    tiempoUltimaWishlist.current = ahora;

    const docRef = doc(db, "usuarios", usuarioActual.uid);
    const estaAgregado = wishlist.includes(codigo);

    try {
      if (estaAgregado) {
        await setDoc(docRef, { wishlist: arrayRemove(codigo) }, { merge: true });
        mostrarToast("Producto eliminado de tu lista de deseos.");
      } else {
        await setDoc(docRef, { wishlist: arrayUnion(codigo) }, { merge: true });
        mostrarToast("¡Producto añadido a tu lista de deseos!");
      }
    } catch (error) {
      mostrarToast("Ocurrió un error de conexión.");
    }
  };

  const renderTarjeta = (prod) => (
    <ProductoCard
      key={prod.codigo}
      producto={prod}
      enCarrito={carrito.includes(prod.codigo)}
      enWishlist={wishlist.includes(prod.codigo)}
      onSelect={setProductoModal}
      onAlternarCarrito={alternarCarrito}
      onAlternarWishlist={alternarWishlist}
    />
  );

  const renderFila = (tituloTexto, listaProductos, enlaceVerMas) => (
    <div className="fila-categoria" key={tituloTexto}>
      <h2 className="fila-titulo text-amarillo fw-bold">{tituloTexto}</h2>
      <div className="scroll-horizontal">
        {listaProductos.map(renderTarjeta)}
        <Link to={enlaceVerMas} className="tarjeta-ver-mas">
          <span>Ver más &#10140;</span>
        </Link>
      </div>
    </div>
  );

  const novedades = productos.slice(-5).reverse();
  const ordenDeseado = ["Figuras", "Peluches", "Juegos", "Libros", "Otros"];
  
  const llavesOrdenadas = Object.keys(categoriasNube).sort((a, b) => {
    let indexA = ordenDeseado.indexOf(a);
    let indexB = ordenDeseado.indexOf(b);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    return indexA - indexB;
  });

  return (
    <>
      <div className="contenedor-principal" id="contenedorInicio">
        {cargando ? (
          <CargandoBox texto="Cargando tienda..." />
        ) : (
          <>
            {novedades.length > 0 && renderFila("Novedades", novedades, "/catalogo")}
            
            {llavesOrdenadas.map(nombreCategoria => {
              const datosCategoria = categoriasNube[nombreCategoria];
              const productosDeCategoria = productos.filter(p => datosCategoria.codigos.includes(p.codigo));
              if (productosDeCategoria.length === 0) return null;
              
              const productosMostrar = mezclarArray(productosDeCategoria).slice(0, 5);
              return renderFila(datosCategoria.titulo, productosMostrar, `/catalogo?cat=${nombreCategoria}`);
            })}
          </>
        )}
      </div>

      <ProductoModal
        producto={productoModal}
        enCarrito={productoModal ? carrito.includes(productoModal.codigo) : false}
        enWishlist={productoModal ? wishlist.includes(productoModal.codigo) : false}
        onCerrar={() => setProductoModal(null)}
        onAlternarCarrito={alternarCarrito}
        onAlternarWishlist={alternarWishlist}
      />

      <ToastNotificacion toast={toast} />
    </>
  );
}

export default Inicio;