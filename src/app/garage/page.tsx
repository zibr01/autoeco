"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (authStatus === "authenticated") {
      fetch("/api/cars")
        .then((r) => r.json())
        .then((data) => setCarsData(Array.isArray(data) ? data : []))
        .finally(() => setLoading(false));
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
        <button className="btn-primary flex items-center gap-2">
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

          <button className="w-full card border-dashed border-prussian/[0.12] hover:border-brand/40 hover:bg-brand/5 transition-all duration-200 flex items-center justify-center gap-3 text-text-muted hover:text-brand-light py-8">
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
    </AppLayout>
  );
}
