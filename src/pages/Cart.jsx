import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import { 
    sendPasswordResetEmail, 
    deleteUser,
    signOut 
} from 'firebase/auth';
import { 
    doc, 
    getDoc, 
    setDoc,
    arrayRemove,
    arrayUnion,
    collection,
    getDocs,
    onSnapshot
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import '../cart.css';

function Cart({ usuarioActual }) {
  const navigate = useNavigate();
  
  const [seccionActiva, setSeccionActiva] = useState('carrito');
  const [productosNube, setProductosNube] = useState([]);
  const [carritoCodigos, setCarritoCodigos] = useState([]);
  const [wishlistCodigos, setWishlistCodigos] = useState([]);
  
  const [nombre, setNombre] = useState('');
  const [nombreDisplay, setNombreDisplay] = useState('Cargando...');
  const [mostrarCorreo, setMostrarCorreo] = useState(false);
  const [mensajeNombre, setMensajeNombre] = useState({ texto: '', tipo: '' });
  const [mensajePassword, setMensajePassword] = useState({ texto: '', tipo: '' });
  
  const [inputCupon, setInputCupon] = useState('');
  const [porcentajeDescuento, setPorcentajeDescuento] = useState(0);
  const [mensajeCupon, setMensajeCupon] = useState({ texto: '', tipo: '' });
  const [procesandoPedido, setProcesandoPedido] = useState(false);
  
  const [modalBorrar1, setModalBorrar1] = useState(false);
  const [modalBorrar2, setModalBorrar2] = useState(false);
  const [errorBorrado, setErrorBorrado] = useState('');
  const [borrando, setBorrando] = useState(false);
  
  const [toast, setToast] = useState({ visible: false, mensaje: '' });
  
  const tiempoUltimoCarrito = useRef(0);
  const tiempoUltimaWishlist = useRef(0);

  const cuponesDisponibles = { "BATI67": 67, "HEROE20": 20, "VILLANO50": 50 };

  useEffect(() => {
    if (!usuarioActual) {
      navigate('/login');
      return;
    }

    const cargarProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        let arr = [];
        querySnapshot.forEach(d => arr.push(d.data()));
        setProductosNube(arr);
      } catch (e) {
        console.error(e);
      }
    };
    cargarProductos();

    const unsubscribe = onSnapshot(doc(db, "usuarios", usuarioActual.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCarritoCodigos(data.carrito || []);
        setWishlistCodigos(data.wishlist || []);
        setNombreDisplay(data.nombre || usuarioActual.displayName || 'Usuario');
        setNombre(data.nombre || usuarioActual.displayName || '');
      } else {
        setNombreDisplay(usuarioActual.displayName || 'Usuario');
        setNombre(usuarioActual.displayName || '');
      }
    });

    return () => unsubscribe();
  }, [usuarioActual, navigate]);

  const mostrarToast = (mensaje) => {
    setToast({ visible: true, mensaje });
    setTimeout(() => setToast({ visible: false, mensaje: '' }), 3000);
  };

  const calcularSubtotal = () => {
    return carritoCodigos.reduce((total, codigo) => {
      const prod = productosNube.find(p => p.codigo === codigo);
      return prod ? total + prod.precio : total;
    }, 0);
  };

  const subtotalSinDescuento = calcularSubtotal();
  const totalConDescuento = porcentajeDescuento > 0 
    ? Math.trunc(subtotalSinDescuento - ((subtotalSinDescuento * porcentajeDescuento) / 100))
    : subtotalSinDescuento;

  const aplicarCupon = () => {
    const cod = inputCupon.trim().toUpperCase();
    if (cod === "") {
      setPorcentajeDescuento(0);
      setMensajeCupon({ texto: '', tipo: '' });
      return;
    }
    if (cuponesDisponibles[cod]) {
      setPorcentajeDescuento(cuponesDisponibles[cod]);
      setMensajeCupon({ texto: `¡Cupón del ${cuponesDisponibles[cod]}% aplicado!`, tipo: 'exito' });
    } else {
      setPorcentajeDescuento(0);
      setMensajeCupon({ texto: "Cupón inválido.", tipo: 'error' });
    }
  };

  const eliminarDeCarrito = async (codigo) => {
    const ahora = Date.now();
    if (ahora - tiempoUltimoCarrito.current < 2000) return mostrarToast("Espera 2 segundos antes de modificar tu carrito.");
    tiempoUltimoCarrito.current = ahora;

    try {
      await setDoc(doc(db, "usuarios", usuarioActual.uid), { carrito: arrayRemove(codigo) }, { merge: true });
      mostrarToast("Producto eliminado del carrito.");
    } catch (e) {
      mostrarToast("Error al eliminar el producto.");
    }
  };

  const alternarCarritoDesdeWishlist = async (codigo) => {
    const ahora = Date.now();
    if (ahora - tiempoUltimoCarrito.current < 2000) return mostrarToast("Espera 2 segundos antes de modificar tu carrito.");
    tiempoUltimoCarrito.current = ahora;
    
    const yaEsta = carritoCodigos.includes(codigo);
    try {
      if (yaEsta) {
        await setDoc(doc(db, "usuarios", usuarioActual.uid), { carrito: arrayRemove(codigo) }, { merge: true });
        mostrarToast("Producto eliminado del carrito.");
      } else {
        await setDoc(doc(db, "usuarios", usuarioActual.uid), { carrito: arrayUnion(codigo) }, { merge: true });
        mostrarToast("¡Producto añadido al carrito!");
      }
    } catch (e) {
      mostrarToast("Error al modificar el carrito.");
    }
  };

  const eliminarDeWishlist = async (codigo) => {
    const ahora = Date.now();
    if (ahora - tiempoUltimaWishlist.current < 1000) return mostrarToast("Espera 1 segundo antes de modificar tu lista.");
    tiempoUltimaWishlist.current = ahora;

    try {
      await setDoc(doc(db, "usuarios", usuarioActual.uid), { wishlist: arrayRemove(codigo) }, { merge: true });
      mostrarToast("Producto eliminado de tu lista de deseos.");
    } catch (e) {
      mostrarToast("Error al eliminar el producto.");
    }
  };

  const hacerPedido = async () => {
    if (!usuarioActual || carritoCodigos.length === 0) return;
    setProcesandoPedido(true);
    try {
      await setDoc(doc(db, "usuarios", usuarioActual.uid), { carrito: [] }, { merge: true });
      setPorcentajeDescuento(0);
      setInputCupon('');
      setMensajeCupon({ texto: '', tipo: '' });
      mostrarToast("¡Compra realizada con éxito! Revisa tu correo.");
    } catch (e) {
      mostrarToast("Error al procesar la compra. Intenta de nuevo.");
    }
    setProcesandoPedido(false);
  };

  const guardarNombre = async () => {
    const nuevoNombre = nombre.trim();
    if (!nuevoNombre || !usuarioActual) return;
    const tiempoActual = Date.now();
    const ultimoCambio = localStorage.getItem("ultimoCambioNombre");
    const cooldownMs = 5 * 60 * 1000; 

    if (ultimoCambio && tiempoActual - parseInt(ultimoCambio) < cooldownMs) {
      const faltanMinutos = Math.ceil((cooldownMs - (tiempoActual - parseInt(ultimoCambio))) / 60000);
      setMensajeNombre({ texto: `Espera ${faltanMinutos} minuto(s) para cambiar tu nombre.`, tipo: 'error' });
      return;
    }

    try {
      await setDoc(doc(db, "usuarios", usuarioActual.uid), { nombre: nuevoNombre }, { merge: true });
      localStorage.setItem("ultimoCambioNombre", tiempoActual.toString());
      setMensajeNombre({ texto: "Nombre guardado con éxito.", tipo: 'exito' });
    } catch (e) {
      setMensajeNombre({ texto: "Error al guardar el nombre.", tipo: 'error' });
    }
  };

  const cambiarPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, usuarioActual.email);
      setMensajePassword({ texto: "Correo enviado. Revisa tu bandeja.", tipo: 'exito' });
    } catch (e) {
      setMensajePassword({ texto: "Ocurrió un error al enviar el correo.", tipo: 'error' });
    }
    setTimeout(() => setMensajePassword({ texto: '', tipo: '' }), 5000);
  };

  const borrarCuentaDefinitivo = async () => {
    setBorrando(true);
    setErrorBorrado("");
    try {
      await deleteUser(usuarioActual);
      navigate('/');
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        setErrorBorrado("Debes cerrar sesión y volver a ingresar para eliminar tu cuenta.");
      } else {
        setErrorBorrado("Error al intentar eliminar la cuenta.");
      }
      setBorrando(false);
    }
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  if (!usuarioActual) return null;

  return (
    <>
      <main className="cart-main max-width-container mx-auto px-3">
        <div className="cart-header d-flex align-items-center gap-3 mb-4">
          {usuarioActual.photoURL && (
            <img src={usuarioActual.photoURL} alt="Perfil" className="perfil-img" referrerPolicy="no-referrer" />
          )}
          <div className="titulo-caja">
            <h1 className="h4 mb-0 fw-bold">Bienvenido {nombreDisplay}</h1>
          </div>
        </div>

        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="list-group cart-menu">
              <button className={`list-group-item list-group-item-action d-flex align-items-center ${seccionActiva === 'carrito' ? 'active' : ''}`} onClick={() => setSeccionActiva('carrito')}>
                <span className="material-symbols-outlined me-2">shopping_cart</span> Mi Carrito
              </button>
              <button className={`list-group-item list-group-item-action d-flex align-items-center ${seccionActiva === 'wishlist' ? 'active' : ''}`} onClick={() => setSeccionActiva('wishlist')}>
                <span className="material-symbols-outlined me-2">star</span> Lista de Deseos
              </button>
              <button className={`list-group-item list-group-item-action d-flex align-items-center ${seccionActiva === 'cuenta' ? 'active' : ''}`} onClick={() => setSeccionActiva('cuenta')}>
                <span className="material-symbols-outlined me-2">person</span> Mi Cuenta
              </button>
              <button className="list-group-item list-group-item-action d-flex align-items-center mt-3 text-danger" onClick={cerrarSesion} style={{ borderColor: '#ff5c5c' }}>
                <span className="material-symbols-outlined me-2">logout</span> Cerrar sesión
              </button>
            </div>
          </div>

          <div className="col-md-9">
            
            {seccionActiva === 'carrito' && (
              <div className="cart-content-box">
                <h2 className="h5 mb-4 text-amarillo fw-bold">Carrito de Compras</h2>
                <div className="d-flex flex-column gap-3 mb-4">
                  {carritoCodigos.length === 0 ? (
                    <div className="text-center py-5">
                      <span className="material-symbols-outlined display-1 text-white fw-bold mb-3">shopping_cart</span>
                      <p className="text-white fw-bold">Tu carrito está vacío de momento.</p>
                    </div>
                  ) : (
                    carritoCodigos.map(codigo => {
                      const prod = productosNube.find(p => p.codigo === codigo);
                      if (!prod) return null;
                      return (
                        <div className="cart-item" key={`cart-${codigo}`}>
                          {prod.imagen ? <img src={prod.imagen} alt={prod.nombre} className="cart-item-img" /> : <div className="cart-item-icono">{prod.nombre.charAt(0).toUpperCase()}</div>}
                          <div className="cart-item-info">
                            <h4 className="h6 mb-1 text-white fw-bold">{prod.nombre}</h4>
                            <p className="mb-0 text-amarillo fw-bold">${prod.precio}</p>
                          </div>
                          <button className="btn-eliminar-item" onClick={() => eliminarDeCarrito(codigo)}>
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
                {carritoCodigos.length > 0 && (
                  <div className="border-top border-secondary pt-4 mt-2">
                    <div className="row g-3 align-items-center mb-3">
                      <div className="col-sm-6">
                        <div className="input-group">
                          <input type="text" className="form-control bg-dark text-white border-amarillo" placeholder="Código de descuento" value={inputCupon} onChange={(e) => setInputCupon(e.target.value)} />
                          <button className="btn btn-outline-warning fw-bold" onClick={aplicarCupon}>Aplicar</button>
                        </div>
                        <p className={`small mt-1 mb-0 fw-bold ${mensajeCupon.tipo === 'exito' ? 'text-success' : 'text-danger'}`}>{mensajeCupon.texto}</p>
                      </div>
                      <div className="col-sm-6 text-sm-end text-center">
                        <h4 className="text-amarillo fw-bold mb-0">Total: ${totalConDescuento}</h4>
                      </div>
                    </div>
                    <button className="btn btn-warning w-100 fw-bold py-2 mt-2" onClick={hacerPedido} disabled={procesandoPedido}>
                      {procesandoPedido ? "Procesando..." : "Hacer el pedido"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {seccionActiva === 'wishlist' && (
              <div className="cart-content-box">
                <h2 className="h5 mb-4 text-amarillo fw-bold">Lista de Deseos</h2>
                <div className="d-flex flex-column gap-3">
                  {wishlistCodigos.length === 0 ? (
                    <div className="text-center py-5">
                      <span className="material-symbols-outlined display-1 text-white fw-bold mb-3">star</span>
                      <p className="text-white fw-bold">Tu lista de deseos está vacía de momento.</p>
                    </div>
                  ) : (
                    wishlistCodigos.map(codigo => {
                      const prod = productosNube.find(p => p.codigo === codigo);
                      if (!prod) return null;
                      const enCarrito = carritoCodigos.includes(codigo);
                      return (
                        <div className="cart-item" key={`wish-${codigo}`}>
                          {prod.imagen ? <img src={prod.imagen} alt={prod.nombre} className="cart-item-img" /> : <div className="cart-item-icono">{prod.nombre.charAt(0).toUpperCase()}</div>}
                          <div className="cart-item-info">
                            <h4 className="h6 mb-1 text-white fw-bold">{prod.nombre}</h4>
                            <p className="mb-0 text-amarillo fw-bold">${prod.precio}</p>
                          </div>
                          <button className={`btn-toggle-cart ${enCarrito ? 'agregado' : ''}`} onClick={() => alternarCarritoDesdeWishlist(codigo)}>
                            <span className="material-symbols-outlined">shopping_cart</span>
                          </button>
                          <button className="btn-eliminar-item ms-2" onClick={() => eliminarDeWishlist(codigo)}>
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {seccionActiva === 'cuenta' && (
              <div className="cart-content-box">
                <h2 className="h5 mb-4 text-amarillo fw-bold">Detalles de la Cuenta</h2>
                
                <div className="mb-4">
                  <label className="form-label fw-bold">Nombre de usuario</label>
                  <div className="d-flex gap-2">
                    <input type="text" className="form-control bg-dark text-white border-amarillo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    <button className="btn btn-warning fw-bold" onClick={guardarNombre}>Guardar</button>
                  </div>
                  <p className={`small mt-1 fw-bold ${mensajeNombre.tipo === 'exito' ? 'text-success' : 'text-danger'}`}>{mensajeNombre.texto}</p>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Correo electrónico</label>
                  <div className="input-group">
                    <input type={mostrarCorreo ? "text" : "password"} className="form-control bg-dark text-white border-amarillo" value={usuarioActual.email} disabled />
                    <button className="btn btn-outline-warning" type="button" onClick={() => setMostrarCorreo(!mostrarCorreo)}>
                      <span className="material-symbols-outlined">{mostrarCorreo ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Contraseña</label>
                  <div className="d-flex gap-2">
                    <input type="password" value="********" className="form-control bg-dark text-white border-amarillo" disabled />
                    <button className="btn btn-outline-warning text-nowrap" onClick={cambiarPassword}>Cambiar contraseña</button>
                  </div>
                  <p className={`small mt-1 fw-bold ${mensajePassword.tipo === 'exito' ? 'text-success' : 'text-danger'}`}>{mensajePassword.texto}</p>
                </div>

                <div className="mb-5">
                  <Link to="/contacto" className="btn btn-warning fw-bold d-inline-flex align-items-center">
                    <span className="material-symbols-outlined me-2">person</span> Soporte y Contacto
                  </Link>
                </div>

                <hr className="border-secondary mb-4" />

                <div className="text-end">
                  <button className="btn btn-danger fw-bold d-inline-flex align-items-center" onClick={() => setModalBorrar1(true)}>
                    <span className="material-symbols-outlined me-2">delete_forever</span> Eliminar Cuenta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {modalBorrar1 && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content bg-dark text-white border-danger">
                <div className="modal-header border-secondary">
                  <h5 className="modal-title text-danger fw-bold">Eliminar Cuenta</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setModalBorrar1(false)}></button>
                </div>
                <div className="modal-body">
                  <p>¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y perderás todos tus datos.</p>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalBorrar1(false)}>Cancelar</button>
                  <button type="button" className="btn btn-danger fw-bold" onClick={() => { setModalBorrar1(false); setModalBorrar2(true); }}>Sí, estoy seguro</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {modalBorrar2 && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content bg-dark text-white border-danger">
                <div className="modal-header border-secondary">
                  <h5 className="modal-title text-danger fw-bold">Confirmación Final</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setModalBorrar2(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Para confirmar la eliminación permanente de tu cuenta, haz clic en "Borrar definitivamente". Serás redirigido al inicio.</p>
                  <p className="small text-danger fw-bold">{errorBorrado}</p>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalBorrar2(false)}>Cancelar</button>
                  <button type="button" className="btn btn-danger fw-bold" onClick={borrarCuentaDefinitivo} disabled={borrando}>
                    {borrando ? "Borrando..." : "Borrar definitivamente"}
                  </button>
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

export default Cart;