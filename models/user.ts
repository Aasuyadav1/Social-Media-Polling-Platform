import mongoose, { Schema } from 'mongoose';

export type UserType = {
    email: string;
    password?: string;
    name?: string,
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<UserType>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    name: String,
    image: String
}, {
    timestamps: true
});

export default mongoose?.models?.User || mongoose.model<UserType>('User', userSchema);
