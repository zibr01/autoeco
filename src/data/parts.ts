export interface PartOffer {
  id: string;
  seller: string;
  sellerLogo: string;
  brand: string;
  type: "original" | "oem" | "analog";
  typeName: string;
  price: number;
  deliveryDays: number;
  inStock: boolean;
  warranty: string;
  partNumber: string;
  rating?: number;
}

export interface Part {
  id: string;
  name: string;
  category: string;
  compatibleCars: string[];
  description: string;
  image?: string;
  offers: PartOffer[];
}

export const parts: Part[] = [
  {
    id: "p1",
    name: "Масляный фильтр",
    category: "Техобслуживание",
    compatibleCars: ["BMW 5 Series (2018–2023)", "BMW 3 Series (2018–2023)"],
    description: "Масляный фильтр для BMW с двигателем B48. Подходит для серий 3, 5, X3, X5 с 2018 года.",
    offers: [
      {
        id: "o1",
        seller: "Exist.ru",
        sellerLogo: "E",
        brand: "BMW Original",
        type: "original",
        typeName: "Оригинал",
        price: 1850,
        deliveryDays: 1,
        inStock: true,
        warranty: "12 месяцев",
        partNumber: "11428507683",
      },
      {
        id: "o2",
        seller: "Autodoc",
        sellerLogo: "A",
        brand: "Mann Filter",
        type: "oem",
        typeName: "OEM",
        price: 890,
        deliveryDays: 2,
        inStock: true,
        warranty: "12 месяцев",
        partNumber: "HU 816 x",
        rating: 4.8,
      },
      {
        id: "o3",
        seller: "Autodoc",
        sellerLogo: "A",
        brand: "Mahle",
        type: "analog",
        typeName: "Аналог",
        price: 720,
        deliveryDays: 3,
        inStock: true,
        warranty: "6 месяцев",
        partNumber: "OX 404D",
        rating: 4.6,
      },
      {
        id: "o4",
        seller: "ЗАП-ПАРТ",
        sellerLogo: "З",
        brand: "Bosch",
        type: "analog",
        typeName: "Аналог",
        price: 640,
        deliveryDays: 2,
        inStock: false,
        warranty: "6 месяцев",
        partNumber: "0 451 103 370",
        rating: 4.5,
      },
    ],
  },
  {
    id: "p2",
    name: "Тормозные колодки передние",
    category: "Тормозная система",
    compatibleCars: ["BMW 5 Series 530i (2018–2023)"],
    description: "Передние тормозные колодки для BMW G30/G31. Совместимы с дисками 340mm.",
    offers: [
      {
        id: "o5",
        seller: "Exist.ru",
        sellerLogo: "E",
        brand: "BMW Original",
        type: "original",
        typeName: "Оригинал",
        price: 12400,
        deliveryDays: 1,
        inStock: true,
        warranty: "24 месяца",
        partNumber: "34116860019",
      },
      {
        id: "o6",
        seller: "Autodoc",
        sellerLogo: "A",
        brand: "Brembo",
        type: "oem",
        typeName: "OEM",
        price: 7800,
        deliveryDays: 2,
        inStock: true,
        warranty: "18 месяцев",
        partNumber: "P 06 063",
        rating: 4.9,
      },
      {
        id: "o7",
        seller: "Авито Запчасти",
        sellerLogo: "АВ",
        brand: "Ate",
        type: "analog",
        typeName: "Аналог",
        price: 5200,
        deliveryDays: 3,
        inStock: true,
        warranty: "12 месяцев",
        partNumber: "13.0460-7205.2",
        rating: 4.6,
      },
    ],
  },
  {
    id: "p3",
    name: "Воздушный фильтр",
    category: "Техобслуживание",
    compatibleCars: ["Toyota Camry 2.5 (2018–2022)"],
    description: "Воздушный фильтр для Toyota Camry XV70 с двигателем A25A-FKS.",
    offers: [
      {
        id: "o8",
        seller: "Exist.ru",
        sellerLogo: "E",
        brand: "Toyota Original",
        type: "original",
        typeName: "Оригинал",
        price: 2100,
        deliveryDays: 1,
        inStock: true,
        warranty: "12 месяцев",
        partNumber: "17801-F0010",
      },
      {
        id: "o9",
        seller: "Autodoc",
        sellerLogo: "A",
        brand: "Mann Filter",
        type: "oem",
        typeName: "OEM",
        price: 980,
        deliveryDays: 2,
        inStock: true,
        warranty: "12 месяцев",
        partNumber: "C 26 115",
        rating: 4.7,
      },
    ],
  },
  {
    id: "p4",
    name: "Аккумулятор 70 Ач",
    category: "Электрооборудование",
    compatibleCars: ["BMW 5 Series 530i", "BMW 3 Series"],
    description: "Стартерный аккумулятор 70Ah 760A AGM для BMW с системой Start-Stop.",
    offers: [
      {
        id: "o10",
        seller: "Exist.ru",
        sellerLogo: "E",
        brand: "BMW Original (Varta)",
        type: "original",
        typeName: "Оригинал",
        price: 16500,
        deliveryDays: 1,
        inStock: true,
        warranty: "36 месяцев",
        partNumber: "61216806755",
      },
      {
        id: "o11",
        seller: "ЗАП-ПАРТ",
        sellerLogo: "З",
        brand: "Varta AGM",
        type: "oem",
        typeName: "OEM",
        price: 12800,
        deliveryDays: 2,
        inStock: true,
        warranty: "36 месяцев",
        partNumber: "A7 570 901 076",
        rating: 4.9,
      },
      {
        id: "o12",
        seller: "Autodoc",
        sellerLogo: "A",
        brand: "Bosch AGM",
        type: "analog",
        typeName: "Аналог",
        price: 11200,
        deliveryDays: 3,
        inStock: true,
        warranty: "24 месяца",
        partNumber: "0 092 S5A 080",
        rating: 4.8,
      },
    ],
  },
  {
    id: "p5",
    name: "Свечи зажигания (к-т 4 шт.)",
    category: "Двигатель",
    compatibleCars: ["Toyota Camry 2.5 (2018–2022)", "Lada Vesta 1.6"],
    description: "Иридиевые свечи зажигания, ресурс до 100 000 км.",
    offers: [
      {
        id: "o13",
        seller: "Exist.ru",
        sellerLogo: "E",
        brand: "Denso Iridium",
        type: "oem",
        typeName: "OEM",
        price: 3600,
        deliveryDays: 1,
        inStock: true,
        warranty: "12 месяцев",
        partNumber: "ITV20TT",
        rating: 4.9,
      },
      {
        id: "o14",
        seller: "Autodoc",
        sellerLogo: "A",
        brand: "NGK Iridium",
        type: "oem",
        typeName: "OEM",
        price: 3200,
        deliveryDays: 2,
        inStock: true,
        warranty: "12 месяцев",
        partNumber: "LZKAR6AP-11",
        rating: 4.8,
      },
      {
        id: "o15",
        seller: "ЗАП-ПАРТ",
        sellerLogo: "З",
        brand: "Bosch",
        type: "analog",
        typeName: "Аналог",
        price: 2400,
        deliveryDays: 2,
        inStock: true,
        warranty: "6 месяцев",
        partNumber: "0 242 240 654",
        rating: 4.5,
      },
    ],
  },
];

export const searchParts = (query: string, carFilter?: string): Part[] => {
  const q = query.toLowerCase();
  return parts.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (carFilter && p.compatibleCars.some((c) => c.toLowerCase().includes(carFilter.toLowerCase())))
  );
};

export const typeColors = {
  original: "bg-brand/10 text-brand border border-brand/15",
  oem: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/15",
  analog: "bg-prussian/[0.04] text-text-muted border border-prussian/[0.08]",
};
