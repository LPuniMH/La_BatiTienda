function ModalConfirmacion({
  visible,
  titulo = 'Confirmar Acción',
  textoConfirmar = 'Eliminar',
  deshabilitado = false,
  onCancelar,
  onConfirmar,
  children
}) {
  if (!visible) return null;

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-dark text-white border-danger">
            <div className="modal-header border-secondary">
              <h5 className="modal-title text-danger fw-bold">{titulo}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onCancelar}></button>
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-secondary" onClick={onCancelar}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger fw-bold" onClick={onConfirmar} disabled={deshabilitado}>
                {textoConfirmar}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}

export default ModalConfirmacion;
