export function convertAndMapSpeed(speedMs) {
  // Step 1: Convert m/s to km/h
  const speedKmh = speedMs * 3.6;

  // Step 2: Apply exponential mapping
  // f(x)=a * e ^(b * x) + c
  // However mappedValue = 20⋅(1 - e ^(-k * x))
  const k = 0.01; // Scaling factor
  const mappedValue = 30 + 20 * (1 - Math.exp(-k * speedKmh));

  return mappedValue;
}

// Example Usage
// console.log(convertAndMapSpeed(0));         // 0 km/h → 0
// console.log(convertAndMapSpeed(69.44));     // 250 km/h → ~20
// console.log(convertAndMapSpeed(27.78));     // 100 km/h → Approx ~13

