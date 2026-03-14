"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import {
  Car,
  Plus,
  Bell,
  AlertTriangle,
  ChevronRight,
  Droplets,
  Wind,
  Shield,
  Wrench,
  Battery,
  Disc,
  Loader2,
  X,
  AlertCircle,
  Search,
  Check,
} from "lucide-react";

interface ReminderData {
  id: string;
  type: string;
  title: string;
  dueDate?: string | null;
  dueMileage?: number | null;
  urgency: "low" | "medium" | "high";
  description: string;
}

interface CarData {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  health: number;
  image: string;
  licensePlate: string;
  nextService: string;
  reminders: ReminderData[];
}

const reminderIcons: Record<string, typeof Droplets> = {
  oil: Droplets,
  tires: Wind,
  insurance: Shield,
  inspection: Wrench,
  battery: Battery,
  brakes: Disc,
};

const urgencyColor = {
  low: "text-text-muted border-prussian/[0.08] bg-prussian/[0.03]",
  medium: "text-accent border-accent/30 bg-accent/10",
  high: "text-red-400 border-red-500/30 bg-red-500/10",
};

export default function GaragePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [carsData, setCarsData] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchCars = () => {
    fetch("/api/cars")
      .then((r) => r.json())
      .then((data) => setCarsData(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (authStatus === "authenticated") {
      fetchCars();
    }
  }, [authStatus, router]);

  if (authStatus === "loading" || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-brand-light animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const allReminders = carsData
    .flatMap((car) => car.reminders.map((r) => ({ ...r, carName: `${car.make} ${car.model}` })))
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.urgency] - order[b.urgency];
    });

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-1">Мой гараж</h1>
          <p className="text-text-muted">
            {session?.user?.name ? `Привет, ${session.user.name}` : "Привет"} 👋 · {carsData.length} автомобил{carsData.length === 1 ? "ь" : carsData.length < 5 ? "я" : "ей"}
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Добавить авто
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {carsData.map((car) => {
            const urgentReminders = car.reminders.filter((r) => r.urgency === "high").length;
            const mediumReminders = car.reminders.filter((r) => r.urgency === "medium").length;

            return (
              <Link href={`/garage/${car.id}`} key={car.id}>
                <div className="card-surface hover:border-brand/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                  <div className="flex gap-5">
                    <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-bg-elevated">
                      <img src={car.image} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="font-semibold text-text group-hover:text-prussian transition-colors">{car.make} {car.model}</h3>
                          <p className="text-text-muted text-sm">{car.year} · {car.licensePlate}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-dim group-hover:text-brand-light group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-sm text-text-muted">
                          <span className="text-text font-medium">{car.mileage.toLocaleString("ru")} км</span>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <div className="progress-bar flex-1">
                            <div
                              className={`progress-fill ${car.health > 80 ? "bg-emerald-500" : car.health > 60 ? "bg-accent" : "bg-red-500"}`}
                              style={{ width: `${car.health}%` }}
                            />
                          </div>
                          <span className="text-xs text-text-muted">{car.health}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-text-muted">
                          <Car className="w-3.5 h-3.5" />
                          ТО {car.nextService}
                        </div>
                        {urgentReminders > 0 && (
                          <div className="flex items-center gap-1 tag-red text-xs">
                            <AlertTriangle className="w-3 h-3" />
                            {urgentReminders} срочно
                          </div>
                        )}
                        {mediumReminders > 0 && (
                          <div className="flex items-center gap-1 tag-accent text-xs">
                            <Bell className="w-3 h-3" />
                            {mediumReminders} скоро
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          <button onClick={() => setShowAddModal(true)} className="w-full card border-dashed border-prussian/[0.12] hover:border-brand/40 hover:bg-brand/5 transition-all duration-200 flex items-center justify-center gap-3 text-text-muted hover:text-brand-light py-8">
            <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-medium">Добавить автомобиль</div>
              <div className="text-sm text-text-dim">Введите VIN или выберите вручную</div>
            </div>
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-text flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent" />
            Напоминания
            {allReminders.filter((r) => r.urgency === "high").length > 0 && (
              <span className="ml-auto tag-red text-xs">
                {allReminders.filter((r) => r.urgency === "high").length} срочно
              </span>
            )}
          </h2>

          {allReminders.map((reminder) => {
            const Icon = reminderIcons[reminder.type] || AlertTriangle;
            return (
              <div key={reminder.id} className={`border rounded-xl p-4 ${urgencyColor[reminder.urgency]}`}>
                <div className="flex items-start gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text truncate">{reminder.title}</div>
                    <div className="text-xs text-text-muted mt-0.5">{reminder.carName}</div>
                    {reminder.dueMileage && (
                      <div className="text-xs mt-1">до {reminder.dueMileage.toLocaleString("ru")} км</div>
                    )}
                    {reminder.dueDate && (
                      <div className="text-xs mt-1">
                        до {new Date(reminder.dueDate).toLocaleDateString("ru", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <AddCarModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false);
            fetchCars();
          }}
        />
      )}
    </AppLayout>
  );
}

// ── Car database for smart search ──

interface CarModelInfo {
  name: string;
  years: [number, number]; // [from, to]
  engines: string[];
  transmission: string[];
  fuelType: string[];
}

interface CarMakeInfo {
  name: string;
  country: string;
  models: CarModelInfo[];
}

const carDatabase: CarMakeInfo[] = [
  {
    name: "BMW", country: "Германия",
    models: [
      { name: "3 Series", years: [1990, 2026], engines: ["2.0L 184 л.с.", "2.0L Turbo 252 л.с.", "3.0L Turbo 340 л.с.", "2.0d 190 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин", "Дизель"] },
      { name: "5 Series", years: [1990, 2026], engines: ["2.0L Turbo 249 л.с.", "3.0L Turbo 340 л.с.", "2.0d 190 л.с.", "3.0d 286 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель", "Гибрид"] },
      { name: "X3", years: [2003, 2026], engines: ["2.0L Turbo 252 л.с.", "2.0d 190 л.с.", "3.0L Turbo 360 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель"] },
      { name: "X5", years: [1999, 2026], engines: ["3.0L Turbo 340 л.с.", "4.4L V8 530 л.с.", "3.0d 286 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель", "Гибрид"] },
      { name: "7 Series", years: [1994, 2026], engines: ["3.0L Turbo 340 л.с.", "4.4L V8 530 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Гибрид"] },
      { name: "X1", years: [2009, 2026], engines: ["1.5L Turbo 136 л.с.", "2.0L Turbo 231 л.с."], transmission: ["Автомат", "Робот"], fuelType: ["Бензин", "Дизель"] },
      { name: "4 Series", years: [2013, 2026], engines: ["2.0L Turbo 252 л.с.", "3.0L Turbo 374 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель"] },
      { name: "1 Series", years: [2004, 2026], engines: ["1.5L Turbo 140 л.с.", "2.0L Turbo 306 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин", "Дизель"] },
    ],
  },
  {
    name: "Mercedes-Benz", country: "Германия",
    models: [
      { name: "C-Class", years: [1993, 2026], engines: ["1.5L Turbo 184 л.с.", "2.0L Turbo 258 л.с.", "2.0d 194 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель"] },
      { name: "E-Class", years: [1993, 2026], engines: ["2.0L Turbo 258 л.с.", "3.0L Turbo 367 л.с.", "2.0d 194 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель", "Гибрид"] },
      { name: "S-Class", years: [1998, 2026], engines: ["3.0L Turbo 367 л.с.", "4.0L V8 503 л.с.", "6.0L V12 612 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Гибрид"] },
      { name: "GLC", years: [2015, 2026], engines: ["2.0L Turbo 258 л.с.", "2.0d 194 л.с.", "3.0L Turbo 390 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель", "Гибрид"] },
      { name: "GLE", years: [2011, 2026], engines: ["2.0L Turbo 272 л.с.", "3.0L Turbo 367 л.с.", "3.0d 330 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель"] },
      { name: "A-Class", years: [2012, 2026], engines: ["1.3L Turbo 136 л.с.", "2.0L Turbo 224 л.с."], transmission: ["Автомат", "Робот"], fuelType: ["Бензин", "Дизель"] },
      { name: "CLA", years: [2013, 2026], engines: ["1.3L Turbo 136 л.с.", "2.0L Turbo 306 л.с."], transmission: ["Робот"], fuelType: ["Бензин"] },
      { name: "GLB", years: [2019, 2026], engines: ["1.3L Turbo 163 л.с.", "2.0L Turbo 224 л.с."], transmission: ["Робот"], fuelType: ["Бензин", "Дизель"] },
    ],
  },
  {
    name: "Audi", country: "Германия",
    models: [
      { name: "A3", years: [1996, 2026], engines: ["1.4 TFSI 150 л.с.", "2.0 TFSI 190 л.с.", "2.0 TDI 150 л.с."], transmission: ["Автомат", "Робот", "Механика"], fuelType: ["Бензин", "Дизель"] },
      { name: "A4", years: [1994, 2026], engines: ["2.0 TFSI 249 л.с.", "2.0 TDI 190 л.с.", "3.0 TFSI 354 л.с."], transmission: ["Автомат", "Робот"], fuelType: ["Бензин", "Дизель"] },
      { name: "A6", years: [1994, 2026], engines: ["2.0 TFSI 249 л.с.", "3.0 TFSI 340 л.с.", "2.0 TDI 204 л.с.", "3.0 TDI 286 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель"] },
      { name: "Q3", years: [2011, 2026], engines: ["1.4 TFSI 150 л.с.", "2.0 TFSI 230 л.с."], transmission: ["Автомат", "Робот"], fuelType: ["Бензин", "Дизель"] },
      { name: "Q5", years: [2008, 2026], engines: ["2.0 TFSI 249 л.с.", "2.0 TDI 204 л.с.", "3.0 TDI 286 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель"] },
      { name: "Q7", years: [2005, 2026], engines: ["2.0 TFSI 252 л.с.", "3.0 TFSI 340 л.с.", "3.0 TDI 272 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель"] },
      { name: "Q8", years: [2018, 2026], engines: ["3.0 TFSI 340 л.с.", "4.0 TFSI 507 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель", "Гибрид"] },
      { name: "A5", years: [2007, 2026], engines: ["2.0 TFSI 249 л.с.", "3.0 TDI 286 л.с."], transmission: ["Автомат", "Робот"], fuelType: ["Бензин", "Дизель"] },
    ],
  },
  {
    name: "Toyota", country: "Япония",
    models: [
      { name: "Camry", years: [1991, 2026], engines: ["2.0L 150 л.с.", "2.5L 181 л.с.", "3.5L V6 249 л.с.", "2.5L Hybrid 218 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин", "Гибрид"] },
      { name: "RAV4", years: [1994, 2026], engines: ["2.0L 149 л.с.", "2.5L 199 л.с.", "2.5L Hybrid 222 л.с."], transmission: ["Автомат", "Вариатор"], fuelType: ["Бензин", "Гибрид"] },
      { name: "Corolla", years: [1990, 2026], engines: ["1.6L 122 л.с.", "1.8L 140 л.с.", "2.0L 169 л.с.", "1.8L Hybrid 122 л.с."], transmission: ["Автомат", "Вариатор", "Механика"], fuelType: ["Бензин", "Гибрид"] },
      { name: "Land Cruiser 300", years: [2021, 2026], engines: ["3.5L V6 Turbo 415 л.с.", "3.3L V6 Diesel 309 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель"] },
      { name: "Land Cruiser Prado", years: [2002, 2026], engines: ["2.7L 163 л.с.", "4.0L V6 249 л.с.", "2.8D 177 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин", "Дизель"] },
      { name: "Highlander", years: [2000, 2026], engines: ["2.5L Hybrid 243 л.с.", "3.5L V6 249 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Гибрид"] },
      { name: "Supra", years: [2019, 2026], engines: ["2.0L Turbo 258 л.с.", "3.0L Turbo 387 л.с."], transmission: ["Автомат"], fuelType: ["Бензин"] },
    ],
  },
  {
    name: "Volkswagen", country: "Германия",
    models: [
      { name: "Tiguan", years: [2007, 2026], engines: ["1.4 TSI 150 л.с.", "2.0 TSI 220 л.с.", "2.0 TDI 150 л.с."], transmission: ["Автомат", "Робот", "Механика"], fuelType: ["Бензин", "Дизель"] },
      { name: "Polo", years: [1994, 2026], engines: ["1.0L 80 л.с.", "1.4 TSI 125 л.с.", "1.6L 110 л.с."], transmission: ["Автомат", "Робот", "Механика"], fuelType: ["Бензин"] },
      { name: "Golf", years: [1991, 2026], engines: ["1.4 TSI 150 л.с.", "2.0 TSI 245 л.с.", "2.0 TDI 150 л.с."], transmission: ["Автомат", "Робот", "Механика"], fuelType: ["Бензин", "Дизель"] },
      { name: "Passat", years: [1993, 2026], engines: ["1.4 TSI 150 л.с.", "2.0 TSI 220 л.с.", "2.0 TDI 190 л.с."], transmission: ["Автомат", "Робот"], fuelType: ["Бензин", "Дизель"] },
      { name: "Touareg", years: [2002, 2026], engines: ["2.0 TSI 249 л.с.", "3.0 TSI 340 л.с.", "3.0 TDI 286 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель", "Гибрид"] },
      { name: "ID.4", years: [2020, 2026], engines: ["150 кВт 204 л.с.", "220 кВт 299 л.с."], transmission: ["Автомат"], fuelType: ["Электро"] },
    ],
  },
  {
    name: "Hyundai", country: "Южная Корея",
    models: [
      { name: "Tucson", years: [2004, 2026], engines: ["2.0L 150 л.с.", "2.5L 190 л.с.", "1.6T 180 л.с.", "2.0 CRDi 186 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин", "Дизель"] },
      { name: "Creta", years: [2016, 2026], engines: ["1.6L 123 л.с.", "2.0L 150 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин"] },
      { name: "Solaris", years: [2011, 2026], engines: ["1.4L 100 л.с.", "1.6L 123 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин"] },
      { name: "Santa Fe", years: [2000, 2026], engines: ["2.5L 180 л.с.", "2.5T 281 л.с.", "2.2 CRDi 202 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель", "Гибрид"] },
      { name: "Sonata", years: [1998, 2026], engines: ["2.0L 150 л.с.", "2.5L 180 л.с.", "1.6T 180 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Гибрид"] },
      { name: "Palisade", years: [2018, 2026], engines: ["3.5L V6 249 л.с.", "2.2 CRDi 202 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель"] },
    ],
  },
  {
    name: "Kia", country: "Южная Корея",
    models: [
      { name: "Sportage", years: [2004, 2026], engines: ["2.0L 150 л.с.", "2.5L 190 л.с.", "1.6T 180 л.с.", "2.0 CRDi 186 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин", "Дизель"] },
      { name: "Rio", years: [2005, 2026], engines: ["1.4L 100 л.с.", "1.6L 123 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин"] },
      { name: "Ceed", years: [2006, 2026], engines: ["1.4L 100 л.с.", "1.6L 128 л.с.", "1.6 CRDi 136 л.с."], transmission: ["Автомат", "Робот", "Механика"], fuelType: ["Бензин", "Дизель"] },
      { name: "K5 (Optima)", years: [2010, 2026], engines: ["2.0L 150 л.с.", "2.5L 194 л.с.", "1.6T 180 л.с."], transmission: ["Автомат"], fuelType: ["Бензин"] },
      { name: "Sorento", years: [2002, 2026], engines: ["2.5L 180 л.с.", "2.5T 281 л.с.", "2.2 CRDi 202 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель", "Гибрид"] },
      { name: "Mohave", years: [2008, 2026], engines: ["3.0 V6 CRDi 260 л.с.", "3.5 V6 249 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель"] },
    ],
  },
  {
    name: "Nissan", country: "Япония",
    models: [
      { name: "Qashqai", years: [2006, 2026], engines: ["2.0L 144 л.с.", "1.3T 150 л.с.", "1.5 e-Power 190 л.с."], transmission: ["Вариатор", "Автомат"], fuelType: ["Бензин", "Гибрид"] },
      { name: "X-Trail", years: [2000, 2026], engines: ["2.0L 144 л.с.", "2.5L 171 л.с.", "1.5T e-Power 213 л.с."], transmission: ["Вариатор", "Механика"], fuelType: ["Бензин", "Гибрид"] },
      { name: "Almera", years: [2000, 2019], engines: ["1.6L 102 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин"] },
      { name: "Pathfinder", years: [2004, 2026], engines: ["2.5 dCi 190 л.с.", "3.5L V6 284 л.с."], transmission: ["Автомат", "Вариатор"], fuelType: ["Бензин", "Дизель"] },
      { name: "Murano", years: [2002, 2026], engines: ["2.5L 170 л.с.", "3.5L V6 249 л.с."], transmission: ["Вариатор"], fuelType: ["Бензин"] },
    ],
  },
  {
    name: "Mazda", country: "Япония",
    models: [
      { name: "CX-5", years: [2012, 2026], engines: ["2.0L 150 л.с.", "2.5L 194 л.с.", "2.2D 184 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин", "Дизель"] },
      { name: "3", years: [2003, 2026], engines: ["1.5L 120 л.с.", "2.0L 150 л.с.", "2.5L 186 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин"] },
      { name: "6", years: [2002, 2023], engines: ["2.0L 150 л.с.", "2.5L 194 л.с.", "2.5T 231 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин"] },
      { name: "CX-9", years: [2006, 2026], engines: ["2.5T 231 л.с."], transmission: ["Автомат"], fuelType: ["Бензин"] },
      { name: "CX-30", years: [2019, 2026], engines: ["2.0L 150 л.с.", "2.0L e-SkyActiv X 186 л.с."], transmission: ["Автомат"], fuelType: ["Бензин"] },
    ],
  },
  {
    name: "Honda", country: "Япония",
    models: [
      { name: "CR-V", years: [1995, 2026], engines: ["2.0L 150 л.с.", "1.5T 193 л.с.", "2.0L Hybrid 184 л.с."], transmission: ["Автомат", "Вариатор"], fuelType: ["Бензин", "Гибрид"] },
      { name: "Civic", years: [1995, 2026], engines: ["1.5T 182 л.с.", "2.0L 158 л.с.", "2.0T 320 л.с."], transmission: ["Вариатор", "Механика"], fuelType: ["Бензин"] },
      { name: "Accord", years: [1998, 2026], engines: ["1.5T 192 л.с.", "2.0T 252 л.с.", "2.0L Hybrid 212 л.с."], transmission: ["Автомат", "Вариатор"], fuelType: ["Бензин", "Гибрид"] },
      { name: "Pilot", years: [2002, 2026], engines: ["3.5L V6 280 л.с."], transmission: ["Автомат"], fuelType: ["Бензин"] },
    ],
  },
  {
    name: "Skoda", country: "Чехия",
    models: [
      { name: "Octavia", years: [1996, 2026], engines: ["1.4 TSI 150 л.с.", "2.0 TSI 245 л.с.", "2.0 TDI 150 л.с."], transmission: ["Автомат", "Робот", "Механика"], fuelType: ["Бензин", "Дизель"] },
      { name: "Kodiaq", years: [2016, 2026], engines: ["1.4 TSI 150 л.с.", "2.0 TSI 220 л.с.", "2.0 TDI 190 л.с."], transmission: ["Робот", "Автомат"], fuelType: ["Бензин", "Дизель"] },
      { name: "Rapid", years: [2012, 2023], engines: ["1.4L 90 л.с.", "1.6L 110 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин"] },
      { name: "Superb", years: [2001, 2026], engines: ["1.4 TSI 150 л.с.", "2.0 TSI 272 л.с.", "2.0 TDI 190 л.с."], transmission: ["Робот", "Автомат"], fuelType: ["Бензин", "Дизель"] },
      { name: "Karoq", years: [2017, 2026], engines: ["1.4 TSI 150 л.с.", "2.0 TSI 190 л.с."], transmission: ["Робот", "Автомат"], fuelType: ["Бензин", "Дизель"] },
    ],
  },
  {
    name: "Lexus", country: "Япония",
    models: [
      { name: "RX", years: [1998, 2026], engines: ["2.4T 275 л.с.", "3.5L V6 295 л.с.", "2.5L Hybrid 308 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Гибрид"] },
      { name: "NX", years: [2014, 2026], engines: ["2.5L 203 л.с.", "2.4T 275 л.с.", "2.5L Hybrid 244 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Гибрид"] },
      { name: "ES", years: [2006, 2026], engines: ["2.5L 203 л.с.", "3.5L V6 302 л.с.", "2.5L Hybrid 218 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Гибрид"] },
      { name: "LX", years: [2007, 2026], engines: ["3.5L V6 Turbo 415 л.с."], transmission: ["Автомат"], fuelType: ["Бензин"] },
    ],
  },
  {
    name: "Lada (ВАЗ)", country: "Россия",
    models: [
      { name: "Vesta", years: [2015, 2026], engines: ["1.6L 106 л.с.", "1.6L 113 л.с.", "1.8L 122 л.с."], transmission: ["Механика", "Автомат", "Вариатор"], fuelType: ["Бензин"] },
      { name: "Granta", years: [2011, 2026], engines: ["1.6L 87 л.с.", "1.6L 106 л.с."], transmission: ["Механика", "Автомат"], fuelType: ["Бензин"] },
      { name: "XRAY", years: [2015, 2023], engines: ["1.6L 106 л.с.", "1.6L 113 л.с.", "1.8L 122 л.с."], transmission: ["Механика", "Вариатор"], fuelType: ["Бензин"] },
      { name: "Niva Travel", years: [2020, 2026], engines: ["1.7L 80 л.с."], transmission: ["Механика"], fuelType: ["Бензин"] },
      { name: "Niva Legend", years: [1977, 2026], engines: ["1.7L 83 л.с."], transmission: ["Механика"], fuelType: ["Бензин"] },
      { name: "Largus", years: [2012, 2026], engines: ["1.6L 87 л.с.", "1.6L 106 л.с."], transmission: ["Механика"], fuelType: ["Бензин"] },
    ],
  },
  {
    name: "Renault", country: "Франция",
    models: [
      { name: "Duster", years: [2010, 2026], engines: ["1.6L 114 л.с.", "2.0L 143 л.с.", "1.5 dCi 109 л.с.", "1.3 TCe 150 л.с."], transmission: ["Механика", "Автомат", "Вариатор"], fuelType: ["Бензин", "Дизель"] },
      { name: "Arkana", years: [2019, 2026], engines: ["1.3 TCe 150 л.с.", "1.6L 114 л.с."], transmission: ["Вариатор", "Автомат"], fuelType: ["Бензин"] },
      { name: "Logan", years: [2004, 2026], engines: ["1.6L 82 л.с.", "1.6L 102 л.с.", "1.6L 113 л.с."], transmission: ["Механика", "Автомат"], fuelType: ["Бензин"] },
      { name: "Kaptur", years: [2016, 2026], engines: ["1.6L 114 л.с.", "2.0L 143 л.с.", "1.3 TCe 150 л.с."], transmission: ["Механика", "Вариатор"], fuelType: ["Бензин"] },
    ],
  },
  {
    name: "Mitsubishi", country: "Япония",
    models: [
      { name: "Outlander", years: [2001, 2026], engines: ["2.0L 150 л.с.", "2.5L 181 л.с.", "2.4L PHEV 224 л.с."], transmission: ["Вариатор", "Автомат"], fuelType: ["Бензин", "Гибрид"] },
      { name: "Pajero Sport", years: [2008, 2026], engines: ["2.4D 181 л.с.", "3.0L V6 209 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель"] },
      { name: "ASX", years: [2010, 2026], engines: ["1.6L 117 л.с.", "2.0L 150 л.с."], transmission: ["Вариатор", "Механика"], fuelType: ["Бензин"] },
      { name: "L200", years: [2006, 2026], engines: ["2.4D 154 л.с.", "2.4D 181 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Дизель"] },
    ],
  },
  {
    name: "Subaru", country: "Япония",
    models: [
      { name: "Forester", years: [1997, 2026], engines: ["2.0L 150 л.с.", "2.5L 185 л.с.", "2.0L Turbo 241 л.с."], transmission: ["Вариатор", "Механика"], fuelType: ["Бензин"] },
      { name: "Outback", years: [2003, 2026], engines: ["2.5L 185 л.с.", "2.4T 264 л.с."], transmission: ["Вариатор"], fuelType: ["Бензин"] },
      { name: "XV (Crosstrek)", years: [2011, 2026], engines: ["1.6L 115 л.с.", "2.0L 150 л.с."], transmission: ["Вариатор", "Механика"], fuelType: ["Бензин"] },
    ],
  },
  {
    name: "Volvo", country: "Швеция",
    models: [
      { name: "XC60", years: [2008, 2026], engines: ["2.0T 249 л.с.", "2.0T 300 л.с.", "2.0D 190 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель", "Гибрид"] },
      { name: "XC90", years: [2002, 2026], engines: ["2.0T 249 л.с.", "2.0T 310 л.с.", "2.0T PHEV 455 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель", "Гибрид"] },
      { name: "S60", years: [2000, 2026], engines: ["2.0T 249 л.с.", "2.0T 310 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Гибрид"] },
      { name: "XC40", years: [2017, 2026], engines: ["1.5T 163 л.с.", "2.0T 249 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Гибрид", "Электро"] },
    ],
  },
  {
    name: "Porsche", country: "Германия",
    models: [
      { name: "Cayenne", years: [2002, 2026], engines: ["3.0L V6 340 л.с.", "4.0L V8 550 л.с.", "2.9L V6 462 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Гибрид"] },
      { name: "Macan", years: [2014, 2026], engines: ["2.0T 265 л.с.", "2.9L V6 380 л.с.", "2.9L V6 440 л.с."], transmission: ["Автомат"], fuelType: ["Бензин"] },
      { name: "Panamera", years: [2009, 2026], engines: ["2.9L V6 330 л.с.", "4.0L V8 630 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Гибрид"] },
    ],
  },
  {
    name: "Land Rover", country: "Великобритания",
    models: [
      { name: "Range Rover", years: [2002, 2026], engines: ["3.0L V6 400 л.с.", "4.4L V8 530 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель", "Гибрид"] },
      { name: "Range Rover Sport", years: [2005, 2026], engines: ["3.0L V6 360 л.с.", "4.4L V8 530 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель"] },
      { name: "Discovery", years: [2004, 2026], engines: ["2.0T 300 л.с.", "3.0L V6 360 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель"] },
      { name: "Defender", years: [2019, 2026], engines: ["2.0T 300 л.с.", "3.0L V6 400 л.с.", "5.0L V8 525 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель"] },
    ],
  },
  {
    name: "Ford", country: "США",
    models: [
      { name: "Focus", years: [1998, 2023], engines: ["1.6L 125 л.с.", "1.5T 150 л.с.", "2.0L 150 л.с."], transmission: ["Автомат", "Робот", "Механика"], fuelType: ["Бензин"] },
      { name: "Kuga", years: [2008, 2026], engines: ["1.5T 150 л.с.", "2.5L Hybrid 225 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин", "Дизель", "Гибрид"] },
      { name: "Explorer", years: [2010, 2026], engines: ["2.3T 300 л.с.", "3.0L V6 370 л.с."], transmission: ["Автомат"], fuelType: ["Бензин"] },
      { name: "Mondeo", years: [2000, 2023], engines: ["2.0L 150 л.с.", "2.0T 240 л.с.", "2.0 TDCi 180 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин", "Дизель"] },
    ],
  },
  {
    name: "Chevrolet", country: "США",
    models: [
      { name: "Tahoe", years: [2006, 2026], engines: ["5.3L V8 360 л.с.", "6.2L V8 426 л.с.", "3.0L Diesel 277 л.с."], transmission: ["Автомат"], fuelType: ["Бензин", "Дизель"] },
      { name: "Camaro", years: [2009, 2026], engines: ["2.0T 275 л.с.", "6.2L V8 455 л.с."], transmission: ["Автомат", "Механика"], fuelType: ["Бензин"] },
      { name: "TrailBlazer", years: [2020, 2026], engines: ["1.3T 155 л.с."], transmission: ["Автомат", "Вариатор"], fuelType: ["Бензин"] },
    ],
  },
  {
    name: "Tesla", country: "США",
    models: [
      { name: "Model 3", years: [2017, 2026], engines: ["RWD 283 л.с.", "Long Range AWD 498 л.с.", "Performance 513 л.с."], transmission: ["Автомат"], fuelType: ["Электро"] },
      { name: "Model Y", years: [2020, 2026], engines: ["RWD 283 л.с.", "Long Range AWD 514 л.с.", "Performance 513 л.с."], transmission: ["Автомат"], fuelType: ["Электро"] },
      { name: "Model S", years: [2012, 2026], engines: ["Long Range 670 л.с.", "Plaid 1020 л.с."], transmission: ["Автомат"], fuelType: ["Электро"] },
      { name: "Model X", years: [2015, 2026], engines: ["Long Range 670 л.с.", "Plaid 1020 л.с."], transmission: ["Автомат"], fuelType: ["Электро"] },
    ],
  },
];

// ── Autocomplete component ──

function AutocompleteInput({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
  required,
  renderItem,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  suggestions: { value: string; subtitle?: string }[];
  placeholder: string;
  required?: boolean;
  renderItem?: (item: { value: string; subtitle?: string }, isSelected: boolean) => React.ReactNode;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = value
    ? suggestions.filter((s) => s.value.toLowerCase().includes(value.toLowerCase()))
    : suggestions;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          className="input-field text-sm pr-8"
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
        />
        <Search className={`w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 ${focused ? "text-brand-light" : "text-text-dim"} transition-colors pointer-events-none`} />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((item) => {
            const isSelected = item.value === value;
            return (
              <button
                key={item.value}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm hover:bg-[var(--hover-bg)] transition-colors flex items-center justify-between gap-2 ${
                  isSelected ? "bg-brand/[0.06] text-brand" : "text-[var(--text)]"
                }`}
              >
                {renderItem ? (
                  renderItem(item, isSelected)
                ) : (
                  <>
                    <div>
                      <div className="font-medium">{item.value}</div>
                      {item.subtitle && <div className="text-xs text-text-muted">{item.subtitle}</div>}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brand flex-shrink-0" />}
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── AddCarModal with smart search ──

function AddCarModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    mileage: 0,
    color: "",
    engine: "",
    transmission: "Автомат",
    fuelType: "Бензин",
    licensePlate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMake, setSelectedMake] = useState<CarMakeInfo | null>(null);
  const [selectedModel, setSelectedModel] = useState<CarModelInfo | null>(null);

  const update = (field: string, value: string | number) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  // When make changes, find in DB
  const handleMakeChange = (val: string) => {
    update("make", val);
    const found = carDatabase.find((m) => m.name.toLowerCase() === val.toLowerCase());
    setSelectedMake(found || null);
    if (!found) {
      setSelectedModel(null);
    }
    // Reset model when make changes
    if (form.model && found) {
      const modelFound = found.models.find((m) => m.name.toLowerCase() === form.model.toLowerCase());
      if (!modelFound) {
        update("model", "");
        setSelectedModel(null);
      }
    }
  };

  // When model changes, autofill engine/transmission/fuel
  const handleModelChange = (val: string) => {
    update("model", val);
    if (!selectedMake) return;
    const found = selectedMake.models.find((m) => m.name.toLowerCase() === val.toLowerCase());
    setSelectedModel(found || null);
    if (found) {
      // Autofill with first options
      update("engine", found.engines[0] || "");
      update("transmission", found.transmission[0] || "Автомат");
      update("fuelType", found.fuelType[0] || "Бензин");
    }
  };

  const makeSuggestions = carDatabase.map((m) => ({
    value: m.name,
    subtitle: m.country,
  }));

  const modelSuggestions = selectedMake
    ? selectedMake.models.map((m) => ({
        value: m.name,
        subtitle: `${m.years[0]}–${m.years[1]}`,
      }))
    : [];

  const engineOptions = selectedModel?.engines || [];
  const transmissionOptions = selectedModel?.transmission || ["Автомат", "Механика", "Робот", "Вариатор"];
  const fuelOptions = selectedModel?.fuelType || ["Бензин", "Дизель", "Гибрид", "Электро", "Газ"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.make || !form.model || !form.vin) {
      setError("Марка, модель и VIN обязательны");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          year: Number(form.year),
          mileage: Number(form.mileage),
          health: 100,
          image: "",
          nextService: "не указано",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка при добавлении");
        setLoading(false);
        return;
      }

      onAdded();
    } catch {
      setError("Ошибка сети");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-[var(--bg-card)] flex items-center justify-between p-5 border-b border-[var(--border)] z-10">
          <h2 className="text-lg font-bold text-text">Добавить автомобиль</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {/* Smart search: Make & Model */}
          <div className="grid grid-cols-2 gap-3">
            <AutocompleteInput
              label="Марка *"
              value={form.make}
              onChange={handleMakeChange}
              suggestions={makeSuggestions}
              placeholder="Начните вводить..."
              required
            />
            <AutocompleteInput
              label="Модель *"
              value={form.model}
              onChange={handleModelChange}
              suggestions={modelSuggestions}
              placeholder={selectedMake ? "Выберите модель..." : "Сначала марку"}
              required
              disabled={!form.make}
            />
          </div>

          {/* Autofill hint */}
          {selectedModel && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand/[0.06] border border-brand/[0.12]">
              <Check className="w-4 h-4 text-brand flex-shrink-0" />
              <span className="text-xs text-brand">
                {selectedMake?.name} {selectedModel.name} — данные заполнены автоматически
              </span>
            </div>
          )}

          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">VIN *</label>
            <input type="text" value={form.vin} onChange={(e) => update("vin", e.target.value.toUpperCase())} className="input-field text-sm font-mono" placeholder="WBA53AH08MWX12345" required maxLength={17} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Год выпуска</label>
              <input type="number" value={form.year} onChange={(e) => update("year", e.target.value)} className="input-field text-sm" min={selectedModel?.years[0] || 1990} max={selectedModel?.years[1] || 2030} />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Пробег (км)</label>
              <input type="number" value={form.mileage} onChange={(e) => update("mileage", e.target.value)} className="input-field text-sm" min={0} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Цвет</label>
              <input type="text" value={form.color} onChange={(e) => update("color", e.target.value)} className="input-field text-sm" placeholder="Серый металлик" />
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Госномер</label>
              <input type="text" value={form.licensePlate} onChange={(e) => update("licensePlate", e.target.value.toUpperCase())} className="input-field text-sm" placeholder="А777БВ 77" />
            </div>
          </div>

          {/* Engine — smart select or free input */}
          <div>
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Двигатель</label>
            {engineOptions.length > 0 ? (
              <select value={form.engine} onChange={(e) => update("engine", e.target.value)} className="input-field text-sm">
                {engineOptions.map((eng) => (
                  <option key={eng} value={eng}>{eng}</option>
                ))}
                <option value="">Другой...</option>
              </select>
            ) : (
              <input type="text" value={form.engine} onChange={(e) => update("engine", e.target.value)} className="input-field text-sm" placeholder="2.0L Turbo 249 л.с." />
            )}
            {engineOptions.length > 0 && form.engine === "" && (
              <input type="text" onChange={(e) => update("engine", e.target.value)} className="input-field text-sm mt-2" placeholder="Введите свой вариант..." />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">КПП</label>
              <select value={form.transmission} onChange={(e) => update("transmission", e.target.value)} className="input-field text-sm">
                {transmissionOptions.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Топливо</label>
              <select value={form.fuelType} onChange={(e) => update("fuelType", e.target.value)} className="input-field text-sm">
                {fuelOptions.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-sm !py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Добавляем...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Добавить автомобиль
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
