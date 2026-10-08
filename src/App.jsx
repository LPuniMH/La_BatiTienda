import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Inicio from './pages/Inicio';
import Catalogo from './pages/Catalogo';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Contacto from './pages/Contacto';

function App() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [rol, setRol] = useState("cliente");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if ((user && user.emailVerified) || (user && user.providerData.some(p => p.providerId === 'google.com'))) {
        setUsuarioActual(user);
        try {
            const docSnap = await getDoc(doc(db, "usuarios", user.uid));
            if (docSnap.exists()) {
                setRol(docSnap.data().rol || "cliente");
            }
        } catch (error) {
            console.error(error);
        }
      } else {
        setUsuarioActual(null);
        setRol("cliente");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Navbar usuarioActual={usuarioActual} rol={rol} />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Inicio usuarioActual={usuarioActual} />} />
          <Route path="/catalogo" element={<Catalogo usuarioActual={usuarioActual} />} />
          <Route path="/cart" element={<Cart usuarioActual={usuarioActual} />} />
          <Route path="/admin" element={<Admin usuarioActual={usuarioActual} rol={rol} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="*" element={<h2 className="text-center mt-5 text-white">Página no encontrada</h2>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;