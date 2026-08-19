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
export declare const BANGLADESH_DIVISIONS: Division[];
export declare const SHIPPING_RATES: {
    INSIDE_DHAKA_STANDARD: number;
    OUTSIDE_DHAKA_STANDARD: number;
    EXPRESS_DELIVERY_ADDON: number;
    FREE_SHIPPING_THRESHOLD: number;
};
export declare function calculateShippingFee(districtId: string, subtotal: number, isExpress?: boolean): number;
export declare function formatBDT(amount: number): string;
export declare const BD_PHONE_REGEX: RegExp;
export declare function isValidBDPhone(phone: string): boolean;
export declare function normalizeBDPhone(phone: string): string;
