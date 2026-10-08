import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
    collection, query, orderBy, writeBatch 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCgumyzzsQy77pJ270BjyO5-aJQJI3ZO4o",
    authDomain: "la-batitienda.firebaseapp.com",
    projectId: "la-batitienda",
    storageBucket: "la-batitienda.firebasestorage.app",
    messagingSenderId: "990894708844",
    appId: "1:990894708844:web:da2a04f4541ab56baa2049"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const adminBody = document.getElementById("adminBody");
const listaProductosAdmin = document.getElementById("listaProductosAdmin");
const contenedorNuevoProducto = document.getElementById("contenedorNuevoProducto");
const toastNotificacion = document.getElementById("toastNotificacion");
const toastMensaje = document.getElementById("toastMensaje");

const btnImportarJS = document.getElementById("btnImportarJS");
const btnConfirmarNuevos = document.getElementById("btnConfirmarNuevos");
const btnConfirmarRepetidos = document.getElementById("btnConfirmarRepetidos");
const btnExportarProdJS = document.getElementById("btnExportarProdJS");
const btnExportarCatJS = document.getElementById("btnExportarCatJS");

const textoConfirmarBorrado = document.getElementById("textoConfirmarBorrado");
const btnConfirmarBorradoActivo = document.getElementById("btnConfirmarBorradoActivo");

let modalNuevosInstancia = null;
let modalRepetidosInstancia = null;
let modalBorradoInstancia = null;

let productosNuevosMigrar = [];
let productosRepetidosMigrar = [];
let productosEnFirestore = [];

let toastTimeout;
let itemAEliminar = null;
let tipoEliminacion = "";
let botonEliminarDOM = null;

function mostrarToast(mensaje) {
    toastMensaje.textContent = mensaje;
    toastNotificacion.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastNotificacion.classList.remove("show");
    }, 3000);
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const docSnap = await getDoc(doc(db, "usuarios", user.uid));
            if (docSnap.exists() && docSnap.data().rol === "admin") {
                adminBody.style.display = "block";
                cargarInventario();
            } else {
                window.location.replace("index.html");
            }
        } catch (error) {
            window.location.replace("index.html");
        }
    } else {
        window.location.replace("index.html");
    }
});

