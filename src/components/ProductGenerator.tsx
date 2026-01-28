import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ArrowLeft, CaretDown, CaretLeft, CaretRight, Check, Funnel, Info, Plus, TrashSimple, X } from "@phosphor-icons/react";
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
const TERM_OPTIONS = ["2 years", "3 years", "4 years", "5 years", "7 years", "10 years"];
const RATE_TYPES = ["Fixed", "Variable", "Adjustable"];
const RATE_HOLD_DAYS = ["60 days", "90 days", "120 days", "150 days", "180 days"];
const INSURED_LTV = ["≥0%, <65%", "≥65%, <70%", "≥70%, <75%", "≥75%, <80%", "≥80%, <95%", "≥0%, <95%"];
const INSURABLE_LTV = ["≥0%, <65%", "≥65%, <70%", "≥70%, <75%", "≥75%, <80%", "≥80%, <95%", "≥0%, <95%"];
const REGIONS = ["QC", "Canada", "ROC", "ON", "AB FSA", "Western Canada Rural", "Canada (AB FSA)", "ROC (AB FSA)"];

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

/** Properties that can be used as chips in the name/description template. Placeholder in template is &Key (e.g. &ProductFamily). */
const TEMPLATE_PROPERTIES = [
  { key: "ProductCategory", label: "Product category" },
  { key: "ProductType", label: "Product type" },
  { key: "ProductFamily", label: "Product family" },
  { key: "Term", label: "Term (years)" },
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

function cartesian<T>(...arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
    [[]]
  );
}

