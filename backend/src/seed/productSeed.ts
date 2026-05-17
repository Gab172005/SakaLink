import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";

const mockProducts = [
  {
    "name": "Baguio Wombok (Napa Cabbage)",
    "description": "Crisp, fresh highland cabbage harvested straight from Benguet farmers.",
    "type": 1,
    "quantity": 350,
    "price": 65,
    "image": "https://images.unsplash.com/photo-1550143043-35b1ff140881?auto=format&fit=crop&w=600&q=80",
    "promoted": true,
    "region": "CAR / Cordillera Administrative Region",
    "certifications": ["PhilGAP Certified", "PGS Certified"]
  },
  {
    "name": "Ilocos Red Onions",
    "description": "Pungent and well-dried red onions with a long shelf-life.",
    "type": 1,
    "quantity": 1200,
    "price": 140,
    "image": "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80",
    "promoted": false,
    "region": "Region I / Ilocos Region",
    "certifications": ["PhilGAP Certified"]
  },
  {
    "name": "Native Ampalaya",
    "description": "Freshly picked lowland bitter gourd. Crunchy texture.",
    "type": 1,
    "quantity": 180,
    "price": 90,
    "image": "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?auto=format&fit=crop&w=600&q=80",
    "promoted": false,
    "region": "Region III / Central Luzon",
    "certifications": ["Organic / PhilOA"]
  },
  {
    "name": "Dressed Native Chicken",
    "description": "All-natural, hormone-free native chicken. Cleaned and chilled.",
    "type": 2,
    "quantity": 150,
    "price": 220,
    "image": "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80",
    "promoted": false,
    "region": "Region IV-A / CALABARZON",
    "certifications": ["Halal Certified", "NMIS Approved"]
  },
  {
    "name": "Batangas Pork Liempo",
    "description": "Fresh, locally slaughtered pork belly cut from standard-compliant farms.",
    "type": 2,
    "quantity": 220,
    "price": 340,
    "image": "https://images.unsplash.com/photo-1532486749414-b1ebfe36691c?auto=format&fit=crop&w=600&q=80",
    "promoted": false,
    "region": "Region IV-A / CALABARZON",
    "certifications": ["NMIS Approved"]
  },
  {
    "name": "Premium Beef Caldereta Cuts",
    "description": "Grass-fed local beef chunks perfect for slow cooking.",
    "type": 2,
    "quantity": 110,
    "price": 420,
    "image": "https://images.unsplash.com/photo-1588168333627-74e5033c7f92?auto=format&fit=crop&w=600&q=80",
    "promoted": false,
    "region": "Region II / Cagayan Valley",
    "certifications": ["NMIS Approved"]
  },
  {
    "name": "Davao Carabao Mangoes",
    "description": "Sweet, export-quality mangoes from Davao orchard growers.",
    "type": 3,
    "quantity": 500,
    "price": 180,
    "image": "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
    "promoted": false,
    "region": "Region XI / Davao Region",
    "certifications": ["PhilGAP Certified"]
  },
  {
    "name": "Guimaras Bananas (Moko)",
    "description": "Rescue Buy! Overproduction due to sudden shipping delays.",
    "type": 3,
    "quantity": 850,
    "price": 45,
    "image": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
    "promoted": true,
    "region": "Region VI / Western Visayas",
    "certifications": ["PhilGAP Certified"]
  },
  {
    "name": "Tagaytay Pineapple Choice",
    "description": "Sweet and juicy pineapples harvested fresh from Cavite hillsides.",
    "type": 3,
    "quantity": 300,
    "price": 70,
    "image": "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80",
    "promoted": false,
    "region": "Region IV-A / CALABARZON",
    "certifications": ["PhilGAP Certified"]
  },
  {
    "name": "Premium Dinorado Milled Rice",
    "description": "Fragrant, soft-cooking local white rice from Nueva Ecija.",
    "type": 4,
    "quantity": 2500,
    "price": 56,
    "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    "promoted": false,
    "region": "Region III / Central Luzon",
    "certifications": ["PhilGAP Certified"]
  },
  {
    "name": "Organic White Corn Kernels",
    "description": "Traditional non-GMO white corn harvested by indigenous communities.",
    "type": 4,
    "quantity": 400,
    "price": 75,
    "image": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80",
    "promoted": false,
    "region": "Region II / Cagayan Valley",
    "certifications": ["Organic / PhilOA", "PhilGAP Certified"]
  },
  {
    "name": "Iloilo Red Rice (Unpolished)",
    "description": "Nutrient-dense, organic red rice packed with antioxidants.",
    "type": 4,
    "quantity": 600,
    "price": 85,
    "image": "https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=600&q=80",
    "promoted": false,
    "region": "Region VI / Western Visayas",
    "certifications": ["Organic / PhilOA"]
  },
  {
    "name": "Fresh Dagupan Bangus",
    "description": "Freshly harvested milkfish. Cleaned, gutted, and descaled.",
    "type": 5,
    "quantity": 300,
    "price": 160,
    "image": "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=600&q=80",
    "promoted": false,
    "region": "Region I / Ilocos Region",
    "certifications": ["PhilGAP Certified"]
  },
  {
    "name": "Roxas Tiger Prawns (Sugpo)",
    "description": "Premium aquaculture prawns from the seafood capital. Flash-frozen.",
    "type": 5,
    "quantity": 120,
    "price": 480,
    "image": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80",
    "promoted": false,
    "region": "Region VI / Western Visayas",
    "certifications": ["Halal Certified"]
  },
  {
    "name": "Zamboanga Yellowfin Tuna Fillet",
    "description": "Sashimi-grade tuna portions processed under strict safety standards.",
    "type": 5,
    "quantity": 85,
    "price": 490,
    "image": "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=600&q=80",
    "promoted": false,
    "region": "Region IX / Zamboanga Peninsula",
    "certifications": ["Halal Certified", "GAqP Certified"]
  },
  {
    "name": "Fresh Table Eggs (Tray of 30)",
    "description": "Medium-sized fresh chicken eggs delivered from poultry layer farms.",
    "type": 6,
    "quantity": 600,
    "price": 210,
    "image": "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=600&q=80",
    "promoted": false,
    "region": "Region IV-A / CALABARZON",
    "certifications": ["NMIS Approved"]
  },
  {
    "name": "Laguna Fresh Carabao Milk",
    "description": "Pasteurized, pure whole carabao milk from dairy cooperatives.",
    "type": 6,
    "quantity": 90,
    "price": 130,
    "image": "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80",
    "promoted": true,
    "region": "Region IV-A / CALABARZON",
    "certifications": ["PGS Certified"]
  },
  {
    "name": "Organic Salted Duck Eggs",
    "description": "Traditional salted eggs made using clay mud curing from Victoria.",
    "type": 6,
    "quantity": 450,
    "price": 12,
    "image": "https://images.unsplash.com/photo-1590483736622-39da8af7ffbc?auto=format&fit=crop&w=600&q=80",
    "promoted": false,
    "region": "Region III / Central Luzon",
    "certifications": ["PGS Certified"]
  }
];

const ATLAS_URI = process.env.MONGODB_URI;

async function seedDatabase() {
  if (!ATLAS_URI) {
    console.error("Error: MONGODB_URI is undefined");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Atlas Cluster...");
    await mongoose.connect(ATLAS_URI);
    console.log("Connected successfully.");

    console.log("Clearing old products collection...");
    await Product.deleteMany({});

    console.log("Inserting mock items...");
    await Product.insertMany(mockProducts);
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

seedDatabase();