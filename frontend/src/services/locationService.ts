import { apiClient } from "./api";

export interface Division {
  id: string;
  name: string;
  bnName: string;
}

export interface District {
  id: string;
  divisionId: string;
  name: string;
  bnName: string;
  isDhakaCity: boolean;
}

export const locationService = {
  // Get all 8 Bangladeshi Divisions
  async getDivisions(): Promise<{ success: boolean; data: Division[] }> {
    return apiClient<{ success: boolean; data: Division[] }>("/locations/divisions");
  },

  // Get Districts by Division
  async getDistricts(divisionId?: string): Promise<{ success: boolean; data: District[] }> {
    return apiClient<{ success: boolean; data: District[] }>("/locations/districts", {
      params: { divisionId },
    });
  },

  // Calculate delivery fee
  async calculateShipping(isInsideDhaka: boolean, weightKg: number = 1): Promise<{
    shippingFee: number;
    estimatedDeliveryDays: string;
    courierPartner: string;
  }> {
    return apiClient<{
      shippingFee: number;
      estimatedDeliveryDays: string;
      courierPartner: string;
    }>("/locations/calculate-shipping", {
      params: { isInsideDhaka: String(isInsideDhaka), weightKg: String(weightKg) },
    });
  },
};
