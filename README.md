# Portal del estudiante

Un proyecto pequeño con React, Vite y JavaScript para una clase de navegación.
No tiene backend, autenticación ni base de datos. El registro solo guarda un nombre
en memoria: al recargar la página se pierde, igual que sucedería con un contexto
sin persistencia.

## Ejecutar

Usa Node.js 22.12 o superior (por ejemplo, Node 24).

```bash
npm install
npm run dev
```

Abre la dirección que indique Vite en la terminal.

```bash
npm run build
npm run preview
```

El primer comando compila el proyecto y el segundo permite revisar esa compilación.

## Archivos para explicar en clase

- `src/main.jsx`: BrowserRouter habilita la navegación para toda la aplicación.
- `src/App.jsx`: define las rutas y guarda el nombre con useState.
- `src/components/Navbar.jsx`: enlaces de navegación y saludo al estudiante.
- `src/pages/Inicio.jsx`: presentación y enlace al registro.
- `src/pages/Registro.jsx`: formulario que guarda el nombre y usa useNavigate.
- `src/pages/Perfil.jsx`: muestra el nombre recibido por props.

## Primera clase: useNavigate

1. Recorre Inicio, Registro y Mi perfil. Observa cómo cambia la URL.
2. Revisa BrowserRouter, Routes y Route para entender qué componente muestra cada ruta.
3. Abre Registro.jsx y ubica `const navigate = useNavigate()`.
4. Sigue handleSubmit: evita la recarga, valida el nombre, actualiza el estado y ejecuta `navigate('/perfil')`.
5. Prueba enviar un nombre vacío o solo espacios. No debe navegar.
6. Registra un nombre y comprueba que aparece en el perfil y en la barra superior.

Usamos Link cuando solo queremos ir a otra página. Usamos useNavigate cuando
necesitamos navegar desde una función, en este caso después de guardar el nombre.
useNavigate pertenece a React Router y debe usarse dentro de BrowserRouter.

Como ejercicio, agrega un botón «Volver» al formulario con `navigate(-1)`.
Ese valor retrocede una entrada en el historial: si alguien abrió la página
directamente, podría salir de la aplicación o no tener una página anterior.
Para regresar siempre al inicio, usa `navigate('/')`.

## Segunda clase: pasar de props a useContext

La base deja useContext pendiente para hacerlo con los estudiantes.
Actualmente App tiene el estado: Navbar y Perfil reciben nombre; Registro recibe
setNombre. Esto permite ver primero cómo se comparte un estado mediante props.
En una aplicación tan pequeña las props son suficientes; el contexto sirve aquí
como ejercicio para compartir los mismos datos desde distintos componentes.

Actividad sugerida:

1. Crea `src/context/UsuarioContext.jsx` y exporta un contexto con `createContext`.
2. En ese archivo crea un componente UsuarioProvider con el estado nombre.
3. Retorna el Provider del contexto con `value={{ nombre, setNombre }}` y sus children.
4. Envuelve App con UsuarioProvider en main.jsx, dentro de BrowserRouter.
5. En Navbar, Registro y Perfil importa el contexto y léelo con `useContext(UsuarioContext)`.
6. Elimina el estado y las props correspondientes de App.
7. Repite el registro: el comportamiento debería ser el mismo.

El contexto comparte el estado; useNavigate cambia de página. Son responsabilidades distintas.

Referencias: [Vite](https://vite.dev/guide/) y
[useNavigate en React Router](https://reactrouter.com/api/hooks/useNavigate).
