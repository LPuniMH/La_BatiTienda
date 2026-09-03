(function () {
    //Elementos html a usar
    const formularioLogin = document.getElementById("loginForm");
    const inputUsuario = document.getElementById("usuario");
    const inputPassword = document.getElementById("password");
    const checkRecordar = document.getElementById("recordar");
    const botonTogglePassword = document.getElementById("togglePassword");
    const iconoTogglePassword = document.getElementById("iconoTogglePassword");
    const botonIngresar = document.getElementById("botonIngresar");
    const feedbackLogin = document.getElementById("loginFeedback");
    const errorUsuario = document.getElementById("errorUsuario");
    const errorPassword = document.getElementById("errorPassword");

    // Si esta página no tiene el formulario de login, no hace nada (evita errores en otras páginas)
    if (!formularioLogin) return;

    //Revisa si el texto ingresado tiene forma de correo válido (ej: nombre@dominio.com)
    function esCorreoValido(texto) {
        return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(texto);
    }

    //Muestra u oculta un mensaje de error debajo de un campo
    function mostrarError(input, elementoError, mensaje) {
        input.classList.toggle("login-input-invalido", Boolean(mensaje));
        elementoError.textContent = mensaje || "";
    }

    //Muestra un mensaje general arriba del botón (éxito o error)
    function mostrarFeedback(mensaje, tipo) {
        feedbackLogin.textContent = mensaje;
        feedbackLogin.classList.remove("login-feedback-exito", "login-feedback-error");
        if (tipo) {
            feedbackLogin.classList.add(tipo === "exito" ? "login-feedback-exito" : "login-feedback-error");
        }
    }

    //Valida usuario y contraseña, mostrando los errores correspondientes
    function validarFormulario() {
        let esValido = true;
        const usuarioIngresado = inputUsuario.value.trim();

        if (usuarioIngresado === "") {
            mostrarError(inputUsuario, errorUsuario, "Ingresa tu correo");
            esValido = false;
        } else if (!esCorreoValido(usuarioIngresado)) {
            mostrarError(inputUsuario, errorUsuario, "Ingresa un correo válido (ej: nombre@dominio.com)");
            esValido = false;
        } else {
            mostrarError(inputUsuario, errorUsuario, "");
        }

        // Alfanumérica (solo letras y números), mínimo 6 caracteres y al menos una mayúscula
        const passwordValida = /^(?=.*[A-Z])[A-Za-z0-9]{6,}$/.test(inputPassword.value);

        if (inputPassword.value === "") {
            mostrarError(inputPassword, errorPassword, "Ingresa tu contraseña");
            esValido = false;
        } else if (!passwordValida) {
            mostrarError(inputPassword, errorPassword, "Mínimo 6 caracteres, solo letras/números y al menos 1 mayúscula");
            esValido = false;
        } else {
            mostrarError(inputPassword, errorPassword, "");
        }

        return esValido;
    }

    //Muestra u oculta la contraseña al hacer clic en el ícono
    function alternarVisibilidadPassword() {
        const esTexto = inputPassword.type === "text";
        inputPassword.type = esTexto ? "password" : "text";
        iconoTogglePassword.textContent = esTexto ? "visibility" : "visibility_off";
    }

    //Guarda o borra el usuario recordado en el navegador
    function manejarRecordarUsuario(usuario, recordar) {
        if (recordar) {
            localStorage.setItem("batitienda_usuario_recordado", usuario);
        } else {
            localStorage.removeItem("batitienda_usuario_recordado");
        }
    }

    //Si había un usuario recordado, se precarga al abrir la página
    function precargarUsuarioRecordado() {
        const usuarioGuardado = localStorage.getItem("batitienda_usuario_recordado");
        if (usuarioGuardado) {
            inputUsuario.value = usuarioGuardado;
            checkRecordar.checked = true;
        }
    }

    //Envío del formulario: valida, simula el ingreso y da feedback visual
    function manejarEnvioLogin(evento) {
        evento.preventDefault();

        if (!validarFormulario()) {
            mostrarFeedback("Revisa los campos marcados en rojo", "error");
            return;
        }

        manejarRecordarUsuario(inputUsuario.value.trim(), checkRecordar.checked);

        botonIngresar.disabled = true;
        botonIngresar.textContent = "Ingresando...";
        mostrarFeedback("", "");

        setTimeout(function () {
            mostrarFeedback("¡Bienvenido a la Baticueva!", "exito");
            window.location.href = "index.html";
        }, 800);
    }

    botonTogglePassword.addEventListener("click", alternarVisibilidadPassword);
    formularioLogin.addEventListener("submit", manejarEnvioLogin);

    inputUsuario.addEventListener("input", function () {
        mostrarError(inputUsuario, errorUsuario, "");
    });
    inputPassword.addEventListener("input", function () {
        mostrarError(inputPassword, errorPassword, "");
    });

    precargarUsuarioRecordado();
})();