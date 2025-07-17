import { defaultMaxListeners } from "events"
import mongoose from "mongoose"


const connectDB = async () : Promise<void> => {
    const mongoUrl="mongodb://admin:admin@localhost:27017/userdb?authSource=admin"
    try {
        await mongoose.connect(mongoUrl)
        console.log("conectado a mongo")
    } catch (error){
        console.log("error al conectar mongo")
    }
}

export default connectDB;