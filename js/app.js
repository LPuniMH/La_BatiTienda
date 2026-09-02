//Elementos html a usar
const contenedorProductos = document.getElementById("contenedorProductos");
const inputBuscar = document.getElementById("buscarProducto");
const selectCategoria = document.getElementById("filtroCategoria");

//sello visual temporal
function obtenerInicial(nombre) {
    return nombre.charAt(0).toUpperCase();
}

//Se dibujan las cajas de productos en el contenedor
function renderizarProductos(listaProductos) {
    contenedorProductos.innerHTML = "";

    listaProductos.forEach(function (producto) {
        const caja = document.createElement("div");
        caja.className = "card";

        caja.innerHTML = `
            <div class="card-visual">
                <span class="card-icono">${obtenerInicial(producto.nombre)}</span>
                <span class="card-codigo">${producto.codigo}</span>
            </div>
            <p class="card-pie-foto">Foto próximamente</p>

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

//Pobla el select de categorías con las categorías unicas de los productos
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

// Filtra los productos según el texto ingresado y la categoría seleccionada
function filtrarProductos() {
    const texto = inputBuscar.value.toLowerCase();
    const categoriaElegida = selectCategoria.value;

    const productosFiltrados = productos.filter(function (producto) {
        const coincideNombre = producto.nombre.toLowerCase().includes(texto);
        const coincideCategoria = categoriaElegida === "todos" || producto.categoria === categoriaElegida;

        return coincideNombre && coincideCategoria;
    });

    renderizarProductos(productosFiltrados);
}

// Cada vez que se escribe en el input o se cambia la categoría, se filtran los productos
inputBuscar.addEventListener("input", filtrarProductos);
selectCategoria.addEventListener("change", filtrarProductos);

// Al cargar la página: llenamos el select y mostramos todos los productos
poblarCategorias();
renderizarProductos(productos);