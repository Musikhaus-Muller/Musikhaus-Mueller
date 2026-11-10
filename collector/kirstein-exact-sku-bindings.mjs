// Manually reviewed bindings.  They are deliberately declarative: a SKU read
// from a page is never promoted here by the collector.
export const KIRSTEIN_EXACT_SKU_BINDINGS = [
  { reference: 'r1', url: 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-11-G3-Schwarz.html', expectedName: 'LD Systems MAUI 11 G3 Schwarz', sku: '00095963', variantMarkers: ['g3', 'schwarz'], status: 'bound' },
  { reference: 'r2', url: 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-11-G3-Schwarz-Set.html', expectedName: 'LD Systems MAUI 11 G3 Schwarz Set', sku: '00096126', variantMarkers: ['g3', 'schwarz'], status: 'bound' },
  { reference: 'r3', url: 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-28-G3-Schwarz-Set.html', expectedName: 'LD Systems MAUI 28 G3 Schwarz Set', sku: '00096122', variantMarkers: ['g3', 'schwarz'], status: 'bound' },
  // r4 is intentionally absent: it points at r3's same SKU but represents a
  // different configuration.  The no-duplicate-SKU invariant keeps it pending.
  { reference: 'r5', url: 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-28-G3-Schwarz.html', expectedName: 'LD Systems MAUI 28 G3 Schwarz', sku: '00095958', variantMarkers: ['g3', 'schwarz'], status: 'bound' },
  { reference: 'r6', url: 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-28-G3-Weiss.html', expectedName: 'LD Systems MAUI 28 G3 Weiss', sku: null, variantMarkers: ['g3', 'weiss'], status: 'not_found' },
  { reference: 'r7', url: 'https://www.kirstein.de/Saeulensysteme/LD-Systems-Maui-28-G3-Mix-Schwarz.html', expectedName: 'LD Systems Maui 28 G3 Mix Schwarz', sku: '00104330', variantMarkers: ['g3', 'mix', 'schwarz'], status: 'bound' },
  { reference: 'r11', url: 'https://www.kirstein.de/Saeulensysteme/LD-Systems-MAUI-28-G3-Subwoofer-Cardioid-Set-Schwarz.html', expectedName: 'LD Systems MAUI 28 G3 Subwoofer Cardioid Set Schwarz', sku: '00104319', variantMarkers: ['g3', 'schwarz'], status: 'bound' },
  { reference: 'r15', url: 'https://www.kirstein.de/PA-Komplettanlagen/LD-Systems-Dave-12-G4X-Set.html', expectedName: 'LD Systems Dave 12 G4X Set', sku: '00093873', variantMarkers: ['g4x'], status: 'bound' },
  { reference: 'r16', url: 'https://www.kirstein.de/PA-Komplettanlagen/LD-Systems-Dave-15-G4X-Set.html', expectedName: 'LD Systems Dave 15 G4X Set', sku: '00093874', variantMarkers: ['g4x'], status: 'bound' },
  { reference: 'r17', url: 'https://www.kirstein.de/PA-Komplettanlagen/LD-Systems-Dave-18-G4X-Set.html', expectedName: 'LD Systems Dave 18 G4X Set', sku: '00093875', variantMarkers: ['g4x'], status: 'bound' }
];

export const bindingForKirsteinReference = reference =>
  KIRSTEIN_EXACT_SKU_BINDINGS.find(binding => binding.reference === reference) || null;