export function ProductGenerator({
  workspace,
  onBackToShelf,
  onGenerated,
  onProductFamilies,
  onTenantSettings,
  onLenderSettings,
  onLogout,
}: {
  workspace: Workspace;
  onBackToShelf: () => void;
  onGenerated: (products: ShelfProduct[]) => void;
  onProductFamilies?: () => void;
  onTenantSettings?: () => void;
  onLenderSettings?: () => void;
  onLogout?: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [productCategory, setProductCategory] = useState("MORTGAGE");
  const productCategoryOptions = PRODUCT_CATEGORY_OPTIONS;
  const productTypeOptions = PRODUCT_TYPE_BY_CATEGORY[productCategory] ?? PRODUCT_TYPE_BY_CATEGORY.MORTGAGE;
  const [productType, setProductType] = useState("MORTGAGE");

  // When category changes, reset product type if it's not in the new category's options
  const setProductCategoryAndSyncType = useCallback((category: string) => {
    setProductCategory(category);
    const allowed = PRODUCT_TYPE_BY_CATEGORY[category] ?? PRODUCT_TYPE_BY_CATEGORY.MORTGAGE;
    setProductType((current) => (allowed.includes(current) ? current : allowed[0] ?? ""));
  }, []);
  const [nameTemplate, setNameTemplate] = useState("Super - &ProductFamily - &Term - &Ratetype");
  const [descriptionTemplate, setDescriptionTemplate] = useState("Super - &ProductFamily - &Term - &Ratetype");

  const [families, setFamilies] = useState<string[]>(["Full Featured"]);
  const [terms, setTerms] = useState<string[]>(["5 years"]);
  const [rateTypes, setRateTypes] = useState<string[]>(["Fixed"]);
  const [rateHolds, setRateHolds] = useState<string[]>(["120 days"]);
  const [insuredLtv, setInsuredLtv] = useState<string[]>(["≥80%, <95%"]);
  const [insurableLtv, setInsurableLtv] = useState<string[]>(["≥70%, <75%", "≥75%, <80%"]);
  const [regions, setRegions] = useState<string[]>(["QC"]);

  /** IDs of optional fields currently added in General Properties (e.g. repaymentType, transactionType). */
  const [addedOptionalFields, setAddedOptionalFields] = useState<string[]>(["repaymentType", "transactionType"]);
  /** Selected value per optional field. Keys are option ids; values will be replaced when you provide dropdown options. */
  const [optionalFieldValues, setOptionalFieldValues] = useState<Record<string, string>>({
    repaymentType: "OPEN",
    transactionType: "NEW_PURCHASE",
  });
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

  const toggle = useCallback(
    (arr: string[], set: (v: string[]) => void, val: string) => {
      set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
    },
    []
  );

  /** Current form values for template placeholders (used in sample preview). */
  const getSampleTemplateValues = useCallback(() => {
    const ltv = [...new Set([...insuredLtv, ...insurableLtv])];
    const ltvFirst = ltv.length ? ltv[0] : "≥80%, <95%";
    const values: Record<string, string> = {
      ProductCategory: productCategory,
      ProductType: productType,
      ProductFamily: families[0] ?? "Full Featured",
      Term: terms[0] ?? "5 years",
      RateType: rateTypes[0] ?? "Fixed",
      RateHoldDays: rateHolds[0] ?? "120 days",
      LtvRange: ltvFirst,
      Region: regions[0] ?? "QC",
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
    families,
    terms,
    rateTypes,
    rateHolds,
    insuredLtv,
    insurableLtv,
    regions,
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

  const combinations = useMemo(() => {
    const fam = families.length ? families : ["Full Featured"];
    const term = terms.length ? terms : ["5 years"];
    const rt = rateTypes.length ? rateTypes : ["Fixed"];
    const rh = rateHolds.length ? rateHolds : ["120 days"];
    const ltv = [...new Set([...insuredLtv, ...insurableLtv])];
    const ltvList = ltv.length ? ltv : ["≥80%, <95%"];
    const reg = regions.length ? regions : ["QC"];

    const rows = cartesian(fam, term, rt, rh, ltvList, reg);
    let id = 0;
    return rows.map(([productFamily, termYears, rateType, rateHoldDays, ltvRange, region]) => {
      const values: Record<string, string> = {
        ProductCategory: productCategory,
        ProductType: productType,
        ProductFamily: productFamily,
        Term: termYears,
        RateType: rateType,
        RateHoldDays: rateHoldDays,
        LtvRange: ltvRange,
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
        id: `gen-${++id}`,
        name,
        description,
        productFamily,
        termYears: termYears.replace(" years", ""),
        rateType,
        rateHoldDays: rateHoldDays.replace(" days", ""),
        ltvRange,
        region,
      } as ProductCombination;
    });
  }, [
    families,
    terms,
    rateTypes,
    rateHolds,
    insuredLtv,
    insurableLtv,
    regions,
    productCategory,
    productType,
    addedOptionalFields,
    optionalFieldValues,
    nameTemplate,
    descriptionTemplate,
  ]);

  const [reviewRows, setReviewRows] = useState<Array<ProductCombination & { selected: boolean }>>([]);

  const goToStep2 = useCallback(() => {
    setReviewRows(
      combinations.map((c) => ({
        ...c,
        selected: true,
      }))
    );
    setStep(2);
  }, [combinations]);

  const goToStep1 = useCallback(() => setStep(1), []);

  const selectedCount = step === 2 ? reviewRows.filter((r) => r.selected).length : combinations.length;
  const totalCount = step === 2 ? reviewRows.length : combinations.length;

  const breakdown = useMemo(() => {
    const n = (x: number) => Math.max(1, x);
    return {
      families: n(families.length),
      terms: n(terms.length),
      rateTypes: n(rateTypes.length),
      rateHolds: n(rateHolds.length),
      ltvRanges: n([...new Set([...insuredLtv, ...insurableLtv])].length),
      regions: n(regions.length),
    };
  }, [families, terms, rateTypes, rateHolds, insuredLtv, insurableLtv, regions]);

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

  const handleGenerate = useCallback(() => {
    const toAdd = reviewRows.filter((r) => r.selected);
    const ltv = (p: (ProductCombination & { ltvRange?: string })) => p.ltvRange ?? "any";
    const newProducts: ShelfProduct[] = toAdd.map((p, i) => ({
      id: `shelf-${Date.now()}-${i}`,
      name: p.name,
      description: p.description,
      descriptionId: `GEN${String(i + 1).padStart(3, "0")}`,
      productId: `T2G${String(i + 1).padStart(2, "0")}`,
      status: "DRAFT" as const,
      visibility: "automatic",
      rateEmbodiment: "any",
      effectiveDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "/"),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
        .replace(/\//g, "/"),
      productCategory,
      productType,
      repaymentType: optionalFieldValues.repaymentType ?? "",
      transactionType: optionalFieldValues.transactionType ?? "",
      productFamily: p.productFamily,
      termYears: p.termYears,
      rateType: p.rateType,
      ltvRange: ltv(p),
      unpublished: true,
    }));
    onGenerated(newProducts);
    onBackToShelf();
  }, [reviewRows, productCategory, productType, optionalFieldValues, onGenerated, onBackToShelf]);

  const toggleReviewRow = (id: string) => {
    setReviewRows((prev) => prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)));
  };
  const selectAllVisible = () => setReviewRows((prev) => prev.map((r) => ({ ...r, selected: true })));
  const deselectAllVisible = () => setReviewRows((prev) => prev.map((r) => ({ ...r, selected: false })));

  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const visibleReviewRows = showOnlySelected ? reviewRows.filter((r) => r.selected) : reviewRows;
  const allVisibleSelected =
    visibleReviewRows.length > 0 && visibleReviewRows.every((r) => r.selected);
  const someVisibleSelected = visibleReviewRows.some((r) => r.selected);
  const selectAllHeaderRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = selectAllHeaderRef.current;
    if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected;
  }, [someVisibleSelected, allVisibleSelected]);

  type ReviewRow = (typeof reviewRows)[number];
  const reviewTableColumns = useMemo(() => {
    const cols: Array<
      | { id: string; label: string; isCheckbox: true }
      | { id: string; label: string; getValue: (row: ReviewRow) => string }
    > = [
      { id: "select", label: "", isCheckbox: true as const },
      { id: "name", label: "Name", getValue: (r) => r.name },
      { id: "description", label: "Description", getValue: (r) => r.description },
      { id: "productCategory", label: "Product category", getValue: () => productCategory },
      { id: "productType", label: "Product type", getValue: () => productType },
    ];
    addedOptionalFields.forEach((fieldId) => {
      const opt = OPTIONAL_FIELD_OPTIONS.find((o) => o.id === fieldId);
      if (opt)
        cols.push({
          id: fieldId,
          label: opt.label,
          getValue: () => optionalFieldValues[fieldId] ?? "",
        });
    });
    cols.push(
      { id: "productFamily", label: "Product family", getValue: (r) => r.productFamily },
      { id: "termYears", label: "Term (years)", getValue: (r) => r.termYears },
      { id: "rateType", label: "Rate type", getValue: (r) => r.rateType },
      { id: "rateHoldDays", label: "Rate hold (days)", getValue: (r) => r.rateHoldDays },
      { id: "ltvRange", label: "LTV range", getValue: (r) => r.ltvRange },
      { id: "region", label: "Region", getValue: (r) => r.region }
    );
    return cols;
  }, [productCategory, productType, addedOptionalFields, optionalFieldValues]);

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
          shelfCount={0}
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
              <span className="product-generator__breadcrumb-title">Product generator</span>
            </nav>
            <div className="product-generator__progress-wrap">
              <div
                className="product-generator__progress-bar"
                role="progressbar"
                aria-valuenow={step}
                aria-valuemin={1}
                aria-valuemax={2}
                aria-label="Step progress"
              >
                <div className="product-generator__progress-fill" style={{ width: step === 1 ? "50%" : "100%" }} />
              </div>
            </div>
          </header>

          <div className="product-generator__main-row">
          <div className="product-generator__scroll">
            <div className="product-generator__scroll-content">
            {step === 1 && (
            <>
              <section className="product-generator__section">
                <div className="product-generator__step-header">
              <h2 className="product-generator__step-title">
                {step === 1 ? "Properties" : "Review results"}
              </h2>
              <span className="product-generator__step-badge">
                Step {step}/2
              </span>
            </div>
            <p className="product-generator__step-description">
              {step === 1
                ? "Configure product properties, name and description templates, and optional fields."
                : "Review the generated combinations below and select which products to create."}
            </p>
                
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
                      <Info size={16} weight="regular" className="product-generator__sample-icon" aria-hidden />
                      <span className="product-generator__sample-label">Sample preview:</span> {sampleName}
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
                      <Info size={16} weight="regular" className="product-generator__sample-icon" aria-hidden />
                      <span className="product-generator__sample-label">Sample preview:</span> {sampleDescription}
                    </div>
                  </div>
                </div>

                <div className="product-generator__card">
                  <div className="product-generator__card-header">
                    <h3 className="product-generator__card-title">General properties</h3>
                  </div>
                  <div className="product-generator__subsection product-generator__subsection--inline">
                    <div className="product-generator__general-fields">
                      <div className="product-generator__inline-field">
                        <label className="product-generator__label">Product category</label>
                        <select
                          className="product-generator__select"
                          value={productCategory}
                          onChange={(e) => setProductCategoryAndSyncType(e.target.value)}
                        >
                          {productCategoryOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div className="product-generator__inline-field">
                        <label className="product-generator__label">Product type</label>
                        <select
                          className="product-generator__select"
                          value={productType}
                          onChange={(e) => setProductType(e.target.value)}
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
                        return (
                          <div key={fieldId} className="product-generator__optional-field-row">
                            <div className="product-generator__optional-field-control">
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
                              ) : (
                                <select
                                  className="product-generator__select"
                                  value={value}
                                  onChange={(e) => setOptionalFieldValue(fieldId, e.target.value)}
                                >
                                  <option value="">Select…</option>
                                  {fieldId === "repaymentType" &&
                                    REPAYMENT_TYPE_OPTIONS.map((opt) => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  {fieldId === "transactionType" &&
                                    TRANSACTION_TYPE_OPTIONS.map((opt) => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  {fieldId === "rank" &&
                                    RANK_OPTIONS.map((opt) => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  {!["repaymentType", "transactionType", "rank"].includes(fieldId) && (
                                    <option value="">Select…</option>
                                  )}
                                </select>
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
                        leftIcon={<Plus size={16} weight="bold" aria-hidden />}
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
                    <h3 className="product-generator__card-title">Mortgage properties</h3>
                  </div>
                  <div className="product-generator__subsection">
                    <p className="product-generator__template-intro">
                      Select the properties and values you want to include. All possible combinations will be generated.
                    </p>
                    <div className="product-generator__grid">
                    <div className="product-generator__field">
                      <span className="product-generator__field-label">Product Families</span>
                      <div className="product-generator__field-options">
                        {PRODUCT_FAMILIES.map((f) => (
                          <label key={f} className="product-generator__checkbox">
                            <input
                              type="checkbox"
                              checked={families.includes(f)}
                              onChange={() => toggle(families, setFamilies, f)}
                            />
                            {f}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="product-generator__field">
                      <span className="product-generator__field-label">Term (years)</span>
                      <div className="product-generator__field-options">
                        {TERM_OPTIONS.map((t) => (
                          <label key={t} className="product-generator__checkbox">
                            <input
                              type="checkbox"
                              checked={terms.includes(t)}
                              onChange={() => toggle(terms, setTerms, t)}
                            />
                            {t}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="product-generator__field">
                      <span className="product-generator__field-label">Rate type</span>
                      <div className="product-generator__field-options">
                        {RATE_TYPES.map((r) => (
                          <label key={r} className="product-generator__checkbox">
                            <input
                              type="checkbox"
                              checked={rateTypes.includes(r)}
                              onChange={() => toggle(rateTypes, setRateTypes, r)}
                            />
                            {r}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="product-generator__field">
                      <span className="product-generator__field-label">Rate hold (days)</span>
                      <div className="product-generator__field-options">
                        {RATE_HOLD_DAYS.map((d) => (
                          <label key={d} className="product-generator__checkbox">
                            <input
                              type="checkbox"
                              checked={rateHolds.includes(d)}
                              onChange={() => toggle(rateHolds, setRateHolds, d)}
                            />
                            {d}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="product-generator__field">
                      <span className="product-generator__field-label">Insured → LTV ranges</span>
                      <div className="product-generator__field-options">
                        {INSURED_LTV.map((l) => (
                          <label key={l} className="product-generator__checkbox">
                            <input
                              type="checkbox"
                              checked={insuredLtv.includes(l)}
                              onChange={() => toggle(insuredLtv, setInsuredLtv, l)}
                            />
                            {l}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="product-generator__field">
                      <span className="product-generator__field-label">Insurable → LTV ranges</span>
                      <div className="product-generator__field-options">
                        {INSURABLE_LTV.map((l) => (
                          <label key={l} className="product-generator__checkbox">
                            <input
                              type="checkbox"
                              checked={insurableLtv.includes(l)}
                              onChange={() => toggle(insurableLtv, setInsurableLtv, l)}
                            />
                            {l}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="product-generator__field">
                      <span className="product-generator__field-label">Region</span>
                      <div className="product-generator__field-options">
                        {REGIONS.map((r) => (
                          <label key={r} className="product-generator__checkbox">
                            <input
                              type="checkbox"
                              checked={regions.includes(r)}
                              onChange={() => toggle(regions, setRegions, r)}
                            />
                            {r}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="alt"
                    size="small"
                    className="product-generator__add-optional-trigger"
                    leftIcon={<Plus size={16} weight="bold" aria-hidden />}
                  >
                    Add mortgage property
                  </Button>
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
                    leftIcon={<Plus size={16} weight="bold" aria-hidden />}
                  >
                    Add attribute
                  </Button>
                </div>
                </div>
              </section>
            </>
          )}

          {step === 2 && (
            <>
              <section className="product-generator__section">
                <div className="product-generator__step-header">
                  <h2 className="product-generator__step-title">Combinations</h2>
                  <span className="product-generator__step-badge">Step 2/2</span>
                </div>
                <p className="product-generator__step-description">
                  Review the generated combinations below and deselect any you don&apos;t want to create.
                </p>
                <div className="product-generator__section-body">
                <div className="product-generator__card">
                  <div className="product-generator__common-details">
                    <span>Product category: {productCategory}</span>
                    <span>Product type: {productType}</span>
                  </div>
                  <h3 className="product-generator__table-caption">PRODUCT COMBINATIONS</h3>
                  <div className="product-generator__toolbar">
                  <label className="product-generator__checkbox product-generator__checkbox--inline">
                    <input
                      type="checkbox"
                      checked={showOnlySelected}
                      onChange={(e) => setShowOnlySelected(e.target.checked)}
                    />
                    Show only selected
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="small"
                    className="product-generator__toolbar-link"
                    onClick={deselectAllVisible}
                  >
                    Deselect all visible
                  </Button>
                  <Button
                    type="button"
                    variant="alt"
                    size="small"
                    className="product-generator__filters-btn"
                    leftIcon={<Funnel size={16} weight="regular" aria-hidden />}
                  >
                    Filters
                  </Button>
                </div>
                <div className="product-generator__table-wrapper">
                  <table className="product-generator__table">
                    <thead>
                      <tr>
                        {reviewTableColumns.map((col) =>
                          "isCheckbox" in col && col.isCheckbox ? (
                            <th key={col.id} style={{ width: 44 }} aria-label="Select all">
                              <label className="product-generator__table-select-all">
                                <input
                                  ref={selectAllHeaderRef}
                                  type="checkbox"
                                  checked={allVisibleSelected}
                                  onChange={(e) =>
                                    e.target.checked
                                      ? selectAllVisible()
                                      : deselectAllVisible()
                                  }
                                  aria-label="Select all rows"
                                />
                              </label>
                            </th>
                          ) : (
                            <th key={col.id}>{col.label}</th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleReviewRows.map((row) => (
                        <tr key={row.id}>
                          {reviewTableColumns.map((col) =>
                            "isCheckbox" in col && col.isCheckbox ? (
                              <td key={col.id}>
                                <input
                                  type="checkbox"
                                  checked={row.selected}
                                  onChange={() => toggleReviewRow(row.id)}
                                  aria-label={`Select ${row.name}`}
                                />
                              </td>
                            ) : "getValue" in col ? (
                              <td key={col.id}>{col.getValue(row)}</td>
                            ) : null
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
                </div>
              </section>
            </>
          )}
            </div>

            <aside className="product-generator__panel" aria-label="Products to generate">
            <h3 className="product-generator__panel-title">PRODUCTS TO GENERATE</h3>
            <p className="product-generator__panel-count">
              {step === 2 ? `${selectedCount}/${totalCount}` : totalCount}
            </p>
            <p className="product-generator__panel-note">
              {step === 1
                ? "This count updates automatically based on your selections."
                : "Products will be generated once published."}
            </p>
            {step === 1 && (
              <>
                <div className="product-generator__breakdown">
                  <h4>CALCULATED BREAKDOWN</h4>
                  <p>× Families: {breakdown.families}</p>
                  <p>× Terms: {breakdown.terms}</p>
                  <p>× Rate Types: {breakdown.rateTypes}</p>
                  <p>× Rate Holds: {breakdown.rateHolds}</p>
                  <p>× LTV Ranges: {breakdown.ltvRanges}</p>
                  <p>× Regions: {breakdown.regions}</p>
                </div>
                <p className="product-generator__panel-sample">SAMPLE NAME PREVIEW: {sampleName}</p>
                <p className="product-generator__panel-sample">SAMPLE DESCRIPTION PREVIEW: {sampleDescription}</p>
              </>
            )}
          </aside>
          </div>
          </div>

        <footer className="product-generator__footer">
          {step === 1 ? (
            <>
              <span aria-hidden />
              <Button
                variant="primary"
                size="medium"
                onClick={goToStep2}
                className="product-generator__footer-btn"
                rightIcon={<CaretRight size={20} weight="regular" aria-hidden />}
              >
                Review results
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="medium"
                onClick={goToStep1}
                className="product-generator__footer-btn"
                leftIcon={<CaretLeft size={20} weight="regular" aria-hidden />}
              >
                Properties
              </Button>
              <Button
                variant="primary"
                size="medium"
                onClick={handleGenerate}
                disabled={selectedCount === 0}
                className="product-generator__footer-btn"
                leftIcon={<Check size={20} weight="bold" aria-hidden />}
              >
                Generate {selectedCount} products
              </Button>
            </>
          )}
        </footer>
        </div>
      </div>
    </div>
  );
}
