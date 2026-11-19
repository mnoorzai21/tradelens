import { describe, expect, it } from "vitest";
import { niceAxis } from "./chart-axis";

describe("niceAxis", () => {
  it("picks round labels for a mix of winning and losing days", () => {
    expect(niceAxis([-230, 120, 340])).toEqual({
      domain: [-400, 400],
      ticks: [-400, -200, 0, 200, 400],
    });
  });

  it("starts at 0 when every day is a loss", () => {
    expect(niceAxis([-68.65, -73.9]).ticks).toEqual([-80, -60, -40, -20, 0]);
  });

  it("starts at 0 when every day is a win", () => {
    expect(niceAxis([100, 340]).ticks).toEqual([0, 100, 200, 300, 400]);
  });

  it("always includes 0 as a label", () => {
    for (const values of [[-5], [12], [-999, 3], [0.5, 4000], [-1234, -2]]) {
      expect(niceAxis(values).ticks).toContain(0);
    }
  });

  it("covers every value", () => {
    const values = [-487.2, 15, 912.8];
    const { domain } = niceAxis(values);
    expect(domain[0]).toBeLessThanOrEqual(Math.min(...values));
    expect(domain[1]).toBeGreaterThanOrEqual(Math.max(...values));
  });

  it("avoids floating-point leftovers with small values", () => {
    expect(niceAxis([0.3]).ticks).toEqual([0, 0.1, 0.2, 0.3]);
  });

  it("handles no data or only zeros", () => {
    expect(niceAxis([])).toEqual({ domain: [-1, 1], ticks: [0] });
    expect(niceAxis([0, 0])).toEqual({ domain: [-1, 1], ticks: [0] });
  });
});