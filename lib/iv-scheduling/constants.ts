import type { ChargeKey, VisaPath } from "./types";

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const CHARGES: Record<ChargeKey, string> = {
  row: "All other areas",
  china: "China",
  india: "India",
  mexico: "Mexico",
  philippines: "Philippines",
};

export const CATS: Record<VisaPath, Record<string, string>> = {
  employment: {
    EB1: "EB-1 · Priority Workers",
    EB2: "EB-2 · Advanced Degree / Exceptional Ability",
    EB3: "EB-3 · Skilled Workers / Professionals",
    EW: "EB-3 · Other Workers",
    EB4: "EB-4 · Certain Special Immigrants",
    SR: "EB-4 · Certain Religious Workers",
    EB5U: "EB-5 · Unreserved",
    EB5R: "EB-5 · Rural Set-Aside",
    EB5H: "EB-5 · High-Unemployment Set-Aside",
    EB5I: "EB-5 · Infrastructure Set-Aside",
  },
  family: {
    F1: "F1 · Unmarried adult sons/daughters of U.S. citizens",
    F2A: "F2A · Spouses/children of permanent residents",
    F2B: "F2B · Unmarried adult sons/daughters of permanent residents",
    F3: "F3 · Married sons/daughters of U.S. citizens",
    F4: "F4 · Siblings of adult U.S. citizens",
  },
  relative: {
    IR: "Immediate Relative",
  },
};

export const PATHNAMES: Record<VisaPath, string> = {
  employment: "Employment-based preference",
  family: "Family-sponsored preference",
  relative: "Immediate Relative",
};

export const DEFAULT_SUBCATEGORY: Record<VisaPath, string> = {
  employment: "EB2",
  family: "F2A",
  relative: "IR",
};
