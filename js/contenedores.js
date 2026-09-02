document.addEventListener("DOMContentLoaded", () => {
    // Barra de navegación
    const navContenedor = document.getElementById("nav-batitienda");
    if (navContenedor) {
        fetch("nav.html")
            .then(respuesta => respuesta.text())
            .then(html => navContenedor.innerHTML = html);
    }

    // Footer
    const footerContenedor = document.getElementById("footer-batitienda");
    if (footerContenedor) {
        fetch("footer.html")
            .then(respuesta => respuesta.text())
            .then(html => footerContenedor.innerHTML = html);
    }
});
