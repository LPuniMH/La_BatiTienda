import { useState, useEffect } from 'react';

function AdminProductoRow({ producto, esNuevo, onGuardar, onEliminar }) {
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

export default AdminProductoRow;
