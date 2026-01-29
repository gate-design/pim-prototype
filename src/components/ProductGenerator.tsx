import { useState, useMemo, useCallback } from "react";
import { ArrowLeft, CaretDown, Check, Info, Plus, TrashSimple, X } from "@phosphor-icons/react";
import type { Workspace } from "./SelectWorkspace";
import type { ProductCombination } from "../types";
import type { ShelfProduct } from "../types";
import { Button } from "./ui/Button";
import { SideNav } from "./SideNav";
import "./ProductGenerator.css";

const PRODUCT_FAMILIES = ["Full Featured", "Limited", "Smart Save"];
/** Optional fields that can be added to General Properties. Dropdown values per field can be provided later. */
const OPTIONAL_FIELD_OPTIONS = [
  { id: "repaymentType", label: "Repayment type" },
  { id: "transactionType", label: "Transaction type" },
  { id: "channel", label: "Channel" },
  { id: "rank", label: "Rank" },
  { id: "subtype", label: "Sub type" },
] as const;
const RATE_TYPES = ["Fixed", "Variable", "Adjustable"];
const REGIONS = [
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NT",
  "NS",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
];

const REPAYMENT_TYPE_OPTIONS = ["OPEN", "CLOSED", "ANY"];
const TRANSACTION_TYPE_OPTIONS = [
  "NEW_PURCHASE",
  "CONSTRUCTION_DRAWS",
  "CONSTRUCTION_SINGLE_ADVANCE",
  "BUILDER_SINGLE_ADVANCE",
  "MORTGAGE_IN_COMPANY_NAME",
  "RENEWAL",
  "TRANSFER",
  "REFINANCE",
  "REFINANCE_WITH_IMPROVEMENT",
  "REFINANCE_WITH_CONSTRUCTION",
  "PORT",
  "STANDALONE BRIDGE",
  "PURCHASE_WITH_IMPROVEMENT",
  "PREAPPROVAL",
  "ASSUMPTION",
  "AMENDMENTS",
];
const PRODUCT_CATEGORY_OPTIONS = ["MORTGAGE", "LINE OF CREDIT", "LOAN"];

/** Product type options per category. */
const PRODUCT_TYPE_BY_CATEGORY: Record<string, string[]> = {
  MORTGAGE: ["MORTGAGE"],
  "LINE OF CREDIT": ["HELOC", "PERSONAL_LOC", "RRSP LOC"],
  LOAN: [
    "AUTO_LOAN",
    "CONSTRUCTION_LOAN",
    "PERSONAL_UNSECURED_LOAN",
    "INVESTMENT_LOAN",
    "STUDENT_LOAN",
    "RRSP_LOAN",
    "BUSINESS_LOAN",
    "BUILDER_LOAN",
    "BRIDGE_LOAN",
    "INVESTMENT_SECURED_LOAN",
  ],
};
const RANK_OPTIONS = ["FIRST", "SECOND", "THIRD"];

/** Product attributes: applicable to MORTGAGE, LINE OF CREDIT, or both. Optional attributes can be added/removed by user. */
const OCCUPANCY_OPTIONS = [
  "OWNER_OCCUPIED",
  "OWNER_OCCUPIED_AND_RENTAL",
  "ANY_RENTAL",
  "RENTAL_1_UNIT",
  "RENTAL_2-4_UNITS",
  "SECOND_HOME",
  "SEASONAL",
  "VACANT",
];
const MORTGAGE_TYPE_OPTIONS = ["RESIDENTIAL", "COMMERCIAL"];
const INSURABILITY_OPTIONS = ["CONVENTIONAL_UNINSURED", "INSURED", "CONVENTIONAL_INSURABLE"];

