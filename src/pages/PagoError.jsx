import { useLocation, Link } from 'react-router';

function PagoError() {
  const location = useLocation();
  const datosIntento = location.state || null;

  return (
    <main className="cart-main max-width-container mx-auto px-3">
      <div className="cart-content-box border-danger" style={{ borderWidth: '2px' }}>
        <div className="text-center mb-5">
          <span className="material-symbols-outlined text-danger display-1 mb-3">cancel</span>
          <h2 className="text-danger fw-bold">No se pudo realizar el pago</h2>
          <p className="text-white">Tu tarjeta fue rechazada por el banco emisor o hubo un error de conexión.</p>
        </div>

        <div className="text-center mb-5">
          <Link to="/checkout" className="btn btn-danger fw-bold px-5 py-3">
            VOLVER A INTENTAR EL PAGO
          </Link>
        </div>

        {datosIntento && (
          <div className="bg-dark p-4 rounded border border-secondary opacity-75">
            <h5 className="text-amarillo border-bottom border-secondary pb-2 mb-3">Detalle del intento de compra</h5>
            <div className="row">
              <div className="col-md-6">
                <p className="text-white mb-1"><strong>A nombre de:</strong> {datosIntento.form.nombre} {datosIntento.form.apellidos}</p>
                <p className="text-white mb-1"><strong>Monto rechazado:</strong> ${datosIntento.total}</p>
              </div>
              <div className="col-md-6">
                <p className="text-white mb-1"><strong>Destino:</strong> {datosIntento.form.calle}, {datosIntento.form.comuna}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default PagoError;