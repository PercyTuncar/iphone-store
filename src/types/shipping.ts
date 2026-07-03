/** Single document: shipping_rates/peru_rates */
export interface ShippingRates {
  rates: Record<string, number>; // department name → cost in soles
}

export interface ShippingRate {
  department: string;
  cost: number;
}
