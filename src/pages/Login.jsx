import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut
} from 'firebase/auth';
import { auth } from '../firebase';
import '../login.css';

function Login() {
  const navigate = useNavigate();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [modoRecuperar, setModoRecuperar] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  const [errorUsuario, setErrorUsuario] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [feedback, setFeedback] = useState({ mensaje: '', tipo: '' });
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && (user.emailVerified || user.providerData.some(p => p.providerId === 'google.com'))) {
        navigate('/cart');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const esCorreoValido = (texto) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(texto);
  const esPasswordValida = (texto) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(texto);

  const alternarModoGlobal = (e) => {
    e.preventDefault();
    if (modoRecuperar) {
      setModoRecuperar(false);
      setModoRegistro(false);
    } else {
      setModoRegistro(!modoRegistro);
    }
    setErrorUsuario('');
    setErrorPassword('');
    setFeedback({ mensaje: '', tipo: '' });
  };

  const activarRecuperacion = (e) => {
    e.preventDefault();
    setModoRecuperar(true);
    setModoRegistro(false);
    setErrorUsuario('');
    setErrorPassword('');
    setFeedback({ mensaje: '', tipo: '' });
  };

  const manejarEnvioLogin = async (e) => {
    e.preventDefault();
    let esValido = true;
    const correoInput = email.trim();

    if (correoInput === "" || !esCorreoValido(correoInput)) {
      setErrorUsuario("Ingresa un correo válido");
      esValido = false;
    } else {
      setErrorUsuario("");
    }

    if (!modoRecuperar) {
      if (!esPasswordValida(password)) {
        setErrorPassword("Mínimo 6 caracteres, 1 mayúscula, 1 minúscula y 1 número");
        esValido = false;
      } else {
        setErrorPassword("");
      }
    }

    if (!esValido) return;

    setProcesando(true);
    setFeedback({ mensaje: '', tipo: '' });

    try {
      if (modoRecuperar) {
        await sendPasswordResetEmail(auth, correoInput);
        setFeedback({ mensaje: "Correo de recuperación enviado. Revisa tu bandeja.", tipo: "exito" });
        setTimeout(() => {
          setModoRecuperar(false);
          setFeedback({ mensaje: '', tipo: '' });
        }, 3000);
      } else if (modoRegistro) {
        const credencial = await createUserWithEmailAndPassword(auth, correoInput, password);
        await sendEmailVerification(credencial.user);
        await signOut(auth);
        setFeedback({ mensaje: "¡Cuenta creada! Revisa tu correo para verificarla antes de ingresar.", tipo: "exito" });
        setTimeout(() => {
          setModoRegistro(false);
          setFeedback({ mensaje: '', tipo: '' });
        }, 3000);
      } else {
        const credencial = await signInWithEmailAndPassword(auth, correoInput, password);
        if (!credencial.user.emailVerified) {
          await signOut(auth);
          setFeedback({ mensaje: "Debes verificar tu correo antes de ingresar.", tipo: "error" });
        } else {
          setFeedback({ mensaje: "¡Ingreso exitoso!", tipo: "exito" });
        }
      }
    } catch (error) {
      let mensajeError = "Ocurrió un error. Intenta nuevamente.";
      if (error.code === 'auth/email-already-in-use') mensajeError = "Este correo ya está registrado.";
      if (error.code === 'auth/invalid-credential') mensajeError = "Correo o contraseña incorrectos.";
      setFeedback({ mensaje: mensajeError, tipo: "error" });
    }
    
    setProcesando(false);
  };

  const manejarIngresoGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setProcesando(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      setFeedback({ mensaje: "El inicio de sesión con Google fue cancelado o falló.", tipo: "error" });
      setProcesando(false);
    }
  };

  return (
    <div className="login-main d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="login-card mx-auto">
          <img className="login-logo" src="https://res.cloudinary.com/yhcvjnf8/image/upload/v1788290645/logoBT.webp" alt="Logo La BatiTienda" />
          
          <h1 className="login-title">
            {modoRecuperar ? "Recuperar contraseña" : modoRegistro ? "Crear cuenta" : "Iniciar sesión"}
          </h1>
          <p className="login-subtitle">
            {modoRecuperar ? "Te enviaremos un enlace seguro" : modoRegistro ? "Únete a la Baticueva" : "Entra a tu cuenta para seguir comprando"}
          </p>

          <form className="login-form" onSubmit={manejarEnvioLogin} noValidate>
            <div className="mb-1 text-start">
              <label className="form-label login-label">Correo electrónico</label>
              <input 
                type="email" 
                className={`form-control login-input ${errorUsuario ? 'login-input-invalido' : ''}`}
                placeholder="bruce.wayne@wayneenterprises.com" 
                autoComplete="username"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorUsuario(''); }}
              />
              <p className="login-error">{errorUsuario}</p>
            </div>

            {!modoRecuperar && (
              <div className="mb-1 text-start">
                <label className="form-label login-label">Contraseña</label>
                <div className="login-password-wrapper">
                  <input 
                    type={mostrarPassword ? "text" : "password"}
                    className={`form-control login-input ${errorPassword ? 'login-input-invalido' : ''}`}
                    placeholder="••••••••" 
                    autoComplete={modoRegistro ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorPassword(''); }}
                  />
                  <button type="button" className="login-toggle-password" onClick={() => setMostrarPassword(!mostrarPassword)}>
                    <span className="material-symbols-outlined">{mostrarPassword ? "visibility" : "visibility_off"}</span>
                  </button>
                </div>
                <p className="login-error">{errorPassword}</p>
              </div>
            )}

            {!modoRecuperar && !modoRegistro && (
              <div className="text-end mb-3 login-options">
                <a href="#" className="login-link" onClick={activarRecuperacion}>¿Olvidaste tu contraseña?</a>
              </div>
            )}

            <p className={`login-feedback ${feedback.tipo === 'exito' ? 'login-feedback-exito' : feedback.tipo === 'error' ? 'login-feedback-error' : ''}`}>
              {feedback.mensaje}
            </p>

            <button type="submit" className="btn w-100 login-btn mb-3" disabled={procesando}>
              {procesando ? "Procesando..." : modoRecuperar ? "Enviar correo" : modoRegistro ? "Registrarse" : "Ingresar"}
            </button>
            
            {!modoRecuperar && (
              <button type="button" className="btn w-100 login-btn-google" onClick={manejarIngresoGoogle} disabled={procesando}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width="20" className="me-2" />
                Continuar con Google
              </button>
            )}
          </form>

          <p className="login-signup-text">
            <span>{modoRecuperar ? "¿Recordaste tu contraseña?" : modoRegistro ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}</span>{' '}
            <a href="#" className="login-link" onClick={alternarModoGlobal}>
              {modoRecuperar || modoRegistro ? "Inicia sesión" : "Regístrate"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;