type ApplicableTo = "MORTGAGE" | "LINE OF CREDIT";
const PRODUCT_ATTRIBUTES = [
  { id: "occupancy", label: "Occupancy", type: "enum" as const, options: OCCUPANCY_OPTIONS, required: true, applicableTo: ["MORTGAGE", "LINE OF CREDIT"] as ApplicableTo[] },
  { id: "isRenewal", label: "Is renewal", type: "boolean" as const, required: true, applicableTo: ["MORTGAGE"] as ApplicableTo[] },
  { id: "mortgageType", label: "Mortgage type", type: "enum" as const, options: MORTGAGE_TYPE_OPTIONS, required: true, applicableTo: ["MORTGAGE"] as ApplicableTo[] },
  { id: "rateHold", label: "Rate hold", type: "num" as const, required: false, applicableTo: ["MORTGAGE", "LINE OF CREDIT"] as ApplicableTo[] },
  { id: "term", label: "Term", type: "num" as const, required: true, applicableTo: ["MORTGAGE"] as ApplicableTo[] },
  { id: "insurability", label: "Insurability", type: "enum" as const, options: INSURABILITY_OPTIONS, required: true, applicableTo: ["MORTGAGE", "LINE OF CREDIT"] as ApplicableTo[] },
  { id: "ltvMin", label: "LTV min (%)", type: "num" as const, required: true, applicableTo: ["MORTGAGE", "LINE OF CREDIT"] as ApplicableTo[] },
  { id: "ltvMax", label: "LTV max (%)", type: "num" as const, required: true, applicableTo: ["MORTGAGE", "LINE OF CREDIT"] as ApplicableTo[] },
  { id: "tdsMax", label: "TDS max (%)", type: "num" as const, required: true, applicableTo: ["MORTGAGE", "LINE OF CREDIT"] as ApplicableTo[] },
  { id: "gdsMax", label: "GDS max (%)", type: "num" as const, required: true, applicableTo: ["MORTGAGE", "LINE OF CREDIT"] as ApplicableTo[] },
  { id: "amortizationMin", label: "Amortization min", type: "num" as const, required: true, applicableTo: ["MORTGAGE"] as ApplicableTo[] },
  { id: "amortizationMax", label: "Amortization max", type: "num" as const, required: true, applicableTo: ["MORTGAGE"] as ApplicableTo[] },
  { id: "propertyValueMax", label: "Property value max", type: "num" as const, required: true, applicableTo: ["MORTGAGE", "LINE OF CREDIT"] as ApplicableTo[] },
  { id: "mortgageAmountMin", label: "Mortgage amount min", type: "num" as const, required: true, applicableTo: ["MORTGAGE"] as ApplicableTo[] },
  { id: "mortgageAmountMax", label: "Mortgage amount max", type: "num" as const, required: true, applicableTo: ["MORTGAGE"] as ApplicableTo[] },
  { id: "creditScoreMin", label: "Credit score min", type: "num" as const, required: false, applicableTo: ["MORTGAGE", "LINE OF CREDIT"] as ApplicableTo[] },
  { id: "creditScoreMax", label: "Credit score max", type: "num" as const, required: false, applicableTo: ["MORTGAGE", "LINE OF CREDIT"] as ApplicableTo[] },
] as const;

const OPTIONAL_ATTRIBUTE_IDS = ["rateHold", "creditScoreMin", "creditScoreMax"] as const;

/** Properties that can be used as chips in the name/description template. Placeholder in template is &Key (e.g. &ProductFamily). */
const TEMPLATE_PROPERTIES = [
  { key: "ProductCategory", label: "Product category" },
  { key: "ProductType", label: "Product type" },
  { key: "ProductFamily", label: "Product family" },
  { key: "Term", label: "Term (months)" },
  { key: "RateType", label: "Rate type" },
  { key: "RateHoldDays", label: "Rate hold (days)" },
  { key: "LtvRange", label: "LTV range" },
  { key: "Region", label: "Region" },
] as const;

function getTemplatePlaceholder(key: string) {
  return `&${key}`;
}

function parseActivePlaceholders(template: string): Set<string> {
  const matches = template.match(/&([A-Za-z]+)/g) ?? [];
  return new Set(matches.map((m) => m.slice(1)));
}

function optionalFieldPlaceholderKey(fieldId: string): string {
  return fieldId.charAt(0).toUpperCase() + fieldId.slice(1);
}

function getInitialStateFromProduct(initialProduct: ShelfProduct | null | undefined) {
  if (!initialProduct) return null;
  const termYearsNum = Number(initialProduct.termYears);
  const termMonths = Number.isNaN(termYearsNum) ? 60 : termYearsNum * 12;
  const ltvMatch = initialProduct.ltvRange?.match(/(\d+)/);
  const ltvMaxFromProduct = ltvMatch ? ltvMatch[1] : "95";
  const addedOptional: string[] = [];
  if (initialProduct.repaymentType) addedOptional.push("repaymentType");
  if (initialProduct.transactionType) addedOptional.push("transactionType");
  return {
    productCategory: initialProduct.productCategory || "MORTGAGE",
    productType: initialProduct.productType || "MORTGAGE",
    nameTemplate: initialProduct.name,
    descriptionTemplate: initialProduct.description,
    family: initialProduct.productFamily || "Full Featured",
    rateType: initialProduct.rateType || "Fixed",
    region: "QC",
    term: String(termMonths),
    occupancy: "OWNER_OCCUPIED",
    isRenewal: false,
    mortgageType: "RESIDENTIAL",
    insurability: "CONVENTIONAL_INSURABLE",
    ltvMin: "0",
    ltvMax: ltvMaxFromProduct,
    tdsMax: "44",
    gdsMax: "39",
    amortizationMin: "5",
    amortizationMax: "30",
    propertyValueMax: initialProduct.propertyValueMax != null ? String(initialProduct.propertyValueMax) : "",
    mortgageAmountMin: "",
    mortgageAmountMax: "",
    rateHold: "",
    creditScoreMin: "",
    creditScoreMax: initialProduct.creditScoreMax != null ? String(initialProduct.creditScoreMax) : "",
    addedOptionalFields: addedOptional.length > 0 ? addedOptional : ["repaymentType", "transactionType"],
    optionalFieldValues: {
      repaymentType: initialProduct.repaymentType || "OPEN",
      transactionType: initialProduct.transactionType || "NEW_PURCHASE",
    },
  };
}

