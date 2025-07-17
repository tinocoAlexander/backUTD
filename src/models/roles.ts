import { Document, Schema, Types, model } from "mongoose";

export interface IRole extends Document{
    _id:Types.ObjectId;
    type:string;
    
}

const roleSchema = new Schema<IRole>({
    type:{
        type:String,
        required:true,
    },
});


export const Role = model<IRole>('Roles', roleSchema, 'roles');