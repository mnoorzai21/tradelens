export type Axis = {
  domain: [number, number];
  ticks: number[];
};

// Round, evenly spaced axis labels that always include 0.
// For example, values from -230 to 340 give -400, -200, 0, 200, 400.
export function niceAxis(values: number[], targetTicks = 5): Axis {
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);

  if (min === max) {
    return { domain: [-1, 1], ticks: [0] };
  }

  const rawStep = (max - min) / (targetTicks - 1);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step =
    [1, 2, 2.5, 5, 10]
      .map((multiple) => multiple * magnitude)
      .find((candidate) => candidate >= rawStep) ?? 10 * magnitude;

  const low = Math.floor(min / step) * step;
  const high = Math.ceil(max / step) * step;
  const count = Math.round((high - low) / step) + 1;

  // toFixed avoids floating-point leftovers like 0.30000000000000004
  const ticks = Array.from({ length: count }, (_, index) =>
    Number((low + index * step).toFixed(10))
  );

  return { domain: [low, high], ticks };
}