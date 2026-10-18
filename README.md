# La BatiTienda

Para correr este proyecto en tu entorno local, asegúrate de tener instalado [Node.js](https://nodejs.org/) en tu computadora. Luego, sigue estos pasos en tu terminal:




### 1. Instalar las dependencias base
Abre la terminal en la carpeta raíz del proyecto y ejecuta este comando para descargar todas las dependencias necesarias de Node y Vite:


```bash
npm install

```

### 2. Instalar las librerías adicionales
El proyecto requiere React Router para la navegación entre páginas y Firebase para la base de datos. Instálalos ejecutando:

```bash
npm install react-router firebase

```

### 3. Iniciar el servidor de desarrollo
Una vez que todo esté instalado, levanta el proyecto con el siguiente comando:

```bash
npm run dev
```

### 4. Pruebas Unitarias y Cobertura (Testing)
Para ejecutar las pruebas y generar los reportes de cobertura, instala Vitest y sus herramientas complementarias de simulación de DOM y eventos:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Para correr las pruebas en la consola de forma rápida:

```bash
npm run test
```

Para generar el reporte analítico con las métricas de cobertura global (Statements, Branches, Functions, Lines):

```bash
npm run coverage
```

Al ejecutar el comando de cobertura, se generará una carpeta coverage en la raíz del proyecto. Puedes abrir el archivo coverage/index.html en tu navegador para revisar los porcentajes detallados.