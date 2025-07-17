import { Router, RequestHandler } from 'express';
import { getMenuItems, createMenuItem, deleteMenuItem, initializeMenuItems, getMenuItemsByRole } from '../controllers/menuController';

const router = Router();

// Inicializar ítems del menú
initializeMenuItems();

// Rutas
router.get('/getall', getMenuItems);

router.post('/update/:id', async (req, res, next) => {
  try {
	await createMenuItem(req, res);
  } catch (err) {
	next(err);
  }
});

router.patch('/delete/:id', async (req, res, next) => {
  try {
	await deleteMenuItem(req, res);
  } catch (err) {
	next(err);
  }
});

router.post('/byrole', async (req, res, next) => {
  try {
	await getMenuItemsByRole(req, res);
  } catch (err) {
	next(err);
  }
});

export default router;