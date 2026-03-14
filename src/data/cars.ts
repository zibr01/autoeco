export interface MaintenanceRecord {
  id: string;
  date: string;
  mileage: number;
  type: string;
  description: string;
  cost: number;
  service: string;
}

export interface Reminder {
  id: string;
  type: "oil" | "tires" | "insurance" | "inspection" | "battery" | "brakes";
  title: string;
  dueDate?: string;
  dueMileage?: number;
  urgency: "low" | "medium" | "high";
  description: string;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  mileage: number;
  color: string;
  engine: string;
  transmission: string;
  fuelType: string;
  health: number;
  image: string;
  licensePlate: string;
  nextService: string;
  maintenanceRecords: MaintenanceRecord[];
  reminders: Reminder[];
}

export const cars: Car[] = [
  {
    id: "1",
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
    maintenanceRecords: [
      {
        id: "m1",
        date: "2024-11-15",
        mileage: 85000,
        type: "Плановое ТО",
        description: "Замена масла и фильтров, диагностика",
        cost: 12500,
        service: "BMW Сервис Центр Москва",
      },
      {
        id: "m2",
        date: "2024-08-20",
        mileage: 80000,
        type: "Замена тормозных колодок",
        description: "Передние тормозные колодки Brembo",
        cost: 8900,
        service: "АвтоТех на Варшавке",
      },
      {
        id: "m3",
        date: "2024-04-10",
        mileage: 75000,
        type: "Замена шин",
        description: "Летняя резина Michelin Pilot Sport 4 — 4 шт.",
        cost: 62000,
        service: "ШинМастер",
      },
      {
        id: "m4",
        date: "2023-11-05",
        mileage: 70000,
        type: "Плановое ТО",
        description: "Замена масла, воздушного фильтра, свечей",
        cost: 15800,
        service: "BMW Сервис Центр Москва",
      },
      {
        id: "m5",
        date: "2023-06-18",
        mileage: 65000,
        type: "Замена шин",
        description: "Зимняя резина Michelin X-Ice — 4 шт.",
        cost: 58000,
        service: "ШинМастер",
      },
      {
        id: "m6",
        date: "2023-02-28",
        mileage: 60000,
        type: "Замена тормозной жидкости",
        description: "Замена тормозной жидкости DOT 4",
        cost: 3200,
        service: "АвтоТех на Варшавке",
      },
    ],
    reminders: [
      {
        id: "r1",
        type: "oil",
        title: "Замена масла",
        dueMileage: 90000,
        urgency: "medium",
        description: "Последняя замена на 85 000 км. Рекомендуем заменить через 2 600 км.",
      },
      {
        id: "r2",
        type: "tires",
        title: "Замена резины на зимнюю",
        dueDate: "2025-10-15",
        urgency: "low",
        description: "Рекомендуем менять шины при температуре ниже +7°C",
      },
      {
        id: "r3",
        type: "insurance",
        title: "Продление ОСАГО",
        dueDate: "2025-06-01",
        urgency: "low",
        description: "ОСАГО истекает 1 июня 2025 года. Осталось 79 дней.",
      },
      {
        id: "r4",
        type: "brakes",
        title: "Проверка задних колодок",
        dueMileage: 95000,
        urgency: "low",
        description: "По нормативу замена задних колодок каждые 30 000 км",
      },
    ],
  },
  {
    id: "2",
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
    maintenanceRecords: [
      {
        id: "m7",
        date: "2024-09-10",
        mileage: 120000,
        type: "Плановое ТО",
        description: "Замена масла, ремня ГРМ, помпы",
        cost: 28000,
        service: "Toyota Официальный Дилер",
      },
      {
        id: "m8",
        date: "2024-03-15",
        mileage: 115000,
        type: "Замена тормозных дисков и колодок",
        description: "Задние диски и колодки в сборе",
        cost: 16500,
        service: "МастерАвто",
      },
      {
        id: "m9",
        date: "2023-10-20",
        mileage: 110000,
        type: "Плановое ТО",
        description: "Замена масла, фильтров, свечей",
        cost: 11200,
        service: "Toyota Официальный Дилер",
      },
    ],
    reminders: [
      {
        id: "r5",
        type: "oil",
        title: "Замена масла — ПРОСРОЧЕНО",
        dueMileage: 125000,
        urgency: "high",
        description: "Плановое ТО просрочено! Пробег превышен. Запишитесь на сервис как можно скорее.",
      },
      {
        id: "r6",
        type: "inspection",
        title: "Технический осмотр",
        dueDate: "2025-05-20",
        urgency: "medium",
        description: "Технический осмотр истекает 20 мая 2025 года.",
      },
      {
        id: "r7",
        type: "battery",
        title: "Проверка аккумулятора",
        urgency: "medium",
        description: "Аккумулятор не менялся с 2019 года. Рекомендуем проверку перед зимой.",
      },
    ],
  },
  {
    id: "3",
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
    maintenanceRecords: [
      {
        id: "m10",
        date: "2024-12-01",
        mileage: 30000,
        type: "Плановое ТО",
        description: "Замена масла, фильтров, проверка ходовой",
        cost: 6500,
        service: "Лада Сервис Авиамоторная",
      },
      {
        id: "m11",
        date: "2024-04-05",
        mileage: 15000,
        type: "ТО-1",
        description: "Плановый осмотр и замена масла",
        cost: 4800,
        service: "Лада Сервис Авиамоторная",
      },
    ],
    reminders: [
      {
        id: "r8",
        type: "oil",
        title: "Замена масла",
        dueMileage: 40000,
        urgency: "low",
        description: "Следующее ТО через 5 800 км или 8 месяцев.",
      },
      {
        id: "r9",
        type: "tires",
        title: "Замена резины на летнюю",
        dueDate: "2025-04-15",
        urgency: "low",
        description: "Рекомендуем переход на летние шины в апреле.",
      },
    ],
  },
];

export const getCar = (id: string): Car | undefined =>
  cars.find((c) => c.id === id);
