export const CATEGORIES = [
  { name: 'Vegetables', count: 124 },
  { name: 'Fruits', count: 82 },
  { name: 'Grains & Rice', count: 45 },
  { name: 'Poultry & Meat', count: 38 },
  { name: 'Seafood', count: 29 },
  { name: 'Dairy & Eggs', count: 18 },
];

export const CERTIFICATIONS = [
  'Organic',
  'GAP Certified',
  'Halal Certified',
  'Fair Trade',
];

export const REGIONS = [
  'CAR / Cordillera',
  'Region I / Ilocos',
  'Region II / Cagayan Valley',
  'Region III / Central Luzon',
  'Region IV-A / CALABARZON',
  'Region V / Bicol',
];

export const SELLER_TYPES = ['Individual Farmer', 'Cooperative', 'Local Farm'];
export const UNITS = ['kg', 'pc', 'bundle', 'sack'];
export const RATINGS = [5, 4, 3, 2, 1];

export const PRODUCTS = [
  {
    id: 1,
    name: "Benguet Highland Lettuce",
    category: "Vegetables",
    price: 85,
    unit: "kg",
    location: "La Trinidad, Benguet",
    region: "CAR / Cordillera",
    certifications: ["Organic", "GAP Certified"],
    rating: 5,
    seller: "Individual Farmer",
    image: "🥬"
  },
  {
    id: 2,
    name: "Red Carabao Mangoes",
    category: "Fruits",
    price: 180,
    unit: "kg",
    location: "Guimaras",
    region: "Region VI / Western Visayas",
    certifications: ["GAP Certified"],
    rating: 5,
    seller: "Cooperative",
    image: "🥭"
  },
  {
    id: 3,
    name: "Dinorado Rice (Premium)",
    category: "Grains & Rice",
    price: 55,
    unit: "kg",
    location: "Isabela",
    region: "Region II / Cagayan Valley",
    certifications: ["Halal Certified"],
    rating: 4,
    seller: "Local Farm",
    image: "🌾"
  },
  {
    id: 4,
    name: "Free-range Native Chicken",
    category: "Poultry & Meat",
    price: 320,
    unit: "pc",
    location: "Batangas",
    region: "Region IV-A / CALABARZON",
    certifications: ["Organic"],
    rating: 4,
    seller: "Individual Farmer",
    image: "🍗"
  },
  {
    id: 5,
    name: "Fresh Catch Tilapia",
    category: "Seafood",
    price: 140,
    unit: "kg",
    location: "Pampanga",
    region: "Region III / Central Luzon",
    certifications: ["GAP Certified"],
    rating: 4,
    seller: "Cooperative",
    image: "🐟"
  },
  {
    id: 6,
    name: "Organic Brown Eggs",
    category: "Dairy & Eggs",
    price: 12,
    unit: "pc",
    location: "Cavite",
    region: "Region IV-A / CALABARZON",
    certifications: ["Organic"],
    rating: 5,
    seller: "Individual Farmer",
    image: "🥚"
  },
];

export const SORT_OPTIONS = [
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
  { label: "Price (Low to High)", value: "price-asc" },
  { label: "Price (High to Low)", value: "price-desc" },
  { label: "Location", value: "location" },
];
