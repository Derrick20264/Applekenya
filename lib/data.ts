export interface Product {
  id: string
  name: string
  price: number
  description: string
  image: string
  category: string
  stock: number
}

export interface Category {
  id: string
  name: string
  slug: string
}

export const categories: Category[] = [
  { id: '1', name: 'Phones', slug: 'phones' },
  { id: '2', name: 'Tablets', slug: 'tablets' },
  { id: '3', name: 'Electronics', slug: 'electronics' },
]

export const products: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 129870,
    description: 'Latest iPhone with A17 Pro chip and titanium design',
    image: '/placeholder-phone.jpg',
    category: 'phones',
    stock: 50,
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24',
    price: 116870,
    description: 'Flagship Android phone with AI features',
    image: '/placeholder-phone.jpg',
    category: 'phones',
    stock: 45,
  },
  {
    id: '3',
    name: 'iPad Pro 12.9"',
    price: 142870,
    description: 'Powerful tablet with M2 chip',
    image: '/placeholder-tablet.jpg',
    category: 'tablets',
    stock: 30,
  },
  {
    id: '4',
    name: 'Samsung Galaxy Tab S9',
    price: 103870,
    description: 'Premium Android tablet with S Pen',
    image: '/placeholder-tablet.jpg',
    category: 'tablets',
    stock: 25,
  },
  {
    id: '5',
    name: 'AirPods Pro',
    price: 32370,
    description: 'Wireless earbuds with active noise cancellation',
    image: '/placeholder-electronics.jpg',
    category: 'electronics',
    stock: 100,
  },
  {
    id: '6',
    name: 'Sony WH-1000XM5',
    price: 51870,
    description: 'Premium noise-cancelling headphones',
    image: '/placeholder-electronics.jpg',
    category: 'electronics',
    stock: 60,
  },
]
