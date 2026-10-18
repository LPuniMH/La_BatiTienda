import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';

// Simulamos Firebase para que el componente no intente conectarse de verdad durante el test
vi.mock('../firebase', () => ({ auth: {} }));
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(() => vi.fn()), // simula el unsubscribe
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn()
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Pruebas del componente Login.jsx', () => {
  
  it('1. Renderiza el formulario de inicio de sesión por defecto', () => {
    renderWithRouter(<Login />);
    expect(screen.getByRole('heading', { name: /Iniciar sesión/i })).toBeInTheDocument();
  });

  it('2. Cambia al modo "Crear cuenta" al hacer clic en el enlace inferior', () => {
    renderWithRouter(<Login />);
    const linkRegistro = screen.getByText('Regístrate');
    fireEvent.click(linkRegistro);
    expect(screen.getByRole('heading', { name: /Crear cuenta/i })).toBeInTheDocument();
  });

  it('3. Actualiza el estado interno cuando el usuario escribe su correo', async () => {
    renderWithRouter(<Login />);
    const inputCorreo = screen.getByPlaceholderText(/bruce.wayne/i);
    await userEvent.type(inputCorreo, 'test@correo.com');
    expect(inputCorreo.value).toBe('test@correo.com');
  });

  it('4. Alterna la visibilidad de la contraseña al interactuar con el ícono del ojo', () => {
    renderWithRouter(<Login />);
    const inputPassword = screen.getByPlaceholderText('••••••••');
    const btnOjo = screen.getByRole('button', { name: /visibility/i });
    
    expect(inputPassword).toHaveAttribute('type', 'password');
    fireEvent.click(btnOjo);
    expect(inputPassword).toHaveAttribute('type', 'text');
  });

  it('5. Muestra mensaje de validación si se intenta ingresar con un formato de correo inválido', () => {
    renderWithRouter(<Login />);
    const btnIngresar = screen.getByRole('button', { name: /Ingresar/i });
    fireEvent.click(btnIngresar);
    expect(screen.getByText('Ingresa un correo válido')).toBeInTheDocument();
  });
});