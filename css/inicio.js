const contenedorInicio = document.getElementById("contenedorInicio");

function obtenerInicial(nombre) {
    return nombre.charAt(0).toUpperCase();
}

function mezclarArray(array) {
    let indiceActual = array.length, indiceAleatorio;
    while (indiceActual !== 0) {
        indiceAleatorio = Math.floor(Math.random() * indiceActual);
        indiceActual--;
        [array[indiceActual], array[indiceAleatorio]] = [array[indiceAleatorio], array[indiceActual]];
    }
    return array;
}

function generarFilasInicio() {
    contenedorInicio.innerHTML = "";

    for (const [nombreCategoria, datosCategoria] of Object.entries(mapaCategorias)) {
        
        const productosDeCategoria = productos.filter(producto => datosCategoria.codigos.includes(producto.codigo));
        
        if (productosDeCategoria.length === 0) continue;

        const productosMezclados = mezclarArray([...productosDeCategoria]);
        const productosMostrar = productosMezclados.slice(0, 5);

        const fila = document.createElement("div");
        fila.className = "fila-categoria";

        const titulo = document.createElement("h2");
        titulo.className = "fila-titulo";
        titulo.textContent = datosCategoria.titulo;
        fila.appendChild(titulo);

        const scrollContainer = document.createElement("div");
        scrollContainer.className = "scroll-horizontal";

        productosMostrar.forEach(producto => {
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
            scrollContainer.appendChild(caja);
        });

        const tarjetaVerMas = document.createElement("a");
        tarjetaVerMas.href = `catalogo.html?cat=${nombreCategoria}`;
        tarjetaVerMas.className = "tarjeta-ver-mas";
        tarjetaVerMas.innerHTML = `<span>Ver más &#10140;</span>`;
        
        scrollContainer.appendChild(tarjetaVerMas);
        fila.appendChild(scrollContainer);
        contenedorInicio.appendChild(fila);
    }
}

generarFilasInicio();
