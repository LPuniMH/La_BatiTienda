function ToastNotificacion({ toast }) {
  return (
    <div className="toast-container-fixed">
      <div className={`toast-custom d-flex align-items-center ${toast?.visible ? 'show' : ''}`}>
        <span className="material-symbols-outlined me-2 text-amarillo">info</span>
        <span>{toast?.mensaje}</span>
      </div>
    </div>
  );
}

export default ToastNotificacion;
