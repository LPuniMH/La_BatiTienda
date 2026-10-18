import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Categorias() {
  const [categorias, setCategorias] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const docCat = await getDoc(doc(db, "configuracion", "categorias"));
        if (docCat.exists()) {
          setCategorias(docCat.data());
        }
      } catch (error) {
        console.error(error);
      }
      setCargando(false);
    };
    cargarCategorias();
  }, []);

  const ordenDeseado = ["Figuras", "Peluches", "Juegos", "Libros", "Otros"];
  const llavesOrdenadas = Object.keys(categorias).sort((a, b) => {
    let idxA = ordenDeseado.indexOf(a);
    let idxB = ordenDeseado.indexOf(b);
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
  });

  if (cargando) return <div className="contenedor-principal text-center py-5 text-white">Cargando categorías...</div>;

  return (
    <div className="contenedor-principal">
      <div className="toolbar-productos text-center mb-5">
        <h1 className="text-amarillo fw-bold display-5 mb-2">Explora nuestras Categorías</h1>
        <p className="peque-desc fs-5">Encuentra exactamente lo que buscas en nuestras secciones especializadas.</p>
      </div>

      <div className="row g-4">
        {llavesOrdenadas.map(llave => {
          const cat = categorias[llave];
          return (
            <div className="col-md-6 col-lg-4" key={llave}>
              <Link to={`/catalogo?cat=${llave}`} className="text-decoration-none">
                <div className="card h-100 bg-dark border-amarillo p-4 text-center d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '250px', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                  <span className="material-symbols-outlined display-1 text-warning mb-3">
                    {llave === 'Figuras' ? 'action_key' : llave === 'Peluches' ? 'cruelty_free' : llave === 'Juegos' ? 'sports_esports' : llave === 'Libros' ? 'menu_book' : 'category'}
                  </span>
                  <h2 className="text-white fw-bold h3">{cat.titulo}</h2>
                  <p className="text-muted small mt-2">{cat.descripcion}</p>
                  <span className="btn btn-outline-warning mt-auto fw-bold rounded-pill px-4">Ver Catálogo</span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Categorias;