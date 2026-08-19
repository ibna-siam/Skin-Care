export interface Division {
  id: string;
  name: string;
  bnName: string;
  districts: District[];
}

export interface District {
  id: string;
  name: string;
  bnName: string;
  divisionId: string;
}

export const BANGLADESH_DIVISIONS: Division[] = [
  {
    id: "dhaka",
    name: "Dhaka",
    bnName: "ঢাকা",
    districts: [
      { id: "dhaka-city", name: "Dhaka City", bnName: "ঢাকা সিটি", divisionId: "dhaka" },
      { id: "gazipur", name: "Gazipur", bnName: "গাজীপুর", divisionId: "dhaka" },
      { id: "narayanganj", name: "Narayanganj", bnName: "নারায়ণগঞ্জ", divisionId: "dhaka" },
      { id: "tangail", name: "Tangail", bnName: "টাঙ্গাইল", divisionId: "dhaka" },
      { id: "narsingdi", name: "Narsingdi", bnName: "নরসিংদী", divisionId: "dhaka" },
      { id: "faridpur", name: "Faridpur", bnName: "ফরিদপুর", divisionId: "dhaka" },
      { id: "manikganj", name: "Manikganj", bnName: "মানিকগঞ্জ", divisionId: "dhaka" },
      { id: "munshiganj", name: "Munshiganj", bnName: "মুন্সীগঞ্জ", divisionId: "dhaka" },
      { id: "kishoreganj", name: "Kishoreganj", bnName: "কিশোরগঞ্জ", divisionId: "dhaka" },
      { id: "gopalganj", name: "Gopalganj", bnName: "গোপালগঞ্জ", divisionId: "dhaka" },
      { id: "madaripur", name: "Madaripur", bnName: "মাদারীপুর", divisionId: "dhaka" },
      { id: "rajbari", name: "Rajbari", bnName: "রাজবাড়ী", divisionId: "dhaka" },
      { id: "shariatpur", name: "Shariatpur", bnName: "শরীয়তপুর", divisionId: "dhaka" },
    ],
  },
  {
    id: "chittagong",
    name: "Chittagong",
    bnName: "চট্টগ্রাম",
    districts: [
      { id: "chittagong-city", name: "Chittagong City", bnName: "চট্টগ্রাম", divisionId: "chittagong" },
      { id: "coxs-bazar", name: "Cox's Bazar", bnName: "কক্সবাজার", divisionId: "chittagong" },
      { id: "comilla", name: "Comilla", bnName: "কুমিল্লা", divisionId: "chittagong" },
      { id: "feni", name: "Feni", bnName: "ফেনী", divisionId: "chittagong" },
      { id: "brahmanbaria", name: "Brahmanbaria", bnName: "ব্রাহ্মণবাড়িয়া", divisionId: "chittagong" },
      { id: "noakhali", name: "Noakhali", bnName: "নোয়াখালী", divisionId: "chittagong" },
      { id: "chandpur", name: "Chandpur", bnName: "চাঁদপুর", divisionId: "chittagong" },
      { id: "lakshmipur", name: "Lakshmipur", bnName: "লক্ষ্মীপুর", divisionId: "chittagong" },
      { id: "rangamati", name: "Rangamati", bnName: "রাঙ্গামাটি", divisionId: "chittagong" },
      { id: "bandarban", name: "Bandarban", bnName: "বান্দরবান", divisionId: "chittagong" },
      { id: "khagrachhari", name: "Khagrachhari", bnName: "খাগড়াছড়ি", divisionId: "chittagong" },
    ],
  },
  {
    id: "sylhet",
    name: "Sylhet",
    bnName: "সিলেট",
    districts: [
      { id: "sylhet-sadar", name: "Sylhet Sadar", bnName: "সিলেট", divisionId: "sylhet" },
      { id: "moulvibazar", name: "Moulvibazar", bnName: "মৌলভীবাজার", divisionId: "sylhet" },
      { id: "habiganj", name: "Habiganj", bnName: "হবিগঞ্জ", divisionId: "sylhet" },
      { id: "sunamganj", name: "Sunamganj", bnName: "সুনামগঞ্জ", divisionId: "sylhet" },
    ],
  },
  {
    id: "rajshahi",
    name: "Rajshahi",
    bnName: "রাজশাহী",
    districts: [
      { id: "rajshahi-sadar", name: "Rajshahi Sadar", bnName: "রাজশাহী", divisionId: "rajshahi" },
      { id: "bogra", name: "Bogra", bnName: "বগুড়া", divisionId: "rajshahi" },
      { id: "pabna", name: "Pabna", bnName: "পাবনা", divisionId: "rajshahi" },
      { id: "sirajganj", name: "Sirajganj", bnName: "সিরাজগঞ্জ", divisionId: "rajshahi" },
      { id: "naogaon", name: "Naogaon", bnName: "নওগাঁ", divisionId: "rajshahi" },
      { id: "natore", name: "Natore", bnName: "নাটোর", divisionId: "rajshahi" },
      { id: "chapainawabganj", name: "Chapainawabganj", bnName: "চাঁপাইনবাবগঞ্জ", divisionId: "rajshahi" },
      { id: "joypurhat", name: "Joypurhat", bnName: "জয়পুরহাট", divisionId: "rajshahi" },
    ],
  },
  {
    id: "khulna",
    name: "Khulna",
    bnName: "খুলনা",
    districts: [
      { id: "khulna-sadar", name: "Khulna Sadar", bnName: "খুলনা", divisionId: "khulna" },
      { id: "jessore", name: "Jessore", bnName: "যশোর", divisionId: "khulna" },
      { id: "kushtia", name: "Kushtia", bnName: "কুষ্টিয়া", divisionId: "khulna" },
      { id: "satkhira", name: "Satkhira", bnName: "সাতক্ষীরা", divisionId: "khulna" },
      { id: "bagerhat", name: "Bagerhat", bnName: "বাগেরহাট", divisionId: "khulna" },
      { id: "jhenaidah", name: "Jhenaidah", bnName: "ঝিনাইদহ", divisionId: "khulna" },
      { id: "chuadanga", name: "Chuadanga", bnName: "চুয়াডাঙ্গা", divisionId: "khulna" },
      { id: "magura", name: "Magura", bnName: "মাগুরা", divisionId: "khulna" },
      { id: "meherpur", name: "Meherpur", bnName: "মেহেরপুর", divisionId: "khulna" },
      { id: "narail", name: "Narail", bnName: "নড়াইল", divisionId: "khulna" },
    ],
  },
  {
    id: "barisal",
    name: "Barisal",
    bnName: "বরিশাল",
    districts: [
      { id: "barisal-sadar", name: "Barisal Sadar", bnName: "বরিশাল", divisionId: "barisal" },
      { id: "bhola", name: "Bhola", bnName: "ভোলা", divisionId: "barisal" },
      { id: "patuakhali", name: "Patuakhali", bnName: "পটুয়াখালী", divisionId: "barisal" },
      { id: "pirojpur", name: "Pirojpur", bnName: "পিরোজপুর", divisionId: "barisal" },
      { id: "barguna", name: "Barguna", bnName: "বরগুনা", divisionId: "barisal" },
      { id: "jhalokati", name: "Jhalokati", bnName: "ঝালকাঠি", divisionId: "barisal" },
    ],
  },
  {
    id: "rangpur",
    name: "Rangpur",
    bnName: "রংপুর",
    districts: [
      { id: "rangpur-sadar", name: "Rangpur Sadar", bnName: "রংপুর", divisionId: "rangpur" },
      { id: "dinajpur", name: "Dinajpur", bnName: "দিনাজপুর", divisionId: "rangpur" },
      { id: "gaibandha", name: "Gaibandha", bnName: "গাইবান্ধা", divisionId: "rangpur" },
      { id: "kurigram", name: "Kurigram", bnName: "কুড়িগ্রাম", divisionId: "rangpur" },
      { id: "nilphamari", name: "Nilphamari", bnName: "নীলফামারী", divisionId: "rangpur" },
      { id: "panchagarh", name: "Panchagarh", bnName: "পঞ্চগড়", divisionId: "rangpur" },
      { id: "thakurgaon", name: "Thakurgaon", bnName: "ঠাকুরগাঁও", divisionId: "rangpur" },
      { id: "lalmonirhat", name: "Lalmonirhat", bnName: "লালমনিরহাট", divisionId: "rangpur" },
    ],
  },
  {
    id: "mymensingh",
    name: "Mymensingh",
    bnName: "ময়মনসিংহ",
    districts: [
      { id: "mymensingh-sadar", name: "Mymensingh Sadar", bnName: "ময়মনসিংহ", divisionId: "mymensingh" },
      { id: "jamalpur", name: "Jamalpur", bnName: "জামালপুর", divisionId: "mymensingh" },
      { id: "netrokona", name: "Netrokona", bnName: "নেত্রকোণা", divisionId: "mymensingh" },
      { id: "sherpur", name: "Sherpur", bnName: "শেরপুর", divisionId: "mymensingh" },
    ],
  },
];

