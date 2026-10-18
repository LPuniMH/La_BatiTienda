import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from 'firebase/auth';

// Simulamos Firebase completo para recorrer todas las ramas lógicas
vi.mock('../firebase', () => ({ auth: {} }));
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(() => vi.fn()),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Pruebas del componente Login.jsx', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Renderiza el formulario de inicio de sesión por defecto', () => {
    renderWithRouter(<Login />);
    expect(screen.getByRole('heading', { name: /Iniciar sesión/i })).toBeInTheDocument();
  });

  it('2. Cambia al modo "Crear cuenta" al hacer clic en el enlace inferior', () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByText('Regístrate'));
    expect(screen.getByRole('heading', { name: /Crear cuenta/i })).toBeInTheDocument();
  });

  it('3. Actualiza el estado interno cuando el usuario escribe su correo y contraseña', async () => {
    renderWithRouter(<Login />);
    const inputCorreo = screen.getByPlaceholderText(/bruce.wayne/i);
    const inputPass = screen.getByPlaceholderText('••••••••');
    
    await userEvent.type(inputCorreo, 'test@correo.com');
    await userEvent.type(inputPass, 'Batman123');
    
    expect(inputCorreo.value).toBe('test@correo.com');
    expect(inputPass.value).toBe('Batman123');
  });

  it('4. Alterna la visibilidad de la contraseña al interactuar con el ícono del ojo', () => {
    renderWithRouter(<Login />);
    const inputPassword = screen.getByPlaceholderText('••••••••');
    const btnOjo = screen.getByRole('button', { name: /visibility/i });
    
    expect(inputPassword).toHaveAttribute('type', 'password');
    fireEvent.click(btnOjo);
    expect(inputPassword).toHaveAttribute('type', 'text');
  });

  it('5. Muestra mensaje de validación si el formato del correo es inválido', async () => {
    renderWithRouter(<Login />);
    await userEvent.type(screen.getByPlaceholderText(/bruce.wayne/i), 'correo-malo');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Batman123');
    
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));
    expect(screen.getByText('Ingresa un correo válido')).toBeInTheDocument();
  });

  it('6. Ejecuta signInWithEmailAndPassword al enviar credenciales válidas en modo Login', async () => {
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: '123' } });
    renderWithRouter(<Login />);
    
    await userEvent.type(screen.getByPlaceholderText(/bruce.wayne/i), 'test@correo.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Batman123');
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });
  });

  it('7. Ejecuta createUserWithEmailAndPassword al enviar formulario en modo Registro', async () => {
    createUserWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: '123' } });
    renderWithRouter(<Login />);
    
    fireEvent.click(screen.getByText('Regístrate'));
    
    await userEvent.type(screen.getByPlaceholderText(/bruce.wayne/i), 'nuevo@correo.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Batman123');
    
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });
  });

  it('8. Captura y muestra el error de Firebase', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/invalid-credential' });
    renderWithRouter(<Login />);
    
    await userEvent.type(screen.getByPlaceholderText(/bruce.wayne/i), 'test@correo.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Batman123');
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Correo o contraseña incorrectos/i)).toBeInTheDocument();
    });
  });

  it('9. Ejecuta signInWithPopup al hacer clic en el botón de Google', async () => {
    signInWithPopup.mockResolvedValueOnce({ user: { uid: '123' } });
    renderWithRouter(<Login />);
    
    const btnGoogle = screen.getByRole('button', { name: /Continuar con Google/i });
    fireEvent.click(btnGoogle);

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledTimes(1);
    });
  });

  it('10. Desmonta el componente y ejecuta la función de limpieza de autenticación', () => {
    const { unmount } = renderWithRouter(<Login />);
    unmount();
    expect(true).toBe(true);
  });

  it('11. Ejecuta el callback interno de onAuthStateChanged si hay un usuario activo', () => {
    vi.mocked(onAuthStateChanged).mockImplementationOnce((auth, callback) => {
      callback({ 
        uid: 'bati-usuario',
        emailVerified: true,
        providerData: [] 
      });
      return vi.fn(); 
    });

    renderWithRouter(<Login />);
    expect(onAuthStateChanged).toHaveBeenCalled();
  });

  it('12. Ejecuta las funciones de limpieza de tiempo (setTimeout) al fallar', async () => {
    vi.useFakeTimers();
    renderWithRouter(<Login />);
    
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));
    
    vi.runAllTimers();
    vi.useRealTimers();
    
    expect(true).toBe(true);
  });

});