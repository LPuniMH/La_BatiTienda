import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, it, expect } from 'vitest';
import PagoError from './PagoError';

describe('Pruebas del componente PagoError.jsx', () => {
  
  it('1. Renderiza el título principal de error en el DOM', () => {
    render(<MemoryRouter><PagoError /></MemoryRouter>);
    expect(screen.getByText('No se pudo realizar el pago')).toBeInTheDocument();
  });

  it('2. Contiene el botón con el enlace correcto para volver a intentar el checkout', () => {
    render(<MemoryRouter><PagoError /></MemoryRouter>);
    const btn = screen.getByRole('link', { name: /VOLVER A INTENTAR EL PAGO/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('href', '/checkout');
  });

  it('3. Oculta la caja de detalles adicionales si no recibe datos del intento de compra (acceso directo)', () => {
    render(<MemoryRouter><PagoError /></MemoryRouter>);
    expect(screen.queryByText('Detalle del intento de compra')).not.toBeInTheDocument();
  });

  it('4. Muestra los detalles del cliente si recibe datos mediante location.state', () => {
    // Simula los datos que enviaría el Checkout al fallar
    const datosSimulados = {
      form: { nombre: 'Peter', apellidos: 'Parker', calle: 'Queens 123', comuna: 'Cerrillos' },
      total: 25000
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/pago-error', state: datosSimulados }]}>
        <Routes>
          <Route path="/pago-error" element={<PagoError />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Detalle del intento de compra')).toBeInTheDocument();
    expect(screen.getByText(/Peter Parker/i)).toBeInTheDocument();
  });

  it('5. Renderiza correctamente el monto total rechazado en la vista de detalle', () => {
    const datosSimulados = {
      form: { nombre: 'Bruce', apellidos: 'Wayne', calle: 'Mansión', comuna: 'Providencia' },
      total: 45990
    };

    render(
      <MemoryRouter initialEntries={[{ pathname: '/pago-error', state: datosSimulados }]}>
        <Routes>
          <Route path="/pago-error" element={<PagoError />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/\$45990/i)).toBeInTheDocument();
  });
});