export const SHIPPING_RATES = {
  INSIDE_DHAKA_STANDARD: 60,
  OUTSIDE_DHAKA_STANDARD: 120,
  EXPRESS_DELIVERY_ADDON: 80,
  FREE_SHIPPING_THRESHOLD: 2500, // ৳2500 for free delivery
};

export function calculateShippingFee(
  districtId: string,
  subtotal: number,
  isExpress: boolean = false
): number {
  if (subtotal >= SHIPPING_RATES.FREE_SHIPPING_THRESHOLD && !isExpress) {
    return 0;
  }
  const isInsideDhaka = districtId === "dhaka-city";
  let baseFee = isInsideDhaka
    ? SHIPPING_RATES.INSIDE_DHAKA_STANDARD
    : SHIPPING_RATES.OUTSIDE_DHAKA_STANDARD;

  if (isExpress) {
    baseFee += SHIPPING_RATES.EXPRESS_DELIVERY_ADDON;
  }
  return baseFee;
}

export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export const BD_PHONE_REGEX = /^(?:\+8801|8801|01)[3-9]\d{8}$/;

export function isValidBDPhone(phone: string): boolean {
  return BD_PHONE_REGEX.test(phone.replace(/[\s-]/g, ""));
}

export function normalizeBDPhone(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, "");
  if (cleaned.startsWith("+88")) {
    return cleaned;
  }
  if (cleaned.startsWith("88")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("01")) {
    return `+88${cleaned}`;
  }
  return cleaned;
}
