import { Document, Schema, Types, model } from "mongoose";

// Interfaz del producto
export interface IProduct extends Document {
    _id:Types.ObjectId;
    name: string;
    description: string;
    quantity: number;
    price: number;
    status: boolean;
}

// Esquema del producto
const productSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
    type: Boolean,
    default: true,
    }
}, {
    timestamps: true // Esto agrega createdAt y updatedAt automáticamente
});

// Exportar el modelo
export const Product = model<IProduct>('Product', productSchema, 'products');