import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function PagoExitoso() {
  const { idPedido } = useParams();
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!idPedido) {
      setCargando(false);
      return;
    }

    const cargarPedido = async () => {
      try {
        const docSnap = await getDoc(doc(db, "pedidos", idPedido));
        if (docSnap.exists()) {
          setPedido(docSnap.data());
        }
      } catch (error) {
        console.error(error);
      }
      setCargando(false);
    };
    cargarPedido();
  }, [idPedido]);

  if (cargando) {
    return (
      <main className="cart-main max-width-container mx-auto px-3">
        <div className="cart-content-box text-center py-5">
          <h4 className="text-white fw-bold mb-0">Generando boleta segura...</h4>
        </div>
      </main>
    );
  }

  if (!pedido) {
    return (
      <main className="cart-main max-width-container mx-auto px-3">
        <div className="cart-content-box border-danger text-center py-5" style={{ borderWidth: '2px' }}>
          <span className="material-symbols-outlined display-1 text-danger fw-bold mb-3">error</span>
          <h3 className="text-white fw-bold mb-4">No se encontró la boleta o no tienes permisos para verla.</h3>
          <Link to="/" className="btn btn-warning fw-bold px-5 py-2">Volver al inicio</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-main max-width-container mx-auto px-3">
      <div className="cart-content-box border-success" style={{ borderWidth: '2px' }}>
        <div className="text-center mb-5">
          <span className="material-symbols-outlined text-success display-1 mb-3">check_circle</span>
          <h2 className="text-success fw-bold">¡Se ha realizado la compra exitosamente!</h2>
          <p className="text-white">Código de orden: <strong className="text-amarillo">{idPedido}</strong></p>
        </div>

        <div className="row g-5">
          <div className="col-md-6">
            <h5 className="text-amarillo border-bottom border-secondary pb-2 mb-3">Datos del Cliente</h5>
            <p className="text-white mb-1"><strong>Nombre:</strong> {pedido.cliente.nombre} {pedido.cliente.apellidos}</p>
            <p className="text-white mb-1"><strong>Correo:</strong> {pedido.cliente.correo}</p>
            
            <h5 className="text-amarillo border-bottom border-secondary pb-2 mb-3 mt-4">Dirección de Entrega</h5>
            <p className="text-white mb-1"><strong>Calle:</strong> {pedido.cliente.calle} {pedido.cliente.departamento}</p>
            <p className="text-white mb-1"><strong>Ubicación:</strong> {pedido.cliente.comuna}, {pedido.cliente.region}</p>
            {pedido.cliente.indicaciones && <p className="text-white mb-1"><strong>Nota:</strong> {pedido.cliente.indicaciones}</p>}
          </div>

          <div className="col-md-6">
            <h5 className="text-amarillo border-bottom border-secondary pb-2 mb-3">Resumen de Productos</h5>
            <div className="d-flex flex-column gap-2 mb-3">
              {pedido.productos.map((p, i) => (
                <div className="d-flex justify-content-between text-white small" key={`${p.codigo}-${i}`}>
                  <span>{p.cantidad}x {p.nombre}</span>
                  <strong>${p.precio}</strong>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-between align-items-center border-top border-secondary pt-3 mt-3">
              <span className="text-white fw-bold h5 mb-0">Total pagado:</span>
              <span className="text-success fw-bold h4 mb-0">${pedido.total}</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link to="/" className="btn btn-warning fw-bold px-5 py-2">Volver al inicio</Link>
        </div>
      </div>
    </main>
  );
}

export default PagoExitoso;