import { afterEach, describe, expect, it, vi } from "vitest";

import { estadoConsentimiento, guardarConsentimiento, leerConsentimiento } from "../consentimiento";

const DIA = 24 * 60 * 60 * 1000;

function almacen(inicial: Record<string, string> = {}) {
  const datos = { ...inicial };
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => datos[k] ?? null,
    setItem: (k: string, v: string) => void (datos[k] = v),
  });
  vi.stubGlobal("window", { dispatchEvent: vi.fn() });
  return datos;
}

afterEach(() => vi.unstubAllGlobals());

describe("consentimiento de cookies", () => {
  it("sin decisión guardada hay que preguntar", () => {
    almacen();
    expect(leerConsentimiento()).toBeNull();
    expect(estadoConsentimiento()).toBe("pendiente");
  });

  it("guarda y lee la decisión", () => {
    almacen();
    guardarConsentimiento({ analitica: true });
    expect(estadoConsentimiento()).toBe("si");
  });

  it("caduca a los 12 meses y con otra versión", () => {
    almacen({ roodada_consentimiento: JSON.stringify({ analitica: true, v: 1, fecha: Date.now() - 366 * DIA }) });
    expect(leerConsentimiento()).toBeNull();
    almacen({ roodada_consentimiento: JSON.stringify({ analitica: true, v: 99, fecha: Date.now() }) });
    expect(leerConsentimiento()).toBeNull();
  });

  it("si el navegador bloquea el almacenamiento, recuerda la decisión en memoria", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("bloqueado");
      },
      setItem: () => {
        throw new Error("bloqueado");
      },
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    const reload = vi.fn();
    vi.stubGlobal("location", { hostname: "roodada.com", reload });
    vi.stubGlobal("document", { cookie: "_ga=GA1.1.123; _ga_ABC=GS1" });
    guardarConsentimiento({ analitica: true });
    expect(estadoConsentimiento()).toBe("si");
    // Retirar el permiso: recarga para descargar Google Analytics
    guardarConsentimiento({ analitica: false });
    expect(estadoConsentimiento()).toBe("no");
    expect(reload).toHaveBeenCalledOnce();
  });
});
