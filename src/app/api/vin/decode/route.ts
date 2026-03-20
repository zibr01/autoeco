import { NextResponse } from "next/server";

// NHTSA VIN Decoder API — free, no key required
const NHTSA_API = "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues";

interface NHTSAResult {
  Make: string;
  Model: string;
  ModelYear: string;
  FuelTypePrimary: string;
  TransmissionStyle: string;
  DisplacementL: string;
  EngineCylinders: string;
  EngineHP: string;
  BodyClass: string;
  DriveType: string;
  VehicleType: string;
  ErrorCode: string;
  ErrorText: string;
}

// Маппинг марок NHTSA → русский формат
const makeMapping: Record<string, string> = {
  "BMW": "BMW",
  "MERCEDES-BENZ": "Mercedes-Benz",
  "MERCEDES BENZ": "Mercedes-Benz",
  "AUDI": "Audi",
  "VOLKSWAGEN": "Volkswagen",
  "TOYOTA": "Toyota",
  "LEXUS": "Lexus",
  "HONDA": "Honda",
  "NISSAN": "Nissan",
  "MAZDA": "Mazda",
  "HYUNDAI": "Hyundai",
  "KIA": "Kia",
  "FORD": "Ford",
  "CHEVROLET": "Chevrolet",
  "SKODA": "Skoda",
  "VOLVO": "Volvo",
  "PORSCHE": "Porsche",
  "LAND ROVER": "Land Rover",
  "SUBARU": "Subaru",
  "MITSUBISHI": "Mitsubishi",
  "RENAULT": "Renault",
  "TESLA": "Tesla",
};

// Маппинг типов топлива
const fuelMapping: Record<string, string> = {
  "Gasoline": "Бензин",
  "Diesel": "Дизель",
  "Electric": "Электро",
  "Hybrid": "Гибрид",
  "Plug-in Hybrid (PHEV)": "Гибрид",
  "Compressed Natural Gas (CNG)": "Газ",
  "Liquefied Petroleum Gas (propane or LPG)": "Газ",
};

// Маппинг КПП
const transmissionMapping: Record<string, string> = {
  "Automatic": "Автомат",
  "Manual": "Механика",
  "Automated Manual Transmission (AMT)": "Робот",
  "Continuously Variable Transmission (CVT)": "Вариатор",
  "Dual-Clutch Transmission (DCT)": "Робот",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vin = searchParams.get("vin");

  if (!vin || vin.length !== 17) {
    return NextResponse.json(
      { error: "VIN должен содержать 17 символов" },
      { status: 400 }
    );
  }

  // Валидация формата VIN
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  if (!vinRegex.test(vin)) {
    return NextResponse.json(
      { error: "Некорректный формат VIN" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${NHTSA_API}/${vin.toUpperCase()}?format=json`,
      { next: { revalidate: 86400 } } // cache 24h
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Сервис VIN-декодера временно недоступен" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const result: NHTSAResult = data.Results?.[0];

    if (!result || result.ErrorCode === "1") {
      return NextResponse.json(
        { error: "VIN не найден в базе данных" },
        { status: 404 }
      );
    }

    // Формируем строку двигателя
    let engineStr = "";
    if (result.DisplacementL && result.DisplacementL !== "0") {
      engineStr += `${parseFloat(result.DisplacementL).toFixed(1)}L`;
    }
    if (result.EngineCylinders) {
      engineStr += engineStr ? ` ${result.EngineCylinders} цил.` : `${result.EngineCylinders} цил.`;
    }
    if (result.EngineHP && result.EngineHP !== "0") {
      engineStr += engineStr ? ` ${Math.round(parseFloat(result.EngineHP))} л.с.` : `${Math.round(parseFloat(result.EngineHP))} л.с.`;
    }

    // Нормализуем марку
    const rawMake = (result.Make || "").toUpperCase().trim();
    const make = makeMapping[rawMake] || result.Make || "";

    // Нормализуем топливо и КПП
    const fuelType = fuelMapping[result.FuelTypePrimary] || result.FuelTypePrimary || "";
    const transmission = transmissionMapping[result.TransmissionStyle] || result.TransmissionStyle || "";

    const decoded = {
      make,
      model: result.Model || "",
      year: parseInt(result.ModelYear) || 0,
      engine: engineStr,
      fuelType,
      transmission,
      bodyClass: result.BodyClass || "",
      driveType: result.DriveType || "",
      vehicleType: result.VehicleType || "",
    };

    return NextResponse.json(decoded);
  } catch {
    return NextResponse.json(
      { error: "Ошибка при декодировании VIN" },
      { status: 500 }
    );
  }
}
