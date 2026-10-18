import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function Navbar({ usuarioActual, rol }) {
  const [carritoCodigos, setCarritoCodigos] = useState([]);
  const [productosNube, setProductosNube] = useState([]);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        let arr = [];
        querySnapshot.forEach(d => arr.push(d.data()));
        setProductosNube(arr);
      } catch (error) {
        console.error(error);
      }
    };
    cargarProductos();
  }, []);

  useEffect(() => {
    if (usuarioActual) {
      const unsubscribe = onSnapshot(doc(db, "usuarios", usuarioActual.uid), (docSnap) => {
        if (docSnap.exists()) {
          setCarritoCodigos(docSnap.data().carrito || []);
        }
      });
      return () => unsubscribe();
    } else {
      setCarritoCodigos([]);
    }
  }, [usuarioActual]);

  const cantidadCarrito = carritoCodigos.length;
  const montoCarrito = carritoCodigos.reduce((total, codigo) => {
    const prod = productosNube.find(p => p.codigo === codigo);
    return prod ? total + prod.precio : total;
  }, 0);

  return (
    <nav className="navbar navbar-expand-lg site-header">
      <div className="container-fluid max-width-container d-flex justify-content-between align-items-center">
          
        <Link className="navbar-brand" to="/">
            <img src="https://res.cloudinary.com/yhcvjnf8/image/upload/v1788290645/logoBT.webp" alt="La BatiTienda" className="main-logo-img img-fluid" />
        </Link>
        
        <div className="d-flex flex-column flex-lg-row align-items-end align-items-lg-center order-lg-3 gap-2 gap-lg-3 ms-auto ms-lg-0">
            <div className="header-actions">
                <Link to={usuarioActual ? "/cart" : "/login"} className="btn btn-outline-dark d-flex align-items-center gap-2 rounded-pill px-3 py-1 fw-bold cart-btn">
                    <span className="cart-amount">${montoCarrito}</span>
                    <div className="position-relative d-flex align-items-center">
                        <span className="material-symbols-outlined">shopping_bag</span>
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-badge">{cantidadCarrito}</span>
                    </div>
                </Link>
            </div>
            
            <button className="navbar-toggler border-0 p-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
                <span className="navbar-toggler-icon"></span>
            </button>
        </div>

        <div className="collapse navbar-collapse justify-content-center order-lg-2 mt-3 mt-lg-0" id="navbarMain">
            <ul className="navbar-nav gap-2 gap-lg-4 main-navigation align-items-center">
                <li className="nav-item">
                    <Link className="nav-link" to="/">INICIO</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link text-danger fw-bold" to="/ofertas">OFERTAS</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/catalogo">CATÁLOGO</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/categorias-grid">CATEGORÍAS</Link>
                </li>
                {['admin', 'owner'].includes(rol) && (
                  <li className="nav-item">
                    <Link className="nav-link text-amarillo fw-bold" to="/admin">
                      <span className="material-symbols-outlined align-middle" style={{fontSize: '1.1rem', marginTop: '-3px'}}>admin_panel_settings</span> ADMIN
                    </Link>
                  </li>
                )}
            </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;