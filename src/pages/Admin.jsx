import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
    doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
    collection, query, orderBy, writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase';
import '../admin.css';

function ProductoRow({ producto, esNuevo, onGuardar, onEliminar }) {
  const [form, setForm] = useState(producto);

  useEffect(() => {
    setForm(producto);
  }, [producto]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className={`admin-prod-card ${esNuevo ? 'nuevo-producto' : ''} row g-3 align-items-center`}>
      <div className="col-md-2 text-center">
        <img src={form.imagen || 'https://via.placeholder.com/120/1a1a1a/f5c500?text=IMG'} className="admin-img-preview" alt="Vista previa" />
        <input type="url" name="imagen" className="form-control admin-input" value={form.imagen || ''} placeholder="URL Imagen" onChange={handleChange} />
      </div>
      <div className="col-md-10">
        <div className="row g-2 mb-2">
          <div className="col-sm-2">
            <label className="admin-label">ID (Núm)</label>
            <input type="number" name="id" className="form-control admin-input" value={form.id || ''} onChange={handleChange} />
          </div>
          <div className="col-sm-2">
            <label className="admin-label">Código</label>
            <input type="text" name="codigo" className="form-control admin-input" value={form.codigo || ''} onChange={handleChange} />
          </div>
          <div className="col-sm-4">
            <label className="admin-label">Nombre</label>
            <input type="text" name="nombre" className="form-control admin-input" value={form.nombre || ''} onChange={handleChange} />
          </div>
          <div className="col-sm-4">
            <label className="admin-label">Categoría</label>
            <input type="text" name="categoria" className="form-control admin-input" value={form.categoria || ''} onChange={handleChange} />
          </div>
        </div>
        <div className="row g-2 mb-2">
          <div className="col-sm-3">
            <label className="admin-label">Marca</label>
            <input type="text" name="marca" className="form-control admin-input" value={form.marca || ''} onChange={handleChange} />
          </div>
          <div className="col-sm-3">
            <label className="admin-label">Modelo</label>
            <input type="text" name="modelo" className="form-control admin-input" value={form.modelo || ''} onChange={handleChange} />
          </div>
          <div className="col-sm-3">
            <label className="admin-label">Precio</label>
            <input type="number" name="precio" className="form-control admin-input" value={form.precio || ''} onChange={handleChange} />
          </div>
          <div className="col-sm-3">
            <label className="admin-label">Stock</label>
            <input type="number" name="stock" className="form-control admin-input" value={form.stock || ''} onChange={handleChange} />
          </div>
        </div>
        <div className="row g-2 align-items-end">
          <div className="col-sm-9">
            <label className="admin-label">Descripción</label>
            <textarea name="descripcion" className="form-control admin-input" rows="1" value={form.descripcion || ''} onChange={handleChange}></textarea>
          </div>
          <div className="col-sm-3 text-end">
            <button className={`btn ${esNuevo ? 'btn-success' : 'btn-warning'} fw-bold w-100`} style={{ fontSize: '0.85rem' }} onClick={() => onGuardar(form, esNuevo, producto.id)}>
              {esNuevo ? 'Añadir Artículo' : 'Actualizar Artículo'}
            </button>
            {!esNuevo && (
              <button className="btn btn-outline-danger fw-bold w-100 mt-2" style={{ fontSize: '0.85rem' }} onClick={() => onEliminar(producto.id)}>
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoriaRow({ llave, datos, productosNube, onUpdate, onEliminar }) {
  const [form, setForm] = useState(datos);
  const [nuevoCod, setNuevoCod] = useState('');

  useEffect(() => {
    setForm(datos);
  }, [datos]);

  const handleChange = (e) => {
    const act = { ...form, [e.target.name]: e.target.value };
    setForm(act);
    onUpdate(llave, act);
  };

  const addCod = () => {
    if (nuevoCod.trim()) {
      const act = { ...form, codigos: [...form.codigos, nuevoCod.trim()] };
      setForm(act);
      onUpdate(llave, act);
      setNuevoCod('');
    }
  };

  const removeCod = (idx) => {
    const act = { ...form, codigos: form.codigos.filter((_, i) => i !== idx) };
    setForm(act);
    onUpdate(llave, act);
  };

  return (
    <div className="admin-prod-card">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4 className="h6 text-amarillo fw-bold mb-0">Categoría: {llave}</h4>
        <button className="btn btn-outline-danger btn-sm fw-bold" onClick={() => onEliminar(llave)}>Eliminar Categoría</button>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-sm-4">
          <label className="admin-label">Título</label>
          <input type="text" name="titulo" className="form-control admin-input" value={form.titulo} onChange={handleChange} />
        </div>
        <div className="col-sm-8">
          <label className="admin-label">Descripción</label>
          <input type="text" name="descripcion" className="form-control admin-input" value={form.descripcion} onChange={handleChange} />
        </div>
      </div>
      <div className="bg-dark p-2 rounded mb-2 border border-secondary">
        <label className="admin-label d-block mb-2">Productos (Códigos)</label>
        <div>
          {form.codigos.length === 0 ? <span className="small text-muted">Vacio</span> : form.codigos.map((cod, idx) => {
            const prod = productosNube.find(p => p.codigo === cod);
            const imgSrc = prod && prod.imagen ? prod.imagen : `https://via.placeholder.com/48/2c2c2c/f5c500?text=${cod}`;
            return (
              <div className="admin-mini-img-wrapper" key={`${cod}-${idx}`}>
                <img src={imgSrc} className="admin-mini-img" title={cod} alt={cod} />
                <button className="btn-mini-remove" onClick={() => removeCod(idx)}>×</button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="row g-2 align-items-end">
        <div className="col-sm-9">
          <label className="admin-label">Añadir Código de Producto</label>
          <input type="text" className="form-control admin-input" placeholder="Ej: FG001" value={nuevoCod} onChange={(e) => setNuevoCod(e.target.value)} />
        </div>
        <div className="col-sm-3">
          <button className="btn btn-outline-warning w-100 fw-bold" onClick={addCod}>Añadir</button>
        </div>
      </div>
    </div>
  );
}

function Admin({ usuarioActual, rol }) {
  const navigate = useNavigate();
  const [tabActivo, setTabActivo] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardandoCat, setGuardandoCat] = useState(false);
  
  const nuevoProductoBase = { id: '', codigo: '', nombre: '', categoria: '', marca: '', modelo: '', precio: '', stock: '', descripcion: '', imagen: '' };
  const [nuevoProducto, setNuevoProducto] = useState(nuevoProductoBase);
  
  const [nuevaCatId, setNuevaCatId] = useState('');
  const [nuevaCatTitulo, setNuevaCatTitulo] = useState('');
  const [nuevaCatDesc, setNuevaCatDesc] = useState('');

  const [toast, setToast] = useState({ visible: false, mensaje: '' });
  const [modalBorrado, setModalBorrado] = useState({ visible: false, id: null, tipo: '', texto: '' });

  useEffect(() => {
    if (!usuarioActual || rol !== "admin") {
      navigate('/');
    } else {
      cargarDatos();
    }
  }, [usuarioActual, rol, navigate]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const q = query(collection(db, "productos"), orderBy("id", "asc"));
      const querySnapshot = await getDocs(q);
      const prods = [];
      querySnapshot.forEach(doc => prods.push(doc.data()));
      setProductos(prods);

      const docCat = await getDoc(doc(db, "configuracion", "categorias"));
      if (docCat.exists()) {
        setCategorias(docCat.data());
      }
    } catch (error) {
      mostrarToast("Error al cargar la base de datos.");
    }
    setCargando(false);
  };

  const mostrarToast = (mensaje) => {
    setToast({ visible: true, mensaje });
    setTimeout(() => setToast({ visible: false, mensaje: '' }), 3000);
  };

  const guardarProducto = async (datos, esNuevo, idOriginal) => {
    const pId = parseInt(datos.id);
    const pCod = datos.codigo?.trim();
    const pNom = datos.nombre?.trim();

    if (isNaN(pId) || !pCod || !pNom) return mostrarToast("Faltan datos obligatorios (ID, Código o Nombre).");

    const objFinal = { 
      ...datos, 
      id: pId, 
      precio: parseInt(datos.precio) || 0, 
      stock: parseInt(datos.stock) || 0,
      codigo: pCod,
      nombre: pNom
    };

    const idRepetido = productos.find(p => p.id === pId && p.id.toString() !== idOriginal?.toString());
    const codRepetido = productos.find(p => p.codigo === pCod && p.id.toString() !== idOriginal?.toString());

    if (idRepetido) return mostrarToast("¡Error! Ya existe un artículo con ese mismo ID numérico.");
    if (codRepetido) return mostrarToast("¡Error! Ya existe un artículo con ese mismo Código.");

    try {
      const docRef = doc(db, "productos", pId.toString());
      if (esNuevo) {
        await setDoc(docRef, objFinal);
        mostrarToast("¡Producto añadido con éxito!");
        setNuevoProducto(nuevoProductoBase);
        cargarDatos();
      } else {
        if (idOriginal.toString() !== pId.toString()) {
          const batch = writeBatch(db);
          batch.delete(doc(db, "productos", idOriginal.toString()));
          batch.set(docRef, objFinal);
          await batch.commit();
        } else {
          await updateDoc(docRef, objFinal);
        }
        mostrarToast("¡Producto actualizado correctamente!");
        cargarDatos();
      }
    } catch (error) {
      mostrarToast("Error de permisos en la base de datos.");
    }
  };

  const actualizarCategoriaState = (llave, datosNuevos) => {
    setCategorias(prev => ({ ...prev, [llave]: datosNuevos }));
  };

  const crearCategoria = () => {
    const id = nuevaCatId.trim();
    if (id && !categorias[id]) {
      setCategorias(prev => ({
        ...prev,
        [id]: { titulo: nuevaCatTitulo.trim(), descripcion: nuevaCatDesc.trim(), codigos: [] }
      }));
      setNuevaCatId('');
      setNuevaCatTitulo('');
      setNuevaCatDesc('');
    }
  };

  const guardarCategoriasGlobal = async () => {
    setGuardandoCat(true);
    try {
      await setDoc(doc(db, "configuracion", "categorias"), categorias);
      mostrarToast("Categorías actualizadas en la base de datos.");
    } catch (error) {
      mostrarToast("Error al guardar las categorías.");
    }
    setGuardandoCat(false);
  };

  const solicitarBorradoProducto = (id) => {
    setModalBorrado({ visible: true, id, tipo: 'producto', texto: '¿Estás seguro de que deseas eliminar este producto permanentemente?' });
  };

  const solicitarBorradoCategoria = (llave) => {
    setModalBorrado({ visible: true, id: llave, tipo: 'categoria', texto: `¿Estás seguro de eliminar la categoría: ${llave}?` });
  };

  const confirmarBorrado = async () => {
    const { id, tipo } = modalBorrado;
    setModalBorrado({ visible: false, id: null, tipo: '', texto: '' });

    if (tipo === 'producto') {
      try {
        await deleteDoc(doc(db, "productos", id.toString()));
        mostrarToast("Producto eliminado con éxito.");
        cargarDatos();
      } catch (error) {
        mostrarToast("Error al eliminar el producto.");
      }
    } else if (tipo === 'categoria') {
      const nuevasCat = { ...categorias };
      delete nuevasCat[id];
      setCategorias(nuevasCat);
    }
  };

  const ordenDeseado = ["Figuras", "Peluches", "Juegos", "Libros", "Otros"];
  const llavesCatOrdenadas = Object.keys(categorias).sort((a, b) => {
    let indexA = ordenDeseado.indexOf(a);
    let indexB = ordenDeseado.indexOf(b);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    return indexA - indexB;
  });

  return (
    <>
      <main className="cart-main max-width-container mx-auto px-3">
        <div className="cart-header d-flex align-items-center gap-3 mb-4">
          <div className="titulo-caja">
            <h1 className="h4 mb-0 fw-bold text-amarillo">
              <span className="material-symbols-outlined align-middle me-2">admin_panel_settings</span>Panel de Control
            </h1>
          </div>
        </div>

        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="list-group cart-menu mb-4">
              <button className={`list-group-item list-group-item-action d-flex align-items-center ${tabActivo === 'productos' ? 'active' : ''}`} onClick={() => setTabActivo('productos')}>
                <span className="material-symbols-outlined me-2">inventory_2</span> Productos
              </button>
              <button className={`list-group-item list-group-item-action d-flex align-items-center ${tabActivo === 'categorias' ? 'active' : ''}`} onClick={() => setTabActivo('categorias')}>
                <span className="material-symbols-outlined me-2">category</span> Categorías
              </button>
            </div>
          </div>

          <div className="col-md-9">
            {tabActivo === 'productos' && (
              <div className="cart-content-box">
                <h2 className="h5 mb-4 text-amarillo fw-bold">Gestión del Inventario</h2>
                <div className="d-flex flex-column gap-4">
                  {cargando ? (
                    <div className="text-center py-5 text-white fw-bold">Cargando inventario...</div>
                  ) : productos.length === 0 ? (
                    <div className="text-center py-5 text-muted fw-bold">No hay productos en la base de datos. ¡Añade uno!</div>
                  ) : (
                    productos.map(prod => (
                      <ProductoRow key={prod.id} producto={prod} esNuevo={false} onGuardar={guardarProducto} onEliminar={solicitarBorradoProducto} />
                    ))
                  )}
                </div>
                <hr className="border-secondary my-5" />
                <h3 className="h5 mb-4 text-amarillo fw-bold">Añadir Nuevo Producto</h3>
                <ProductoRow producto={nuevoProducto} esNuevo={true} onGuardar={guardarProducto} />
              </div>
            )}

            {tabActivo === 'categorias' && (
              <div className="cart-content-box">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
                  <h2 className="h5 text-amarillo fw-bold mb-0">Gestión de Categorías</h2>
                  <button className="btn btn-success fw-bold d-flex align-items-center" onClick={guardarCategoriasGlobal} disabled={guardandoCat}>
                    <span className="material-symbols-outlined me-2">save</span> {guardandoCat ? 'Guardando...' : 'Actualizar Cambios'}
                  </button>
                </div>
                <div className="d-flex flex-column gap-4">
                  {cargando ? (
                    <div className="text-center py-5 text-white fw-bold">Cargando categorías...</div>
                  ) : (
                    llavesCatOrdenadas.map(llave => (
                      <CategoriaRow key={llave} llave={llave} datos={categorias[llave]} productosNube={productos} onUpdate={actualizarCategoriaState} onEliminar={solicitarBorradoCategoria} />
                    ))
                  )}
                </div>
                <hr className="border-secondary my-5" />
                <h3 className="h5 mb-4 text-amarillo fw-bold">Añadir Nueva Categoría</h3>
                <div className="admin-prod-card row g-3 align-items-end">
                  <div className="col-sm-3">
                    <label className="admin-label">ID (Nombre interno)</label>
                    <input type="text" className="form-control admin-input" placeholder="Ej: Ropa" value={nuevaCatId} onChange={(e) => setNuevaCatId(e.target.value)} />
                  </div>
                  <div className="col-sm-3">
                    <label className="admin-label">Título a mostrar</label>
                    <input type="text" className="form-control admin-input" value={nuevaCatTitulo} onChange={(e) => setNuevaCatTitulo(e.target.value)} />
                  </div>
                  <div className="col-sm-4">
                    <label className="admin-label">Descripción</label>
                    <input type="text" className="form-control admin-input" value={nuevaCatDesc} onChange={(e) => setNuevaCatDesc(e.target.value)} />
                  </div>
                  <div className="col-sm-2 text-end">
                    <button className="btn btn-warning fw-bold w-100" style={{ fontSize: '0.85rem' }} onClick={crearCategoria}>Añadir</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {modalBorrado.visible && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content bg-dark text-white border-danger">
                <div className="modal-header border-secondary">
                  <h5 className="modal-title text-danger fw-bold">Confirmar Acción</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setModalBorrado({ ...modalBorrado, visible: false })}></button>
                </div>
                <div className="modal-body">
                  <p>{modalBorrado.texto}</p>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalBorrado({ ...modalBorrado, visible: false })}>Cancelar</button>
                  <button type="button" className="btn btn-danger fw-bold" onClick={confirmarBorrado}>Eliminar</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      <div className="toast-container-fixed">
        <div className={`toast-custom d-flex align-items-center ${toast.visible ? 'show' : ''}`}>
          <span className="material-symbols-outlined me-2 text-amarillo">info</span>
          <span>{toast.mensaje}</span>
        </div>
      </div>
    </>
  );
}

export default Admin;