(function () {
    //Elementos html a usar
    const formularioContacto = document.getElementById("contactoForm");
    const inputNombre = document.getElementById("nombre");
    const inputCorreo = document.getElementById("correo");
    const selectMotivo = document.getElementById("motivo");
    const inputMensaje = document.getElementById("mensaje");
    const inputPedido = document.getElementById("pedido");
    const botonEnviar = document.getElementById("botonEnviar");
    const feedbackContacto = document.getElementById("contactoFeedback");
    const errorNombre = document.getElementById("errorNombre");
    const errorCorreo = document.getElementById("errorCorreo");
    const errorMotivo = document.getElementById("errorMotivo");
    const errorPedido = document.getElementById("errorPedido");
    const errorMensaje = document.getElementById("errorMensaje");

    // Si esta página no tiene el formulario de contacto, no hace nada
    if (!formularioContacto) return;

    const LARGO_MINIMO_MENSAJE = 15;

    //Revisa si el texto ingresado tiene forma de correo válido (ej: nombre@dominio.com)
    function esCorreoValido(texto) {
        return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(texto);
    }

    //Muestra u oculta un mensaje de error debajo de un campo
    function mostrarError(input, elementoError, mensaje) {
        if (input) {
            input.classList.toggle("contacto-input-invalido", Boolean(mensaje));
        }
        elementoError.textContent = mensaje || "";
    }

    //Muestra un mensaje general arriba del botón (éxito o error)
    function mostrarFeedback(mensaje, tipo) {
        feedbackContacto.textContent = mensaje;
        feedbackContacto.classList.remove("contacto-feedback-exito", "contacto-feedback-error");
        if (tipo) {
            feedbackContacto.classList.add(tipo === "exito" ? "contacto-feedback-exito" : "contacto-feedback-error");
        }
    }

    //Valida todos los campos del formulario, mostrando los errores correspondientes
    function validarFormulario() {
        let esValido = true;

        if (inputNombre.value.trim() === "") {
            mostrarError(inputNombre, errorNombre, "Ingresa tu nombre completo");
            esValido = false;
        } else {
            mostrarError(inputNombre, errorNombre, "");
        }

        const correoIngresado = inputCorreo.value.trim();
        if (correoIngresado === "") {
            mostrarError(inputCorreo, errorCorreo, "Ingresa tu correo");
            esValido = false;
        } else if (!esCorreoValido(correoIngresado)) {
            mostrarError(inputCorreo, errorCorreo, "Ingresa un correo válido (ej: nombre@dominio.com)");
            esValido = false;
        } else {
            mostrarError(inputCorreo, errorCorreo, "");
        }

        if (selectMotivo.value === "") {
            mostrarError(selectMotivo, errorMotivo, "Selecciona un motivo de contacto");
            esValido = false;
        } else {
            mostrarError(selectMotivo, errorMotivo, "");
        }

        if (inputPedido.value.trim() === "") {
            mostrarError(inputPedido, errorPedido, "Ingresa el número de pedido");
            esValido = false;
        } else {
            mostrarError(inputPedido, errorPedido, "");
        }

        const mensajeIngresado = inputMensaje.value.trim();
        if (mensajeIngresado === "") {
            mostrarError(inputMensaje, errorMensaje, "Cuéntanos qué pasó");
            esValido = false;
        } else if (mensajeIngresado.length < LARGO_MINIMO_MENSAJE) {
            mostrarError(inputMensaje, errorMensaje, "Danos un poco más de detalle (mínimo " + LARGO_MINIMO_MENSAJE + " caracteres)");
            esValido = false;
        } else {
            mostrarError(inputMensaje, errorMensaje, "");
        }

        return esValido;
    }

    //Envío del formulario: valida, simula el envío y da feedback visual
    function manejarEnvioContacto(evento) {
        evento.preventDefault();

        if (!validarFormulario()) {
            mostrarFeedback("Revisa los campos marcados en rojo", "error");
            return;
        }

        // Por ahora no hay backend conectado: se simula el envío
        botonEnviar.disabled = true;
        botonEnviar.textContent = "Enviando...";
        mostrarFeedback("", "");

        setTimeout(function () {
            mostrarFeedback("¡Batiseñal mandada! Te responderemos a tu correo a la brevedad.", "exito");
            botonEnviar.disabled = false;
            botonEnviar.textContent = "Enviar mensaje";
            formularioContacto.reset();
        }, 800);
    }

    formularioContacto.addEventListener("submit", manejarEnvioContacto);

    // Quita el error de un campo apenas el usuario empieza a corregirlo
    inputNombre.addEventListener("input", function () {
        mostrarError(inputNombre, errorNombre, "");
    });
    inputCorreo.addEventListener("input", function () {
        mostrarError(inputCorreo, errorCorreo, "");
    });
    selectMotivo.addEventListener("change", function () {
        mostrarError(selectMotivo, errorMotivo, "");
    });
    inputPedido.addEventListener("input", function () {
        mostrarError(inputPedido, errorPedido, "");
    });
    inputMensaje.addEventListener("input", function () {
        mostrarError(inputMensaje, errorMensaje, "");
    });
})();