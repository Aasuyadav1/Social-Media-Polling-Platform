import { MongooseConnection } from '../lib/db-connect';

declare global {
    var mongoose: {
        conn: typeof import("mongoose") | null;
        promise: Promise<typeof import("mongoose")> | null;
    };
    
    namespace NodeJS {
        interface Global {
            mongoose: MongooseConnection;
        }
    }
}
