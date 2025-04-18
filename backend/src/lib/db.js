import mongo from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongo.connect(process.env.MONGODB_URI);
        console.log(
            "MongoDB connected:",
            conn.connection.host,
            conn.connection.port
        );
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
};
