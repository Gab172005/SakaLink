export const PRODUCTS = [
  { id: 1, name: "Apple", location: "PHYSCI", price: 85, unit: "kg", category: "Fruits", region: "Visayas", certifications: ["Organic"], rating: 5, seller: "Individual Farmer" },
  { id: 2, name: "Mango", location: "CAS Bldg", price: 65, unit: "kg", category: "Fruits", region: "Central Luzon", certifications: ["DA Certified"], rating: 4, seller: "Cooperative" },
  { id: 3, name: "Cabbage", location: "CAS Annex I", price: 95, unit: "crate", category: "Vegetables", region: "CAR / Cordillera", certifications: ["Organic", "Pesticide-Free"], rating: 5, seller: "Commercial Distributor" },
  { id: 4, name: "Carrots", location: "CAS Annex II", price: 75, unit: "kg", category: "Vegetables", region: "Central Luzon", certifications: [], rating: 4, seller: "Individual Farmer" },
  { id: 5, name: "Avocado", location: "Copeland", price: 70, unit: "crate", category: "Fruits", region: "CAR / Cordillera", certifications: ["Pesticide-Free"], rating: 5, seller: "Cooperative" },
  { id: 6, name: "A", location: "Raymundo", price: 55, unit: "kg", category: "Fruits", region: "Visayas", certifications: [], rating: 3, seller: "Individual Farmer" },
  { id: 7, name: "B", location: "711", price: 110, unit: "box", category: "Fruits", region: "Mindanao", certifications: ["Organic", "DA Certified"], rating: 5, seller: "Commercial Distributor" },
  { id: 8, name: "C", location: "Uncle Johns", price: 90, unit: "kg", category: "Fruits", region: "Central Luzon", certifications: ["DA Certified"], rating: 4, seller: "Cooperative" },
  { id: 9, name: "D", location: "FO Santos", price: 45, unit: "kg", category: "Fruits", region: "Central Luzon", certifications: [], rating: 4, seller: "Individual Farmer" },
  { id: 10, name: "E", location: "Lopez", price: 130, unit: "box", category: "Fruits", region: "CAR / Cordillera", certifications: ["Organic", "Pesticide-Free"], rating: 5, seller: "Commercial Distributor" },
];

export const CATEGORIES = [
  { name: "Vegetables", count: 142 },
  { name: "Fruits", count: 88 },
  { name: "Grains & Rice", count: 34 },
  { name: "Herbs", count: 56 },
  { name: "Root Crops", count: 29 },
];

export const CERTIFICATIONS = ["Organic", "DA Certified", "Pesticide-Free"];
export const REGIONS = ["CAR / Cordillera", "Central Luzon", "Mindanao", "Visayas"];
export const RATINGS = [4, 5];
export const UNITS = ["kg", "crate", "box"];
export const SELLER_TYPES = ["Individual Farmer", "Cooperative", "Commercial Distributor"];

export const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rating" },
];