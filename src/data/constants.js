export const TRANSPORTISTAS = ["ATLAS", "OTRO"];

export const PROCEDENCIAS = ["CCDC-51", "PRODUCCION"];

// Locaciones Bloque 14
const BLOQUE14 = [
  "ESTACION PINDO",
  "ESTACION DAYUMA",
  "KUPI A",
  "KUPI E",
  "KUPI D",
  "ESTACION CPH",
  "NANTU E",
  "NANTU C",
  "NANTU D",
  "PENKE A",
  "PENKE B",
  "SUNKA A",
  "SUNKA B",
  "WANKE A",
  "ESTACION CDP"
];

// Locaciones Bloque 17 (nuevas)
const BLOQUE17 = [
  "HORMIGUERO A",
  "HORMIGUERO B",
  "HORMIGUERO C",
  "HORMIGUERO D",
  "HORMIGUERO E",
  "HORMIGUERO SUR",
  "TAPIR A",
  "TAPIR B",
  "AURORA",
  "TAPIR EXTENSIÓN",
  "KUPI 4",
  "CAMI",
  "NANTU B",
  "DISPENSARIO COMUNITARIO",
  "CENTRO MEDICO KUPI 4"
];

// Export combinado (se usa actualmente en el formulario)
export const LOCACIONES = [...BLOQUE14, ...BLOQUE17];

// Export opcional por bloque si se requiere posteriormente filtrado
export const LOCACIONES_BLOQUE14 = BLOQUE14;
export const LOCACIONES_BLOQUE17 = BLOQUE17;

// Lista alfabética para uso en la UI (sin revelar bloque)
export const LOCACIONES_ALFABETICAS = [...LOCACIONES].sort((a,b) => a.localeCompare(b));

export const RANGO_NIVEL = { min: 1, max: 95 };
