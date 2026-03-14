import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Начинаем заполнение базы данных...");

  // Clean existing data
  await prisma.booking.deleteMany();
  await prisma.partOffer.deleteMany();
  await prisma.part.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.review.deleteMany();
  await prisma.priceItem.deleteMany();
  await prisma.serviceCenter.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.car.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // ─── User ──────────────────────────────────────

  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.create({
    data: {
      name: "Кирилл",
      email: "kirill@example.com",
      passwordHash,
      phone: "+7 (916) 123-45-67",
      city: "Москва",
      subscription: "PREMIUM",
    },
  });

  console.log(`✅ Пользователь: ${user.name} (${user.email})`);

  // ─── Cars ──────────────────────────────────────

  const bmw = await prisma.car.create({
    data: {
      userId: user.id,
      make: "BMW",
      model: "5 Series 530i",
      year: 2021,
      vin: "WBA53AH08MWX12345",
      mileage: 87400,
      color: "Серый металлик",
      engine: "2.0L Twin-Turbo 249 л.с.",
      transmission: "Автомат 8-ст.",
      fuelType: "Бензин",
      health: 82,
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop",
      licensePlate: "А777БВ 77",
      nextService: "через 2 600 км",
    },
  });

  const toyota = await prisma.car.create({
    data: {
      userId: user.id,
      make: "Toyota",
      model: "Camry 2.5",
      year: 2019,
      vin: "4T1BF1FK0KU123456",
      mileage: 124700,
      color: "Белый перламутр",
      engine: "2.5L 181 л.с.",
      transmission: "Автомат 6-ст.",
      fuelType: "Бензин",
      health: 65,
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop",
      licensePlate: "Х544ОК 97",
      nextService: "просрочено",
    },
  });

  const lada = await prisma.car.create({
    data: {
      userId: user.id,
      make: "Lada",
      model: "Vesta SW Cross",
      year: 2022,
      vin: "XTA21176MC1234567",
      mileage: 34200,
      color: "Тёмно-синий",
      engine: "1.6L 113 л.с.",
      transmission: "Механика 5-ст.",
      fuelType: "Бензин",
      health: 94,
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop",
      licensePlate: "В234КМ 199",
      nextService: "через 5 800 км",
    },
  });

  console.log(`✅ Автомобили: BMW, Toyota, Lada`);

  // ─── Maintenance Records ───────────────────────

  await prisma.maintenanceRecord.createMany({
    data: [
      // BMW
      { carId: bmw.id, date: new Date("2024-11-15"), mileage: 85000, type: "Плановое ТО", description: "Замена масла и фильтров, диагностика", cost: 12500, serviceName: "BMW Сервис Центр Москва" },
      { carId: bmw.id, date: new Date("2024-08-20"), mileage: 80000, type: "Замена тормозных колодок", description: "Передние тормозные колодки Brembo", cost: 8900, serviceName: "АвтоТех на Варшавке" },
      { carId: bmw.id, date: new Date("2024-04-10"), mileage: 75000, type: "Замена шин", description: "Летняя резина Michelin Pilot Sport 4 — 4 шт.", cost: 62000, serviceName: "ШинМастер" },
      { carId: bmw.id, date: new Date("2023-11-05"), mileage: 70000, type: "Плановое ТО", description: "Замена масла, воздушного фильтра, свечей", cost: 15800, serviceName: "BMW Сервис Центр Москва" },
      { carId: bmw.id, date: new Date("2023-06-18"), mileage: 65000, type: "Замена шин", description: "Зимняя резина Michelin X-Ice — 4 шт.", cost: 58000, serviceName: "ШинМастер" },
      { carId: bmw.id, date: new Date("2023-02-28"), mileage: 60000, type: "Замена тормозной жидкости", description: "Замена тормозной жидкости DOT 4", cost: 3200, serviceName: "АвтоТех на Варшавке" },
      // Toyota
      { carId: toyota.id, date: new Date("2024-09-10"), mileage: 120000, type: "Плановое ТО", description: "Замена масла, ремня ГРМ, помпы", cost: 28000, serviceName: "Toyota Официальный Дилер" },
      { carId: toyota.id, date: new Date("2024-03-15"), mileage: 115000, type: "Замена тормозных дисков и колодок", description: "Задние диски и колодки в сборе", cost: 16500, serviceName: "МастерАвто" },
      { carId: toyota.id, date: new Date("2023-10-20"), mileage: 110000, type: "Плановое ТО", description: "Замена масла, фильтров, свечей", cost: 11200, serviceName: "Toyota Официальный Дилер" },
      // Lada
      { carId: lada.id, date: new Date("2024-12-01"), mileage: 30000, type: "Плановое ТО", description: "Замена масла, фильтров, проверка ходовой", cost: 6500, serviceName: "Лада Сервис Авиамоторная" },
      { carId: lada.id, date: new Date("2024-04-05"), mileage: 15000, type: "ТО-1", description: "Плановый осмотр и замена масла", cost: 4800, serviceName: "Лада Сервис Авиамоторная" },
    ],
  });

  console.log(`✅ Записи ТО: 11 шт.`);

  // ─── Reminders ─────────────────────────────────

  await prisma.reminder.createMany({
    data: [
      // BMW
      { carId: bmw.id, type: "oil", title: "Замена масла", dueMileage: 90000, urgency: "medium", description: "Последняя замена на 85 000 км. Рекомендуем заменить через 2 600 км." },
      { carId: bmw.id, type: "tires", title: "Замена резины на зимнюю", dueDate: new Date("2025-10-15"), urgency: "low", description: "Рекомендуем менять шины при температуре ниже +7°C" },
      { carId: bmw.id, type: "insurance", title: "Продление ОСАГО", dueDate: new Date("2025-06-01"), urgency: "low", description: "ОСАГО истекает 1 июня 2025 года. Осталось 79 дней." },
      { carId: bmw.id, type: "brakes", title: "Проверка задних колодок", dueMileage: 95000, urgency: "low", description: "По нормативу замена задних колодок каждые 30 000 км" },
      // Toyota
      { carId: toyota.id, type: "oil", title: "Замена масла — ПРОСРОЧЕНО", dueMileage: 125000, urgency: "high", description: "Плановое ТО просрочено! Пробег превышен. Запишитесь на сервис как можно скорее." },
      { carId: toyota.id, type: "inspection", title: "Технический осмотр", dueDate: new Date("2025-05-20"), urgency: "medium", description: "Технический осмотр истекает 20 мая 2025 года." },
      { carId: toyota.id, type: "battery", title: "Проверка аккумулятора", urgency: "medium", description: "Аккумулятор не менялся с 2019 года. Рекомендуем проверку перед зимой." },
      // Lada
      { carId: lada.id, type: "oil", title: "Замена масла", dueMileage: 40000, urgency: "low", description: "Следующее ТО через 5 800 км или 8 месяцев." },
      { carId: lada.id, type: "tires", title: "Замена резины на летнюю", dueDate: new Date("2025-04-15"), urgency: "low", description: "Рекомендуем переход на летние шины в апреле." },
    ],
  });

  console.log(`✅ Напоминания: 9 шт.`);

  // ─── Service Centers ───────────────────────────

  const sc1 = await prisma.serviceCenter.create({
    data: {
      name: "АвтоТех Премиум", type: "sto", typeName: "Автосервис", rating: 4.9, reviewCount: 312,
      address: "ул. Варшавское шоссе, 168А", district: "Южный", city: "Москва",
      phone: "+7 (495) 555-01-01", hours: "08:00 – 21:00",
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&auto=format&fit=crop",
      tags: JSON.stringify(["BMW", "Mercedes", "Audi", "Официальная диагностика"]),
      description: "Профессиональный автосервис для европейских автомобилей. Работаем с 2015 года, более 5000 довольных клиентов.",
      priceFrom: 3500, verified: true, featured: true,
      services: JSON.stringify(["Плановое ТО", "Диагностика", "Замена масла", "Тормозная система", "Ходовая часть", "Двигатель и КПП", "Электрика", "Климат"]),
      photos: JSON.stringify(["https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=400&auto=format&fit=crop", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop", "https://images.unsplash.com/photo-1609840113956-500ff23aacf3?w=400&auto=format&fit=crop"]),
    },
  });

  const sc2 = await prisma.serviceCenter.create({
    data: {
      name: "ШинМастер Pro", type: "tires", typeName: "Шиномонтаж", rating: 4.8, reviewCount: 789,
      address: "Проспект Мира, 56", district: "Центральный", city: "Москва",
      phone: "+7 (495) 555-02-02", hours: "07:00 – 22:00",
      image: "https://images.unsplash.com/photo-1578843088009-9f1bd854e665?w=800&auto=format&fit=crop",
      tags: JSON.stringify(["Быстрая замена", "Балансировка", "Хранение шин"]),
      description: "Профессиональный шиномонтаж и балансировка. 8 подъёмников, очередь без ожидания.",
      priceFrom: 800, verified: true, featured: false,
      services: JSON.stringify(["Шиномонтаж", "Балансировка", "Прокачка азотом", "Хранение шин", "Ремонт проколов"]),
      photos: JSON.stringify(["https://images.unsplash.com/photo-1573074617613-fc8ef27e6a63?w=400&auto=format&fit=crop"]),
    },
  });

  const sc3 = await prisma.serviceCenter.create({
    data: {
      name: "AquaShine Детейлинг", type: "detailing", typeName: "Детейлинг и мойка", rating: 4.9, reviewCount: 256,
      address: "ул. Тверская, 22", district: "Центральный", city: "Москва",
      phone: "+7 (495) 555-03-03", hours: "09:00 – 21:00",
      image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&auto=format&fit=crop",
      tags: JSON.stringify(["Защитные покрытия", "Полировка", "Химчистка"]),
      description: "Профессиональный детейлинг-центр. Керамические покрытия, полировка кузова, химчистка салона.",
      priceFrom: 2000, verified: true, featured: false,
      services: JSON.stringify(["Детейлинг-мойка", "Полировка кузова", "Керамическое покрытие", "Химчистка салона", "Защита кузова", "Экспресс-мойка"]),
      photos: JSON.stringify(["https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&auto=format&fit=crop"]),
    },
  });

  await prisma.serviceCenter.createMany({
    data: [
      {
        name: "Мастер Владимир Колесников", type: "master", typeName: "Частный мастер", rating: 4.7, reviewCount: 143,
        address: "Выезд по Москве и МО", district: "По всей Москве", city: "Москва",
        phone: "+7 (916) 555-04-04", hours: "09:00 – 20:00",
        image: "https://images.unsplash.com/photo-1537637709474-46deaeade5fc?w=400&auto=format&fit=crop",
        tags: JSON.stringify(["Выезд на место", "Диагностика", "Лада / Kia / Hyundai"]),
        description: "Опытный автомеханик с 15-летним стажем.",
        priceFrom: 1000, verified: true, featured: false,
        services: JSON.stringify(["Выездная диагностика", "Замена масла и фильтров", "Тормозная система", "Мелкий ремонт"]),
        photos: JSON.stringify([]),
      },
      {
        name: "AutoWash 24", type: "wash", typeName: "Автомойка", rating: 4.5, reviewCount: 1240,
        address: "МКАД 47 км, внешняя сторона", district: "Южный", city: "Москва",
        phone: "+7 (495) 555-05-05", hours: "00:00 – 24:00",
        image: "https://images.unsplash.com/photo-1594956849073-5b14a8191b01?w=800&auto=format&fit=crop",
        tags: JSON.stringify(["Круглосуточно", "Без очереди", "Самообслуживание"]),
        description: "Автоматическая и ручная мойка круглосуточно.",
        priceFrom: 500, verified: false, featured: false,
        services: JSON.stringify(["Автоматическая мойка", "Ручная мойка", "Самообслуживание", "Пылесос", "Чернение резины"]),
        photos: JSON.stringify([]),
      },
      {
        name: "ЭлектроМоторс", type: "electric", typeName: "Автоэлектрик", rating: 4.8, reviewCount: 198,
        address: "ул. Автозаводская, 23", district: "Южный", city: "Москва",
        phone: "+7 (495) 555-06-06", hours: "09:00 – 20:00",
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop",
        tags: JSON.stringify(["Электроника", "Аккумуляторы", "Сигнализация", "Камеры"]),
        description: "Специализируемся на автоэлектрике и электронике.",
        priceFrom: 1500, verified: true, featured: false,
        services: JSON.stringify(["Диагностика ошибок", "Замена аккумулятора", "Установка сигнализации", "Видеорегистратор", "Камеры"]),
        photos: JSON.stringify([]),
      },
      {
        name: "GarageOne Techcenter", type: "sto", typeName: "Автосервис", rating: 4.6, reviewCount: 421,
        address: "Ленинградское шоссе, 112", district: "Северный", city: "Москва",
        phone: "+7 (495) 555-07-07", hours: "08:00 – 22:00",
        image: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&auto=format&fit=crop",
        tags: JSON.stringify(["Японские авто", "Kia", "Hyundai", "Nissan"]),
        description: "Специализация на японских и корейских автомобилях.",
        priceFrom: 2500, verified: true, featured: false,
        services: JSON.stringify(["Плановое ТО", "Ходовая", "Двигатель", "Кузов", "Шины", "Диагностика"]),
        photos: JSON.stringify([]),
      },
      {
        name: "LadaMaster", type: "sto", typeName: "Автосервис", rating: 4.4, reviewCount: 567,
        address: "Рязанский проспект, 85", district: "Восточный", city: "Москва",
        phone: "+7 (495) 555-08-08", hours: "08:00 – 21:00",
        image: "https://images.unsplash.com/photo-1562141947-96f4ea73d82c?w=800&auto=format&fit=crop",
        tags: JSON.stringify(["Lada", "ВАЗ", "Доступные цены", "Запчасти на месте"]),
        description: "Специализированный сервис для отечественных автомобилей Lada и ВАЗ.",
        priceFrom: 800, verified: false, featured: false,
        services: JSON.stringify(["ТО Lada", "Ходовая", "Кузов", "Электрика", "Трансмиссия"]),
        photos: JSON.stringify([]),
      },
    ],
  });

  console.log(`✅ Сервисы: 8 шт.`);

  // ─── Price Items ───────────────────────────────

  await prisma.priceItem.createMany({
    data: [
      { serviceCenterId: sc1.id, name: "Замена масла + фильтр", price: "от 3 500 ₽" },
      { serviceCenterId: sc1.id, name: "Плановое ТО (полный пакет)", price: "от 9 800 ₽" },
      { serviceCenterId: sc1.id, name: "Компьютерная диагностика", price: "1 500 ₽" },
      { serviceCenterId: sc1.id, name: "Замена тормозных колодок (ось)", price: "от 4 200 ₽" },
      { serviceCenterId: sc1.id, name: "Замена свечей (4 шт.)", price: "от 2 800 ₽" },
      { serviceCenterId: sc1.id, name: "Замена ремня ГРМ в сборе", price: "от 18 000 ₽" },
      { serviceCenterId: sc2.id, name: "Снятие/установка колеса (шт.)", price: "250 ₽" },
      { serviceCenterId: sc2.id, name: "Балансировка (шт.)", price: "300 ₽" },
      { serviceCenterId: sc2.id, name: "Смена шин (полный комплект)", price: "от 2 400 ₽" },
      { serviceCenterId: sc2.id, name: "Ремонт прокола", price: "от 500 ₽" },
      { serviceCenterId: sc2.id, name: "Хранение шин (сезон)", price: "от 2 500 ₽" },
      { serviceCenterId: sc3.id, name: "Экспресс-мойка", price: "1 500 ₽" },
      { serviceCenterId: sc3.id, name: "Детейлинг-мойка (полная)", price: "от 4 500 ₽" },
      { serviceCenterId: sc3.id, name: "Полировка кузова (2 стадии)", price: "от 25 000 ₽" },
      { serviceCenterId: sc3.id, name: "Керамическое покрытие Gyeon", price: "от 45 000 ₽" },
      { serviceCenterId: sc3.id, name: "Химчистка салона", price: "от 8 000 ₽" },
    ],
  });

  // ─── Reviews ───────────────────────────────────

  await prisma.review.createMany({
    data: [
      { serviceCenterId: sc1.id, author: "Алексей К.", avatar: "А", rating: 5, date: new Date("2025-02-14"), text: "Отличный сервис! Записался онлайн, приехал точно в срок. BMW 530i обслуживают идеально, цены адекватные.", carModel: "BMW 5 Series" },
      { serviceCenterId: sc1.id, author: "Мария П.", avatar: "М", rating: 5, date: new Date("2025-01-28"), text: "Первый раз попала сюда по рекомендации. Сделали диагностику бесплатно при записи через AutoEco.", carModel: "Mercedes C-Class" },
      { serviceCenterId: sc1.id, author: "Дмитрий С.", avatar: "Д", rating: 5, date: new Date("2025-01-10"), text: "Хожу только сюда уже 2 года. Качество на уровне официального дилера, но цены раза в два ниже.", carModel: "Audi A6" },
      { serviceCenterId: sc1.id, author: "Елена В.", avatar: "Е", rating: 4, date: new Date("2024-12-20"), text: "Хороший сервис, всё объясняют понятно. Единственный минус — иногда приходится ждать.", carModel: "BMW 3 Series" },
      { serviceCenterId: sc2.id, author: "Игорь Т.", avatar: "И", rating: 5, date: new Date("2025-02-28"), text: "Записался через приложение, приехал — сразу взяли. За 40 минут поменяли 4 колеса.", carModel: "Toyota Camry" },
      { serviceCenterId: sc2.id, author: "Светлана Д.", avatar: "С", rating: 5, date: new Date("2025-02-15"), text: "Самый быстрый шиномонтаж в районе. Всегда без очереди по записи.", carModel: "Lada Vesta" },
      { serviceCenterId: sc3.id, author: "Николай Р.", avatar: "Н", rating: 5, date: new Date("2025-03-01"), text: "Сделали полировку и керамику — машина как новая!", carModel: "BMW 5 Series" },
    ],
  });

  // ─── Time Slots (for first 3 services) ─────────

  await prisma.timeSlot.createMany({
    data: [
      { serviceCenterId: sc1.id, time: "09:00", available: false },
      { serviceCenterId: sc1.id, time: "10:00", available: true },
      { serviceCenterId: sc1.id, time: "11:00", available: true },
      { serviceCenterId: sc1.id, time: "12:00", available: false },
      { serviceCenterId: sc1.id, time: "13:00", available: true },
      { serviceCenterId: sc1.id, time: "14:00", available: true },
      { serviceCenterId: sc1.id, time: "15:00", available: false },
      { serviceCenterId: sc1.id, time: "16:00", available: true },
      { serviceCenterId: sc1.id, time: "17:00", available: true },
      { serviceCenterId: sc1.id, time: "18:00", available: true },
      { serviceCenterId: sc2.id, time: "08:00", available: true },
      { serviceCenterId: sc2.id, time: "09:00", available: true },
      { serviceCenterId: sc2.id, time: "10:00", available: false },
      { serviceCenterId: sc2.id, time: "11:00", available: true },
      { serviceCenterId: sc2.id, time: "12:00", available: true },
      { serviceCenterId: sc2.id, time: "13:00", available: true },
      { serviceCenterId: sc2.id, time: "14:00", available: false },
      { serviceCenterId: sc2.id, time: "15:00", available: true },
      { serviceCenterId: sc3.id, time: "10:00", available: true },
      { serviceCenterId: sc3.id, time: "12:00", available: false },
      { serviceCenterId: sc3.id, time: "14:00", available: true },
      { serviceCenterId: sc3.id, time: "16:00", available: true },
    ],
  });

  // ─── Parts ─────────────────────────────────────

  const part1 = await prisma.part.create({
    data: {
      name: "Масляный фильтр", category: "Техобслуживание",
      compatibleCars: JSON.stringify(["BMW 5 Series (2018–2023)", "BMW 3 Series (2018–2023)"]),
      description: "Масляный фильтр для BMW с двигателем B48.",
    },
  });

  const part2 = await prisma.part.create({
    data: {
      name: "Тормозные колодки передние", category: "Тормозная система",
      compatibleCars: JSON.stringify(["BMW 5 Series 530i (2018–2023)"]),
      description: "Передние тормозные колодки для BMW G30/G31.",
    },
  });

  const part3 = await prisma.part.create({
    data: {
      name: "Воздушный фильтр", category: "Техобслуживание",
      compatibleCars: JSON.stringify(["Toyota Camry 2.5 (2018–2022)"]),
      description: "Воздушный фильтр для Toyota Camry XV70.",
    },
  });

  const part4 = await prisma.part.create({
    data: {
      name: "Аккумулятор 70 Ач", category: "Электрооборудование",
      compatibleCars: JSON.stringify(["BMW 5 Series 530i", "BMW 3 Series"]),
      description: "Стартерный аккумулятор 70Ah 760A AGM для BMW с системой Start-Stop.",
    },
  });

  const part5 = await prisma.part.create({
    data: {
      name: "Свечи зажигания (к-т 4 шт.)", category: "Двигатель",
      compatibleCars: JSON.stringify(["Toyota Camry 2.5 (2018–2022)", "Lada Vesta 1.6"]),
      description: "Иридиевые свечи зажигания, ресурс до 100 000 км.",
    },
  });

  await prisma.partOffer.createMany({
    data: [
      { partId: part1.id, seller: "Exist.ru", sellerLogo: "E", brand: "BMW Original", type: "original", typeName: "Оригинал", price: 1850, deliveryDays: 1, inStock: true, warranty: "12 месяцев", partNumber: "11428507683" },
      { partId: part1.id, seller: "Autodoc", sellerLogo: "A", brand: "Mann Filter", type: "oem", typeName: "OEM", price: 890, deliveryDays: 2, inStock: true, warranty: "12 месяцев", partNumber: "HU 816 x", rating: 4.8 },
      { partId: part1.id, seller: "Autodoc", sellerLogo: "A", brand: "Mahle", type: "analog", typeName: "Аналог", price: 720, deliveryDays: 3, inStock: true, warranty: "6 месяцев", partNumber: "OX 404D", rating: 4.6 },
      { partId: part1.id, seller: "ЗАП-ПАРТ", sellerLogo: "З", brand: "Bosch", type: "analog", typeName: "Аналог", price: 640, deliveryDays: 2, inStock: false, warranty: "6 месяцев", partNumber: "0 451 103 370", rating: 4.5 },
      { partId: part2.id, seller: "Exist.ru", sellerLogo: "E", brand: "BMW Original", type: "original", typeName: "Оригинал", price: 12400, deliveryDays: 1, inStock: true, warranty: "24 месяца", partNumber: "34116860019" },
      { partId: part2.id, seller: "Autodoc", sellerLogo: "A", brand: "Brembo", type: "oem", typeName: "OEM", price: 7800, deliveryDays: 2, inStock: true, warranty: "18 месяцев", partNumber: "P 06 063", rating: 4.9 },
      { partId: part2.id, seller: "Авито Запчасти", sellerLogo: "АВ", brand: "Ate", type: "analog", typeName: "Аналог", price: 5200, deliveryDays: 3, inStock: true, warranty: "12 месяцев", partNumber: "13.0460-7205.2", rating: 4.6 },
      { partId: part3.id, seller: "Exist.ru", sellerLogo: "E", brand: "Toyota Original", type: "original", typeName: "Оригинал", price: 2100, deliveryDays: 1, inStock: true, warranty: "12 месяцев", partNumber: "17801-F0010" },
      { partId: part3.id, seller: "Autodoc", sellerLogo: "A", brand: "Mann Filter", type: "oem", typeName: "OEM", price: 980, deliveryDays: 2, inStock: true, warranty: "12 месяцев", partNumber: "C 26 115", rating: 4.7 },
      { partId: part4.id, seller: "Exist.ru", sellerLogo: "E", brand: "BMW Original (Varta)", type: "original", typeName: "Оригинал", price: 16500, deliveryDays: 1, inStock: true, warranty: "36 месяцев", partNumber: "61216806755" },
      { partId: part4.id, seller: "ЗАП-ПАРТ", sellerLogo: "З", brand: "Varta AGM", type: "oem", typeName: "OEM", price: 12800, deliveryDays: 2, inStock: true, warranty: "36 месяцев", partNumber: "A7 570 901 076", rating: 4.9 },
      { partId: part4.id, seller: "Autodoc", sellerLogo: "A", brand: "Bosch AGM", type: "analog", typeName: "Аналог", price: 11200, deliveryDays: 3, inStock: true, warranty: "24 месяца", partNumber: "0 092 S5A 080", rating: 4.8 },
      { partId: part5.id, seller: "Exist.ru", sellerLogo: "E", brand: "Denso Iridium", type: "oem", typeName: "OEM", price: 3600, deliveryDays: 1, inStock: true, warranty: "12 месяцев", partNumber: "ITV20TT", rating: 4.9 },
      { partId: part5.id, seller: "Autodoc", sellerLogo: "A", brand: "NGK Iridium", type: "oem", typeName: "OEM", price: 3200, deliveryDays: 2, inStock: true, warranty: "12 месяцев", partNumber: "LZKAR6AP-11", rating: 4.8 },
      { partId: part5.id, seller: "ЗАП-ПАРТ", sellerLogo: "З", brand: "Bosch", type: "analog", typeName: "Аналог", price: 2400, deliveryDays: 2, inStock: true, warranty: "6 месяцев", partNumber: "0 242 240 654", rating: 4.5 },
    ],
  });

  console.log(`✅ Запчасти: 5 шт., предложения: 15 шт.`);

  // ─── Bookings ──────────────────────────────────

  await prisma.booking.createMany({
    data: [
      { userId: user.id, serviceCenterId: sc1.id, carId: bmw.id, serviceType: "Плановое ТО", date: new Date("2026-03-20"), time: "10:00", status: "confirmed" },
      { userId: user.id, serviceCenterId: sc2.id, carId: lada.id, serviceType: "Замена резины на летнюю", date: new Date("2026-04-12"), time: "14:00", status: "pending" },
    ],
  });

  console.log(`✅ Записи на сервис: 2 шт.`);

  // ─── 19 Additional Test Users ─────────────────
  // Total: 20 accounts for internal testing
  // All use password: test123

  const testPassword = await bcrypt.hash("test123", 12);

  const testUsers = [
    { name: "Алексей Петров", email: "alex@autoeco.test", phone: "+7 (916) 001-00-01", city: "Москва", car: { make: "Hyundai", model: "Tucson 2.0", year: 2022, vin: "KMHJ3814MNU100001", mileage: 42000, color: "Белый", engine: "2.0L 150 л.с.", transmission: "Автомат 6-ст.", fuelType: "Бензин", health: 90, image: "https://images.unsplash.com/photo-1633695632009-26111c161b84?w=800&auto=format&fit=crop", licensePlate: "А001АА 77", nextService: "через 3 000 км" } },
    { name: "Мария Иванова", email: "maria@autoeco.test", phone: "+7 (916) 002-00-02", city: "Москва", car: { make: "Kia", model: "Sportage 2.0", year: 2023, vin: "KNAPH81BDP5100002", mileage: 18500, color: "Серый", engine: "2.0L 150 л.с.", transmission: "Автомат 6-ст.", fuelType: "Бензин", health: 96, image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format&fit=crop", licensePlate: "В002ВВ 77", nextService: "через 11 500 км" } },
    { name: "Дмитрий Сидоров", email: "dmitry@autoeco.test", phone: "+7 (916) 003-00-03", city: "Москва", car: { make: "Volkswagen", model: "Tiguan 2.0 TSI", year: 2020, vin: "WVGZZZ5NZLW100003", mileage: 78000, color: "Чёрный", engine: "2.0L TSI 180 л.с.", transmission: "Робот DSG 7-ст.", fuelType: "Бензин", health: 75, image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format&fit=crop", licensePlate: "С003СС 97", nextService: "через 2 000 км" } },
    { name: "Елена Козлова", email: "elena@autoeco.test", phone: "+7 (916) 004-00-04", city: "Москва", car: { make: "Toyota", model: "RAV4 2.5", year: 2021, vin: "JTMW1RFV5MD100004", mileage: 55000, color: "Синий", engine: "2.5L 199 л.с.", transmission: "Автомат 8-ст.", fuelType: "Бензин", health: 85, image: "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800&auto=format&fit=crop", licensePlate: "Е004ЕЕ 77", nextService: "через 5 000 км" } },
    { name: "Андрей Морозов", email: "andrey@autoeco.test", phone: "+7 (916) 005-00-05", city: "Москва", car: { make: "Skoda", model: "Octavia 1.4 TSI", year: 2021, vin: "TMBJG9NE6M0100005", mileage: 62000, color: "Серебристый", engine: "1.4L TSI 150 л.с.", transmission: "Робот DSG 8-ст.", fuelType: "Бензин", health: 80, image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop", licensePlate: "К005КК 77", nextService: "через 3 000 км" } },
    { name: "Ольга Новикова", email: "olga@autoeco.test", phone: "+7 (916) 006-00-06", city: "Москва", car: { make: "Mazda", model: "CX-5 2.5", year: 2022, vin: "JM3KFBCM5N0100006", mileage: 35000, color: "Красный", engine: "2.5L 194 л.с.", transmission: "Автомат 6-ст.", fuelType: "Бензин", health: 92, image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop", licensePlate: "М006МН 77", nextService: "через 5 000 км" } },
    { name: "Сергей Волков", email: "sergey@autoeco.test", phone: "+7 (916) 007-00-07", city: "Москва", car: { make: "Nissan", model: "Qashqai 2.0", year: 2020, vin: "SJNFAAJ11U2100007", mileage: 89000, color: "Тёмно-серый", engine: "2.0L 144 л.с.", transmission: "Вариатор", fuelType: "Бензин", health: 70, image: "https://images.unsplash.com/photo-1609840112990-4a4b78e457b0?w=800&auto=format&fit=crop", licensePlate: "Н007НН 97", nextService: "просрочено" } },
    { name: "Наталья Белова", email: "natasha@autoeco.test", phone: "+7 (916) 008-00-08", city: "Москва", car: { make: "Renault", model: "Duster 1.5 dCi", year: 2021, vin: "VF1HJDAH0G0100008", mileage: 47000, color: "Оливковый", engine: "1.5L dCi 109 л.с.", transmission: "Механика 6-ст.", fuelType: "Дизель", health: 87, image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop", licensePlate: "О008ОР 77", nextService: "через 3 000 км" } },
    { name: "Игорь Лебедев", email: "igor@autoeco.test", phone: "+7 (916) 009-00-09", city: "Москва", car: { make: "Mercedes-Benz", model: "E 200", year: 2020, vin: "WDD2130421A100009", mileage: 68000, color: "Чёрный обсидиан", engine: "2.0L 197 л.с.", transmission: "Автомат 9G-TRONIC", fuelType: "Бензин", health: 78, image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop", licensePlate: "Р009РС 77", nextService: "через 2 000 км" } },
    { name: "Анна Кузнецова", email: "anna@autoeco.test", phone: "+7 (916) 010-00-10", city: "Москва", car: { make: "Audi", model: "Q3 35 TFSI", year: 2022, vin: "WAUZZZF38NA100010", mileage: 28000, color: "Белый", engine: "1.5L TFSI 150 л.с.", transmission: "Робот S tronic 7-ст.", fuelType: "Бензин", health: 95, image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop", licensePlate: "Т010ТУ 77", nextService: "через 12 000 км" } },
    { name: "Павел Соколов", email: "pavel@autoeco.test", phone: "+7 (916) 011-00-11", city: "Москва", car: { make: "Lada", model: "Granta 1.6", year: 2023, vin: "XTA219010P0100011", mileage: 15000, color: "Белый", engine: "1.6L 90 л.с.", transmission: "Автомат 4-ст.", fuelType: "Бензин", health: 97, image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop", licensePlate: "У011УФ 199", nextService: "через 15 000 км" } },
    { name: "Виктория Попова", email: "vika@autoeco.test", phone: "+7 (916) 012-00-12", city: "Москва", car: { make: "Chery", model: "Tiggo 7 Pro", year: 2023, vin: "LVTDB21B9P0100012", mileage: 22000, color: "Синий", engine: "1.5L Turbo 147 л.с.", transmission: "Вариатор", fuelType: "Бензин", health: 93, image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop", licensePlate: "Х012ХЦ 77", nextService: "через 8 000 км" } },
    { name: "Максим Орлов", email: "max@autoeco.test", phone: "+7 (916) 013-00-13", city: "Москва", car: { make: "Haval", model: "Jolion 1.5T", year: 2022, vin: "LGWFF4A5XNH100013", mileage: 38000, color: "Серый", engine: "1.5L Turbo 143 л.с.", transmission: "Робот 7-ст.", fuelType: "Бензин", health: 88, image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop", licensePlate: "Ч013ЧШ 97", nextService: "через 2 000 км" } },
    { name: "Татьяна Федорова", email: "tanya@autoeco.test", phone: "+7 (916) 014-00-14", city: "Москва", car: { make: "Honda", model: "CR-V 2.0", year: 2019, vin: "SHSRD6870KU100014", mileage: 95000, color: "Белый перламутр", engine: "2.0L i-VTEC 150 л.с.", transmission: "Вариатор", fuelType: "Бензин", health: 68, image: "https://images.unsplash.com/photo-1568844293986-8d0400f4745b?w=800&auto=format&fit=crop", licensePlate: "Э014ЭЮ 77", nextService: "просрочено" } },
    { name: "Роман Егоров", email: "roman@autoeco.test", phone: "+7 (916) 015-00-15", city: "Москва", car: { make: "Geely", model: "Coolray 1.5T", year: 2023, vin: "LSJA24U35P0100015", mileage: 12000, color: "Оранжевый", engine: "1.5L Turbo 150 л.с.", transmission: "Робот 7-ст.", fuelType: "Бензин", health: 98, image: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&auto=format&fit=crop", licensePlate: "А015АВ 199", nextService: "через 18 000 км" } },
    { name: "Юлия Миллер", email: "julia@autoeco.test", phone: "+7 (916) 016-00-16", city: "Москва", car: { make: "Ford", model: "Kuga 2.5 Hybrid", year: 2021, vin: "WF0XXXGCDXMA00016", mileage: 51000, color: "Тёмно-синий", engine: "2.5L Hybrid 190 л.с.", transmission: "Вариатор", fuelType: "Гибрид", health: 84, image: "https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&auto=format&fit=crop", licensePlate: "В016ВГ 77", nextService: "через 4 000 км" } },
    { name: "Артём Зайцев", email: "artem@autoeco.test", phone: "+7 (916) 017-00-17", city: "Москва", car: { make: "Mitsubishi", model: "Outlander 2.4", year: 2020, vin: "JMBXTCW5WKZ100017", mileage: 73000, color: "Серебристый", engine: "2.4L 167 л.с.", transmission: "Вариатор", fuelType: "Бензин", health: 76, image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop", licensePlate: "Д017ДЕ 97", nextService: "через 2 000 км" } },
    { name: "Екатерина Смирнова", email: "katya@autoeco.test", phone: "+7 (916) 018-00-18", city: "Москва", car: { make: "Subaru", model: "Forester 2.5", year: 2021, vin: "JF2SKARC5MH100018", mileage: 44000, color: "Зелёный", engine: "2.5L 185 л.с.", transmission: "Вариатор Lineartronic", fuelType: "Бензин", health: 89, image: "https://images.unsplash.com/photo-1619976215249-0a78de35ebde?w=800&auto=format&fit=crop", licensePlate: "Ж018ЖЗ 77", nextService: "через 6 000 км" } },
    { name: "Владислав Чернов", email: "vlad@autoeco.test", phone: "+7 (916) 019-00-19", city: "Москва", car: { make: "Volvo", model: "XC60 T5", year: 2020, vin: "YV4102DL1L1100019", mileage: 82000, color: "Синий", engine: "2.0L T5 254 л.с.", transmission: "Автомат 8-ст.", fuelType: "Бензин", health: 77, image: "https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&auto=format&fit=crop", licensePlate: "И019ИК 77", nextService: "через 3 000 км" } },
  ];

  for (const tu of testUsers) {
    const testUser = await prisma.user.create({
      data: {
        name: tu.name,
        email: tu.email,
        passwordHash: testPassword,
        phone: tu.phone,
        city: tu.city,
        subscription: "FREE",
      },
    });

    await prisma.car.create({
      data: {
        userId: testUser.id,
        ...tu.car,
      },
    });
  }

  console.log(`✅ Тестовые аккаунты: 19 шт. (пароль: test123)`);
  console.log("\n🎉 База данных заполнена! Всего 20 аккаунтов.");
  console.log("\n📋 Аккаунты:");
  console.log("  1. kirill@example.com / password123 (Premium, 3 авто)");
  console.log("  2-20. [имя]@autoeco.test / test123 (Free, 1 авто)");
  console.log("\nПримеры тестовых:");
  console.log("  alex@autoeco.test / test123");
  console.log("  maria@autoeco.test / test123");
  console.log("  dmitry@autoeco.test / test123");
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
