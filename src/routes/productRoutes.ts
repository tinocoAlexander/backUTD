import { Router } from 'express';
import { createProduct , deleteProduct, getAllProducts, getProductById, updateProduct } from '../controllers/productController';

const router = Router();

// Crear una nueva orden
router.post('/create', createProduct);

// Obtener todas las órdenes
router.get('/getall', getAllProducts);

// Obtener una orden por ID
router.get('/get/:id', getProductById);

// Actualizar una orden
router.patch('/update/:id', updateProduct);

// Eliminar una orden
router.delete('/delete/:id', deleteProduct);

export default router;