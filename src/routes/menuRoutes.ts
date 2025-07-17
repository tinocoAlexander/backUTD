import { Router } from 'express';
import { getMenuItems, createMenuItem, deleteMenuItem, initializeMenuItems, getMenuItemsByRole } from '../controllers/menuController';

const router = Router();

// Inicializar ítems del menú
initializeMenuItems();

// Rutas
router.get('/getall', getMenuItems);
router.post('/update/:id', createMenuItem);
router.patch('/delete/:id', deleteMenuItem);
router.post('/byrole', getMenuItemsByRole);

export default router;