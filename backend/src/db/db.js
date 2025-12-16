import mongoose from 'mongoose';

const mongoDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log(`\nMongoDB connected ✅\nDB HOST : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.error("MongoDB Connection Failed ❌ : " , error);
        process.exit(1);
    }
};

export default mongoDB;