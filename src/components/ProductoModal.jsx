function ProductoModal({
  producto,
  enCarrito,
  enWishlist,
  onCerrar,
  onAlternarCarrito,
  onAlternarWishlist
}) {
  if (!producto) return null;

  const sinStock = producto.stock <= 0;

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content modal-content-custom bg-dark text-white">
            <div className="modal-header border-secondary">
              <h5 className="modal-title text-amarillo fw-bold">{producto.nombre}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onCerrar}></button>
            </div>
            <div className="modal-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="position-relative">
                    <button
                      className={`btn-wishlist ${enWishlist ? 'active' : ''}`}
                      onClick={(e) => onAlternarWishlist(e, producto.codigo)}
                    >
                      <span className="material-symbols-outlined">star</span>
                    </button>
                    <div className="modal-img-producto">
                      {producto.imagen ? (
                        <img src={producto.imagen} alt={producto.nombre} />
                      ) : (
                        <span className="card-icono text-white">{producto.nombre.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-6 d-flex flex-column">
                  <span className="card-categoria align-self-start">{producto.categoria}</span>
                  <p className="mt-3 mb-1 small text-white">
                    <span className="fw-bold">Código:</span> <span className="fw-normal">{producto.codigo}</span>
                  </p>
                  <p className="mb-1 small text-white">
                    <span className="fw-bold">Marca:</span> <span className="fw-normal">{producto.marca}</span>
                  </p>
                  <p className="mb-3 small text-white">
                    <span className="fw-bold">Modelo:</span> <span className="fw-normal">{producto.modelo}</span>
                  </p>
                  <h4 className="text-amarillo fw-bold mb-3">${producto.precio}</h4>
                  <p className="flex-grow-1">{producto.descripcion}</p>
                  <div className="mt-auto">
                    <p className={`small mb-2 ${producto.stock <= 5 ? 'text-danger fw-bold' : ''}`}>
                      {sinStock ? 'Producto agotado' : `Stock disponible: ${producto.stock}`}
                    </p>
                    <button
                      className={`btn-agregar w-100 ${enCarrito ? 'btn-agregado' : ''}`}
                      onClick={(e) => onAlternarCarrito(e, producto.codigo)}
                      disabled={!enCarrito && sinStock}
                    >
                      {enCarrito ? 'Quitar del carrito' : sinStock ? 'Sin stock' : 'Agregar al carrito'}
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
  );
}

export default ProductoModal;
