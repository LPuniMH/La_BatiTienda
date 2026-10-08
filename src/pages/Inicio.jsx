import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { collection, getDocs, doc, getDoc, setDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

function Inicio({ usuarioActual }) {
  const [productos, setProductos] = useState([]);
  const [categoriasNube, setCategoriasNube] = useState({});
  const [carrito, setCarrito] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState({ visible: false, mensaje: '' });
  const [productoModal, setProductoModal] = useState(null);

  const tiempoUltimoCarrito = useRef(0);
  const tiempoUltimaWishlist = useRef(0);

  useEffect(() => {
    const cargarBaseDatos = async () => {
      try {
        const docCat = await getDoc(doc(db, "configuracion", "categorias"));
        if (docCat.exists()) setCategoriasNube(docCat.data());

        const querySnapshot = await getDocs(collection(db, "productos"));
        let arrProds = [];
        querySnapshot.forEach((d) => arrProds.push(d.data()));
        arrProds.sort((a, b) => a.id - b.id);
        setProductos(arrProds);
      } catch (error) {
        console.error(error);
      }
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

  const renderTarjeta = (prod) => {
    const enCarrito = carrito.includes(prod.codigo);
    const enWishlist = wishlist.includes(prod.codigo);

    return (
      <div className="card" key={prod.codigo} onClick={() => setProductoModal(prod)}>
        <div className="card-visual">
          <button className={`btn-wishlist ${enWishlist ? 'active' : ''}`} onClick={(e) => alternarWishlist(e, prod.codigo)}>
            <span className="material-symbols-outlined">star</span>
          </button>
          {prod.imagen ? (
            <img src={prod.imagen} alt={prod.nombre} className="card-img" />
          ) : (
            <span className="card-icono">{prod.nombre.charAt(0).toUpperCase()}</span>
          )}
          <span className="card-codigo">{prod.codigo}</span>
        </div>
        <span className="card-categoria">{prod.categoria}</span>
        <h3 className="card-titulo">{prod.nombre}</h3>
        <p className="card-descripcion">{prod.descripcion}</p>
        <hr className="card-divisor" />
        <div className="card-footer">
          <span className="card-precio">${prod.precio}</span>
          <span className={`card-stock ${prod.stock <= 5 ? "stock-bajo" : ""}`}>
            {prod.stock <= 5 ? "¡Últimas unidades!" : `Stock: ${prod.stock}`}
          </span>
        </div>
        <button className={`btn-agregar ${enCarrito ? 'btn-agregado' : ''}`} onClick={(e) => alternarCarrito(e, prod.codigo)}>
          {enCarrito ? 'Quitar del carrito' : 'Agregar al carrito'}
        </button>
      </div>
    );
  };

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
        {novedades.length > 0 && renderFila("Novedades", novedades, "/catalogo")}
        
        {llavesOrdenadas.map(nombreCategoria => {
          const datosCategoria = categoriasNube[nombreCategoria];
          const productosDeCategoria = productos.filter(p => datosCategoria.codigos.includes(p.codigo));
          if (productosDeCategoria.length === 0) return null;
          
          const productosMostrar = mezclarArray(productosDeCategoria).slice(0, 5);
          return renderFila(datosCategoria.titulo, productosMostrar, `/catalogo?cat=${nombreCategoria}`);
        })}
      </div>

      {productoModal && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content modal-content-custom bg-dark text-white">
                <div className="modal-header border-secondary">
                  <h5 className="modal-title text-amarillo fw-bold">{productoModal.nombre}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setProductoModal(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="position-relative">
                        <button className={`btn-wishlist ${wishlist.includes(productoModal.codigo) ? 'active' : ''}`} onClick={(e) => alternarWishlist(e, productoModal.codigo)}>
                          <span className="material-symbols-outlined">star</span>
                        </button>
                        <div className="modal-img-producto">
                          {productoModal.imagen ? (
                            <img src={productoModal.imagen} alt={productoModal.nombre} />
                          ) : (
                            <span className="card-icono text-white">{productoModal.nombre.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 d-flex flex-column">
                      <span className="card-categoria align-self-start">{productoModal.categoria}</span>
                      <p className="mt-3 mb-1 small text-white"><span className="fw-bold">Código:</span> <span className="fw-normal">{productoModal.codigo}</span></p>
                      <p className="mb-1 small text-white"><span className="fw-bold">Marca:</span> <span className="fw-normal">{productoModal.marca}</span></p>
                      <p className="mb-3 small text-white"><span className="fw-bold">Modelo:</span> <span className="fw-normal">{productoModal.modelo}</span></p>
                      <h4 className="text-amarillo fw-bold mb-3">${productoModal.precio}</h4>
                      <p className="flex-grow-1">{productoModal.descripcion}</p>
                      <div className="mt-auto">
                        <p className={`small mb-2 ${productoModal.stock <= 5 ? "text-danger fw-bold" : ""}`}>
                          Stock disponible: {productoModal.stock}
                        </p>
                        <button className={`btn-agregar w-100 ${carrito.includes(productoModal.codigo) ? 'btn-agregado' : ''}`} onClick={(e) => alternarCarrito(e, productoModal.codigo)}>
                          {carrito.includes(productoModal.codigo) ? 'Quitar del carrito' : 'Agregar al carrito'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      <div className="toast-container-fixed">
        <div className={`toast-custom d-flex align-items-center ${toast.visible ? 'show' : ''}`}>
          <span className="material-symbols-outlined me-2 text-amarillo">info</span>
          <span>{toast.mensaje}</span>
        </div>
      </div>
    </>
  );
}

export default Inicio;