function ProductoCard({
  producto,
  enCarrito,
  enWishlist,
  esOferta = false,
  onSelect,
  onAlternarCarrito,
  onAlternarWishlist
}) {
  const sinStock = producto.stock <= 0;
  const precioConDescuento = Math.trunc(producto.precio * 0.8);

  if (esOferta) {
    return (
      <div className="card border-warning">
        <div className="card-visual">
          <div className="position-absolute top-0 start-0 bg-danger text-white px-2 py-1 m-2 rounded fw-bold shadow" style={{ zIndex: 10 }}>
            -20% OFF
          </div>
          {producto.imagen ? (
            <img src={producto.imagen} alt={producto.nombre} className="card-img" />
          ) : (
            <span className="card-icono">{producto.nombre.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <h3 className="card-titulo mt-3">{producto.nombre}</h3>
        <hr className="card-divisor" />
        <div className="card-footer flex-column align-items-start gap-1">
          <span className="text-decoration-line-through small fw-bold" style={{ color: '#dcb4ff' }}>
            Precio normal: ${producto.precio}
          </span>
          <span className="card-precio text-warning fs-4 fw-bold">Aprox. ${precioConDescuento}</span>
        </div>
        <button
          className={`btn-agregar mt-3 ${enCarrito ? 'btn-agregado' : 'btn-warning text-dark'}`}
          onClick={(e) => onAlternarCarrito(e, producto.codigo)}
          disabled={!enCarrito && sinStock}
        >
          {enCarrito ? 'Quitar del carrito' : sinStock ? 'Sin stock' : 'Aprovechar Oferta'}
        </button>
      </div>
    );
  }

  return (
    <div className="card" onClick={() => onSelect && onSelect(producto)}>
      <div className="card-visual">
        {onAlternarWishlist && (
          <button
            className={`btn-wishlist ${enWishlist ? 'active' : ''}`}
            onClick={(e) => onAlternarWishlist(e, producto.codigo)}
          >
            <span className="material-symbols-outlined">star</span>
          </button>
        )}
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre} className="card-img" />
        ) : (
          <span className="card-icono">{producto.nombre.charAt(0).toUpperCase()}</span>
        )}
        <span className="card-codigo">{producto.codigo}</span>
      </div>
      <span className="card-categoria">{producto.categoria}</span>
      <h3 className="card-titulo">{producto.nombre}</h3>
      <p className="card-descripcion">{producto.descripcion}</p>
      <hr className="card-divisor" />
      <div className="card-footer">
        <span className="card-precio">${producto.precio}</span>
        <span className={`card-stock ${producto.stock <= 5 ? 'stock-bajo' : ''}`}>
          {sinStock ? 'Agotado' : producto.stock <= 5 ? '¡Últimas unidades!' : `Stock: ${producto.stock}`}
        </span>
      </div>
      <button
        className={`btn-agregar ${enCarrito ? 'btn-agregado' : ''}`}
        onClick={(e) => onAlternarCarrito(e, producto.codigo)}
        disabled={!enCarrito && sinStock}
      >
        {enCarrito ? 'Quitar del carrito' : sinStock ? 'Sin stock' : 'Agregar al carrito'}
      </button>
    </div>
  );
}

export default ProductoCard;
