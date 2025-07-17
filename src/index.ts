import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.route';
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productRoutes';
import menuRoutes from './routes/menuRoutes';
import connectDB from './config/db';

// Cargar variables de entorno
dotenv.config();

// Inicializar app
const app = express();
const PORT = process.env.PORT;

// Middlewares
app.use(express.json());
app.use(morgan('dev'));

// Permitir peticiones desde cualquier origen
app.use(cors());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/menu', menuRoutes);

// Conexión a la base de datos y arranque del servidor
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    process.exit(1); // Cerrar proceso si falla la DB
  }
};

startServer();