export function ProductGenerator({
  workspace,
  onBackToShelf,
  onGenerated,
  onSaveChanges,
  initialProduct,
  shelfCount,
  onProductFamilies,
  onTenantSettings,
  onLenderSettings,
  onLogout,
}: {
  workspace: Workspace;
  onBackToShelf: () => void;
  onGenerated: (products: ShelfProduct[]) => void;
  /** When provided, form is in edit mode: state is initialized from this product and Save calls onSaveChanges(updated) instead of onGenerated. */
  onSaveChanges?: (product: ShelfProduct) => void;
  initialProduct?: ShelfProduct | null;
  shelfCount?: number;
  onProductFamilies?: () => void;
  onTenantSettings?: () => void;
  onLenderSettings?: () => void;
  onLogout?: () => void;
}) {
  const initial = getInitialStateFromProduct(initialProduct);
  const [productCategory, setProductCategory] = useState(initial?.productCategory ?? "MORTGAGE");
  const productCategoryOptions = PRODUCT_CATEGORY_OPTIONS;
  const productTypeOptions = PRODUCT_TYPE_BY_CATEGORY[productCategory] ?? PRODUCT_TYPE_BY_CATEGORY.MORTGAGE;
  const [productType, setProductType] = useState(initial?.productType ?? "MORTGAGE");

  // When category changes, reset product type if it's not in the new category's options
  const setProductCategoryAndSyncType = useCallback((category: string) => {
    setProductCategory(category);
    const allowed = PRODUCT_TYPE_BY_CATEGORY[category] ?? PRODUCT_TYPE_BY_CATEGORY.MORTGAGE;
    setProductType((current) => (allowed.includes(current) ? current : allowed[0] ?? ""));
  }, []);
  const [nameTemplate, setNameTemplate] = useState(initial?.nameTemplate ?? "Super - &ProductFamily - &Term - &Ratetype");
  const [descriptionTemplate, setDescriptionTemplate] = useState(initial?.descriptionTemplate ?? "Super - &ProductFamily - &Term - &Ratetype");

  const [family, setFamily] = useState(initial?.family ?? "Full Featured");
  const [rateType, setRateType] = useState(initial?.rateType ?? "Fixed");
  const [region, setRegion] = useState(initial?.region ?? "QC");

  /** Product attributes (table-driven). Values are strings; num types use string for input. */
  const [occupancy, setOccupancy] = useState(initial?.occupancy ?? "OWNER_OCCUPIED");
  const [isRenewal, setIsRenewal] = useState(initial?.isRenewal ?? false);
  const [mortgageType, setMortgageType] = useState(initial?.mortgageType ?? "RESIDENTIAL");
  const [term, setTerm] = useState(initial?.term ?? "60");
  const [insurability, setInsurability] = useState(initial?.insurability ?? "CONVENTIONAL_INSURABLE");
  const [ltvMin, setLtvMin] = useState(initial?.ltvMin ?? "0");
  const [ltvMax, setLtvMax] = useState(initial?.ltvMax ?? "95");
  const [tdsMax, setTdsMax] = useState(initial?.tdsMax ?? "44");
  const [gdsMax, setGdsMax] = useState(initial?.gdsMax ?? "39");
  const [amortizationMin, setAmortizationMin] = useState(initial?.amortizationMin ?? "5");
  const [amortizationMax, setAmortizationMax] = useState(initial?.amortizationMax ?? "30");
  const [propertyValueMax, setPropertyValueMax] = useState(initial?.propertyValueMax ?? "");
  const [mortgageAmountMin, setMortgageAmountMin] = useState(initial?.mortgageAmountMin ?? "");
  const [mortgageAmountMax, setMortgageAmountMax] = useState(initial?.mortgageAmountMax ?? "");
  const [rateHold, setRateHold] = useState(initial?.rateHold ?? "");
  const [creditScoreMin, setCreditScoreMin] = useState(initial?.creditScoreMin ?? "");
  const [creditScoreMax, setCreditScoreMax] = useState(initial?.creditScoreMax ?? "");

  /** Optional product attributes: user can add/remove these (rate hold, credit score min/max). */
  const [addedOptionalAttributes, setAddedOptionalAttributes] = useState<string[]>(["rateHold"]);
  const [optionalAttrDropdownOpen, setOptionalAttrDropdownOpen] = useState(false);
  const addOptionalAttribute = useCallback((id: string) => {
    setAddedOptionalAttributes((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setOptionalAttrDropdownOpen(false);
  }, []);
  const removeOptionalAttribute = useCallback((id: string) => {
    setAddedOptionalAttributes((prev) => prev.filter((x) => x !== id));
  }, []);

  /** IDs of optional fields currently added in General Properties (e.g. repaymentType, transactionType). */
  const [addedOptionalFields, setAddedOptionalFields] = useState<string[]>(initial?.addedOptionalFields ?? ["repaymentType", "transactionType"]);
  /** Selected value per optional field. Keys are option ids; values will be replaced when you provide dropdown options. */
  const [optionalFieldValues, setOptionalFieldValues] = useState<Record<string, string>>(
    initial?.optionalFieldValues ?? { repaymentType: "OPEN", transactionType: "NEW_PURCHASE" }
  );
  const [optionalFieldDropdownOpen, setOptionalFieldDropdownOpen] = useState(false);

  const addOptionalField = useCallback((fieldId: string) => {
    setAddedOptionalFields((prev) => (prev.includes(fieldId) ? prev : [...prev, fieldId]));
    setOptionalFieldValues((prev) => ({ ...prev, [fieldId]: prev[fieldId] ?? "" }));
    setOptionalFieldDropdownOpen(false);
  }, []);
  const removeOptionalField = useCallback((fieldId: string) => {
    setAddedOptionalFields((prev) => prev.filter((id) => id !== fieldId));
    setOptionalFieldValues((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);
  const setOptionalFieldValue = useCallback((fieldId: string, value: string) => {
    setOptionalFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  /** Current form values for template placeholders (used in sample preview). */
  const getSampleTemplateValues = useCallback(() => {
    const values: Record<string, string> = {
      ProductCategory: productCategory,
      ProductType: productType,
      ProductFamily: family,
      Term: term,
      RateType: rateType,
      RateHoldDays: rateHold || "—",
      LtvRange: ltvMin && ltvMax ? `${ltvMin}% - ${ltvMax}%` : "—",
      Region: region,
    };
    OPTIONAL_FIELD_OPTIONS.forEach((opt) => {
      if (addedOptionalFields.includes(opt.id)) {
        const key = optionalFieldPlaceholderKey(opt.id);
        values[key] = optionalFieldValues[opt.id] ?? "";
      }
    });
    return values;
  }, [
    productCategory,
    productType,
    family,
    term,
    rateType,
    rateHold,
    ltvMin,
    ltvMax,
    region,
    addedOptionalFields,
    optionalFieldValues,
  ]);

  function replacePlaceholdersInTemplate(template: string, values: Record<string, string>): string {
    let out = template;
    for (const [key, value] of Object.entries(values)) {
      out = out.replace(new RegExp(`\\&${key}\\b`, "gi"), value);
    }
    return out;
  }

  const addPlaceholderToTemplate = useCallback(
    (setTemplate: React.Dispatch<React.SetStateAction<string>>, key: string) => {
      const placeholder = getTemplatePlaceholder(key);
      setTemplate((prev) => (prev.trimEnd() ? prev + " - " : "") + placeholder);
    },
    []
  );

  const removePlaceholderFromTemplate = useCallback(
    (setTemplate: React.Dispatch<React.SetStateAction<string>>, key: string) => {
      setTemplate((prev) =>
        prev
          .replace(new RegExp(`\\s*\\-?\\s*\\&${key}\\b\\s*\\-?`, "gi"), " ")
          .replace(/\s+-\s+/g, " - ")
          .replace(/^\s*-\s*|\s*-\s*$/g, "")
          .trim()
      );
    },
    []
  );

  const singleCombination = useMemo(() => {
    const values: Record<string, string> = {
      ProductCategory: productCategory,
      ProductType: productType,
      ProductFamily: family,
      Term: term,
      RateType: rateType,
      RateHoldDays: rateHold || "",
      LtvRange: ltvMin && ltvMax ? `${ltvMin}% - ${ltvMax}%` : "",
      Region: region,
    };
    OPTIONAL_FIELD_OPTIONS.forEach((opt) => {
      if (addedOptionalFields.includes(opt.id)) {
        values[optionalFieldPlaceholderKey(opt.id)] = optionalFieldValues[opt.id] ?? "";
      }
    });
    const name = replacePlaceholdersInTemplate(nameTemplate, values);
    const description = replacePlaceholdersInTemplate(descriptionTemplate, values);
    return {
      id: "gen-1",
      name,
      description,
      productFamily: family,
      termYears: term,
      rateType,
      rateHoldDays: rateHold || "",
      ltvRange: ltvMin && ltvMax ? `${ltvMin}% - ${ltvMax}%` : "",
      region,
    } as ProductCombination;
  }, [
    productCategory,
    productType,
    family,
    term,
    rateType,
    rateHold,
    ltvMin,
    ltvMax,
    region,
    addedOptionalFields,
    optionalFieldValues,
    nameTemplate,
    descriptionTemplate,
  ]);

  const handleSave = useCallback(() => {
    const p = singleCombination;
    const baseProduct: Omit<ShelfProduct, "id" | "descriptionId" | "productId" | "status" | "effectiveDate" | "expiryDate"> = {
      name: p.name,
      description: p.description,
      visibility: "automatic",
      rateEmbodiment: "any",
      productCategory,
      productType,
      repaymentType: optionalFieldValues.repaymentType ?? "",
      transactionType: optionalFieldValues.transactionType ?? "",
      productFamily: p.productFamily,
      termYears: p.termYears,
      rateType: p.rateType,
      ltvRange: p.ltvRange ?? "any",
      ...(propertyValueMax !== "" && { propertyValueMax: propertyValueMax.trim() || undefined }),
      ...(creditScoreMax !== "" && { creditScoreMax: creditScoreMax.trim() || undefined }),
      unpublished: true,
    };
    if (initialProduct && onSaveChanges) {
      const updated: ShelfProduct = {
        ...initialProduct,
        ...baseProduct,
      };
      onSaveChanges(updated);
      onBackToShelf();
    } else {
      const newProduct: ShelfProduct = {
        ...baseProduct,
        id: `shelf-${Date.now()}-0`,
        descriptionId: "GEN001",
        productId: "T2G01",
        status: "DRAFT",
        effectiveDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "/"),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
          .replace(/\//g, "/"),
      };
      onGenerated([newProduct]);
      onBackToShelf();
    }
  }, [singleCombination, productCategory, productType, optionalFieldValues, propertyValueMax, creditScoreMax, initialProduct, onSaveChanges, onGenerated, onBackToShelf]);

  const sampleName = useMemo(() => {
    const values = getSampleTemplateValues();
    return replacePlaceholdersInTemplate(nameTemplate, values);
  }, [nameTemplate, getSampleTemplateValues]);

  const sampleDescription = useMemo(() => {
    const values = getSampleTemplateValues();
    return replacePlaceholdersInTemplate(descriptionTemplate, values);
  }, [descriptionTemplate, getSampleTemplateValues]);

  const nameActivePlaceholders = useMemo(() => parseActivePlaceholders(nameTemplate), [nameTemplate]);
  const descriptionActivePlaceholders = useMemo(
    () => parseActivePlaceholders(descriptionTemplate),
    [descriptionTemplate]
  );

  const allTemplateChipConfig = useMemo(() => {
    const base = TEMPLATE_PROPERTIES.map((p) => ({ key: p.key, label: p.label }));
    const optional = addedOptionalFields.map((id) => {
      const opt = OPTIONAL_FIELD_OPTIONS.find((o) => o.id === id);
      return opt ? { key: optionalFieldPlaceholderKey(id), label: opt.label } : null;
    }).filter(Boolean) as { key: string; label: string }[];
    return [...base, ...optional];
  }, [addedOptionalFields]);


  return (
    <div className="product-generator">
      <div className="product-generator__body">
        <SideNav
          tenantName={workspace.name}
          lenderName="TD residential"
          userName="Josée Racicot"
          userEmail="josee.racicot@nesto.ca"
          userInitial="JR"
          currentSection="shelf"
          shelfCount={shelfCount ?? 0}
          familiesCount={0}
          onNavigate={(section) => {
            if (section === "shelf") onBackToShelf();
            if (section === "product-families") onProductFamilies?.();
          }}
          onSignOut={() => onLogout?.()}
          onTenantSettings={onTenantSettings}
          onLenderSettings={onLenderSettings}
        />

        <div className="product-generator__main">
          <header className="product-generator__header">
            <nav className="product-generator__breadcrumb" aria-label="Breadcrumb">
              <button type="button" onClick={onBackToShelf} className="product-generator__breadcrumb-back">
                <ArrowLeft size={20} weight="regular" aria-hidden />
                Back to Main shelf
              </button>
              <span className="product-generator__breadcrumb-sep">|</span>
              <span className="product-generator__breadcrumb-title">{initialProduct ? initialProduct.name : "Product creation"}</span>
            </nav>
          </header>

          <div className="product-generator__main-row">
          <div className="product-generator__scroll">
            <div className="product-generator__scroll-content">
              <section className="product-generator__section">
                <div className="product-generator__section-body">
                <div className="product-generator__card">
                  <div className="product-generator__card-header">
                    <h3 className="product-generator__card-title">Name</h3>
                    <p className="product-generator__template-intro">
                      Each chip represents a property (selected below in the form). Add chips to the template to include their values in the product name.
                    </p>
                  </div>
                  
                  <div className="product-generator__subsection">
                    
                    <label className="product-generator__label">Template</label>
                    <input
                      type="text"
                      className="product-generator__input"
                      value={nameTemplate}
                      onChange={(e) => setNameTemplate(e.target.value)}
                      placeholder="e.g. Super - &ProductFamily - &Term - &RateType"
                    />
                    <div className="product-generator__chips">
                      {allTemplateChipConfig.map(({ key, label }) => {
                        const isActive = nameActivePlaceholders.has(key);
                        return isActive ? (
                          <span key={key} className="product-generator__chip product-generator__chip--active">
                            {label}
                            <button
                              type="button"
                              className="product-generator__chip-remove"
                              aria-label={`Remove ${label} from template`}
                              onClick={() => removePlaceholderFromTemplate(setNameTemplate, key)}
                            >
                              <X size={16} weight="bold" aria-hidden />
                            </button>
                          </span>
                        ) : (
                          <button
                            key={key}
                            type="button"
                            className="product-generator__chip product-generator__chip--inactive"
                            aria-label={`Add ${label} to template`}
                            onClick={() => addPlaceholderToTemplate(setNameTemplate, key)}
                          >
                            <Plus size={14} weight="bold" aria-hidden />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="product-generator__sample-preview">
                      <span className="product-generator__sample-preview-icon" aria-hidden>
                        <Info size={14} weight="regular" />
                      </span>
                      <div className="product-generator__sample-preview-text">
                        <span className="product-generator__sample-preview-label">Sample preview</span>
                        <span className="product-generator__sample-preview-value">{sampleName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="product-generator__card">
                  <div className="product-generator__card-header">
                    <h3 className="product-generator__card-title">Description</h3>
                  </div>
                  <div className="product-generator__subsection">
                    <p className="product-generator__template-intro">
                      Each chip represents a property (selected below). Add chips to the template to include their values in the product description.
                    </p>
                    <label className="product-generator__label">Template</label>
                    <input
                      type="text"
                      className="product-generator__input"
                      value={descriptionTemplate}
                      onChange={(e) => setDescriptionTemplate(e.target.value)}
                      placeholder="e.g. Super - &ProductFamily - &Term - &RateType"
                    />
                    <div className="product-generator__chips">
                      {allTemplateChipConfig.map(({ key, label }) => {
                        const isActive = descriptionActivePlaceholders.has(key);
                        return isActive ? (
                          <span key={key} className="product-generator__chip product-generator__chip--active">
                            {label}
                            <button
                              type="button"
                              className="product-generator__chip-remove"
                              aria-label={`Remove ${label} from template`}
                              onClick={() => removePlaceholderFromTemplate(setDescriptionTemplate, key)}
                            >
                              <X size={16} weight="bold" aria-hidden />
                            </button>
                          </span>
                        ) : (
                          <button
                            key={key}
                            type="button"
                            className="product-generator__chip product-generator__chip--inactive"
                            aria-label={`Add ${label} to template`}
                            onClick={() => addPlaceholderToTemplate(setDescriptionTemplate, key)}
                          >
                            <Plus size={14} weight="bold" aria-hidden />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="product-generator__sample-preview">
                      <span className="product-generator__sample-preview-icon" aria-hidden>
                        <Info size={14} weight="regular" />
                      </span>
                      <div className="product-generator__sample-preview-text">
                        <span className="product-generator__sample-preview-label">Sample preview</span>
                        <span className="product-generator__sample-preview-value">{sampleDescription}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="product-generator__card">
                  <div className="product-generator__card-header">
                    <h3 className="product-generator__card-title">General properties</h3>
                  </div>
                  <div className="product-generator__subsection product-generator__subsection--inline">
                    <div className="product-generator__general-fields">
                      <div className="product-generator__field-cell">
                        <label className="product-generator__label">Product category</label>
                        <select
                          className="product-generator__select"
                          value={productCategory}
                          onChange={(e) => setProductCategoryAndSyncType(e.target.value)}
                          aria-label="Product category"
                        >
                          {productCategoryOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div className="product-generator__field-cell">
                        <label className="product-generator__label">Product type</label>
                        <select
                          className="product-generator__select"
                          value={productType}
                          onChange={(e) => setProductType(e.target.value)}
                          aria-label="Product type"
                        >
                          {productTypeOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      {addedOptionalFields.map((fieldId) => {
                        const option = OPTIONAL_FIELD_OPTIONS.find((o) => o.id === fieldId);
                        if (!option) return null;
                        const value = optionalFieldValues[fieldId] ?? "";
                        const options =
                          fieldId === "repaymentType"
                            ? REPAYMENT_TYPE_OPTIONS
                            : fieldId === "transactionType"
                              ? TRANSACTION_TYPE_OPTIONS
                              : fieldId === "rank"
                                ? RANK_OPTIONS
                                : null;
                        return (
                          <div key={fieldId} className="product-generator__optional-field-row">
                            <div className="product-generator__field-cell product-generator__optional-field-control">
                              <label className="product-generator__label">{option.label}</label>
                              {fieldId === "subtype" ? (
                                <input
                                  type="text"
                                  className="product-generator__input"
                                  value={value}
                                  onChange={(e) => setOptionalFieldValue(fieldId, e.target.value)}
                                  placeholder="Enter sub type…"
                                  aria-label={option.label}
                                />
                              ) : options ? (
                                <select
                                  className="product-generator__select"
                                  value={value}
                                  onChange={(e) => setOptionalFieldValue(fieldId, e.target.value)}
                                  aria-label={option.label}
                                >
                                  <option value="">Select…</option>
                                  {options.map((optVal) => (
                                    <option key={optVal} value={optVal}>{optVal}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  className="product-generator__input"
                                  value={value}
                                  onChange={(e) => setOptionalFieldValue(fieldId, e.target.value)}
                                  placeholder="Select…"
                                  aria-label={option.label}
                                />
                              )}
                            </div>
                            <button
                              type="button"
                              className="product-generator__optional-field-remove"
                              onClick={() => removeOptionalField(fieldId)}
                              aria-label={`Remove ${option.label}`}
                            >
                              <TrashSimple size={16} weight="regular" aria-hidden />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="product-generator__add-optional-wrap">
                      <Button
                        type="button"
                        variant="alt"
                        size="small"
                        className="product-generator__add-optional-trigger"
                        onClick={() => setOptionalFieldDropdownOpen((o) => !o)}
                        aria-expanded={optionalFieldDropdownOpen}
                        aria-haspopup="listbox"
                        aria-label="Add optional field"
                        leftIcon={<Plus size={16} weight="regular" aria-hidden />}
                        rightIcon={<CaretDown size={16} weight="regular" aria-hidden />}
                      >
                        Add optional field
                      </Button>
                      {optionalFieldDropdownOpen && (
                        <>
                          <div
                            className="product-generator__add-optional-backdrop"
                            aria-hidden
                            onClick={() => setOptionalFieldDropdownOpen(false)}
                          />
                          <ul
                            className="product-generator__add-optional-dropdown"
                            role="listbox"
                            aria-label="Optional fields"
                          >
                            {OPTIONAL_FIELD_OPTIONS.map((opt) => {
                              const isAdded = addedOptionalFields.includes(opt.id);
                              return (
                                <li
                                  key={opt.id}
                                  role="option"
                                  aria-selected={isAdded}
                                  className={`product-generator__add-optional-option ${isAdded ? "product-generator__add-optional-option--added" : ""}`}
                                  onClick={() => !isAdded && addOptionalField(opt.id)}
                                >
                                  {opt.label}
                                  {isAdded && (
                                    <span className="product-generator__add-optional-check" aria-hidden>
                                      <Check size={16} weight="bold" />
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="product-generator__card">
                  <div className="product-generator__card-header">
                    <h3 className="product-generator__card-title">Product attributes</h3>
                  </div>
                  <div className="product-generator__subsection">
                    <div className="product-generator__grid">
                      <div className="product-generator__field-cell">
                        <label className="product-generator__label">Product family</label>
                        <select
                          className="product-generator__select"
                          value={family}
                          onChange={(e) => setFamily(e.target.value)}
                          aria-label="Product family"
                        >
                          {PRODUCT_FAMILIES.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                      <div className="product-generator__field-cell">
                        <label className="product-generator__label">Rate type</label>
                        <select
                          className="product-generator__select"
                          value={rateType}
                          onChange={(e) => setRateType(e.target.value)}
                          aria-label="Rate type"
                        >
                          {RATE_TYPES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                      <div className="product-generator__field-cell">
                        <label className="product-generator__label">Region</label>
                        <select
                          className="product-generator__select"
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          aria-label="Region"
                        >
                          {REGIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      {(productCategory === "MORTGAGE" || productCategory === "LINE OF CREDIT") &&
                        PRODUCT_ATTRIBUTES.filter(
                          (attr) =>
                            attr.applicableTo.includes(productCategory) &&
                            (attr.required || addedOptionalAttributes.includes(attr.id))
                        ).map((attr) => {
                          if (attr.type === "enum" && attr.options) {
                            const value =
                              attr.id === "occupancy"
                                ? occupancy
                                : attr.id === "mortgageType"
                                  ? mortgageType
                                  : insurability;
                            const setValue =
                              attr.id === "occupancy"
                                ? setOccupancy
                                : attr.id === "mortgageType"
                                  ? setMortgageType
                                  : setInsurability;
                            return (
                              <div key={attr.id} className="product-generator__field-cell">
                                <label className="product-generator__label">{attr.label}</label>
                                <select
                                  className="product-generator__select"
                                  value={value}
                                  onChange={(e) => setValue(e.target.value)}
                                  aria-label={attr.label}
                                >
                                  {attr.options.map((opt) => (
                                    <option key={opt} value={opt}>{opt.replace(/_/g, " ")}</option>
                                  ))}
                                </select>
                              </div>
                            );
                          }
                          if (attr.type === "boolean") {
                            return (
                              <div key={attr.id} className="product-generator__field-cell product-generator__field-cell--toggle-row">
                                <label className="product-generator__label">{attr.label}</label>
                                <label className="product-generator__toggle">
                                  <input
                                    type="checkbox"
                                    checked={isRenewal}
                                    onChange={(e) => setIsRenewal(e.target.checked)}
                                    aria-label={attr.label}
                                  />
                                  <span className="product-generator__toggle-slider" aria-hidden />
                                </label>
                              </div>
                            );
                          }
                          if (attr.type === "num") {
                            const value =
                              attr.id === "term"
                                ? term
                                : attr.id === "ltvMin"
                                  ? ltvMin
                                  : attr.id === "ltvMax"
                                    ? ltvMax
                                    : attr.id === "tdsMax"
                                      ? tdsMax
                                      : attr.id === "gdsMax"
                                        ? gdsMax
                                        : attr.id === "amortizationMin"
                                          ? amortizationMin
                                          : attr.id === "amortizationMax"
                                            ? amortizationMax
                                            : attr.id === "propertyValueMax"
                                              ? propertyValueMax
                                              : attr.id === "mortgageAmountMin"
                                                ? mortgageAmountMin
                                                : attr.id === "mortgageAmountMax"
                                                  ? mortgageAmountMax
                                                  : attr.id === "rateHold"
                                                    ? rateHold
                                                    : attr.id === "creditScoreMin"
                                                      ? creditScoreMin
                                                      : creditScoreMax;
                            const setValue =
                              attr.id === "term"
                                ? setTerm
                                : attr.id === "ltvMin"
                                  ? setLtvMin
                                  : attr.id === "ltvMax"
                                    ? setLtvMax
                                    : attr.id === "tdsMax"
                                      ? setTdsMax
                                      : attr.id === "gdsMax"
                                        ? setGdsMax
                                        : attr.id === "amortizationMin"
                                          ? setAmortizationMin
                                          : attr.id === "amortizationMax"
                                            ? setAmortizationMax
                                            : attr.id === "propertyValueMax"
                                              ? setPropertyValueMax
                                              : attr.id === "mortgageAmountMin"
                                                ? setMortgageAmountMin
                                                : attr.id === "mortgageAmountMax"
                                                  ? setMortgageAmountMax
                                                  : attr.id === "rateHold"
                                                    ? setRateHold
                                                    : attr.id === "creditScoreMin"
                                                      ? setCreditScoreMin
                                                      : setCreditScoreMax;
                            const isOptional = OPTIONAL_ATTRIBUTE_IDS.includes(attr.id as (typeof OPTIONAL_ATTRIBUTE_IDS)[number]);
                            return (
                              <div key={attr.id} className={isOptional ? "product-generator__optional-field-row" : "product-generator__field-cell product-generator__field-cell--inline"}>
                                <div className={isOptional ? "product-generator__field-cell product-generator__optional-field-control" : ""}>
                                  <label className="product-generator__label">{attr.label}</label>
                                  <input
                                    type="number"
                                    className="product-generator__input"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder={attr.id === "rateHold" ? "e.g. 120" : attr.id.startsWith("creditScore") ? "e.g. 650" : ""}
                                    aria-label={attr.label}
                                    min={attr.id.startsWith("ltv") || attr.id.startsWith("tds") || attr.id.startsWith("gds") ? 0 : undefined}
                                    max={attr.id.startsWith("ltv") || attr.id.startsWith("tds") || attr.id.startsWith("gds") ? 100 : undefined}
                                  />
                                </div>
                                {isOptional && (
                                  <button
                                    type="button"
                                    className="product-generator__optional-field-remove"
                                    onClick={() => removeOptionalAttribute(attr.id)}
                                    aria-label={`Remove ${attr.label}`}
                                  >
                                    <TrashSimple size={16} weight="regular" aria-hidden />
                                  </button>
                                )}
                              </div>
                            );
                          }
                          return null;
                        })}
                    </div>
                    {(productCategory === "MORTGAGE" || productCategory === "LINE OF CREDIT") && (
                      <div className="product-generator__add-optional-wrap">
                        <Button
                          type="button"
                          variant="alt"
                          size="small"
                          className="product-generator__add-optional-trigger"
                          onClick={() => setOptionalAttrDropdownOpen((o) => !o)}
                          aria-expanded={optionalAttrDropdownOpen}
                          aria-haspopup="listbox"
                          aria-label="Add optional attribute"
                          leftIcon={<Plus size={16} weight="bold" aria-hidden />}
                          rightIcon={<CaretDown size={16} weight="regular" aria-hidden />}
                        >
                          Add optional attribute
                        </Button>
                        {optionalAttrDropdownOpen && (
                          <>
                            <div
                              className="product-generator__add-optional-backdrop"
                              aria-hidden
                              onClick={() => setOptionalAttrDropdownOpen(false)}
                            />
                            <ul
                              className="product-generator__add-optional-dropdown"
                              role="listbox"
                              aria-label="Optional attributes"
                            >
                              {OPTIONAL_ATTRIBUTE_IDS.map((id) => {
                                const attr = PRODUCT_ATTRIBUTES.find((a) => a.id === id);
                                const isAdded = addedOptionalAttributes.includes(id);
                                return (
                                  <li
                                    key={id}
                                    role="option"
                                    aria-selected={isAdded}
                                    className={`product-generator__add-optional-option ${isAdded ? "product-generator__add-optional-option--added" : ""}`}
                                    onClick={() => !isAdded && addOptionalAttribute(id)}
                                  >
                                    {attr?.label ?? id}
                                    {isAdded && (
                                      <span className="product-generator__add-optional-check" aria-hidden>
                                        <Check size={16} weight="bold" />
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="product-generator__card">
                  <div className="product-generator__card-header">
                    <h3 className="product-generator__card-title">Attributes</h3>
                  </div>
                  <Button
                    type="button"
                    variant="alt"
                    size="small"
                    className="product-generator__add-optional-trigger"
                    leftIcon={<Plus size={16} weight="regular" aria-hidden />}
                  >
                    Add attribute
                  </Button>
                </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <footer className="product-generator__footer">
          <span aria-hidden />
          <div className="product-generator__footer-actions">
            <Button
              variant="alt"
              size="medium"
              onClick={onBackToShelf}
              className="product-generator__footer-btn"
            >
              Discard
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={handleSave}
              className="product-generator__footer-btn"
              leftIcon={<Check size={20} weight="bold" aria-hidden />}
            >
              Save
            </Button>
          </div>
        </footer>
        </div>
      </div>
    </div>
  );
}
