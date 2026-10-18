import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Admin from './Admin';
import * as firestore from 'firebase/firestore';

// 1. Mock de Firebase Firestore súper robusto
vi.mock('../firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => {
  const mockBatch = { delete: vi.fn(), set: vi.fn(), commit: vi.fn() };
  return {
    collection: vi.fn((db, path) => ({ path })), // Inyectamos el nombre de la ruta
    doc: vi.fn((db, path, id) => ({ path, id })),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn((coll) => coll), // Pasamos la colección intacta
    orderBy: vi.fn(),
    writeBatch: vi.fn(() => mockBatch),
  };
});

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

// 2. Datos falsos de simulación
const mockProductos = [
  { id: 1, codigo: 'FIG01', nombre: 'Batman Figura', categoria: 'Figuras', precio: 20000, stock: 5, imagen: '' }
];
const mockCategorias = {
  'Figuras': { titulo: 'Figuras de Acción', descripcion: 'Coleccionables', codigos: ['FIG01'] }
};
const mockUsuarios = [
  { id: 'user1', nombre: 'Clark', rol: 'cliente' },
  { id: 'user2', nombre: 'Bruce', rol: 'admin' }
];
const mockPedidos = [
  { id: 'ped1', fecha: '2026-10-01T10:00:00Z', cliente: { nombre: 'Lois' }, total: 15000, estado: 'Pagado' }
];

