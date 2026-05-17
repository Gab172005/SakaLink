import mongoose, { Schema, Document } from "mongoose";

export interface productDocument extends Document {
  name: string;
  description: string;
  type: number;//1:Vegetables, 2: Poultry & Meat, 3: Fruits, 4: Grains & Rice, 5: Seafood, 6: Dairy & Eggs
  quantity: number;
  price: number;
  image?: string;
  promoted: boolean;//allows the department of agriculture to promote specific crops ideally in frontend implementation there'll be an additional top picks or support disaster struck farmers this is inspired by the rescue by section from rural rising.
  certifications: string[];
  region: string;
}               
                  
                  
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
      enum: [1, 2, 3, 4, 5, 6],
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
    region: {
      type: String,
      enum: [
        "NCR / National Capital Region",
        "CAR / Cordillera Administrative Region",
        "Region I / Ilocos Region",
        "Region II / Cagayan Valley",
        "Region III / Central Luzon",
        "Region IV-A / CALABARZON",
        "MIMAROPA Region",
        "Region V / Bicol Region",
        "Region VI / Western Visayas",
        "Region VII / Central Visayas",
        "Region VIII / Eastern Visayas",
        "Region IX / Zamboanga Peninsula",
        "Region X / Northern Mindanao",
        "Region XI / Davao Region",
        "Region XII / SOCCSKSARGEN",
        "Region XIII / Caraga",
        "BARMM / Bangsamoro Autonomous Region in Muslim Mindanao"
      ],
      required: true
    },
    certifications: {
      type: [String],
      enum: [
        "PhilGAP Certified", 
        "Organic / PhilOA", 
        "PGS Certified", 
        "Halal Certified", 
        "GAqP Certified",//todo: add a hover modal so the avg consumer knows what this shit actually means
        "NMIS Approved"
      ],
      default: []
    }
  },
  { timestamps: true }
);

//.index has mongodb kind of pre sort the list so sorting and searching happens practically instantly instead of having
//to search and sort through the list everytime.
productSchema.index({ name: 1 });
productSchema.index({ type: 1 });
productSchema.index({ price: 1 });
productSchema.index({ quantity: 1 });
productSchema.index({ region: 1 });
productSchema.index({ certifications: 1 });
productSchema.index({ type: 1, price: 1, region: 1 });//this optimizes it even further
export const Product = mongoose.model<productDocument>("Product", productSchema);