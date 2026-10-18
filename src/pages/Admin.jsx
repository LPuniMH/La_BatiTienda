import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { 
    doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
    collection, query, orderBy, writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase';
import '../admin.css';

function ProductoRow({ producto, esNuevo, onGuardar, onEliminar }) {
  const [form, setForm] = useState(producto);

  useEffect(() => { setForm(producto); }, [producto]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

  useEffect(() => { setForm(datos); }, [datos]);

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
  const [tabActivo, setTabActivo] = useState('dashboard');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState({});
  
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [listaOrdenes, setListaOrdenes] = useState([]);
  
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalOrdenes, setTotalOrdenes] = useState(0);
  const [totalVentas, setTotalVentas] = useState(0);

  const [cargando, setCargando] = useState(true);
  const [guardandoCat, setGuardandoCat] = useState(false);
  
  const nuevoProductoBase = { id: '', codigo: '', nombre: '', categoria: '', marca: '', modelo: '', precio: '', stock: '', descripcion: '', imagen: '' };
  const [nuevoProducto, setNuevoProducto] = useState(nuevoProductoBase);
  
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [busquedaCategoria, setBusquedaCategoria] = useState('');
  const [busquedaOrden, setBusquedaOrden] = useState('');
  const [busquedaUsuario, setBusquedaUsuario] = useState('');

  const [toast, setToast] = useState({ visible: false, mensaje: '' });
  const [modalBorrado, setModalBorrado] = useState({ visible: false, id: null, tipo: '', texto: '' });

  useEffect(() => {
    if (!usuarioActual || !['admin', 'owner'].includes(rol)) {
      navigate('/');
    } else {
      cargarDatos();
    }
  }, [usuarioActual, rol, navigate]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const qProductos = query(collection(db, "productos"), orderBy("id", "asc"));
      const snapProductos = await getDocs(qProductos);
      const prods = [];
      snapProductos.forEach(doc => prods.push(doc.data()));
      setProductos(prods);

      const docCat = await getDoc(doc(db, "configuracion", "categorias"));
      if (docCat.exists()) setCategorias(docCat.data());

      const snapUsuarios = await getDocs(collection(db, "usuarios"));
      const arrUsuarios = [];
      snapUsuarios.forEach(doc => arrUsuarios.push({ id: doc.id, ...doc.data() }));
      setListaUsuarios(arrUsuarios);
      setTotalUsuarios(arrUsuarios.length);

      const snapPedidos = await getDocs(collection(db, "pedidos"));
      const arrPedidos = [];
      let ventasAcumuladas = 0;
      snapPedidos.forEach(doc => {
        const data = doc.data();
        arrPedidos.push({ id: doc.id, ...data });
        ventasAcumuladas += data.total || 0;
      });
      
      arrPedidos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setListaOrdenes(arrPedidos);
      setTotalOrdenes(arrPedidos.length);
      setTotalVentas(ventasAcumuladas);

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

    if (isNaN(pId) || !pCod || !pNom) return mostrarToast("Faltan datos obligatorios.");

    const objFinal = { 
      ...datos, id: pId, precio: parseInt(datos.precio) || 0, stock: parseInt(datos.stock) || 0, codigo: pCod, nombre: pNom
    };

    const idRepetido = productos.find(p => p.id === pId && p.id.toString() !== idOriginal?.toString());
    const codRepetido = productos.find(p => p.codigo === pCod && p.id.toString() !== idOriginal?.toString());

    if (idRepetido) return mostrarToast("¡Error! Ya existe un artículo con ese ID numérico.");
    if (codRepetido) return mostrarToast("¡Error! Ya existe un artículo con ese Código.");

    try {
      const docRef = doc(db, "productos", pId.toString());
      if (esNuevo) {
        await setDoc(docRef, objFinal);
        mostrarToast("¡Producto añadido con éxito!");
        setNuevoProducto(nuevoProductoBase);
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
      }
      cargarDatos();
    } catch (error) {
      mostrarToast("Error de permisos.");
    }
  };

  const actualizarCategoriaState = (llave, datosNuevos) => {
    setCategorias(prev => ({ ...prev, [llave]: datosNuevos }));
  };

  const guardarCategoriasGlobal = async () => {
    setGuardandoCat(true);
    try {
      await setDoc(doc(db, "configuracion", "categorias"), categorias);
      mostrarToast("Categorías actualizadas.");
    } catch (error) {
      mostrarToast("Error al guardar.");
    }
    setGuardandoCat(false);
  };

  const cambiarEstadoPedido = async (idPedido, nuevoEstado) => {
    try {
      await updateDoc(doc(db, "pedidos", idPedido), { estado: nuevoEstado });
      setListaOrdenes(listaOrdenes.map(p => p.id === idPedido ? { ...p, estado: nuevoEstado } : p));
      mostrarToast("Estado del pedido actualizado.");
    } catch (e) {
      mostrarToast("Error al actualizar estado.");
    }
  };

  const cambiarRolUsuario = async (uid, nuevoRol) => {
    try {
      await updateDoc(doc(db, "usuarios", uid), { rol: nuevoRol });
      setListaUsuarios(listaUsuarios.map(u => u.id === uid ? { ...u, rol: nuevoRol } : u));
      mostrarToast("Rol de usuario actualizado.");
    } catch (e) {
      mostrarToast("Error al actualizar rol.");
    }
  };

  const solicitarBorradoProducto = (id) => setModalBorrado({ visible: true, id, tipo: 'producto', texto: '¿Eliminar producto permanentemente?' });
  const solicitarBorradoCategoria = (llave) => setModalBorrado({ visible: true, id: llave, tipo: 'categoria', texto: `¿Eliminar categoría: ${llave}?` });

  const confirmarBorrado = async () => {
    const { id, tipo } = modalBorrado;
    setModalBorrado({ visible: false, id: null, tipo: '', texto: '' });
    if (tipo === 'producto') {
      try {
        await deleteDoc(doc(db, "productos", id.toString()));
        mostrarToast("Producto eliminado.");
        cargarDatos();
      } catch (error) {
        mostrarToast("Error al eliminar.");
      }
    } else if (tipo === 'categoria') {
      const nuevasCat = { ...categorias };
      delete nuevasCat[id];
      setCategorias(nuevasCat);
    }
  };

  const ordenDeseado = ["Figuras", "Peluches", "Juegos", "Libros", "Otros"];
  const llavesCatOrdenadas = Object.keys(categorias).sort((a, b) => {
    let indexA = ordenDeseado.indexOf(a), indexB = ordenDeseado.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) || p.codigo.toLowerCase().includes(busquedaProducto.toLowerCase()));
  const categoriasFiltradas = llavesCatOrdenadas.filter(llave => llave.toLowerCase().includes(busquedaCategoria.toLowerCase()) || categorias[llave].titulo.toLowerCase().includes(busquedaCategoria.toLowerCase()));
  
  const ordenesFiltradas = listaOrdenes.filter(o => 
    o.id.toLowerCase().includes(busquedaOrden.toLowerCase()) ||
    o.cliente?.nombre?.toLowerCase().includes(busquedaOrden.toLowerCase()) ||
    o.cliente?.correo?.toLowerCase().includes(busquedaOrden.toLowerCase())
  );

  const usuariosFiltrados = listaUsuarios.filter(u => 
    u.id.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    (u.nombre || '').toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    (u.rol || 'cliente').toLowerCase().includes(busquedaUsuario.toLowerCase())
  );

  return (
    <>
      <main className="cart-main max-width-container mx-auto px-3">
        <div className="cart-header d-flex align-items-center gap-3 mb-4">
          <div className="titulo-caja">
            <h1 className="h4 mb-0 fw-bold text-amarillo">
              <span className="material-symbols-outlined align-middle me-2">admin_panel_settings</span>Panel de Administración
            </h1>
          </div>
          {rol === 'owner' && <span className="badge bg-warning text-dark fw-bold ms-auto">Cuenta Owner</span>}
        </div>

        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="list-group cart-menu mb-4">
              <button className={`list-group-item list-group-item-action d-flex align-items-center ${tabActivo === 'dashboard' ? 'active' : ''}`} onClick={() => setTabActivo('dashboard')}>
                <span className="material-symbols-outlined me-2">dashboard</span> Dashboard
              </button>
              <button className={`list-group-item list-group-item-action d-flex align-items-center ${tabActivo === 'ordenes' ? 'active' : ''}`} onClick={() => setTabActivo('ordenes')}>
                <span className="material-symbols-outlined me-2">receipt_long</span> Órdenes
              </button>
              <button className={`list-group-item list-group-item-action d-flex align-items-center ${tabActivo === 'productos' ? 'active' : ''}`} onClick={() => setTabActivo('productos')}>
                <span className="material-symbols-outlined me-2">inventory_2</span> Productos
              </button>
              <button className={`list-group-item list-group-item-action d-flex align-items-center ${tabActivo === 'categorias' ? 'active' : ''}`} onClick={() => setTabActivo('categorias')}>
                <span className="material-symbols-outlined me-2">category</span> Categorías
              </button>
              <button className={`list-group-item list-group-item-action d-flex align-items-center ${tabActivo === 'usuarios' ? 'active' : ''}`} onClick={() => setTabActivo('usuarios')}>
                <span className="material-symbols-outlined me-2">group</span> Usuarios
              </button>
            </div>
          </div>

          <div className="col-md-9">
            {tabActivo === 'dashboard' && (
              <div className="cart-content-box">
                <h2 className="h5 mb-4 text-amarillo fw-bold">Dashboard - Resumen de Actividad</h2>
                <div className="row g-3 mb-5">
                  <div className="col-md-4">
                    <div className="p-4 rounded text-center shadow h-100 d-flex flex-column justify-content-center" style={{ backgroundColor: '#2b5797', border: '1px solid #3c78d8' }}>
                      <span className="material-symbols-outlined text-white display-4 mb-2">shopping_cart</span>
                      <h3 className="fw-bold text-white mb-0">{totalOrdenes}</h3>
                      <p className="text-white small mb-3">Compras Realizadas</p>
                      <div className="bg-dark rounded p-2 text-warning fw-bold small">Ingresos: ${totalVentas}</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-4 rounded text-center shadow h-100 d-flex flex-column justify-content-center" style={{ backgroundColor: '#1e7145', border: '1px solid #2d965d' }}>
                      <span className="material-symbols-outlined text-white display-4 mb-2">inventory_2</span>
                      <h3 className="fw-bold text-white mb-0">{productos.length}</h3>
                      <p className="text-white small mb-0">Productos en Catálogo</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-4 rounded text-center shadow h-100 d-flex flex-column justify-content-center" style={{ backgroundColor: '#b58900', border: '1px solid #dcb4ff' }}>
                      <span className="material-symbols-outlined text-white display-4 mb-2">group</span>
                      <h3 className="fw-bold text-white mb-0">{totalUsuarios}</h3>
                      <p className="text-white small mb-0 fw-bold">Usuarios Registrados</p>
                    </div>
                  </div>
                </div>
                <h3 className="h6 mb-3 text-white fw-bold">Accesos Rápidos</h3>
                <div className="row g-3">
                  <div className="col-sm-4">
                    <button className="btn btn-outline-light w-100 py-3 d-flex flex-column align-items-center" onClick={() => setTabActivo('ordenes')}>
                      <span className="material-symbols-outlined mb-2">receipt_long</span> Gestión de Órdenes
                    </button>
                  </div>
                  <div className="col-sm-4">
                    <button className="btn btn-outline-light w-100 py-3 d-flex flex-column align-items-center" onClick={() => setTabActivo('productos')}>
                      <span className="material-symbols-outlined mb-2">inventory_2</span> Inventario
                    </button>
                  </div>
                  <div className="col-sm-4">
                    <button className="btn btn-outline-light w-100 py-3 d-flex flex-column align-items-center" onClick={() => setTabActivo('usuarios')}>
                      <span className="material-symbols-outlined mb-2">manage_accounts</span> Control de Usuarios
                    </button>
                  </div>
                </div>
              </div>
            )}

            {tabActivo === 'ordenes' && (
              <div className="cart-content-box">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
                  <h2 className="h5 text-amarillo fw-bold mb-0">Gestión de Órdenes</h2>
                  <input type="text" className="form-control bg-dark text-white border-amarillo" style={{ maxWidth: '250px' }} placeholder="Buscar pedido..." value={busquedaOrden} onChange={(e) => setBusquedaOrden(e.target.value)} />
                </div>
                <div className="table-responsive pe-2" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                  <table className="table table-dark table-hover align-middle border-secondary mb-0">
                    <thead className="sticky-top bg-dark">
                      <tr>
                        <th>ID Pedido</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Boleta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordenesFiltradas.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-4">No se encontraron órdenes.</td></tr>
                      ) : (
                        ordenesFiltradas.map(orden => (
                          <tr key={orden.id}>
                            <td className="small text-amarillo fw-bold">{orden.id.substring(0, 8)}...</td>
                            <td className="small">{new Date(orden.fecha).toLocaleDateString()}</td>
                            <td>
                              <div className="fw-bold small">{orden.cliente?.nombre} {orden.cliente?.apellidos}</div>
                              <div className="text-amarillo" style={{ fontSize: '0.75rem' }}>{orden.cliente?.correo}</div>
                            </td>
                            <td className="text-white fw-bold">${orden.total}</td>
                            <td>
                              <select className="form-select form-select-sm bg-dark text-white border-secondary" value={orden.estado || 'Pendiente'} onChange={(e) => cambiarEstadoPedido(orden.id, e.target.value)}>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Pagado">Pagado</option>
                                <option value="Enviado">Enviado</option>
                                <option value="Entregado">Entregado</option>
                              </select>
                            </td>
                            <td>
                              <Link to={`/pago-exitoso/${orden.id}`} className="btn btn-sm btn-outline-warning" target="_blank">
                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>visibility</span>
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tabActivo === 'usuarios' && (
              <div className="cart-content-box">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
                  <h2 className="h5 text-amarillo fw-bold mb-0">Gestión de Usuarios</h2>
                  <input type="text" className="form-control bg-dark text-white border-amarillo" style={{ maxWidth: '250px' }} placeholder="Buscar usuario..." value={busquedaUsuario} onChange={(e) => setBusquedaUsuario(e.target.value)} />
                </div>
                <div className="table-responsive pe-2" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                  <table className="table table-dark table-hover align-middle border-secondary mb-0">
                    <thead className="sticky-top bg-dark">
                      <tr>
                        <th>ID Usuario</th>
                        <th>Nombre</th>
                        <th>Rol</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuariosFiltrados.length === 0 ? (
                        <tr><td colSpan="3" className="text-center py-4">No se encontraron usuarios.</td></tr>
                      ) : (
                        usuariosFiltrados.map(user => (
                          <tr key={user.id}>
                            <td className="small text-amarillo fw-bold">{user.id.substring(0, 12)}...</td>
                            <td className="fw-bold small text-white">{user.nombre || 'Usuario sin nombre guardado'}</td>
                            <td>
                              {rol === 'owner' && user.id !== usuarioActual.uid && user.rol !== 'owner' ? (
                                <select className="form-select form-select-sm bg-dark text-white border-secondary w-auto" value={user.rol || 'cliente'} onChange={(e) => cambiarRolUsuario(user.id, e.target.value)}>
                                  <option value="cliente">Cliente</option>
                                  <option value="admin">Administrador</option>
                                </select>
                              ) : (
                                <span className={`badge ${user.rol === 'owner' ? 'bg-warning text-dark' : user.rol === 'admin' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                                  {user.rol || 'cliente'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tabActivo === 'productos' && (
              <div className="cart-content-box">
                <h3 className="h5 mb-4 text-amarillo fw-bold">Añadir Nuevo Producto</h3>
                <ProductoRow producto={nuevoProducto} esNuevo={true} onGuardar={guardarProducto} />
                <hr className="border-secondary my-5" />
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
                  <h2 className="h5 text-amarillo fw-bold mb-0">Gestión del Inventario</h2>
                  <input type="text" className="form-control bg-dark text-white border-amarillo" style={{ maxWidth: '300px' }} placeholder="Buscar por nombre o código..." value={busquedaProducto} onChange={(e) => setBusquedaProducto(e.target.value)} />
                </div>
                <div className="d-flex flex-column gap-4 pe-2" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                  {cargando ? (
                    <div className="text-center py-5 text-white fw-bold">Cargando inventario...</div>
                  ) : productosFiltrados.length === 0 ? (
                    <div className="text-center py-5 text-white fw-bold">No se encontraron productos.</div>
                  ) : (
                    productosFiltrados.map(prod => <ProductoRow key={prod.id} producto={prod} esNuevo={false} onGuardar={guardarProducto} onEliminar={solicitarBorradoProducto} />)
                  )}
                </div>
              </div>
            )}

            {tabActivo === 'categorias' && (
              <div className="cart-content-box">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
                  <h2 className="h5 text-amarillo fw-bold mb-0">Gestión de Categorías</h2>
                  <div className="d-flex gap-2">
                    <input type="text" className="form-control bg-dark text-white border-amarillo" style={{ maxWidth: '250px' }} placeholder="Buscar categoría..." value={busquedaCategoria} onChange={(e) => setBusquedaCategoria(e.target.value)} />
                    <button className="btn btn-success fw-bold d-flex align-items-center" onClick={guardarCategoriasGlobal} disabled={guardandoCat}>
                      <span className="material-symbols-outlined me-2">save</span> {guardandoCat ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </div>
                <div className="d-flex flex-column gap-4 pe-2" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                  {cargando ? (
                    <div className="text-center py-5 text-white fw-bold">Cargando categorías...</div>
                  ) : categoriasFiltradas.length === 0 ? (
                    <div className="text-center py-5 text-white fw-bold">No se encontraron categorías.</div>
                  ) : (
                    categoriasFiltradas.map(llave => <CategoriaRow key={llave} llave={llave} datos={categorias[llave]} productosNube={productos} onUpdate={actualizarCategoriaState} onEliminar={solicitarBorradoCategoria} />)
                  )}
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
                <div className="modal-body"><p>{modalBorrado.texto}</p></div>
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