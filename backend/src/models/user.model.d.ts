import mongoose, { Document } from "mongoose";
export interface userDocument extends Document {
    firstName: string;
    middleName?: string;
    lastName: string;
    userType: 'admin' | 'customer';
    email: string;
    password: string;
    cart: Map<string, number>;
    comparePassword: (password: string) => Promise<boolean>;
}
export declare const User: mongoose.Model<userDocument, {}, {}, {}, mongoose.Document<unknown, {}, userDocument, {}, mongoose.DefaultSchemaOptions> & userDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, userDocument>;
//# sourceMappingURL=user.model.d.ts.map