declare global {
  interface Window {
    ymaps?: {
      ready: (cb: () => void) => void;
      Map: new (el: HTMLElement, opts: Record<string, unknown>) => unknown;
      Placemark: new (
        coords: [number, number],
        props: Record<string, unknown>,
        opts: Record<string, unknown>
      ) => unknown;
      GeoObjectCollection: new () => { add: (obj: unknown) => void };
    };
  }
}

export {};