describe('Pruebas masivas del componente Admin.jsx', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // El mock detecta qué tabla está pidiendo el componente gracias al .path
    firestore.getDocs.mockImplementation(async (ref) => {
      const path = ref?.path;
      if (path === 'usuarios') return { size: mockUsuarios.length, forEach: (cb) => mockUsuarios.forEach(u => cb({ id: u.id, data: () => u })) };
      if (path === 'pedidos') return { size: mockPedidos.length, forEach: (cb) => mockPedidos.forEach(p => cb({ id: p.id, data: () => p })) };
      return { size: mockProductos.length, forEach: (cb) => mockProductos.forEach(p => cb({ id: p.id, data: () => p })) };
    });

    firestore.getDoc.mockResolvedValue({ exists: () => true, data: () => mockCategorias });
  });

  // Función de apoyo para navegar entre pestañas de forma segura
  const clickTab = (container, index) => {
    const tabs = container.querySelectorAll('.list-group-item');
    if(tabs[index]) fireEvent.click(tabs[index]);
  };

  it('1. Redirige al inicio si no hay usuario o el rol no es admin/owner', () => {
    renderWithRouter(<Admin usuarioActual={null} rol={null} />);
    expect(mockNavigate).toHaveBeenCalledWith('/');
    
    renderWithRouter(<Admin usuarioActual={{uid:'123'}} rol="cliente" />);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('2. Carga y renderiza el Dashboard correctamente para un Owner', async () => {
    renderWithRouter(<Admin usuarioActual={{uid:'owner1'}} rol="owner" />);
    await waitFor(() => {
      expect(screen.getByText('Cuenta Owner')).toBeInTheDocument();
      expect(screen.getByText('Compras Realizadas')).toBeInTheDocument();
    });
  });

  it('3. Navega por todas las pestañas laterales sin fallos', async () => {
    const { container } = renderWithRouter(<Admin usuarioActual={{uid:'admin1'}} rol="admin" />);
    
    clickTab(container, 1); // Órdenes
    expect(screen.getByRole('heading', { name: /Gestión de Órdenes/i })).toBeInTheDocument();
    
    clickTab(container, 2); // Productos
    expect(screen.getByRole('heading', { name: /Gestión del Inventario/i })).toBeInTheDocument();
    
    clickTab(container, 3); // Categorías
    expect(screen.getByRole('heading', { name: /Gestión de Categorías/i })).toBeInTheDocument();
    
    clickTab(container, 4); // Usuarios
    expect(screen.getByRole('heading', { name: /Gestión de Usuarios/i })).toBeInTheDocument();
  });

  it('4. Permite a un Owner cambiar el rol de un usuario', async () => {
    const { container } = renderWithRouter(<Admin usuarioActual={{uid:'owner1'}} rol="owner" />);
    
    await waitFor(() => clickTab(container, 4)); // Ir a usuarios
    
    await waitFor(() => {
      const select = container.querySelector('select'); // El primer select es de la tabla
      if(select) fireEvent.change(select, { target: { value: 'admin' } });
    });
    
    expect(firestore.updateDoc).toHaveBeenCalled();
  });

  it('5. Permite cambiar el estado de un pedido', async () => {
    const { container } = renderWithRouter(<Admin usuarioActual={{uid:'admin1'}} rol="admin" />);
    
    await waitFor(() => clickTab(container, 1)); // Ir a órdenes
    
    await waitFor(() => {
      const select = container.querySelector('select');
      if(select) fireEvent.change(select, { target: { value: 'Enviado' } });
    });
    
    expect(firestore.updateDoc).toHaveBeenCalled();
  });

  it('6. Bloquea la creación de un producto si faltan datos obligatorios', async () => {
    const { container } = renderWithRouter(<Admin usuarioActual={{uid:'admin1'}} rol="admin" />);
    
    await waitFor(() => clickTab(container, 2)); // Ir a productos
    
    await waitFor(() => {
      const btnAdd = container.querySelector('.btn-success'); // El botón verde es de Añadir
      fireEvent.click(btnAdd);
    });
    
    expect(screen.getByText('Faltan datos obligatorios.')).toBeInTheDocument();
  });

  it('7. Guarda un producto nuevo correctamente', async () => {
    const { container } = renderWithRouter(<Admin usuarioActual={{uid:'admin1'}} rol="admin" />);
    await waitFor(() => clickTab(container, 2));
    
    await waitFor(() => {
      // El primer input name="id" corresponde al formulario de nuevo producto
      fireEvent.change(container.querySelectorAll('input[name="id"]')[0], { target: { name: 'id', value: '99' } });
      fireEvent.change(container.querySelectorAll('input[name="codigo"]')[0], { target: { name: 'codigo', value: 'NUEVO01' } }); 
      fireEvent.change(container.querySelectorAll('input[name="nombre"]')[0], { target: { name: 'nombre', value: 'Test' } });
      
      fireEvent.click(container.querySelector('.btn-success'));
    });
    
    await waitFor(() => {
      expect(firestore.setDoc).toHaveBeenCalled();
    });
  });

  it('8. Actualiza un producto existente modificando su ID (Dispara Batch)', async () => {
    const { container } = renderWithRouter(<Admin usuarioActual={{uid:'admin1'}} rol="admin" />);
    await waitFor(() => clickTab(container, 2));
    
    await waitFor(() => {
      expect(container.querySelectorAll('input[name="id"]').length).toBeGreaterThan(1);
    });
    
    const inputEditId = container.querySelectorAll('input[name="id"]')[1];
    await userEvent.clear(inputEditId);
    await userEvent.type(inputEditId, '2');
    
    const btnActualizar = container.querySelector('.btn-warning');
    fireEvent.click(btnActualizar);
    
    await waitFor(() => {
      expect(firestore.writeBatch).toHaveBeenCalled(); 
    });
  });

  it('9. Rechaza guardar si el ID numérico ya existe', async () => {
    const { container } = renderWithRouter(<Admin usuarioActual={{uid:'admin1'}} rol="admin" />);
    await waitFor(() => clickTab(container, 2));
    
    await waitFor(() => {
      fireEvent.change(container.querySelectorAll('input[name="id"]')[0], { target: { name: 'id', value: '1' } }); // 1 ya existe
      fireEvent.change(container.querySelectorAll('input[name="codigo"]')[0], { target: { name: 'codigo', value: 'OTRO' } });
      fireEvent.change(container.querySelectorAll('input[name="nombre"]')[0], { target: { name: 'nombre', value: 'Falla' } });
      
      fireEvent.click(container.querySelector('.btn-success'));
    });
    
    await waitFor(() => {
      expect(screen.getByText('¡Error! Ya existe un artículo con ese ID numérico.')).toBeInTheDocument();
    });
  });

  it('10. Abre el modal de borrado de producto y confirma la eliminación', async () => {
    const { container } = renderWithRouter(<Admin usuarioActual={{uid:'admin1'}} rol="admin" />);
    await waitFor(() => clickTab(container, 2));
    
    await waitFor(() => {
      fireEvent.click(container.querySelector('.btn-outline-danger')); // Botón eliminar de la fila
    });
    
    expect(screen.getByText('Confirmar Acción')).toBeInTheDocument();
    
    // Confirmar en el modal
    fireEvent.click(container.querySelector('.modal .btn-danger'));
    
    await waitFor(() => {
      expect(firestore.deleteDoc).toHaveBeenCalled();
    });
  });

  it('11. Modifica una categoría añadiendo y quitando un código', async () => {
    const { container } = renderWithRouter(<Admin usuarioActual={{uid:'admin1'}} rol="admin" />);
    await waitFor(() => clickTab(container, 3)); // Categorías
    
    await waitFor(() => {
      const inputNuevo = container.querySelector('input[placeholder="Ej: FG001"]');
      fireEvent.change(inputNuevo, { target: { value: 'NUEVO_COD' } });
      fireEvent.click(container.querySelector('.btn-outline-warning')); // Añadir
    });
    
    await waitFor(() => {
      fireEvent.click(container.querySelector('.btn-mini-remove')); // Quitar
    });
  });

  it('12. Guarda las categorías globalmente en Firestore', async () => {
    const { container } = renderWithRouter(<Admin usuarioActual={{uid:'admin1'}} rol="admin" />);
    await waitFor(() => clickTab(container, 3));
    
    await waitFor(() => {
      fireEvent.click(container.querySelector('.btn-success')); // Guardar Cambios
    });
    
    await waitFor(() => {
      expect(firestore.setDoc).toHaveBeenCalled();
    });
  });

  it('13. Abre el modal de borrado de categoría y confirma', async () => {
    const { container } = renderWithRouter(<Admin usuarioActual={{uid:'admin1'}} rol="admin" />);
    await waitFor(() => clickTab(container, 3));
    
    await waitFor(() => {
      fireEvent.click(container.querySelector('.btn-outline-danger')); // Eliminar categoría
    });
    
    fireEvent.click(container.querySelector('.modal .btn-danger')); // Confirmar modal
  });

  it('14. Funcionamiento de los buscadores (filtrado en memoria)', async () => {
    const { container } = renderWithRouter(<Admin usuarioActual={{uid:'admin1'}} rol="admin" />);
    
    await waitFor(() => clickTab(container, 2));
    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText(/Buscar por nombre o código/i), { target: { value: 'Inexistente123' } });
      expect(screen.getByText('No se encontraron productos.')).toBeInTheDocument();
    });

    await waitFor(() => clickTab(container, 1));
    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText(/Buscar pedido/i), { target: { value: 'Inexistente123' } });
      expect(screen.getByText('No se encontraron órdenes.')).toBeInTheDocument();
    });
  });

  it('15. Captura errores de red al intentar cargar la base de datos', async () => {
    firestore.getDocs.mockRejectedValueOnce(new Error("Error de red"));
    renderWithRouter(<Admin usuarioActual={{uid:'admin1'}} rol="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error al cargar la base de datos.')).toBeInTheDocument();
    });
  });
});