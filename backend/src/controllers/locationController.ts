import { Request, Response } from "express";
import { courierService } from "../services/courierService";

export const BANGLADESH_DIVISIONS = [
  { id: "div-dhaka", name: "Dhaka", bnName: "ঢাকা" },
  { id: "div-chittagong", name: "Chattogram", bnName: "চট্টগ্রাম" },
  { id: "div-rajshahi", name: "Rajshahi", bnName: "রাজশাহী" },
  { id: "div-khulna", name: "Khulna", bnName: "খুলনা" },
  { id: "div-barishal", name: "Barishal", bnName: "বরিশাল" },
  { id: "div-sylhet", name: "Sylhet", bnName: "সিলেট" },
  { id: "div-rangpur", name: "Rangpur", bnName: "রংপুর" },
  { id: "div-mymensingh", name: "Mymensingh", bnName: "ময়মনসিংহ" },
];

export const BANGLADESH_DISTRICTS = [
  // Dhaka Division
  { id: "dis-dhaka-city", divisionId: "div-dhaka", name: "Dhaka City (North/South)", bnName: "ঢাকা মহানগর", isDhakaCity: true },
  { id: "dis-gazipur", divisionId: "div-dhaka", name: "Gazipur", bnName: "গাজীপুর", isDhakaCity: false },
  { id: "dis-narayanganj", divisionId: "div-dhaka", name: "Narayanganj", bnName: "নারায়ণগঞ্জ", isDhakaCity: false },
  { id: "dis-tangail", divisionId: "div-dhaka", name: "Tangail", bnName: "টাঙ্গাইল", isDhakaCity: false },
  { id: "dis-narsingdi", divisionId: "div-dhaka", name: "Narsingdi", bnName: "নরসিংদী", isDhakaCity: false },
  
  // Chattogram Division
  { id: "dis-ctg-city", divisionId: "div-chittagong", name: "Chattogram City", bnName: "চট্টগ্রাম মহানগর", isDhakaCity: false },
  { id: "dis-coxsbazar", divisionId: "div-chittagong", name: "Cox's Bazar", bnName: "কক্সবাজার", isDhakaCity: false },
  { id: "dis-cumilla", divisionId: "div-chittagong", name: "Cumilla", bnName: "কুমিল্লা", isDhakaCity: false },
  { id: "dis-feni", divisionId: "div-chittagong", name: "Feni", bnName: "ফেনী", isDhakaCity: false },

  // Sylhet Division
  { id: "dis-sylhet-city", divisionId: "div-sylhet", name: "Sylhet Sadar", bnName: "সিলেট সদর", isDhakaCity: false },
  { id: "dis-moulvibazar", divisionId: "div-sylhet", name: "Moulvibazar", bnName: "মৌলভীবাজার", isDhakaCity: false },

  // Rajshahi Division
  { id: "dis-rajshahi-city", divisionId: "div-rajshahi", name: "Rajshahi City", bnName: "রাজশাহী মহানগর", isDhakaCity: false },
  { id: "dis-bogra", divisionId: "div-rajshahi", name: "Bogura", bnName: "বগুড়া", isDhakaCity: false },
  { id: "dis-pabna", divisionId: "div-rajshahi", name: "Pabna", bnName: "পাবনা", isDhakaCity: false },

  // Khulna Division
  { id: "dis-khulna-city", divisionId: "div-khulna", name: "Khulna City", bnName: "খুলনা মহানগর", isDhakaCity: false },
  { id: "dis-jessore", divisionId: "div-khulna", name: "Jashore", bnName: "যশোর", isDhakaCity: false },
  { id: "dis-kushtia", divisionId: "div-khulna", name: "Kushtia", bnName: "কুষ্টিয়া", isDhakaCity: false },

  // Barishal Division
  { id: "dis-barishal-city", divisionId: "div-barishal", name: "Barishal Sadar", bnName: "বরিশাল সদর", isDhakaCity: false },

  // Rangpur Division
  { id: "dis-rangpur-city", divisionId: "div-rangpur", name: "Rangpur Sadar", bnName: "রংপুর সদর", isDhakaCity: false },

  // Mymensingh Division
  { id: "dis-mymensingh-city", divisionId: "div-mymensingh", name: "Mymensingh Sadar", bnName: "ময়মনসিংহ সদর", isDhakaCity: false },
];

export const locationController = {
  // GET /api/v1/locations/divisions
  getDivisions(req: Request, res: Response): void {
    res.json({
      success: true,
      data: BANGLADESH_DIVISIONS,
    });
  },

  // GET /api/v1/locations/districts
  getDistricts(req: Request, res: Response): void {
    const { divisionId } = req.query;
    let districts = [...BANGLADESH_DISTRICTS];

    if (divisionId) {
      districts = districts.filter((d) => d.divisionId === divisionId);
    }

    res.json({
      success: true,
      data: districts,
    });
  },

  // GET /api/v1/locations/calculate-shipping
  calculateShipping(req: Request, res: Response): void {
    const { isInsideDhaka, weightKg } = req.query;
    const inside = isInsideDhaka === "true" || isInsideDhaka === "1";
    const weight = weightKg ? Number(weightKg) : 1;

    const rate = courierService.calculateDeliveryCharge(inside, weight);
    res.json({
      success: true,
      shippingFee: rate.totalFee,
      baseFee: rate.baseFee,
      estimatedDeliveryDays: rate.estimatedDeliveryDays,
      courierPartner: rate.courierName,
    });
  },
};
