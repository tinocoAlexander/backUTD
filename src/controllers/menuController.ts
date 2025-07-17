import { Request, Response } from 'express';
import MenuItem from '../models/menuItem';

// Interfaz para los ítems iniciales (sin _id)
interface MenuItemInput {
  title: string;
  path: string;
  icon: string;
  roles: string[];
  isActive: boolean;
}

// Inicializar la colección con datos predeterminados si está vacía
export const initializeMenuItems = async () => {
  try {
    const count = await MenuItem.countDocuments();
    if (count === 0) {
      const initialItems: MenuItemInput[] = [
        {
          title: 'Inicio',
          path: '/',
          icon: 'HomeOutlined',
          roles: ['admin', 'user'],
          isActive: true,
        },
        {
          title: 'Usuarios',
          path: '/users',
          icon: 'UserOutlined',
          roles: ['admin'],
          isActive: true,
        },
        {
          title: 'Productos',
          path: '/products',
          icon: 'ShoppingOutlined',
          roles: ['admin', 'user'],
          isActive: true,
        },
        {
          title: 'Órdenes',
          path: '/orders',
          icon: 'ShoppingCartOutlined',
          roles: ['admin', 'user'],
          isActive: true,
        },
        {
          title: 'Reportes',
          path: '/reportes',
          icon: 'BarChartOutlined',
          roles: ['admin'],
          isActive: true,
        },
      ];
      await MenuItem.insertMany(initialItems);
      console.log('Menú inicializado con ítems predeterminados');
    }
  } catch (error) {
    console.error('Error al inicializar ítems del menú:', error);
  }
};

// GET: Consultar ítems del menú activos
export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const items = await MenuItem.find({ isActive: true }).select('-__v');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar los ítems del menú' });
  }
};

// POST: Agregar un nuevo ítem al menú
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { title, path, icon, roles } = req.body;
    if (!title || !path || !icon || !roles || !Array.isArray(roles)) {
      return res.status(400).json({ error: 'Faltan datos requeridos o roles no es un arreglo' });
    }
    const newItem = new MenuItem({ title, path, icon, roles, isActive: true });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'El path ya existe' });
    } else {
      res.status(500).json({ error: 'Error al crear el ítem del menú' });
    }
  }
};

// PATCH: Baja lógica de un ítem del menú
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!item) {
      return res.status(404).json({ error: 'Ítem no encontrado' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Error al realizar la baja lógica' });
  }
};

// POST: Consultar ítems del menú por rol
export const getMenuItemsByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!role || typeof role !== 'string') {
      return res.status(400).json({ error: 'El campo role es requerido y debe ser una cadena' });
    }
    const items = await MenuItem.find({ 
      isActive: true,
      roles: { $in: [role] }
    }).select('-__v');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar los ítems del menú por rol' });
  }
};