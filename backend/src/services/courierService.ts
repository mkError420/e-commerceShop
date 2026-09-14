import { ENV } from "../config/env";

export const courierService = {
  calculateDeliveryCharge(isInsideDhaka: boolean, weightKg: number = 1): {
    baseFee: number;
    weightSurcharge: number;
    totalFee: number;
    estimatedDeliveryDays: string;
    courierName: string;
  } {
    const baseFee = isInsideDhaka ? ENV.COURIER.INSIDE_DHAKA_RATE : ENV.COURIER.OUTSIDE_DHAKA_RATE;
    const extraKg = Math.max(0, Math.ceil(weightKg) - 1);
    const weightSurcharge = extraKg * (isInsideDhaka ? 20 : 35);
    const totalFee = baseFee + weightSurcharge;

    return {
      baseFee,
      weightSurcharge,
      totalFee,
      estimatedDeliveryDays: isInsideDhaka ? "24 - 48 Hours" : "2 - 4 Days",
      courierName: isInsideDhaka ? "Pathao Courier / Paperfly" : "Steadfast Courier / RedX",
    };
  },

  generateTrackingNumber(courier: string = "Steadfast"): string {
    const prefix = courier.toLowerCase().includes("steadfast") ? "STDF" : "PTHO";
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${rand}-BD`;
  },
};
