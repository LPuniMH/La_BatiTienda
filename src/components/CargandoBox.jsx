function CargandoBox({ texto = 'Cargando...' }) {
  return (
    <div className="cargando-box d-flex align-items-center justify-content-center my-4">
      <div className="spinner-border text-warning me-3" role="status" aria-hidden="true"></div>
      <span className="text-white fw-bold fs-5">{texto}</span>
    </div>
  );
}

export default CargandoBox;
