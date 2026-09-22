export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  pricePerM2: string;
  image: string;
  description: string;
  stock: number;
  rating: number;
  reviews: number;
}

export const products: Product[] = [
  // Laminate Flooring
  {
    id: 'laminate-001',
    name: 'Rustic Oak Laminate',
    category: 'Laminate Flooring',
    price: 2499,
    pricePerM2: '£4.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/r/u/rustic-oak.jpg',
    description: 'Premium 8mm laminate with realistic wood grain texture',
    stock: 45,
    rating: 4.8,
    reviews: 126,
  },
  {
    id: 'laminate-002',
    name: 'Natural Maple Laminate',
    category: 'Laminate Flooring',
    price: 3199,
    pricePerM2: '£5.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/n/a/natural-maple.jpg',
    description: '10mm thick laminate with AC4 durability rating',
    stock: 32,
    rating: 4.7,
    reviews: 89,
  },
  {
    id: 'laminate-003',
    name: 'Dark Walnut Laminate',
    category: 'Laminate Flooring',
    price: 3999,
    pricePerM2: '£7.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/d/a/dark-walnut.jpg',
    description: 'Premium 12mm laminate with enhanced acoustic properties',
    stock: 28,
    rating: 4.9,
    reviews: 154,
  },

  // Herringbone Flooring
  {
    id: 'herringbone-001',
    name: 'Classic Oak Herringbone',
    category: 'Herringbone',
    price: 850,
    pricePerM2: '£8.50/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/h/e/herringbone-oak.jpg',
    description: 'Authentic herringbone pattern with bevelled edges',
    stock: 60,
    rating: 4.9,
    reviews: 203,
  },
  {
    id: 'herringbone-002',
    name: 'Walnut Herringbone Pattern',
    category: 'Herringbone',
    price: 1299,
    pricePerM2: '£12.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/h/e/herringbone-walnut.jpg',
    description: 'Luxury herringbone with click system for easy installation',
    stock: 35,
    rating: 4.8,
    reviews: 178,
  },
  {
    id: 'herringbone-003',
    name: 'Maple Herringbone Deluxe',
    category: 'Herringbone',
    price: 1599,
    pricePerM2: '£15.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/h/e/herringbone-maple.jpg',
    description: 'Premium engineered herringbone with superior stability',
    stock: 22,
    rating: 4.9,
    reviews: 142,
  },

  // LVT Flooring
  {
    id: 'lvt-001',
    name: 'Stone Look Luxury Vinyl',
    category: 'LVT Flooring',
    price: 2899,
    pricePerM2: '£5.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/l/v/lvt-stone.jpg',
    description: 'Waterproof LVT with realistic stone texture',
    stock: 72,
    rating: 4.7,
    reviews: 198,
  },
  {
    id: 'lvt-002',
    name: 'Oak Look LVT Plank',
    category: 'LVT Flooring',
    price: 3299,
    pricePerM2: '£6.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/l/v/lvt-oak.jpg',
    description: 'Realistic wood-look LVT with embossed surface',
    stock: 88,
    rating: 4.8,
    reviews: 267,
  },
  {
    id: 'lvt-003',
    name: 'Slate Effect LVT Premium',
    category: 'LVT Flooring',
    price: 4199,
    pricePerM2: '£8.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/l/v/lvt-slate.jpg',
    description: 'Ultra-realistic slate with textured finish and underlay',
    stock: 45,
    rating: 4.9,
    reviews: 221,
  },

  // Solid Wood Flooring
  {
    id: 'solid-wood-001',
    name: 'European Oak Solid',
    category: 'Solid Wood Flooring',
    price: 8999,
    pricePerM2: '£29.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/s/o/solid-oak.jpg',
    description: '18mm solid European oak with natural finish',
    stock: 15,
    rating: 4.9,
    reviews: 89,
  },
  {
    id: 'solid-wood-002',
    name: 'Walnut Solid Premium',
    category: 'Solid Wood Flooring',
    price: 12999,
    pricePerM2: '£39.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/s/o/solid-walnut.jpg',
    description: '20mm solid walnut with UV-cured finish',
    stock: 8,
    rating: 5.0,
    reviews: 64,
  },
  {
    id: 'solid-wood-003',
    name: 'Ash Solid Wood Classic',
    category: 'Solid Wood Flooring',
    price: 7999,
    pricePerM2: '£24.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/s/o/solid-ash.jpg',
    description: '18mm solid ash with matte lacquer finish',
    stock: 12,
    rating: 4.8,
    reviews: 73,
  },

  // Engineered Wood Flooring
  {
    id: 'engineered-001',
    name: 'Oak Engineered Classic',
    category: 'Engineered Wood Flooring',
    price: 3799,
    pricePerM2: '£37.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/e/n/engineered-oak.jpg',
    description: '14mm engineered oak with stable plywood core',
    stock: 52,
    rating: 4.8,
    reviews: 167,
  },
  {
    id: 'engineered-002',
    name: 'Walnut Engineered Premium',
    category: 'Engineered Wood Flooring',
    price: 5299,
    pricePerM2: '£52.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/e/n/engineered-walnut.jpg',
    description: '15mm engineered walnut with click joint system',
    stock: 38,
    rating: 4.9,
    reviews: 142,
  },
  {
    id: 'engineered-003',
    name: 'Maple Engineered Deluxe',
    category: 'Engineered Wood Flooring',
    price: 4799,
    pricePerM2: '£47.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/e/n/engineered-maple.jpg',
    description: '14mm engineered maple with three-layer cross construction',
    stock: 31,
    rating: 4.8,
    reviews: 124,
  },

  // Roll Vinyl
  {
    id: 'vinyl-roll-001',
    name: 'Classic Wood Roll Vinyl',
    category: 'Roll Vinyl',
    price: 1299,
    pricePerM2: '£2.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/v/i/vinyl-roll-wood.jpg',
    description: '2m or 3m wide roll vinyl with wood effect',
    stock: 120,
    rating: 4.6,
    reviews: 156,
  },
  {
    id: 'vinyl-roll-002',
    name: 'Stone Effect Roll Vinyl',
    category: 'Roll Vinyl',
    price: 1599,
    pricePerM2: '£3.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/v/i/vinyl-roll-stone.jpg',
    description: '2m/3m roll with realistic stone texture',
    stock: 95,
    rating: 4.7,
    reviews: 189,
  },
  {
    id: 'vinyl-roll-003',
    name: 'Tile Effect Roll Vinyl Premium',
    category: 'Roll Vinyl',
    price: 1999,
    pricePerM2: '£4.99/m²',
    image: 'https://imagely.factory-direct-flooring.co.uk/media/catalog/product/v/i/vinyl-roll-tile.jpg',
    description: '2m/3m premium roll with tile embossing',
    stock: 78,
    rating: 4.8,
    reviews: 143,
  },
];

export function getProductsByCategory(category: string) {
  return products.filter((p) => p.category === category);
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function getAllCategories() {
  return Array.from(new Set(products.map((p) => p.category)));
}
