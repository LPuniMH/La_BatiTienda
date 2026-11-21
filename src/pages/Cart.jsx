import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import { 
    sendPasswordResetEmail, 
    deleteUser,
    signOut 
} from 'firebase/auth';
import { 
    doc, 
    setDoc,
    arrayRemove,
    arrayUnion,
    onSnapshot
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import CartItemRow from '../components/CartItemRow';
import ModalConfirmacion from '../components/ModalConfirmacion';
import ToastNotificacion from '../components/ToastNotificacion';
import CargandoBox from '../components/CargandoBox';
import '../cart.css';

const API_PRODUCTOS_URL = import.meta.env.VITE_API_PRODUCTOS_URL || 'http://localhost:8081';

function Cart({ usuarioActual }) {
  const navigate = useNavigate();
  
  const [seccionActiva, setSeccionActiva] = useState('carrito');
  const [productosNube, setProductosNube] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [carritoCodigos, setCarritoCodigos] = useState([]);
  const [wishlistCodigos, setWishlistCodigos] = useState([]);
  
  const [nombre, setNombre] = useState('');
  const [nombreDisplay, setNombreDisplay] = useState('Cargando...');
  const [mostrarCorreo, setMostrarCorreo] = useState(false);
  const [mensajeNombre, setMensajeNombre] = useState({ texto: '', tipo: '' });
  const [mensajePassword, setMensajePassword] = useState({ texto: '', tipo: '' });
  
  const [inputCupon, setInputCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState('');
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
        const res = await fetch(`${API_PRODUCTOS_URL}/api/productos`);
        if (res.ok) {
          setProductosNube(await res.json());
        }
      } catch (e) {
        console.error(e);
      }
      setCargandoProductos(false);
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
      setCuponAplicado('');
      setMensajeCupon({ texto: '', tipo: '' });
      return;
    }
    if (cuponesDisponibles[cod]) {
      setPorcentajeDescuento(cuponesDisponibles[cod]);
      setCuponAplicado(cod);
      setMensajeCupon({ texto: `¡Cupón del ${cuponesDisponibles[cod]}% aplicado!`, tipo: 'exito' });
    } else {
      setPorcentajeDescuento(0);
      setCuponAplicado('');
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
    if (!yaEsta) {
      const prod = productosNube.find(p => p.codigo === codigo);
      if (prod && prod.stock <= 0) {
        return mostrarToast("Este producto está agotado.");
      }
    }

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

  const hacerPedido = () => {
    const hayAgotados = carritoCodigos.some(cod => {
      const prod = productosNube.find(p => p.codigo === cod);
      return prod && prod.stock <= 0;
    });
    if (hayAgotados) {
      return mostrarToast("Elimina los productos agotados del carrito antes de continuar.");
    }
    navigate('/checkout', { state: { porcentajeDescuento, cupon: cuponAplicado } });
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
                  {cargandoProductos ? (
                    <CargandoBox texto="Cargando carrito..." />
                  ) : carritoCodigos.length === 0 ? (
                    <div className="text-center py-5">
                      <span className="material-symbols-outlined display-1 text-white fw-bold mb-3">shopping_cart</span>
                      <p className="text-white fw-bold">Tu carrito está vacío de momento.</p>
                    </div>
                  ) : (
                    carritoCodigos.map(codigo => {
                      const prod = productosNube.find(p => p.codigo === codigo);
                      if (!prod) return null;
                      return (
                        <CartItemRow
                          key={`cart-${codigo}`}
                          producto={prod}
                          mostrarEstadoStock={true}
                          onEliminar={eliminarDeCarrito}
                        />
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
                  {cargandoProductos ? (
                    <CargandoBox texto="Cargando lista de deseos..." />
                  ) : wishlistCodigos.length === 0 ? (
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
                        <CartItemRow
                          key={`wish-${codigo}`}
                          producto={prod}
                          enCarrito={enCarrito}
                          onAlternarCarrito={alternarCarritoDesdeWishlist}
                          onEliminar={eliminarDeWishlist}
                        />
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

      <ModalConfirmacion
        visible={modalBorrar1}
        titulo="Eliminar Cuenta"
        textoConfirmar="Sí, estoy seguro"
        onCancelar={() => setModalBorrar1(false)}
        onConfirmar={() => { setModalBorrar1(false); setModalBorrar2(true); }}
      >
        <p>¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y perderás todos tus datos.</p>
      </ModalConfirmacion>

      <ModalConfirmacion
        visible={modalBorrar2}
        titulo="Confirmación Final"
        textoConfirmar={borrando ? 'Borrando...' : 'Borrar definitivamente'}
        deshabilitado={borrando}
        onCancelar={() => setModalBorrar2(false)}
        onConfirmar={borrarCuentaDefinitivo}
      >
        <p>Para confirmar la eliminación permanente de tu cuenta, haz clic en "Borrar definitivamente". Serás redirigido al inicio.</p>
        <p className="small text-danger fw-bold">{errorBorrado}</p>
      </ModalConfirmacion>

      <ToastNotificacion toast={toast} />
    </>
  );
}

export default Cart;