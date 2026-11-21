import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { doc, setDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import ProductoCard from '../components/ProductoCard';
import ProductoModal from '../components/ProductoModal';
import ToastNotificacion from '../components/ToastNotificacion';

const API_PRODUCTOS_URL = import.meta.env.VITE_API_PRODUCTOS_URL || 'http://localhost:8081';

function Catalogo({ usuarioActual }) {
  const [searchParams] = useSearchParams();
  const categoriaURL = searchParams.get('cat');

  const [productos, setProductos] = useState([]);
  const [categoriasNube, setCategoriasNube] = useState({});
  const [carrito, setCarrito] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState({ visible: false, mensaje: '' });
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  
  const [minPrecio, setMinPrecio] = useState(0);
  const [maxPrecio, setMaxPrecio] = useState(5000000);
  const [ordenPrecio, setOrdenPrecio] = useState('ninguno');
  
  const [modalFiltros, setModalFiltros] = useState(false);
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
    };
    
    setMinPrecio(parseInt(localStorage.getItem("batitienda_min_precio")) || 0);
    setMaxPrecio(parseInt(localStorage.getItem("batitienda_max_precio")) || 5000000);
    setOrdenPrecio(localStorage.getItem("batitienda_orden_precio") || "ninguno");
    
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
    setTimeout(() => setToast({ visible: false, mensaje: '' }), 3000);
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

  const aplicarFiltrosPrecio = () => {
    let min = parseInt(minPrecio) || 0;
    let max = parseInt(maxPrecio) || 5000000;
    if (min < 0) min = 0;
    if (max > 5000000) max = 5000000;

    setMinPrecio(min);
    setMaxPrecio(max);
    
    localStorage.setItem("batitienda_min_precio", min);
    localStorage.setItem("batitienda_max_precio", max);
    localStorage.setItem("batitienda_orden_precio", ordenPrecio);
    
    setModalFiltros(false);
  };

  let tituloPagina = "Nuestro catálogo";
  let descPagina = "Kuromi, anime, figuras, peluches y superhéroes";
  
  if (categoriaURL && categoriasNube[categoriaURL]) {
    tituloPagina = categoriasNube[categoriaURL].titulo;
    descPagina = categoriasNube[categoriaURL].descripcion;
  }

  const categoriasUnicas = [...new Set(productos.map(p => p.categoria))];

  let productosFiltrados = productos.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltroCat = filtroCategoria === "todos" || p.categoria === filtroCategoria;
    const coincidePrecio = p.precio >= minPrecio && p.precio <= maxPrecio;
    
    let coincideUrlCat = true;
    if (categoriaURL && categoriasNube[categoriaURL]) {
      coincideUrlCat = categoriasNube[categoriaURL].codigos.includes(p.codigo);
    }

    return coincideNombre && coincideFiltroCat && coincidePrecio && coincideUrlCat;
  });

  if (ordenPrecio === "asc") productosFiltrados.sort((a, b) => a.precio - b.precio);
  if (ordenPrecio === "desc") productosFiltrados.sort((a, b) => b.precio - a.precio);

  return (
    <>
      <div className="contenedor-principal">
        <div className="toolbar-productos d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h1 className="h3 mb-0 text-amarillo fw-bold">{tituloPagina}</h1>
            <p className="peque-desc mb-0">{descPagina}</p>
          </div>
          <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar producto..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <select 
              className="form-select" 
              style={{ minWidth: '220px' }}
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="todos">Categorías</option>
              {categoriasUnicas.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button 
              className="btn btn-outline-warning d-flex align-items-center" 
              onClick={() => setModalFiltros(true)}
            >
              <span className="material-symbols-outlined">attach_money</span>
            </button>
          </div>
        </div>

        <div id="contenedorProductos">
          {productosFiltrados.map(prod => (
            <ProductoCard
              key={prod.codigo}
              producto={prod}
              enCarrito={carrito.includes(prod.codigo)}
              enWishlist={wishlist.includes(prod.codigo)}
              onSelect={setProductoModal}
              onAlternarCarrito={alternarCarrito}
              onAlternarWishlist={alternarWishlist}
            />
          ))}
        </div>
      </div>

      {modalFiltros && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content modal-content-custom bg-dark text-white">
                <div className="modal-header border-secondary">
                  <h5 className="modal-title text-amarillo fw-bold">Filtros de Precio</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setModalFiltros(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Precio Mínimo ($)</label>
                    <input type="number" className="form-control bg-dark text-white border-amarillo" min="0" step="500" value={minPrecio} onChange={(e) => setMinPrecio(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Precio Máximo ($)</label>
                    <input type="number" className="form-control bg-dark text-white border-amarillo" min="0" max="5000000" step="500" value={maxPrecio} onChange={(e) => setMaxPrecio(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Ordenar por precio</label>
                    <select className="form-select bg-dark text-white border-amarillo" value={ordenPrecio} onChange={(e) => setOrdenPrecio(e.target.value)}>
                      <option value="ninguno">Relevancia</option>
                      <option value="asc">De Menor a Mayor</option>
                      <option value="desc">De Mayor a Menor</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalFiltros(false)}>Cancelar</button>
                  <button type="button" className="btn btn-warning fw-bold" onClick={aplicarFiltrosPrecio}>Aplicar Filtros</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

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

export default Catalogo;