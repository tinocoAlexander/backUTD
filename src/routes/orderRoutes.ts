import { Router } from 'express';
import { createOrder, getOrders, getOrderById, updateOrder, deleteOrder } from '../controllers/orderController';

const router = Router();

// Crear una nueva orden
router.post('/create', createOrder);

// Obtener todas las órdenes
router.get('/getall', getOrders);

// Obtener una orden por ID
router.get('/get/:id', getOrderById);

// Actualizar una orden
router.patch('/update/:id', updateOrder);

// Eliminar una orden
router.delete('/delete/:id', deleteOrder);

export default router;