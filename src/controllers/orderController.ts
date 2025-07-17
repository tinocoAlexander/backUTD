import { Request, Response } from 'express';
import { Order, IOrder } from '../models/order';
import { Product } from '../models/product';
import mongoose from 'mongoose';

// Tasa de IVA (16%)
const IVA_RATE = 0.16;

// Enum para los estados válidos de la orden
enum OrderStatus {
  Pagado = 'pagado',
  Cancelado = 'cancelado',
  Pendiente = 'pendiente'
}

// Interfaz para la respuesta de error
interface ErrorResponse {
  message: string;
  details?: any;
}

// Crear una nueva orden
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, products, status } = req.body;

    // Validar status
    if (status && !Object.values(OrderStatus).includes(status)) {
      res.status(400).json({
        message: 'Estado inválido. Debe ser pagado, cancelado o pendiente'
      });
      return;
    }

    // Validar que los productos existan y obtener sus precios
    let subtotal = 0;
    const validatedProducts = [];

    for (const product of products) {
      const dbProduct = await Product.findById(product.productId);
      if (!dbProduct) {
        res.status(404).json({
          message: `Producto con ID ${product.productId} no encontrado`
        });
        return;
      }
      if (product.quantity < 1) {
        res.status(400).json({
          message: 'La cantidad debe ser mayor a 0'
        });
        return;
      }
      validatedProducts.push({
        productId: product.productId,
        quantity: product.quantity,
        price: dbProduct.price
      });
      subtotal += dbProduct.price * product.quantity;
    }

    // Calcular total con IVA
    const total = subtotal * (1 + IVA_RATE);

    // Crear la orden
    const orderData: Partial<IOrder> = {
      userId,
      products: validatedProducts,
      subtotal,
      total,
      status: status || OrderStatus.Pendiente,
      createDate: new Date(),
      updateDate: new Date()
    };

    const order = new Order(orderData);
    await order.save();

    res.status(201).json({
      message: 'Orden creada exitosamente',
      order
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear la orden',
      details: error instanceof Error ? error.message : error
    });
  }
};

// Obtener todas las órdenes
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate('products.productId')
      .lean();

    res.status(200).json({
      message: 'Órdenes obtenidas exitosamente',
      orders
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener las órdenes',
      details: error instanceof Error ? error.message : error
    });
  }
};

// Obtener una orden por ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'ID de orden inválido' });
      return;
    }

    const order = await Order.findById(id)
      .populate('products.productId')
      .lean();

    if (!order) {
      res.status(404).json({ message: 'Orden no encontrada' });
      return;
    }

    res.status(200).json({
      message: 'Orden obtenida exitosamente',
      order
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener la orden',
      details: error instanceof Error ? error.message : error
    });
  }
};

// Actualizar una orden
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId, products, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'ID de orden inválido' });
      return;
    }

    // Validar status si se proporciona
    if (status && !Object.values(OrderStatus).includes(status)) {
      res.status(400).json({
        message: 'Estado inválido. Debe ser pagado, cancelado o pendiente'
      });
      return;
    }

    const updateData: Partial<IOrder> = {
      updateDate: new Date()
    };

    // Actualizar userId si se proporciona
    if (userId) {
      updateData.userId = userId;
    }

    // Si se proporcionan productos, validarlos y recalcular precios
    if (products) {
      let subtotal = 0;
      const validatedProducts = [];

      for (const product of products) {
        const dbProduct = await Product.findById(product.productId);
        if (!dbProduct) {
          res.status(404).json({
            message: `Producto con ID ${product.productId} no encontrado`
          });
          return;
        }
        if (product.quantity < 1) {
          res.status(400).json({
            message: 'La cantidad debe ser mayor a 0'
          });
          return;
        }
        validatedProducts.push({
          productId: product.productId,
          quantity: product.quantity,
          price: dbProduct.price
        });
        subtotal += dbProduct.price * product.quantity;
      }

      updateData.products = validatedProducts;
      updateData.subtotal = subtotal;
      updateData.total = subtotal * (1 + IVA_RATE);
    }

    if (status) {
      updateData.status = status;
    }

    const order = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('products.productId');

    if (!order) {
      res.status(404).json({ message: 'Orden no encontrada' });
      return;
    }

    res.status(200).json({
      message: 'Orden actualizada exitosamente',
      order
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar la orden',
      details: error instanceof Error ? error.message : error
    });
  }
};

// Cancelar una orden (cambiar status a cancelado)
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'ID de orden inválido' });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { 
        status: OrderStatus.Cancelado,
        updateDate: new Date()
      },
      { 
        new: true,
        runValidators: true
      }
    ).populate('products.productId');

    if (!order) {
      res.status(404).json({ message: 'Orden no encontrada' });
      return;
    }

    res.status(200).json({
      message: 'Orden cancelada exitosamente',
      order
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al cancelar la orden',
      details: error instanceof Error ? error.message : error
    });
  }
};