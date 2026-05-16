import mongoose, { Document } from "mongoose";
export interface productDocument extends Document {
    name: string;
    description: string;
    type: number;
    quantity: number;
    price: number;
    image?: string;
    promoted: boolean;
}
export declare const Product: mongoose.Model<productDocument, {}, {}, {}, mongoose.Document<unknown, {}, productDocument, {}, mongoose.DefaultSchemaOptions> & productDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, productDocument>;
//# sourceMappingURL=product.model.d.ts.map