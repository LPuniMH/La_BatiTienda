import { useState } from 'react'
import { useNavigate } from 'react-router'

function Registro({ setNombre }) {
  const [nombreIngresado, setNombreIngresado] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()

    if (!nombreIngresado.trim()) {
      setError('Escribe tu nombre para continuar.')
      return
    }

    setNombre(nombreIngresado.trim())
    navigate('/perfil')
  }

  return (
    <>
      <h1>Registro de estudiante</h1>
      <p>Solo necesitamos tu nombre para comenzar.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="nombre">Nombre</label>
        <input
          id="nombre"
          type="text"
          autoComplete="given-name"
          placeholder="Ej: Camila"
          value={nombreIngresado}
          onChange={(event) => {
            setNombreIngresado(event.target.value)
            setError('')
          }}
          aria-describedby={error ? 'error-nombre' : undefined}
          aria-invalid={Boolean(error)}
        />
        {error && <p id="error-nombre" className="error" role="alert">{error}</p>}
        <button type="submit">Guardar y ver mi perfil</button>
      </form>
    </>
  )
}

export default Registro
