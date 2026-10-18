import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import Contacto from './Contacto';

describe('Pruebas del componente Contacto.jsx', () => {
  
  // Prueba 1: Renderizado básico
  it('1. Renderiza correctamente el encabezado principal del componente', () => {
    render(<Contacto />);
    expect(screen.getByText('Soporte y contacto')).toBeInTheDocument();
  });

  // Prueba 2: Renderizado de propiedades y estado inicial
  it('2. Los campos del formulario inician vacíos', () => {
    render(<Contacto />);
    expect(screen.getByLabelText(/Nombre completo/i).value).toBe('');
    expect(screen.getByLabelText(/Correo electrónico/i).value).toBe('');
    expect(screen.getByLabelText(/Cuéntanos qué pasó/i).value).toBe('');
  });

  // Prueba 3: Pruebas de Eventos (Escribir en inputs)
  it('3. Actualiza el estado cuando el usuario escribe en el campo nombre', async () => {
    render(<Contacto />);
    const inputNombre = screen.getByLabelText(/Nombre completo/i);
    await userEvent.type(inputNombre, 'Bruce Wayne');
    expect(inputNombre.value).toBe('Bruce Wayne');
  });

  // Prueba 4: Pruebas de Eventos (Seleccionar en un dropdown)
  it('4. Actualiza el estado al seleccionar un motivo de contacto', async () => {
    render(<Contacto />);
    const selectMotivo = screen.getByLabelText(/Motivo de contacto/i);
    await userEvent.selectOptions(selectMotivo, 'pedido');
    expect(selectMotivo.value).toBe('pedido');
  });

  // Prueba 5: Renderizado condicional (Error de validación vacío)
  it('5. Muestra mensaje de error si se intenta enviar el formulario vacío', async () => {
    render(<Contacto />);
    const btnSubmit = screen.getByRole('button', { name: /Enviar mensaje/i });
    fireEvent.click(btnSubmit);
    expect(screen.getByText('Ingresa tu nombre completo')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu correo')).toBeInTheDocument();
  });

  // Prueba 6: Lógica y validación de formato de correo
  it('6. Muestra error específico si el correo no tiene formato válido', async () => {
    render(<Contacto />);
    const inputCorreo = screen.getByLabelText(/Correo electrónico/i);
    await userEvent.type(inputCorreo, 'correo-invalido');
    
    const btnSubmit = screen.getByRole('button', { name: /Enviar mensaje/i });
    fireEvent.click(btnSubmit);
    expect(screen.getByText('Ingresa un correo válido (ej: nombre@dominio.com)')).toBeInTheDocument();
  });

  // Prueba 7: Lógica y validación del largo del mensaje
  it('7. Muestra error si el mensaje tiene menos de 15 caracteres', async () => {
    render(<Contacto />);
    const textarea = screen.getByLabelText(/Cuéntanos qué pasó/i);
    await userEvent.type(textarea, 'Corto');
    
    const btnSubmit = screen.getByRole('button', { name: /Enviar mensaje/i });
    fireEvent.click(btnSubmit);
    expect(screen.getByText(/Danos un poco más de detalle/i)).toBeInTheDocument();
  });

  // Prueba 8: Cambio de estado reactivo (Borrado de errores)
  it('8. Elimina el mensaje de error al empezar a escribir nuevamente', async () => {
    render(<Contacto />);
    const inputNombre = screen.getByLabelText(/Nombre completo/i);
    const btnSubmit = screen.getByRole('button', { name: /Enviar mensaje/i });
    
    // Forzamos el error primero
    fireEvent.click(btnSubmit);
    expect(screen.getByText('Ingresa tu nombre completo')).toBeInTheDocument();
    
    // Al escribir, el error debe desaparecer del estado
    await userEvent.type(inputNombre, 'A');
    expect(screen.queryByText('Ingresa tu nombre completo')).not.toBeInTheDocument();
  });

  // Prueba 9: Renderizado condicional asíncrono (Feedback de éxito)
  it('9. Muestra mensaje de éxito al enviar el formulario correctamente', async () => {
    render(<Contacto />);
    
    await userEvent.type(screen.getByLabelText(/Nombre completo/i), 'Clark Kent');
    await userEvent.type(screen.getByLabelText(/Correo electrónico/i), 'clark@dailyplanet.com');
    await userEvent.selectOptions(screen.getByLabelText(/Motivo de contacto/i), 'consulta');
    await userEvent.type(screen.getByLabelText(/N° de pedido/i), 'BT-1234');
    await userEvent.type(screen.getByLabelText(/Cuéntanos qué pasó/i), 'Tengo una duda con la talla de la capa.');

    fireEvent.click(screen.getByRole('button', { name: /Enviar mensaje/i }));

    // Esperamos a que pase el setTimeout (800ms) del componente
    await waitFor(() => {
      expect(screen.getByText('¡Batiseñal mandada! Te responderemos a tu correo a la brevedad.')).toBeInTheDocument();
    }, { timeout: 1500 });
  });

  // Prueba 10: Pruebas de estado y DOM (Bloqueo del botón mientras procesa)
  it('10. Deshabilita el botón de envío y cambia el texto a "Enviando..." durante el procesamiento', async () => {
    render(<Contacto />);
    
    await userEvent.type(screen.getByLabelText(/Nombre completo/i), 'Clark Kent');
    await userEvent.type(screen.getByLabelText(/Correo electrónico/i), 'clark@test.com');
    await userEvent.selectOptions(screen.getByLabelText(/Motivo de contacto/i), 'consulta');
    await userEvent.type(screen.getByLabelText(/N° de pedido/i), 'BT-123');
    await userEvent.type(screen.getByLabelText(/Cuéntanos qué pasó/i), 'Mensaje suficientemente largo.');

    const btnSubmit = screen.getByRole('button', { name: /Enviar mensaje/i });
    fireEvent.click(btnSubmit);

    // Inmediatamente después del click, el botón debe estar deshabilitado
    expect(btnSubmit).toBeDisabled();
    expect(btnSubmit).toHaveTextContent('Enviando...');
  });
});