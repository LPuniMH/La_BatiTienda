import { Link } from 'react-router'

function Perfil({ nombre }) {
  return (
    <>
      <h1>Mi perfil</h1>
      {nombre ? (
        <>
          <p>Hola, <strong>{nombre}</strong>.</p>
          <p>Ya puedes comenzar a aprender React.</p>
        </>
      ) : (
        <>
          <p>Todavía no has registrado tu nombre.</p>
          <Link to="/registro">Ir al registro</Link>
        </>
      )}
    </>
  )
}

export default Perfil
