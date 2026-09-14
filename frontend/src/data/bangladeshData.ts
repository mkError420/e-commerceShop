export interface DivisionData {
  id: string;
  name: string;
  nameBn: string;
  districts: {
    name: string;
    nameBn: string;
    thanas: string[];
  }[];
}

export const BANGLADESH_DIVISIONS: DivisionData[] = [
  {
    id: "dhaka",
    name: "Dhaka",
    nameBn: "ঢাকা",
    districts: [
      {
        name: "Dhaka City",
        nameBn: "ঢাকা সিটি",
        thanas: [
          "Dhanmondi", "Gulshan", "Banani", "Uttara", "Mirpur", 
          "Mohammadpur", "Badda", "Tejgaon", "Motijheel", "Khilgaon", 
          "Malibagh", "Lalbagh", "Bashundhara R/A", "Baridhara", "Wari"
        ],
      },
      {
        name: "Gazipur",
        nameBn: "গাজীপুর",
        thanas: ["Gazipur Sadar", "Tongi", "Kaliakair", "Kapasia", "Sreepur"],
      },
      {
        name: "Narayanganj",
        nameBn: "নারায়ণগঞ্জ",
        thanas: ["Narayanganj Sadar", "Bandar", "Rupganj", "Sonargaon", "Araihazar"],
      },
      {
        name: "Tangail",
        nameBn: "টাঙ্গাইল",
        thanas: ["Tangail Sadar", "Mirzapur", "Delduar", "Nagarpur", "Madhupur"],
      },
    ],
  },
  {
    id: "chattogram",
    name: "Chattogram",
    nameBn: "চট্টগ্রাম",
    districts: [
      {
        name: "Chattogram City",
        nameBn: "চট্টগ্রাম সিটি",
        thanas: ["Panchlaish", "Kotwali", "Khulshi", "Halishahar", "Agrabad", "Nasirabad", "GEC"],
      },
      {
        name: "Cox's Bazar",
        nameBn: "কক্সবাজার",
        thanas: ["Cox's Bazar Sadar", "Teknaf", "Chakaria", "Ramu", "Ukhia"],
      },
      {
        name: "Cumilla",
        nameBn: "কুমিল্লা",
        thanas: ["Cumilla Adarsha Sadar", "Daudkandi", "Chandina", "Debidwar", "Laksam"],
      },
    ],
  },
  {
    id: "sylhet",
    name: "Sylhet",
    nameBn: "সিলেট",
    districts: [
      {
        name: "Sylhet",
        nameBn: "সিলেট",
        thanas: ["Sylhet Sadar", "South Surma", "Beanibazar", "Golapganj", "Zakiganj"],
      },
      {
        name: "Moulvibazar",
        nameBn: "মৌলভীবাজার",
        thanas: ["Moulvibazar Sadar", "Sreemangal", "Kulaura", "Barlekha"],
      },
    ],
  },
  {
    id: "rajshahi",
    name: "Rajshahi",
    nameBn: "রাজশাহী",
    districts: [
      {
        name: "Rajshahi",
        nameBn: "রাজশাহী",
        thanas: ["Boalia", "Motihar", "Rajpara", "Shah Mokhdum", "Paba", "Godagari"],
      },
      {
        name: "Bogura",
        nameBn: "বগুড়া",
        thanas: ["Bogura Sadar", "Sherpur", "Shibganj", "Gabtali", "Sonatola"],
      },
    ],
  },
  {
    id: "khulna",
    name: "Khulna",
    nameBn: "খুলনা",
    districts: [
      {
        name: "Khulna",
        nameBn: "খুলনা",
        thanas: ["Khulna Sadar", "Sonadanga", "Khalishpur", "Daulatpur", "Khan Jahan Ali"],
      },
      {
        name: "Jashore",
        nameBn: "যশোর",
        thanas: ["Kotwali", "Jhikargachha", "Sharsha", "Manirampur", "Keshabpur"],
      },
    ],
  },
  {
    id: "barishal",
    name: "Barishal",
    nameBn: "বরিশাল",
    districts: [
      {
        name: "Barishal",
        nameBn: "বরিশাল",
        thanas: ["Kotwali", "Airport", "Babuganj", "Bakerganj", "Banaripara"],
      },
    ],
  },
  {
    id: "rangpur",
    name: "Rangpur",
    nameBn: "রংপুর",
    districts: [
      {
        name: "Rangpur",
        nameBn: "রংপুর",
        thanas: ["Kotwali", "Haragach", "Taraganj", "Pirganj", "Badarganj"],
      },
    ],
  },
  {
    id: "mymensingh",
    name: "Mymensingh",
    nameBn: "ময়মনসিংহ",
    districts: [
      {
        name: "Mymensingh",
        nameBn: "ময়মনসিংহ",
        thanas: ["Kotwali", "Muktagachha", "Trishal", "Bhaluka", "Gafargaon"],
      },
    ],
  },
];

export const SHIPPING_RATES = {
  INSIDE_DHAKA: {
    feeBDT: 60,
    estimatedDays: "24-48 Hours",
    estimatedDaysBn: "২৪-৪৮ ঘণ্টার মধ্যে",
    hub: "Tejgaon / Mirpur Hub",
  },
  OUTSIDE_DHAKA: {
    feeBDT: 130,
    estimatedDays: "3-5 Business Days",
    estimatedDaysBn: "৩-৫ কার্যদিবস",
    hub: "National Express Courier Hub",
  },
};

export function calculateShippingFee(division: string, district: string): {
  zone: 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA';
  fee: number;
  deliveryEstimateEn: string;
  deliveryEstimateBn: string;
} {
  const isInsideDhaka = 
    division.toLowerCase().includes("dhaka") && 
    (district.toLowerCase().includes("dhaka city") || district.toLowerCase() === "dhaka");

  if (isInsideDhaka) {
    return {
      zone: 'INSIDE_DHAKA',
      fee: SHIPPING_RATES.INSIDE_DHAKA.feeBDT,
      deliveryEstimateEn: SHIPPING_RATES.INSIDE_DHAKA.estimatedDays,
      deliveryEstimateBn: SHIPPING_RATES.INSIDE_DHAKA.estimatedDaysBn,
    };
  }

  return {
    zone: 'OUTSIDE_DHAKA',
    fee: SHIPPING_RATES.OUTSIDE_DHAKA.feeBDT,
    deliveryEstimateEn: SHIPPING_RATES.OUTSIDE_DHAKA.estimatedDays,
    deliveryEstimateBn: SHIPPING_RATES.OUTSIDE_DHAKA.estimatedDaysBn,
  };
}
