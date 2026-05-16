import mongoose, { Document } from "mongoose";
export interface OrderDocument extends Document {
    user: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    quantity: number;
    totalPrice: number;
    status: number;
    email: string;
}
export declare const Order: mongoose.Model<OrderDocument, {}, {}, {}, mongoose.Document<unknown, {}, OrderDocument, {}, mongoose.DefaultSchemaOptions> & OrderDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, OrderDocument>;
//# sourceMappingURL=order.model.d.ts.map