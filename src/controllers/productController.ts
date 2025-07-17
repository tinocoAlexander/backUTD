import { Request, Response } from 'express';
import { Product, IProduct } from '../models/product';
import { Types } from 'mongoose';

// Create a new product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, quantity, price } = req.body;

    if (!name || !description || quantity === undefined || price === undefined) {
      res.status(400).json({ message: 'name, description, quantity, and price are required' });
      return;
    }

    const product: IProduct = await Product.create({
      name,
      description,
      quantity,
      price,
      status: true
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        quantity: product.quantity,
        price: product.price,
        status: product.status
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'An error occurred while creating product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all products
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ status: true });

    res.status(200).json({
      message: 'Products retrieved successfully',
      products
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'An error occurred while getting all products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get a single product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    const product = await Product.findOne({ _id: id, status: true });

    if (!product) {
      res.status(404).json({ message: 'Product not found or inactive' });
      return;
    }

    res.status(200).json({
      message: 'Product retrieved successfully',
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        quantity: product.quantity,
        price: product.price,
        status: product.status
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'An error occurred while getting product by ID',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, quantity, price } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    const product = await Product.findOne({ _id: id, status: true });
    if (!product) {
      res.status(404).json({ message: 'Product not found or inactive' });
      return;
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (quantity !== undefined) product.quantity = quantity;
    if (price !== undefined) product.price = price;
    if (typeof req.body.status === 'boolean') product.status = req.body.status;

    const savedProduct = await product.save();

    res.status(200).json({
      message: 'Product updated successfully',
      product: {
        id: savedProduct._id,
        name: savedProduct.name,
        description: savedProduct.description,
        quantity: savedProduct.quantity,
        price: savedProduct.price,
        status: savedProduct.status
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'An error occurred while updating product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a product (logical delete)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    const product = await Product.findOne({ _id: id, status: true });
    if (!product) {
      res.status(404).json({ message: 'Product not found or already inactive' });
      return;
    }

    product.status = false;

    const savedProduct = await product.save();

    res.status(200).json({
      message: 'Product logically deleted successfully',
      product: {
        id: savedProduct._id,
        name: savedProduct.name,
        description: savedProduct.description,
        quantity: savedProduct.quantity,
        price: savedProduct.price,
        status: savedProduct.status
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'An error occurred while deleting product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};