import * as mongoose from "mongoose";

let isConnected = false;

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseConnection {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

let cached: MongooseConnection = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export const connectToDB = async (): Promise<void> => {

    if (cached.conn) {
        console.log('Using existing connection');
        return;
    }

    try {
        if (!cached.promise) {
            cached.promise = mongoose.connect(MONGODB_URI);
        }
        cached.conn = await cached.promise;
        isConnected = true;
        console.log('New connection established');
    } catch (error) {
        cached.promise = null;
        console.error('MongoDB connection error:', error);
        throw error;
    }
};