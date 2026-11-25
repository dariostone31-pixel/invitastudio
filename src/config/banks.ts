export const ARGENTINA_BANK_ENTITIES = [
  "Mercado Pago",
  "Banco Nación",
  "Banco Galicia",
  "Banco Santander",
  "BBVA",
  "Banco Macro",
  "Banco Hipotecario",
  "Banco Provincia",
  "Banco Ciudad",
  "Brubank",
  "Ualá",
  "Naranja X",
  "Personal Pay",
  "Prex",
  "Modo",
] as const;

export const OTHER_BANK_OPTION = "Otra entidad";

export function isKnownBankEntity(value: string): boolean {
  return (ARGENTINA_BANK_ENTITIES as readonly string[]).includes(value);
}
