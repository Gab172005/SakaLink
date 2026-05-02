import mongoose, { Schema, Document } from "mongoose";

export interface productDocument extends Document {
  name: string;
  description: string;
  type: number;
  quantity: number;
  price: number;
  image?: string;
  promoted: boolean;//allows the department of agriculture to promote specific crops
}                   //ideally in frontend implementation there'll be an additional top picks or support 
                    //disaster struck farmers
                    //this is inspired by the rescue by section from rural rising.
const productSchema = new Schema<productDocument>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    type: {
      type: Number,
      enum: [1, 2],//crop and poultry
      required: true,
    },
    quantity: { 
      type: Number, 
      required: true, 
      min: 0
    },
    price: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    image: { 
      type: String,
    },
    promoted: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

//.index has mongodb kind of pre sort the list so sorting and searching happens practically instantly instead of having
//to search and sort through the list everytime.
productSchema.index({ name: 1 });
productSchema.index({ type: 1 });
productSchema.index({ price: 1 });
productSchema.index({ quantity: 1 });

export const Product = mongoose.model<productDocument>("Product", productSchema);