export const BUSINESS_TYPES = [
  "Restaurant",
  "E-commerce",
  "Freelancer",
  "Agency",
  "Retail",
  "Service",
  "SaaS",
  "Non-profit",
  "Consultancy",
  "Education",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];
