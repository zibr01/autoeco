"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface ServiceMapProps {
  services: {
    id: string;
    name: string;
    type: string;
    typeName: string;
    rating: number;
    address: string;
    lat?: number | null;
    lng?: number | null;
  }[];
  selectedId?: string | null;
}

// Window.ymaps types are in src/types/ymaps.d.ts

type YPlacemark = {
  options: { set: (key: string, value: unknown) => void };
  balloon: { open: () => void; close: () => void };
};

export default function ServiceMap({ services, selectedId }: ServiceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const placemarkMapRef = useRef<Map<string, YPlacemark>>(new Map());

  useEffect(() => {
    const servicesWithCoords = services.filter((s) => s.lat && s.lng);
    if (servicesWithCoords.length === 0) {
      setError(true);
      return;
    }

    setError(false);

    if (window.ymaps) {
      window.ymaps.ready(() => initMap(servicesWithCoords));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.NEXT_PUBLIC_YMAPS_KEY || ""}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      if (window.ymaps) {
        window.ymaps.ready(() => initMap(servicesWithCoords));
      }
    };
    script.onerror = () => setError(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup not needed for ymaps
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services]);

  // React to selectedId changes — highlight the marker
  useEffect(() => {
    const placemarks = placemarkMapRef.current;
    placemarks.forEach((pm, id) => {
      if (id === selectedId) {
        pm.options.set("preset", "islands#violetIcon");
        pm.balloon.open();
      } else {
        pm.options.set("preset", "islands#violetDotIcon");
        pm.balloon.close();
      }
    });
  }, [selectedId]);

  function initMap(
    servicesWithCoords: {
      id: string;
      name: string;
      typeName: string;
      rating: number;
      address: string;
      lat?: number | null;
      lng?: number | null;
    }[]
  ) {
    if (!mapRef.current || !window.ymaps) return;

    const ymaps = window.ymaps;

    const avgLat = servicesWithCoords.reduce((s, c) => s + (c.lat || 0), 0) / servicesWithCoords.length;
    const avgLng = servicesWithCoords.reduce((s, c) => s + (c.lng || 0), 0) / servicesWithCoords.length;

    const map = new ymaps.Map(mapRef.current, {
      center: [avgLat, avgLng],
      zoom: 11,
      controls: ["zoomControl"],
    });

    placemarkMapRef.current.clear();

    for (const s of servicesWithCoords) {
      const placemark = new ymaps.Placemark(
        [s.lat!, s.lng!],
        {
          balloonContentHeader: `<strong>${s.name}</strong>`,
          balloonContentBody: `
            <div style="font-size:13px;color:#666">
              <div>${s.typeName} · ★ ${s.rating}</div>
              <div style="margin-top:4px">${s.address}</div>
              <a href="/services/${s.id}" style="display:inline-block;margin-top:8px;color:#5932E6;font-weight:500">Подробнее →</a>
            </div>
          `,
          hintContent: s.name,
        },
        {
          preset: s.id === selectedId ? "islands#violetIcon" : "islands#violetDotIcon",
        }
      );
      (map as unknown as { geoObjects: { add: (p: unknown) => void } }).geoObjects.add(placemark);
      placemarkMapRef.current.set(s.id, placemark as unknown as YPlacemark);
    }

    setLoaded(true);
  }

  if (error) {
    return (
      <div className="card-surface flex flex-col items-center justify-center py-16 text-center">
        <MapPin className="w-12 h-12 text-text-dim mb-4" />
        <p className="text-text-muted font-medium mb-1">Карта недоступна</p>
        <p className="text-text-dim text-sm">Для сервисов нет координат или не удалось загрузить карту</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bg-surface)] rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-full rounded-xl overflow-hidden border border-[var(--border)]"
      />
    </div>
  );
}
