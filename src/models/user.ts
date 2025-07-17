import { Document, Schema, model, Types } from "mongoose";

export interface IRole {
    roleType: string;
    description?: string;
}

export interface IUser extends Document {
    _id: Types.ObjectId; // Agregar explícitamente _id
    name: string;
    email: string;
    password: string;
    role: IRole;
    phone: string;
    createdDate: Date;
    deleteDate: Date;
    status: boolean;
}

const roleSchema = new Schema<IRole>({
    roleType: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
});

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: roleSchema,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    createdDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    deleteDate: {
        type: Date,
        required: false,
    },
    status: {
        type: Boolean,
        required: true,
        default: true,
    },
});

export const User = model<IUser>("User", userSchema, "user");