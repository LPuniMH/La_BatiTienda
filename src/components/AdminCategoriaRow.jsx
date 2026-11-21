import { useState, useEffect } from 'react';

function AdminCategoriaRow({ llave, datos, productosNube, onUpdate, onEliminar }) {
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

export default AdminCategoriaRow;
