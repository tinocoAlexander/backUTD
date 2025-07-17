import { Document, Schema, Types, model } from "mongoose";
import { User } from "./user";

// Definición de la interfaz para los productos en la orden
interface IOrderProduct {
    productId: Types.ObjectId;
    quantity: number;
    price: number;
}

// Definición de la interfaz de la orden
export interface IOrder extends Document {
    _id: Types.ObjectId;
    userId: string;
    total: number;
    subtotal: number;
    status: string;
    createDate: Date;
    updateDate: Date;
    products: IOrderProduct[];
}

// Esquema de producto en la orden
const orderProductSchema = new Schema<IOrderProduct>({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    }
}, { _id: false });

// Esquema de la orden
const orderSchema = new Schema<IOrder>({
    userId: {
        type: String,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    subtotal: {
        type: Number,
        required: true,
    },
    products: {
        type: [orderProductSchema],
        required: true,
        validate: [(array: any[]) => array.length > 0, 'La orden debe contener al menos un producto'],
    },
    createDate: {
        type: Date,
        default: Date.now,
    },
    updateDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        required: true,
        enum: ['pagado', 'cancelado', 'pendiente'],
        default: 'pendiente'
    }
});

// Excluir __v de las respuestas JSON
orderSchema.set('toJSON', { versionKey: false });

// Exportar el modelo
export const Order = model<IOrder>('Order', orderSchema, 'orders');