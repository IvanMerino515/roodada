import { describe, expect, it } from "vitest";

import { INDEXNOW_KEY, INDEXNOW_MAX, indexNowPayloads } from "../indexnow";

describe("IndexNow", () => {
  it("arma direcciones absolutas sin repetir, con la clave y su fichero", () => {
    const [t] = indexNowPayloads("https://roodada.com/", ["/", "/bici/a", "bici/a", "/bici/a"]);
    expect(t.host).toBe("roodada.com");
    expect(t.key).toBe(INDEXNOW_KEY);
    expect(t.keyLocation).toBe(`https://roodada.com/${INDEXNOW_KEY}.txt`);
    expect(t.urlList).toEqual(["https://roodada.com/", "https://roodada.com/bici/a"]);
  });

  it("parte en tandas de 10.000", () => {
    const rutas = Array.from({ length: INDEXNOW_MAX + 5 }, (_, i) => `/bici/${i}`);
    expect(indexNowPayloads("https://roodada.com", rutas).map((t) => t.urlList.length)).toEqual([INDEXNOW_MAX, 5]);
  });

  it("sin cambios no hay envíos", () => {
    expect(indexNowPayloads("https://roodada.com", [])).toEqual([]);
  });
});
