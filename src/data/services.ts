export type ServiceType = "sto" | "wash" | "tires" | "detailing" | "master" | "electric";

export interface PriceItem {
  name: string;
  price: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  carModel: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  typeName: string;
  rating: number;
  reviewCount: number;
  address: string;
  district: string;
  city: string;
  phone: string;
  hours: string;
  image: string;
  tags: string[];
  description: string;
  priceFrom: number;
  services: string[];
  priceList: PriceItem[];
  reviews: Review[];
  photos: string[];
  timeSlots: TimeSlot[];
  verified: boolean;
  featured?: boolean;
}

export const services: Service[] = [
  {
    id: "1",
    name: "АвтоТех Премиум",
    type: "sto",
    typeName: "Автосервис",
    rating: 4.9,
    reviewCount: 312,
    address: "ул. Варшавское шоссе, 168А",
    district: "Южный",
    city: "Москва",
    phone: "+7 (495) 555-01-01",
    hours: "08:00 – 21:00",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&auto=format&fit=crop",
    tags: ["BMW", "Mercedes", "Audi", "Официальная диагностика"],
    description:
      "Профессиональный автосервис для европейских автомобилей. Работаем с 2015 года, более 5000 довольных клиентов. Официальное оборудование BMW и Mercedes, оригинальные запчасти со склада.",
    priceFrom: 3500,
    verified: true,
    featured: true,
    services: [
      "Плановое ТО",
      "Диагностика",
      "Замена масла",
      "Тормозная система",
      "Ходовая часть",
      "Двигатель и КПП",
      "Электрика",
      "Климат",
    ],
    priceList: [
      { name: "Замена масла + фильтр", price: "от 3 500 ₽" },
      { name: "Плановое ТО (полный пакет)", price: "от 9 800 ₽" },
      { name: "Компьютерная диагностика", price: "1 500 ₽" },
      { name: "Замена тормозных колодок (ось)", price: "от 4 200 ₽" },
      { name: "Замена свечей (4 шт.)", price: "от 2 800 ₽" },
      { name: "Замена ремня ГРМ в сборе", price: "от 18 000 ₽" },
    ],
    reviews: [
      {
        id: "rv1",
        author: "Алексей К.",
        avatar: "А",
        rating: 5,
        date: "2025-02-14",
        text: "Отличный сервис! Записался онлайн, приехал точно в срок. BMW 530i обслуживают идеально, цены адекватные. Рекомендую!",
        carModel: "BMW 5 Series",
      },
      {
        id: "rv2",
        author: "Мария П.",
        avatar: "М",
        rating: 5,
        date: "2025-01-28",
        text: "Первый раз попала сюда по рекомендации. Сделали диагностику бесплатно при записи через AutoEco. Нашли проблему с подвеской, которую другие не замечали. Спасибо!",
        carModel: "Mercedes C-Class",
      },
      {
        id: "rv3",
        author: "Дмитрий С.",
        avatar: "Д",
        rating: 5,
        date: "2025-01-10",
        text: "Хожу только сюда уже 2 года. Качество на уровне официального дилера, но цены раза в два ниже. Мастера очень грамотные.",
        carModel: "Audi A6",
      },
      {
        id: "rv4",
        author: "Елена В.",
        avatar: "Е",
        rating: 4,
        date: "2024-12-20",
        text: "Хороший сервис, всё объясняют понятно. Единственный минус — иногда берут в работу, а приходится ждать. Но качеством довольна.",
        carModel: "BMW 3 Series",
      },
    ],
    photos: [
      "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1609840113956-500ff23aacf3?w=400&auto=format&fit=crop",
    ],
    timeSlots: [
      { time: "09:00", available: false },
      { time: "10:00", available: true },
      { time: "11:00", available: true },
      { time: "12:00", available: false },
      { time: "13:00", available: true },
      { time: "14:00", available: true },
      { time: "15:00", available: false },
      { time: "16:00", available: true },
      { time: "17:00", available: true },
      { time: "18:00", available: true },
    ],
  },
  {
    id: "2",
    name: "ШинМастер Pro",
    type: "tires",
    typeName: "Шиномонтаж",
    rating: 4.8,
    reviewCount: 789,
    address: "Проспект Мира, 56",
    district: "Центральный",
    city: "Москва",
    phone: "+7 (495) 555-02-02",
    hours: "07:00 – 22:00",
    image: "https://images.unsplash.com/photo-1578843088009-9f1bd854e665?w=800&auto=format&fit=crop",
    tags: ["Быстрая замена", "Балансировка", "Хранение шин"],
    description:
      "Профессиональный шиномонтаж и балансировка. 8 подъёмников, очередь без ожидания. Сезонное хранение шин от 2 500 ₽/сезон.",
    priceFrom: 800,
    verified: true,
    services: ["Шиномонтаж", "Балансировка", "Прокачка азотом", "Хранение шин", "Ремонт проколов"],
    priceList: [
      { name: "Снятие/установка колеса (шт.)", price: "250 ₽" },
      { name: "Балансировка (шт.)", price: "300 ₽" },
      { name: "Смена шин (полный комплект)", price: "от 2 400 ₽" },
      { name: "Ремонт прокола", price: "от 500 ₽" },
      { name: "Хранение шин (сезон)", price: "от 2 500 ₽" },
    ],
    reviews: [
      {
        id: "rv5",
        author: "Игорь Т.",
        avatar: "И",
        rating: 5,
        date: "2025-02-28",
        text: "Записался через приложение, приехал — сразу взяли. За 40 минут поменяли 4 колеса. Отличная работа!",
        carModel: "Toyota Camry",
      },
      {
        id: "rv6",
        author: "Светлана Д.",
        avatar: "С",
        rating: 5,
        date: "2025-02-15",
        text: "Самый быстрый шиномонтаж в районе. Всегда без очереди по записи.",
        carModel: "Lada Vesta",
      },
    ],
    photos: [
      "https://images.unsplash.com/photo-1573074617613-fc8ef27e6a63?w=400&auto=format&fit=crop",
    ],
    timeSlots: [
      { time: "08:00", available: true },
      { time: "09:00", available: true },
      { time: "10:00", available: false },
      { time: "11:00", available: true },
      { time: "12:00", available: true },
      { time: "13:00", available: true },
      { time: "14:00", available: false },
      { time: "15:00", available: true },
    ],
  },
  {
    id: "3",
    name: "AquaShine Детейлинг",
    type: "detailing",
    typeName: "Детейлинг и мойка",
    rating: 4.9,
    reviewCount: 256,
    address: "ул. Тверская, 22",
    district: "Центральный",
    city: "Москва",
    phone: "+7 (495) 555-03-03",
    hours: "09:00 – 21:00",
    image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&auto=format&fit=crop",
    tags: ["Защитные покрытия", "Полировка", "Химчистка"],
    description:
      "Профессиональный детейлинг-центр. Керамические покрытия, полировка кузова, химчистка салона. Используем только профессиональную химию Gyeon и Koch-Chemie.",
    priceFrom: 2000,
    verified: true,
    services: [
      "Детейлинг-мойка",
      "Полировка кузова",
      "Керамическое покрытие",
      "Химчистка салона",
      "Защита кузова",
      "Экспресс-мойка",
    ],
    priceList: [
      { name: "Экспресс-мойка", price: "1 500 ₽" },
      { name: "Детейлинг-мойка (полная)", price: "от 4 500 ₽" },
      { name: "Полировка кузова (2 стадии)", price: "от 25 000 ₽" },
      { name: "Керамическое покрытие Gyeon", price: "от 45 000 ₽" },
      { name: "Химчистка салона", price: "от 8 000 ₽" },
    ],
    reviews: [
      {
        id: "rv7",
        author: "Николай Р.",
        avatar: "Н",
        rating: 5,
        date: "2025-03-01",
        text: "Сделали полировку и керамику — машина как новая! Качество работы просто на высшем уровне.",
        carModel: "BMW 5 Series",
      },
    ],
    photos: [
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&auto=format&fit=crop",
    ],
    timeSlots: [
      { time: "10:00", available: true },
      { time: "12:00", available: false },
      { time: "14:00", available: true },
      { time: "16:00", available: true },
    ],
  },
  {
    id: "4",
    name: "Мастер Владимир Колесников",
    type: "master",
    typeName: "Частный мастер",
    rating: 4.7,
    reviewCount: 143,
    address: "Выезд по Москве и МО",
    district: "По всей Москве",
    city: "Москва",
    phone: "+7 (916) 555-04-04",
    hours: "09:00 – 20:00",
    image: "https://images.unsplash.com/photo-1537637709474-46deaeade5fc?w=400&auto=format&fit=crop",
    tags: ["Выезд на место", "Диагностика", "Лада / Kia / Hyundai"],
    description:
      "Опытный автомеханик с 15-летним стажем. Специализируюсь на японских и корейских автомобилях, Lada. Выезжаю на диагностику и несложный ремонт прямо к вам. Собственный диагностический стенд.",
    priceFrom: 1000,
    verified: true,
    services: ["Выездная диагностика", "Замена масла и фильтров", "Тормозная система", "Мелкий ремонт"],
    priceList: [
      { name: "Выездная диагностика", price: "2 000 ₽" },
      { name: "Замена масла + фильтр (с выездом)", price: "от 2 500 ₽" },
      { name: "Замена колодок (ось, с выездом)", price: "от 3 500 ₽" },
    ],
    reviews: [
      {
        id: "rv8",
        author: "Андрей М.",
        avatar: "А",
        rating: 5,
        date: "2025-01-20",
        text: "Владимир приехал, нашёл проблему за 20 минут. Сэкономил мне кучу времени и денег.",
        carModel: "Lada Vesta",
      },
    ],
    photos: [],
    timeSlots: [
      { time: "10:00", available: true },
      { time: "13:00", available: true },
      { time: "16:00", available: true },
    ],
  },
  {
    id: "5",
    name: "AutoWash 24",
    type: "wash",
    typeName: "Автомойка",
    rating: 4.5,
    reviewCount: 1240,
    address: "МКАД 47 км, внешняя сторона",
    district: "Южный",
    city: "Москва",
    phone: "+7 (495) 555-05-05",
    hours: "00:00 – 24:00",
    image: "https://images.unsplash.com/photo-1594956849073-5b14a8191b01?w=800&auto=format&fit=crop",
    tags: ["Круглосуточно", "Без очереди", "Самообслуживание"],
    description:
      "Автоматическая и ручная мойка круглосуточно. 12 постов самообслуживания, 3 поста ручной мойки. Без записи, без ожидания.",
    priceFrom: 500,
    verified: false,
    services: ["Автоматическая мойка", "Ручная мойка", "Самообслуживание", "Пылесос", "Чернение резины"],
    priceList: [
      { name: "Авто (стандарт)", price: "от 500 ₽" },
      { name: "Авто (full)", price: "от 900 ₽" },
      { name: "Внедорожник (full)", price: "от 1 200 ₽" },
      { name: "Самообслуживание (15 мин)", price: "250 ₽" },
    ],
    reviews: [
      {
        id: "rv9",
        author: "Павел К.",
        avatar: "П",
        rating: 4,
        date: "2025-02-05",
        text: "Хорошая мойка, работает круглосуточно. Удобно после работы.",
        carModel: "Toyota Camry",
      },
    ],
    photos: [],
    timeSlots: [
      { time: "Без записи", available: true },
    ],
  },
  {
    id: "6",
    name: "ЭлектроМоторс",
    type: "electric",
    typeName: "Автоэлектрик",
    rating: 4.8,
    reviewCount: 198,
    address: "ул. Автозаводская, 23",
    district: "Южный",
    city: "Москва",
    phone: "+7 (495) 555-06-06",
    hours: "09:00 – 20:00",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop",
    tags: ["Электроника", "Аккумуляторы", "Сигнализация", "Камеры"],
    description:
      "Специализируемся на автоэлектрике и электронике. Диагностика ошибок, замена аккумуляторов, установка сигнализаций, видеорегистраторов, камер.",
    priceFrom: 1500,
    verified: true,
    services: ["Диагностика ошибок", "Замена аккумулятора", "Установка сигнализации", "Видеорегистратор", "Камеры"],
    priceList: [
      { name: "Компьютерная диагностика", price: "1 500 ₽" },
      { name: "Замена аккумулятора (работа)", price: "500 ₽" },
      { name: "Установка сигнализации StarLine", price: "от 7 500 ₽" },
    ],
    reviews: [
      {
        id: "rv10",
        author: "Максим О.",
        avatar: "М",
        rating: 5,
        date: "2025-02-10",
        text: "Нашли проблему с электрикой, которую три других сервиса не могли найти месяц. Мастера профессионалы!",
        carModel: "BMW 5 Series",
      },
    ],
    photos: [],
    timeSlots: [
      { time: "10:00", available: true },
      { time: "12:00", available: true },
      { time: "14:00", available: false },
      { time: "16:00", available: true },
    ],
  },
  {
    id: "7",
    name: "GarageOne Techcenter",
    type: "sto",
    typeName: "Автосервис",
    rating: 4.6,
    reviewCount: 421,
    address: "Ленинградское шоссе, 112",
    district: "Северный",
    city: "Москва",
    phone: "+7 (495) 555-07-07",
    hours: "08:00 – 22:00",
    image: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&auto=format&fit=crop",
    tags: ["Японские авто", "Kia", "Hyundai", "Nissan"],
    description:
      "Специализация на японских и корейских автомобилях. Честные цены, оригинальные и качественные аналоги запчастей. Гарантия на все виды работ 6 месяцев.",
    priceFrom: 2500,
    verified: true,
    services: ["Плановое ТО", "Ходовая", "Двигатель", "Кузов", "Шины", "Диагностика"],
    priceList: [
      { name: "Замена масла + фильтр", price: "от 2 500 ₽" },
      { name: "Плановое ТО", price: "от 7 500 ₽" },
      { name: "Диагностика", price: "1 200 ₽" },
    ],
    reviews: [
      {
        id: "rv11",
        author: "Сергей Л.",
        avatar: "С",
        rating: 5,
        date: "2025-01-15",
        text: "Лучший сервис для Hyundai в Москве. Быстро, качественно, цены ниже дилерских.",
        carModel: "Hyundai Sonata",
      },
    ],
    photos: [],
    timeSlots: [
      { time: "09:00", available: true },
      { time: "11:00", available: true },
      { time: "13:00", available: true },
      { time: "15:00", available: false },
    ],
  },
  {
    id: "8",
    name: "LadaMaster",
    type: "sto",
    typeName: "Автосервис",
    rating: 4.4,
    reviewCount: 567,
    address: "Рязанский проспект, 85",
    district: "Восточный",
    city: "Москва",
    phone: "+7 (495) 555-08-08",
    hours: "08:00 – 21:00",
    image: "https://images.unsplash.com/photo-1562141947-96f4ea73d82c?w=800&auto=format&fit=crop",
    tags: ["Lada", "ВАЗ", "Доступные цены", "Запчасти на месте"],
    description:
      "Специализированный сервис для отечественных автомобилей Lada и ВАЗ. Большой склад запчастей, работаем быстро и по доступным ценам.",
    priceFrom: 800,
    verified: false,
    services: ["ТО Lada", "Ходовая", "Кузов", "Электрика", "Трансмиссия"],
    priceList: [
      { name: "ТО Lada (масло + фильтры)", price: "от 3 500 ₽" },
      { name: "Замена сцепления", price: "от 5 000 ₽" },
      { name: "Ремонт подвески (стойки)", price: "от 2 500 ₽" },
    ],
    reviews: [
      {
        id: "rv12",
        author: "Виктор П.",
        avatar: "В",
        rating: 4,
        date: "2025-02-22",
        text: "Хорошее место для обслуживания Весты. Цены нормальные, делают быстро.",
        carModel: "Lada Vesta",
      },
    ],
    photos: [],
    timeSlots: [
      { time: "09:00", available: true },
      { time: "10:00", available: true },
      { time: "11:00", available: false },
      { time: "14:00", available: true },
    ],
  },
];

export const getService = (id: string): Service | undefined =>
  services.find((s) => s.id === id);

export const serviceTypeColors: Record<ServiceType, string> = {
  sto: "bg-brand/10 text-brand border-brand/15",
  wash: "bg-sky-500/10 text-sky-600 border-sky-500/15",
  tires: "bg-emerald-500/10 text-emerald-600 border-emerald-500/15",
  detailing: "bg-purple-500/10 text-purple-600 border-purple-500/15",
  master: "bg-accent/10 text-accent-dark border-accent/15",
  electric: "bg-yellow-500/10 text-yellow-600 border-yellow-500/15",
};