function generarPlantillaProducto(prod, esNuevo = false) {
    const idUnico = esNuevo ? "nuevo" : prod.id;
    const claseExtra = esNuevo ? "nuevo-producto" : "";
    const textoBoton = esNuevo ? "Añadir Artículo" : "Actualizar Artículo";
    const colorBoton = esNuevo ? "btn-success" : "btn-warning";
    
    return `
        <div class="admin-prod-card ${claseExtra} row g-3 align-items-center" id="card-${idUnico}">
            <div class="col-md-2 text-center">
                <img src="${prod.imagen || ''}" id="img-${idUnico}" class="admin-img-preview" alt="Vista previa">
                <input type="url" id="val-img-${idUnico}" class="form-control admin-input" value="${prod.imagen || ''}" placeholder="URL Imagen" oninput="document.getElementById('img-${idUnico}').src = this.value">
            </div>
            <div class="col-md-10">
                <div class="row g-2 mb-2">
                    <div class="col-sm-2">
                        <label class="admin-label">ID (Núm)</label>
                        <input type="number" id="val-id-${idUnico}" class="form-control admin-input" value="${prod.id || ''}">
                    </div>
                    <div class="col-sm-2">
                        <label class="admin-label">Código</label>
                        <input type="text" id="val-cod-${idUnico}" class="form-control admin-input" value="${prod.codigo || ''}">
                    </div>
                    <div class="col-sm-4">
                        <label class="admin-label">Nombre</label>
                        <input type="text" id="val-nom-${idUnico}" class="form-control admin-input" value="${prod.nombre || ''}">
                    </div>
                    <div class="col-sm-4">
                        <label class="admin-label">Categoría</label>
                        <input type="text" id="val-cat-${idUnico}" class="form-control admin-input" value="${prod.categoria || ''}">
                    </div>
                </div>
                <div class="row g-2 mb-2">
                    <div class="col-sm-3">
                        <label class="admin-label">Marca</label>
                        <input type="text" id="val-mar-${idUnico}" class="form-control admin-input" value="${prod.marca || ''}">
                    </div>
                    <div class="col-sm-3">
                        <label class="admin-label">Modelo</label>
                        <input type="text" id="val-mod-${idUnico}" class="form-control admin-input" value="${prod.modelo || ''}">
                    </div>
                    <div class="col-sm-3">
                        <label class="admin-label">Precio</label>
                        <input type="number" id="val-pre-${idUnico}" class="form-control admin-input" value="${prod.precio || ''}">
                    </div>
                    <div class="col-sm-3">
                        <label class="admin-label">Stock</label>
                        <input type="number" id="val-sto-${idUnico}" class="form-control admin-input" value="${prod.stock || ''}">
                    </div>
                </div>
                <div class="row g-2 align-items-end">
                    <div class="col-sm-9">
                        <label class="admin-label">Descripción</label>
                        <textarea id="val-des-${idUnico}" class="form-control admin-input" rows="1">${prod.descripcion || ''}</textarea>
                    </div>
                    <div class="col-sm-3 text-end">
                        <button class="btn ${colorBoton} fw-bold w-100 btn-guardar-prod" data-original-id="${esNuevo ? 'nuevo' : prod.id}" style="font-size: 0.85rem;">
                            ${textoBoton}
                        </button>
                        ${!esNuevo ? `<button class="btn btn-outline-danger fw-bold w-100 mt-2 btn-eliminar-prod" data-original-id="${prod.id}" style="font-size: 0.85rem;">Eliminar</button>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function cargarInventario() {
    listaProductosAdmin.innerHTML = "<div class='text-center py-5 text-white fw-bold'>Cargando inventario...</div>";
    productosEnFirestore = [];

    try {
        const q = query(collection(db, "productos"), orderBy("id", "asc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            listaProductosAdmin.innerHTML = "<div class='text-center py-5 text-muted fw-bold'>No hay productos en la base de datos. ¡Importa o añade uno!</div>";
        } else {
            listaProductosAdmin.innerHTML = "";
            querySnapshot.forEach((doc) => {
                const prodData = doc.data();
                productosEnFirestore.push(prodData);
                listaProductosAdmin.innerHTML += generarPlantillaProducto(prodData, false);
            });
        }
        
        contenedorNuevoProducto.innerHTML = generarPlantillaProducto({}, true);
        asignarEventosBotones();
        
    } catch (error) {
        listaProductosAdmin.innerHTML = "<div class='text-danger text-center fw-bold'>Error al cargar los datos. Revisa permisos.</div>";
    }
}

function validarYExtraerDatos(idInput) {
    const pId = parseInt(document.getElementById(`val-id-${idInput}`).value);
    const pCod = document.getElementById(`val-cod-${idInput}`).value.trim();
    const pNom = document.getElementById(`val-nom-${idInput}`).value.trim();
    
    if (isNaN(pId) || pCod === "" || pNom === "") return null;

    return {
        id: pId,
        codigo: pCod,
        nombre: pNom,
        categoria: document.getElementById(`val-cat-${idInput}`).value.trim(),
        marca: document.getElementById(`val-mar-${idInput}`).value.trim(),
        modelo: document.getElementById(`val-mod-${idInput}`).value.trim(),
        precio: parseInt(document.getElementById(`val-pre-${idInput}`).value) || 0,
        stock: parseInt(document.getElementById(`val-sto-${idInput}`).value) || 0,
        descripcion: document.getElementById(`val-des-${idInput}`).value.trim(),
        imagen: document.getElementById(`val-img-${idInput}`).value.trim()
    };
}

async function guardarProducto(e) {
    const btn = e.target;
    const idOriginal = btn.dataset.originalId;
    const esNuevo = idOriginal === "nuevo";
    
    const datosNuevos = validarYExtraerDatos(idOriginal);
    
    if (!datosNuevos) {
        mostrarToast("Faltan datos obligatorios (ID, Código o Nombre).");
        return;
    }

    const idRepetido = productosEnFirestore.find(p => p.id === datosNuevos.id && p.id.toString() !== idOriginal.toString());
    const codRepetido = productosEnFirestore.find(p => p.codigo === datosNuevos.codigo && p.id.toString() !== idOriginal.toString());

    if (idRepetido) return mostrarToast("¡Error! Ya existe un artículo con ese mismo ID numérico.");
    if (codRepetido) return mostrarToast("¡Error! Ya existe un artículo con ese mismo Código.");

    btn.disabled = true;
    btn.textContent = "Procesando...";

    try {
        const docRef = doc(db, "productos", datosNuevos.id.toString());
        
        if (esNuevo) {
            await setDoc(docRef, datosNuevos);
            mostrarToast("¡Producto añadido con éxito!");
            cargarInventario();
        } else {
            if (idOriginal.toString() !== datosNuevos.id.toString()) {
                const docRefViejo = doc(db, "productos", idOriginal.toString());
                const batch = writeBatch(db);
                batch.delete(docRefViejo);
                batch.set(docRef, datosNuevos);
                await batch.commit();
                cargarInventario(); 
            } else {
                await updateDoc(docRef, datosNuevos);
                const index = productosEnFirestore.findIndex(p => p.id.toString() === idOriginal.toString());
                if(index > -1) productosEnFirestore[index] = datosNuevos;
            }
            mostrarToast("¡Producto actualizado correctamente!");
            btn.disabled = false;
            btn.textContent = "Actualizar Artículo";
        }
    } catch (error) {
        mostrarToast("Error de permisos en la base de datos.");
        btn.disabled = false;
    }
}

function eliminarProducto(e) {
    itemAEliminar = e.target.dataset.originalId;
    tipoEliminacion = "producto";
    botonEliminarDOM = e.target;
    textoConfirmarBorrado.textContent = "¿Estás seguro de que deseas eliminar este producto permanentemente?";
    btnConfirmarBorradoActivo.textContent = "Eliminar";
    btnConfirmarBorradoActivo.className = "btn btn-danger fw-bold";
    
    if (!modalBorradoInstancia) {
        modalBorradoInstancia = new bootstrap.Modal(document.getElementById('modalConfirmarBorrado'));
    }
    modalBorradoInstancia.show();
}

btnConfirmarBorradoActivo.addEventListener("click", async () => {
    modalBorradoInstancia.hide();
    
    if (tipoEliminacion === "producto") {
        botonEliminarDOM.disabled = true;
        botonEliminarDOM.textContent = "Borrando...";
        
        try {
            await deleteDoc(doc(db, "productos", itemAEliminar.toString()));
            mostrarToast("Producto eliminado con éxito.");
            cargarInventario();
        } catch (error) {
            mostrarToast("Error al eliminar el producto.");
            botonEliminarDOM.disabled = false;
            botonEliminarDOM.textContent = "Eliminar";
        }
    } else if (tipoEliminacion === "categoria") {
        delete categoriasEnMemoria[itemAEliminar];
        renderizarCategorias();
    } else if (tipoEliminacion === "importar_categorias") {
        try {
            await setDoc(doc(db, "configuracion", "categorias"), mapaCategorias);
            mostrarToast("¡Importación exitosa!");
            cargarCategorias();
        } catch (e) {
            mostrarToast("Error en la importación.");
        }
    }
});

function asignarEventosBotones() {
    document.querySelectorAll('.btn-guardar-prod').forEach(btn => btn.addEventListener('click', guardarProducto));
    document.querySelectorAll('.btn-eliminar-prod').forEach(btn => btn.addEventListener('click', eliminarProducto));
}

btnImportarJS.addEventListener("click", () => {
    if (typeof productos === "undefined" || productos.length === 0) {
        mostrarToast("No se encontró información en productos.js");
        return;
    }

    productosNuevosMigrar = [];
    productosRepetidosMigrar = [];

    productos.forEach(prodLocal => {
        const existe = productosEnFirestore.some(p => p.id === prodLocal.id);
        if (existe) {
            productosRepetidosMigrar.push(prodLocal);
        } else {
            productosNuevosMigrar.push(prodLocal);
        }
    });

    if (productosNuevosMigrar.length > 0) {
        document.getElementById("cantNuevos").textContent = productosNuevosMigrar.length;
        if (!modalNuevosInstancia) modalNuevosInstancia = new bootstrap.Modal(document.getElementById('modalImportarNuevos'));
        modalNuevosInstancia.show();
    } else if (productosRepetidosMigrar.length > 0) {
        lanzarModalRepetidos();
    } else {
        mostrarToast("No hay datos nuevos para importar.");
    }
});

function lanzarModalRepetidos() {
    document.getElementById("cantRepetidos").textContent = productosRepetidosMigrar.length;
    if (!modalRepetidosInstancia) modalRepetidosInstancia = new bootstrap.Modal(document.getElementById('modalImportarRepetidos'));
    modalRepetidosInstancia.show();
}

async function procesarLoteMigracion(arregloProductos, mensajeExito) {
    try {
        const batch = writeBatch(db);
        arregloProductos.forEach(prod => {
            const docRef = doc(db, "productos", prod.id.toString());
            batch.set(docRef, prod); 
        });
        await batch.commit();
        mostrarToast(mensajeExito);
        cargarInventario();
    } catch (error) {
        mostrarToast("Error al importar los datos.");
    }
}

btnConfirmarNuevos.addEventListener("click", async () => {
    btnConfirmarNuevos.disabled = true;
    await procesarLoteMigracion(productosNuevosMigrar, `¡Se añadieron ${productosNuevosMigrar.length} productos nuevos!`);
    modalNuevosInstancia.hide();
    btnConfirmarNuevos.disabled = false;
    
    if (productosRepetidosMigrar.length > 0) {
        setTimeout(lanzarModalRepetidos, 500);
    }
});

btnConfirmarRepetidos.addEventListener("click", async () => {
    btnConfirmarRepetidos.disabled = true;
    await procesarLoteMigracion(productosRepetidosMigrar, `¡Se actualizaron ${productosRepetidosMigrar.length} productos!`);
    modalRepetidosInstancia.hide();
    btnConfirmarRepetidos.disabled = false;
});

const btnTabProductos = document.getElementById("btnTabProductos");
const btnTabCategorias = document.getElementById("btnTabCategorias");
const seccionProductos = document.getElementById("seccionProductos");
const seccionCategorias = document.getElementById("seccionCategorias");
const listaCategoriasAdmin = document.getElementById("listaCategoriasAdmin");
const btnImportarCatJS = document.getElementById("btnImportarCatJS");
const btnGuardarCategoriasGlobal = document.getElementById("btnGuardarCategoriasGlobal");

let categoriasEnMemoria = {};

btnTabProductos.addEventListener("click", () => {
    btnTabProductos.classList.add("active");
    btnTabCategorias.classList.remove("active");
    seccionProductos.classList.remove("d-none");
    seccionCategorias.classList.add("d-none");
});

btnTabCategorias.addEventListener("click", () => {
    btnTabCategorias.classList.add("active");
    btnTabProductos.classList.remove("active");
    seccionCategorias.classList.remove("d-none");
    seccionProductos.classList.add("d-none");
    cargarCategorias();
});

async function cargarCategorias() {
    try {
        const docSnap = await getDoc(doc(db, "configuracion", "categorias"));
        categoriasEnMemoria = docSnap.exists() ? docSnap.data() : {};
        renderizarCategorias();
    } catch (error) {
        listaCategoriasAdmin.innerHTML = "<div class='text-danger text-center fw-bold'>Error al cargar categorías.</div>";
    }
}

function renderizarCategorias() {
    listaCategoriasAdmin.innerHTML = "";
    
    const ordenDeseado = ["Figuras", "Peluches", "Juegos", "Libros", "Otros"];
    const llavesOrdenadas = Object.keys(categoriasEnMemoria).sort((a, b) => {
        let indexA = ordenDeseado.indexOf(a);
        let indexB = ordenDeseado.indexOf(b);
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;
        return indexA - indexB;
    });

    for (const llave of llavesOrdenadas) {
        const datos = categoriasEnMemoria[llave];
        let miniaturasHTML = "";
        
        datos.codigos.forEach((codigo, index) => {
            const prod = productosEnFirestore.find(p => p.codigo === codigo);
            const imgSrc = prod && prod.imagen ? prod.imagen : "https://via.placeholder.com/48/2c2c2c/f5c500?text=" + codigo;
            miniaturasHTML += `
                <div class="admin-mini-img-wrapper">
                    <img src="${imgSrc}" class="admin-mini-img" title="${codigo}">
                    <button class="btn-mini-remove" data-cat="${llave}" data-index="${index}">×</button>
                </div>
            `;
        });

        listaCategoriasAdmin.innerHTML += `
            <div class="admin-prod-card">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h4 class="h6 text-amarillo fw-bold mb-0">Categoría: ${llave}</h4>
                    <button class="btn btn-outline-danger btn-sm fw-bold btn-borrar-cat" data-cat="${llave}">Eliminar Categoría</button>
                </div>
                <div class="row g-2 mb-3">
                    <div class="col-sm-4">
                        <label class="admin-label">Título</label>
                        <input type="text" class="form-control admin-input val-cat-tit" data-cat="${llave}" value="${datos.titulo}">
                    </div>
                    <div class="col-sm-8">
                        <label class="admin-label">Descripción</label>
                        <input type="text" class="form-control admin-input val-cat-des" data-cat="${llave}" value="${datos.descripcion}">
                    </div>
                </div>
                <div class="bg-dark p-2 rounded mb-2 border border-secondary">
                    <label class="admin-label d-block mb-2">Productos (Códigos)</label>
                    <div>${miniaturasHTML || "<span class='small text-muted'>Vacio</span>"}</div>
                </div>
                <div class="row g-2 align-items-end">
                    <div class="col-sm-9">
                        <label class="admin-label">Añadir Código de Producto</label>
                        <input type="text" id="nuevoCod-${llave}" class="form-control admin-input" placeholder="Ej: FG001">
                    </div>
                    <div class="col-sm-3">
                        <button class="btn btn-outline-warning w-100 fw-bold btn-add-cod" data-cat="${llave}">Añadir</button>
                    </div>
                </div>
            </div>
        `;
    }
    asignarEventosCategorias();
}

function asignarEventosCategorias() {
    document.querySelectorAll('.val-cat-tit').forEach(i => i.addEventListener('input', e => categoriasEnMemoria[e.target.dataset.cat].titulo = e.target.value));
    document.querySelectorAll('.val-cat-des').forEach(i => i.addEventListener('input', e => categoriasEnMemoria[e.target.dataset.cat].descripcion = e.target.value));
    
    document.querySelectorAll('.btn-add-cod').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const llave = e.target.dataset.cat;
            const input = document.getElementById(`nuevoCod-${llave}`);
            const val = input.value.trim();
            if(val) { categoriasEnMemoria[llave].codigos.push(val); renderizarCategorias(); }
        });
    });

    document.querySelectorAll('.btn-mini-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const llave = e.target.dataset.cat;
            const idx = e.target.dataset.index;
            categoriasEnMemoria[llave].codigos.splice(idx, 1);
            renderizarCategorias();
        });
    });

    document.querySelectorAll('.btn-borrar-cat').forEach(btn => {
        btn.addEventListener('click', (e) => {
            itemAEliminar = e.target.dataset.cat;
            tipoEliminacion = "categoria";
            textoConfirmarBorrado.textContent = `¿Estás seguro de eliminar la categoría: ${itemAEliminar}?`;
            btnConfirmarBorradoActivo.textContent = "Eliminar";
            btnConfirmarBorradoActivo.className = "btn btn-danger fw-bold";
            
            if (!modalBorradoInstancia) {
                modalBorradoInstancia = new bootstrap.Modal(document.getElementById('modalConfirmarBorrado'));
            }
            modalBorradoInstancia.show();
        });
    });
}

