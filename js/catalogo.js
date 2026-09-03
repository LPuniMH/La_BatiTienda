const contenedorProductos = document.getElementById("contenedorProductos");
const inputBuscar = document.getElementById("buscarProducto");
const selectCategoria = document.getElementById("filtroCategoria");
const parametrosURL = new URLSearchParams(window.location.search);
const categoriaURL = parametrosURL.get('cat');

function obtenerInicial(nombre) {
    return nombre.charAt(0).toUpperCase();
}

function renderizarProductos(listaProductos) {
    contenedorProductos.innerHTML = "";

    listaProductos.forEach(function (producto) {
        const caja = document.createElement("div");
        caja.className = "card";

        caja.innerHTML = `
            <div class="card-visual">
              ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}" class="card-img">` 
                                : `<span class="card-icono">${obtenerInicial(producto.nombre)}</span>`
                  }
              <span class="card-codigo">${producto.codigo}</span>
            </div>
           
            <span class="card-categoria">${producto.categoria}</span>
            <h3 class="card-titulo">${producto.nombre}</h3>
            <p class="card-descripcion">${producto.descripcion}</p>

            <hr class="card-divisor">

            <div class="card-footer">
                <span class="card-precio">$${producto.precio}</span>
                <span class="card-stock ${producto.stock <= 5 ? "stock-bajo" : ""}">
                    ${producto.stock <= 5 ? "¡Últimas unidades!" : "Stock: " + producto.stock}
                </span>
            </div>

            <button class="btn-agregar">Agregar al carrito</button>
        `;

        contenedorProductos.appendChild(caja);
    });
}

function poblarCategorias() {
    const todasLasCategorias = productos.map(function (producto) {
        return producto.categoria;
    });

    const categoriasUnicas = [...new Set(todasLasCategorias)];

    categoriasUnicas.forEach(function (categoria) {
        const opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.textContent = categoria;
        selectCategoria.appendChild(opcion);
    });
}

function filtrarProductos() {
    const texto = inputBuscar.value.toLowerCase();
    const filtroElegido = selectCategoria.value;

    const productosFiltrados = productos.filter(function (producto) {
        const coincideNombre = producto.nombre.toLowerCase().includes(texto);
        const coincideFiltro = filtroElegido === "todos" || producto.categoria === filtroElegido;
        
        let coincideCategoriaPrincipal = true;
        if (categoriaURL && mapaCategorias[categoriaURL]) {
            coincideCategoriaPrincipal = mapaCategorias[categoriaURL].codigos.includes(producto.codigo);
        }

        return coincideNombre && coincideFiltro && coincideCategoriaPrincipal;
    });

    renderizarProductos(productosFiltrados);
}

function activarEnlaceNavbar() {
    const intervaloNav = setInterval(() => {
        const enlaces = document.querySelectorAll('.main-navigation .nav-link');
        if (enlaces.length > 0) {
            clearInterval(intervaloNav);
            const rutaActual = window.location.pathname;

            enlaces.forEach(enlace => {
                const href = enlace.getAttribute('href');
                
                if (categoriaURL && href.includes(`cat=${categoriaURL}`)) {
                    enlace.classList.add('active');
                } else if (!categoriaURL && rutaActual.includes('catalogo.html') && href === 'catalogo.html') {
                    enlace.classList.add('active');
                }
            });
        }
    }, 100);
}

function actualizarTextosCabecera() {
    const tituloElemento = document.getElementById("tituloCatalogo");
    const descElemento = document.getElementById("descCatalogo");

    if (categoriaURL && mapaCategorias[categoriaURL]) {
        tituloElemento.textContent = mapaCategorias[categoriaURL].titulo;
        descElemento.textContent = mapaCategorias[categoriaURL].descripcion;
    } else {
        tituloElemento.textContent = "Nuestro catálogo";
        descElemento.textContent = "Kuromi, anime, figuras, peluches y superhéroes";
    }
}

inputBuscar.addEventListener("input", filtrarProductos);
selectCategoria.addEventListener("change", filtrarProductos);

poblarCategorias();
filtrarProductos();
activarEnlaceNavbar();
actualizarTextosCabecera();
