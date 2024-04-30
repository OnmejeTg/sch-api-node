import mongoose from 'mongoose';
import 'dotenv/config'

const MONGO_URI = process.env.MONGO_URI

const connectDatabase = async ()=>{
    try{
        await mongoose.connect(MONGO_URI)
        console.log("Connected to MongoDB")

    }catch(e){
        console.log("Conection failed:", e.message);
    }
}

export default connectDatabase;