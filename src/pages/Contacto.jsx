import { useState } from 'react';
import '../contacto.css';

function Contacto() {
  const [formulario, setFormulario] = useState({
    nombre: '',
    correo: '',
    motivo: '',
    pedido: '',
    mensaje: ''
  });

  const [errores, setErrores] = useState({
    nombre: '',
    correo: '',
    motivo: '',
    pedido: '',
    mensaje: ''
  });

  const [feedback, setFeedback] = useState({ texto: '', tipo: '' });
  const [procesando, setProcesando] = useState(false);

  const LARGO_MINIMO_MENSAJE = 15;

  const esCorreoValido = (texto) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(texto);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
    setErrores({ ...errores, [name]: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let esValido = true;
    let nuevosErrores = { nombre: '', correo: '', motivo: '', pedido: '', mensaje: '' };

    if (formulario.nombre.trim() === "") {
      nuevosErrores.nombre = "Ingresa tu nombre completo";
      esValido = false;
    }

    const correoIngresado = formulario.correo.trim();
    if (correoIngresado === "") {
      nuevosErrores.correo = "Ingresa tu correo";
      esValido = false;
    } else if (!esCorreoValido(correoIngresado)) {
      nuevosErrores.correo = "Ingresa un correo válido (ej: nombre@dominio.com)";
      esValido = false;
    }

    if (formulario.motivo === "") {
      nuevosErrores.motivo = "Selecciona un motivo de contacto";
      esValido = false;
    }

    if (formulario.pedido.trim() === "") {
      nuevosErrores.pedido = "Ingresa el número de pedido";
      esValido = false;
    }

    const mensajeIngresado = formulario.mensaje.trim();
    if (mensajeIngresado === "") {
      nuevosErrores.mensaje = "Cuéntanos qué pasó";
      esValido = false;
    } else if (mensajeIngresado.length < LARGO_MINIMO_MENSAJE) {
      nuevosErrores.mensaje = `Danos un poco más de detalle (mínimo ${LARGO_MINIMO_MENSAJE} caracteres)`;
      esValido = false;
    }

    setErrores(nuevosErrores);

    if (!esValido) {
      setFeedback({ texto: "Revisa los campos marcados en rojo", tipo: "error" });
      return;
    }

    setProcesando(true);
    setFeedback({ texto: '', tipo: '' });

    setTimeout(() => {
      setFeedback({ texto: "¡Batiseñal mandada! Te responderemos a tu correo a la brevedad.", tipo: "exito" });
      setProcesando(false);
      setFormulario({ nombre: '', correo: '', motivo: '', pedido: '', mensaje: '' });
    }, 800);
  };

  return (
    <div className="contenedor-principal">
      <div className="contacto-encabezado">
        <h1 className="h3 mb-1">Soporte y contacto</h1>
        <p className="peque-desc mb-0">¿Tienes un problema con tu pedido o alguna duda? Cuéntanos y te respondemos a la brevedad.</p>
      </div>

      <div className="contacto-card">
        <form className="contacto-form" onSubmit={handleSubmit} noValidate>
          <div className="row">
            <div className="col-md-6 mb-1 text-start">
              <label htmlFor="nombre" className="form-label contacto-label">Nombre completo</label>
              <input 
                type="text" 
                id="nombre" 
                name="nombre" 
                className={`form-control contacto-input ${errores.nombre ? 'contacto-input-invalido' : ''}`} 
                placeholder="Bruce Wayne" 
                autoComplete="name" 
                value={formulario.nombre} 
                onChange={handleChange} 
              />
              <p className="contacto-error">{errores.nombre}</p>
            </div>

            <div className="col-md-6 mb-1 text-start">
              <label htmlFor="correo" className="form-label contacto-label">Correo electrónico</label>
              <input 
                type="email" 
                id="correo" 
                name="correo" 
                className={`form-control contacto-input ${errores.correo ? 'contacto-input-invalido' : ''}`} 
                placeholder="bruce.wayne@wayneenterprises.com" 
                autoComplete="email" 
                value={formulario.correo} 
                onChange={handleChange} 
              />
              <p className="contacto-error">{errores.correo}</p>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-1 text-start">
              <label htmlFor="motivo" className="form-label contacto-label">Motivo de contacto</label>
              <select 
                id="motivo" 
                name="motivo" 
                className={`form-select contacto-input ${errores.motivo ? 'contacto-input-invalido' : ''}`} 
                value={formulario.motivo} 
                onChange={handleChange}
              >
                <option value="" disabled>Selecciona un motivo</option>
                <option value="consulta">Consulta general</option>
                <option value="pedido">Estado de mi pedido</option>
                <option value="producto">Problema con un producto</option>
                <option value="reclamo">Reclamo</option>
                <option value="sugerencia">Sugerencia</option>
                <option value="otro">Otro</option>
              </select>
              <p className="contacto-error">{errores.motivo}</p>
            </div>

            <div className="col-md-6 mb-1 text-start">
              <label htmlFor="pedido" className="form-label contacto-label">N° de pedido</label>
              <input 
                type="text" 
                id="pedido" 
                name="pedido" 
                className={`form-control contacto-input ${errores.pedido ? 'contacto-input-invalido' : ''}`} 
                placeholder="Ej: BT-00123" 
                value={formulario.pedido} 
                onChange={handleChange} 
              />
              <p className="contacto-error">{errores.pedido}</p>
            </div>
          </div>

          <div className="mb-1 text-start">
            <label htmlFor="mensaje" className="form-label contacto-label">Cuéntanos qué pasó</label>
            <textarea 
              id="mensaje" 
              name="mensaje" 
              className={`form-control contacto-input contacto-textarea ${errores.mensaje ? 'contacto-input-invalido' : ''}`} 
              rows="5" 
              placeholder="Describe tu consulta o problema con el mayor detalle posible..." 
              value={formulario.mensaje} 
              onChange={handleChange}
            ></textarea>
            <p className="contacto-error">{errores.mensaje}</p>
          </div>

          <p className={`contacto-feedback ${feedback.tipo === 'exito' ? 'contacto-feedback-exito' : feedback.tipo === 'error' ? 'contacto-feedback-error' : ''}`}>
            {feedback.texto}
          </p>

          <button type="submit" className="btn w-100 contacto-btn" disabled={procesando}>
            {procesando ? "Enviando..." : "Enviar mensaje"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contacto;