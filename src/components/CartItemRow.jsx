function CartItemRow({
  producto,
  mostrarEstadoStock = false,
  enCarrito = false,
  onAlternarCarrito,
  onEliminar
}) {
  return (
    <div className="cart-item">
      {producto.imagen ? (
        <img src={producto.imagen} alt={producto.nombre} className="cart-item-img" />
      ) : (
        <div className="cart-item-icono">{producto.nombre.charAt(0).toUpperCase()}</div>
      )}
      <div className="cart-item-info">
        <h4 className="h6 mb-1 text-white fw-bold">{producto.nombre}</h4>
        <p className="mb-0 text-amarillo fw-bold">
          ${producto.precio}
          {mostrarEstadoStock && producto.stock <= 0 && (
            <span className="badge bg-danger ms-2">Sin stock</span>
          )}
        </p>
      </div>
      {onAlternarCarrito && (
        <button
          className={`btn-toggle-cart ${enCarrito ? 'agregado' : ''}`}
          onClick={() => onAlternarCarrito(producto.codigo)}
        >
          <span className="material-symbols-outlined">shopping_cart</span>
        </button>
      )}
      <button
        className={`btn-eliminar-item ${onAlternarCarrito ? 'ms-2' : ''}`}
        onClick={() => onEliminar(producto.codigo)}
      >
        <span className="material-symbols-outlined">delete</span>
      </button>
    </div>
  );
}

export default CartItemRow;
