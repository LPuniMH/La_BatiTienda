import { Link } from 'react-router';

function Navbar({ usuarioActual, rol }) {
  const cantidadCarrito = 0;
  const montoCarrito = 0;

  return (
    <nav className="navbar navbar-expand-lg site-header">
      <div className="container-fluid max-width-container">
          
        <Link className="navbar-brand" to="/">
            <img src="https://res.cloudinary.com/yhcvjnf8/image/upload/v1788290645/logoBT.webp" alt="La BatiTienda" className="main-logo-img img-fluid" />
        </Link>
        
        <div className="d-flex align-items-center order-lg-3">
            <div className="header-actions d-flex align-items-center me-3 me-lg-0">
                <Link to={usuarioActual ? "/cart" : "/login"} className="btn btn-outline-dark d-flex align-items-center gap-2 rounded-pill px-3 py-1 fw-bold cart-btn">
                    <span className="cart-amount">${montoCarrito}</span>
                    <div className="position-relative d-flex align-items-center">
                        <span className="material-symbols-outlined">shopping_bag</span>
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-badge">{cantidadCarrito}</span>
                    </div>
                </Link>
            </div>
            
            <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
                <span className="navbar-toggler-icon"></span>
            </button>
        </div>

        <div className="collapse navbar-collapse justify-content-center order-lg-2" id="navbarMain">
            <ul className="navbar-nav gap-4 main-navigation">
                <li className="nav-item"><Link className="nav-link" to="/">INICIO</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/catalogo">CATÁLOGO</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/catalogo?cat=Figuras">FIGURAS</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/catalogo?cat=Peluches">PELUCHES</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/catalogo?cat=Juegos">JUEGOS</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/catalogo?cat=Libros">LIBROS</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/catalogo?cat=Otros">OTROS</Link></li>
                
                {rol === "admin" && (
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