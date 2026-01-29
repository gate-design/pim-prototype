export type ShelfProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "EXPIRED" | "REVIEW";

/** Rate data stored when a rate is added for a product (from Manage rates). */
export interface ProductRate {
  baseRatePercent: number;
  ceilingRate?: number;
  floorRate?: number;
  targetRate?: number;
}

export interface ShelfProduct {
  id: string;
  name: string;
  description: string;
  descriptionId: string;
  productId: string;
  status: ShelfProductStatus;
  visibility: string;
  rateEmbodiment: string;
  effectiveDate: string;
  expiryDate: string;
  /** General properties: MORTGAGE | LINE OF CREDIT | LOAN */
  productCategory: string;
  productType: string;
  /** General properties optional: OPEN | CLOSED | ANY */
  repaymentType: string;
  /** General properties optional: NEW_PURCHASE, REFINANCE, etc. */
  transactionType: string;
  productFamily: string;
  termYears: string;
  rateType: string;
  ltvRange: string;
  /** From product attributes (ProductGenerator). Shown when defined. */
  propertyValueMax?: string | number;
  /** From product attributes (ProductGenerator). Shown when defined. */
  creditScoreMax?: string | number;
  unpublished: boolean;
  /** Set when a rate has been added for this product (Manage rates). */
  rate?: ProductRate;
}

export interface ProductCombination {
  id: string;
  name: string;
  description: string;
  productFamily: string;
  termYears: string;
  rateType: string;
  rateHoldDays: string;
  ltvRange: string;
  region: string;
}

export const INITIAL_SHELF_PRODUCTS: ShelfProduct[] = [
  {
    id: "1",
    name: "Internal refinance",
    description: "Residency",
    descriptionId: "SOBO01",
    productId: "T2AB",
    status: "ACTIVE",
    visibility: "automatic",
    rateEmbodiment: "any",
    effectiveDate: "25/03/2020",
    expiryDate: "25/03/2021",
    productCategory: "MORTGAGE",
    productType: "Residential",
    repaymentType: "CLOSED",
    transactionType: "REFINANCE",
    productFamily: "Full Featured",
    termYears: "5",
    rateType: "Fixed",
    ltvRange: "<= 65% LTV",
    unpublished: false,
  },
  {
    id: "2",
    name: "Residency",
    description: "Initiator",
    descriptionId: "SOBO02",
    productId: "T2AC",
    status: "DRAFT",
    visibility: "any",
    rateEmbodiment: "any",
    effectiveDate: "25/03/2020",
    expiryDate: "25/03/2021",
    productCategory: "MORTGAGE",
    productType: "Commercial",
    repaymentType: "ANY",
    transactionType: "NEW_PURCHASE",
    productFamily: "Pmt Mortgage",
    termYears: "1",
    rateType: "Adjustable",
    ltvRange: "65%-75% LTV",
    unpublished: true,
    rate: {
      baseRatePercent: 4.4,
      targetRate: 4.45,
      ceilingRate: 4.45,
    },
  },
  {
    id: "3",
    name: "New purchase",
    description: "Residential",
    descriptionId: "SOBO03",
    productId: "T2AD",
    status: "ACTIVE",
    visibility: "automatic",
    rateEmbodiment: "any",
    effectiveDate: "01/06/2020",
    expiryDate: "01/06/2022",
    productCategory: "MORTGAGE",
    productType: "Multi-family",
    repaymentType: "OPEN",
    transactionType: "NEW_PURCHASE",
    productFamily: "Full Featured",
    termYears: "5",
    rateType: "Fixed",
    ltvRange: "<= 65% LTV",
    unpublished: false,
  },
];
