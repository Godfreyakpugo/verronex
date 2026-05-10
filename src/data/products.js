import mac1 from "../assets/images/products/macbook pro m3.webp";
import mac2 from "../assets/images/products/macbook2.jpeg";
import mac3 from "../assets/images/products/macbook3.jpg";

import nothing from "../assets/images/products/Nothing Phone 2.jpg";
import xm5 from "../assets/images/products/sony.avif";
import ipad from "../assets/images/products/ipad pro.webp";

import s23a from "../assets/images/products/s23a.jpg";
import s23b from "../assets/images/products/s23b.jpg";
import s23c from "../assets/images/products/s23c.jpg";

import xiaomi from "../assets/images/products/17pm.jpg";
import xiaomi2 from "../assets/images/products/xiaomi-17-pro-max-3.jpg";


const products = [
  {
    id: "macbook-m3",
    name: "MacBook Pro M3",
    price: 2850000,
    onSale: false, // New field: false as default
    discount: 15, // New field
    category: "laptops",
    images: [mac3, mac2, mac1],
    specs: {
      processor: "Apple M3",
      ram: "16GB",
      storage: "512GB SSD",
      display: "14-inch Retina"
    }
  },

  {
    id: "nothing-phone-2",
    name: "Nothing Phone (2)",
    price: 820000,
    onSale: true,
    discount: 10,
    category: "phones",
    images: [nothing],
    specs: {
      processor: "Snapdragon 8+ Gen 1",
      ram: "12GB",
      storage: "256GB",
      display: "6.7\" OLED"
    }
  },

  {
    id: "sony-xm5",
    name: "Sony WH-1000XM5",
    price: 650000,
    onSale: true,
    discount: 20,
    category: "accessories",
    images: [xm5],
    specs: {
      type: "Wireless Headphones",
      battery: "30 hours",
      noiseCancel: "Active Noise Cancelling"
    }
  },

  {
    id: "ipad-pro-m2",
    name: "iPad Pro M2",
    price: 1450000,
    onSale: false,
    discount: 10,
    category: "tablets",
    images: [ipad],
    specs: {
      processor: "Apple M2",
      storage: "256GB",
      display: "11-inch Liquid Retina"
    }
  },

  {
  id: "samsung-s23-ultra",
  name: "Samsung Galaxy S23 Ultra",
  price: 1650000,
  onSale: true,
  discount: 10,
  category: "phones",
  images: [s23a, s23b, s23c],

  specs: {
    processor: "Snapdragon 8 Gen 2",
    ram: "12GB",
    storage: "512GB",
    display: "6.8-inch Dynamic AMOLED 2X"
  }
},

{
  id: "xiaomi-17-pro-max",
  name: "Xiaomi 17 Pro Max",
  price: 1250000,
  onSale: true,
  discount: 10,
  category: "phones",
  images: [xiaomi, xiaomi2],
  specs: {
    processor: "Snapdragon 8 Gen 2",
    ram: "12GB",
    storage: "512GB",
    display: "6.8-inch Dynamic AMOLED 2X"
  }
}
];

export default products;