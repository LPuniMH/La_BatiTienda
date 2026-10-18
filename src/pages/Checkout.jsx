import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { doc, getDoc, getDocs, collection, addDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../cart.css';

const regionesYComunas = {
  "Región Metropolitana": ["Cerrillos", "Providencia", "Santiago", "Maipú", "Ñuñoa", "Puente Alto"],
  "Valparaíso": ["Viña del Mar", "Valparaíso", "Quilpué", "Villa Alemana", "Limache", "Concón"]
};

function Checkout({ usuarioActual }) {
  const navigate = useNavigate();
  const location = useLocation();
  const porcentajeDescuento = location.state?.porcentajeDescuento || 0;

  const [productosNube, setProductosNube] = useState([]);
  const [carritoCodigos, setCarritoCodigos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [form, setForm] = useState({
    nombre: '', apellidos: '', correo: '', calle: '',
    departamento: '', region: 'Región Metropolitana', comuna: 'Cerrillos', indicaciones: ''
  });

  const [simulacion, setSimulacion] = useState('exito');

  useEffect(() => {
    if (!usuarioActual) {
      navigate('/login');
      return;
    }

    const cargarDatos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        let arr = [];
        querySnapshot.forEach(d => arr.push(d.data()));
        setProductosNube(arr);

        const docSnap = await getDoc(doc(db, "usuarios", usuarioActual.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          const codigos = data.carrito || [];
          
          setCarritoCodigos(codigos);
          setForm(prev => ({
            ...prev,
            nombre: data.nombre || usuarioActual.displayName?.split(' ')[0] || '',
            apellidos: usuarioActual.displayName?.split(' ').slice(1).join(' ') || '',
            correo: usuarioActual.email || ''
          }));
        }
      } catch (e) {
        console.error(e);
      }
      setCargando(false);
    };
    cargarDatos();
  }, [usuarioActual, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "region") {
      setForm({ ...form, region: value, comuna: regionesYComunas[value][0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const carritoItems = carritoCodigos.map(codigo => {
    const prod = productosNube.find(p => p.codigo === codigo);
    return prod ? { ...prod, cantidad: 1 } : null;
  }).filter(Boolean);

  const subtotal = carritoItems.reduce((acc, item) => acc + item.precio, 0);
  const montoDescuento = porcentajeDescuento > 0 ? ((subtotal * porcentajeDescuento) / 100) : 0;
  const totalConDescuento = Math.trunc(subtotal - montoDescuento);

  const procesarPago = async (e) => {
    e.preventDefault();
    if (carritoCodigos.length === 0) return;
    setProcesando(true);

    if (simulacion === 'error') {
      setTimeout(() => {
        navigate('/pago-error', { state: { form, carritoItems, total: totalConDescuento } });
      }, 1500);
      return;
    }

    try {
      const nuevoPedido = {
        uid: usuarioActual.uid,
        cliente: form,
        productos: carritoItems,
        total: totalConDescuento,
        descuentoAplicado: porcentajeDescuento,
        fecha: new Date().toISOString(),
        estado: 'Pendiente'
      };

      const docRef = await addDoc(collection(db, "pedidos"), nuevoPedido);
      await setDoc(doc(db, "usuarios", usuarioActual.uid), { carrito: [] }, { merge: true });
      
      setTimeout(() => {
        navigate(`/pago-exitoso/${docRef.id}`);
      }, 1500);

    } catch (error) {
      console.error(error);
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <main className="cart-main max-width-container mx-auto px-3">
        <div className="cart-content-box text-center py-5">
          <h4 className="text-white fw-bold mb-0">Cargando información segura...</h4>
        </div>
      </main>
    );
  }

  if (carritoCodigos.length === 0) {
    return (
      <main className="cart-main max-width-container mx-auto px-3">
        <div className="cart-content-box text-center py-5">
          <span className="material-symbols-outlined display-1 text-white fw-bold mb-3">shopping_cart</span>
          <h4 className="text-white fw-bold mb-0">Tu carrito está vacío. Añade productos antes de pagar.</h4>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-main max-width-container mx-auto px-3">
      <div className="cart-content-box">
        <h2 className="h4 mb-4 text-amarillo fw-bold">Checkout - Finalizar Compra</h2>
        
        <div className="row g-5">
          <div className="col-md-7">
            <form onSubmit={procesarPago}>
              <h5 className="text-white mb-3 fw-bold">Información del cliente</h5>
              <div className="row g-3 mb-4">
                <div className="col-sm-6">
                  <label className="form-label text-amarillo small fw-bold">Nombre</label>
                  <input type="text" name="nombre" className="form-control bg-dark text-white border-amarillo" value={form.nombre} onChange={handleChange} required />
                </div>
                <div className="col-sm-6">
                  <label className="form-label text-amarillo small fw-bold">Apellidos</label>
                  <input type="text" name="apellidos" className="form-control bg-dark text-white border-amarillo" value={form.apellidos} onChange={handleChange} required />
                </div>
                <div className="col-sm-12">
                  <label className="form-label text-amarillo small fw-bold">Correo electrónico</label>
                  <input type="email" name="correo" className="form-control bg-dark text-white border-amarillo" value={form.correo} onChange={handleChange} required />
                </div>
              </div>

              <h5 className="text-white mb-3 fw-bold">Dirección de entrega</h5>
              <div className="row g-3 mb-4">
                <div className="col-sm-8">
                  <label className="form-label text-amarillo small fw-bold">Calle</label>
                  <input type="text" name="calle" className="form-control bg-dark text-white border-amarillo" value={form.calle} onChange={handleChange} required />
                </div>
                <div className="col-sm-4">
                  <label className="form-label text-amarillo small fw-bold">Dpto (Opcional)</label>
                  <input type="text" name="departamento" className="form-control bg-dark text-white border-amarillo" value={form.departamento} onChange={handleChange} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label text-amarillo small fw-bold">Región</label>
                  <select name="region" className="form-select bg-dark text-white border-amarillo" value={form.region} onChange={handleChange}>
                    {Object.keys(regionesYComunas).map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>
                <div className="col-sm-6">
                  <label className="form-label text-amarillo small fw-bold">Comuna</label>
                  <select name="comuna" className="form-select bg-dark text-white border-amarillo" value={form.comuna} onChange={handleChange}>
                    {regionesYComunas[form.region].map(com => (
                      <option key={com} value={com}>{com}</option>
                    ))}
                  </select>
                </div>
                <div className="col-sm-12">
                  <label className="form-label text-amarillo small fw-bold">Indicaciones para la entrega (Opcional)</label>
                  <textarea name="indicaciones" className="form-control bg-dark text-white border-amarillo" rows="2" value={form.indicaciones} onChange={handleChange}></textarea>
                </div>
              </div>

              <div className="p-3 bg-black border border-warning rounded mb-4">
                <label className="form-label text-amarillo fw-bold mb-2">Simulador de Pasarela de Pago</label>
                <select className="form-select bg-dark text-white border-amarillo" value={simulacion} onChange={(e) => setSimulacion(e.target.value)}>
                  <option value="exito">Tarjeta de Crédito (Simular Aprobación)</option>
                  <option value="error">Tarjeta de Crédito (Simular Rechazo)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-warning w-100 fw-bold py-3" disabled={procesando}>
                {procesando ? 'Procesando pago seguro...' : `Pagar ahora $${totalConDescuento}`}
              </button>
            </form>
          </div>

          <div className="col-md-5">
            <div className="bg-dark p-4 rounded border border-secondary">
              <h5 className="text-white mb-4 fw-bold">Resumen de compra</h5>
              <div className="d-flex flex-column gap-3 mb-4">
                {carritoItems.map(item => (
                  <div className="d-flex align-items-center justify-content-between" key={item.codigo}>
                    <div className="d-flex align-items-center gap-3">
                      {item.imagen ? <img src={item.imagen} alt={item.nombre} style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'6px'}} /> : <div style={{width:'50px', height:'50px', backgroundColor:'#1a1a1a', borderRadius:'6px'}}></div>}
                      <div>
                        <p className="mb-0 text-white small fw-bold">{item.nombre}</p>
                        <p className="mb-0 text-muted small">Cant: 1</p>
                      </div>
                    </div>
                    <p className="mb-0 text-amarillo fw-bold">${item.precio}</p>
                  </div>
                ))}
              </div>
              <hr className="border-secondary" />
              
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span className="text-white small mb-0">Subtotal:</span>
                <span className="text-white small mb-0">${subtotal}</span>
              </div>
              
              {porcentajeDescuento > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <span className="text-success small mb-0">Descuento ({porcentajeDescuento}%):</span>
                  <span className="text-success small mb-0">-${Math.trunc(montoDescuento)}</span>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary">
                <span className="text-white fw-bold h5 mb-0">Total a pagar:</span>
                <span className="text-amarillo fw-bold h4 mb-0">${totalConDescuento}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

export default Checkout;