document.getElementById("btnCrearCategoria").addEventListener("click", () => {
    const id = document.getElementById("nuevaCatId").value.trim();
    if(id && !categoriasEnMemoria[id]) {
        categoriasEnMemoria[id] = {
            titulo: document.getElementById("nuevaCatTitulo").value.trim(),
            descripcion: document.getElementById("nuevaCatDesc").value.trim(),
            codigos: []
        };
        document.getElementById("nuevaCatId").value = "";
        document.getElementById("nuevaCatTitulo").value = "";
        document.getElementById("nuevaCatDesc").value = "";
        renderizarCategorias();
    }
});

btnGuardarCategoriasGlobal.addEventListener("click", async () => {
    btnGuardarCategoriasGlobal.disabled = true;
    btnGuardarCategoriasGlobal.textContent = "Guardando...";
    try {
        await setDoc(doc(db, "configuracion", "categorias"), categoriasEnMemoria);
        mostrarToast("Categorías actualizadas en la base de datos.");
    } catch (e) {
        mostrarToast("Error al guardar las categorías.");
    }
    btnGuardarCategoriasGlobal.disabled = false;
    btnGuardarCategoriasGlobal.innerHTML = `<span class="material-symbols-outlined me-2">save</span> Actualizar Cambios`;
});

btnImportarCatJS.addEventListener("click", () => {
    if (typeof mapaCategorias === "undefined") return mostrarToast("No se encontró el archivo de categorías.");
    
    tipoEliminacion = "importar_categorias";
    textoConfirmarBorrado.textContent = "¿Deseas sobreescribir la base de datos con tu archivo categorias.js local?";
    btnConfirmarBorradoActivo.textContent = "Sobreescribir";
    btnConfirmarBorradoActivo.className = "btn btn-warning fw-bold";

    if (!modalBorradoInstancia) {
        modalBorradoInstancia = new bootstrap.Modal(document.getElementById('modalConfirmarBorrado'));
    }
    modalBorradoInstancia.show();
});

function exportarArchivoJS(nombreArchivo, nombreVariable, datos) {
    const contenido = `const ${nombreVariable} = ${JSON.stringify(datos, null, 4)};`;
    const blob = new Blob([contenido], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

btnExportarProdJS.addEventListener("click", () => {
    if (productosEnFirestore.length === 0) return mostrarToast("No hay productos para exportar.");
    exportarArchivoJS("productos.js", "productos", productosEnFirestore);
    mostrarToast("Exportando productos...");
});

btnExportarCatJS.addEventListener("click", () => {
    if (Object.keys(categoriasEnMemoria).length === 0) return mostrarToast("No hay categorías para exportar.");
    exportarArchivoJS("categorias.js", "mapaCategorias", categoriasEnMemoria);
    mostrarToast("Exportando categorías...");
});