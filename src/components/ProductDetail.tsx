import { useState, useCallback } from "react";
import { ArrowLeft, CaretDown, CaretUp, Check, Plus, TrashSimple } from "@phosphor-icons/react";
import type { Workspace } from "./SelectWorkspace";
import type { ShelfProduct } from "../types";
import { Button } from "./ui/Button";
import { SideNav } from "./SideNav";
import "./ProductDetail.css";

/** Optional fields that can be added to General Properties. */
const OPTIONAL_FIELD_OPTIONS = [
  { id: "repaymentType", label: "Repayment type" },
  { id: "transactionType", label: "Transaction type" },
  { id: "channel", label: "Channel" },
  { id: "rank", label: "Rank" },
  { id: "subtype", label: "Sub type" },
] as const;
const REPAYMENT_TYPE_OPTIONS = ["OPEN", "CLOSED", "ANY"];
const TRANSACTION_TYPE_OPTIONS = [
  "NEW_PURCHASE", "CONSTRUCTION_DRAWS", "CONSTRUCTION_SINGLE_ADVANCE", "BUILDER_SINGLE_ADVANCE",
  "MORTGAGE_IN_COMPANY_NAME", "RENEWAL", "TRANSFER", "REFINANCE", "REFINANCE_WITH_IMPROVEMENT",
  "REFINANCE_WITH_CONSTRUCTION", "PORT", "STANDALONE BRIDGE", "PURCHASE_WITH_IMPROVEMENT",
  "PREAPPROVAL", "ASSUMPTION", "AMENDMENTS",
];
const RANK_OPTIONS = ["FIRST", "SECOND", "THIRD"];

export function ProductDetail({
  workspace,
  product,
  productsCount,
  onBack,
  onSignOut,
}: {
  workspace: Workspace;
  product: ShelfProduct;
  productsCount: number;
  onBack: () => void;
  onSignOut: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    general: true,
    productFamily: true,
    term: true,
    rateType: true,
    rateHold: true,
    insurability: true,
    region: true,
    attributes: true,
  });

  const [addedOptionalFields, setAddedOptionalFields] = useState<string[]>([]);
  const [optionalFieldValues, setOptionalFieldValues] = useState<Record<string, string>>({});
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

  const toggle = (key: string) => setExpanded((e) => ({ ...e, [key]: !e[key] }));

  return (
    <div className="product-detail">
      <div className="product-detail__body">
        <SideNav
          tenantName={workspace.name}
          lenderName="TD residential"
          userName="Josée Racicot"
          userEmail="josee.racicot@nesto.ca"
          userInitial="JR"
          currentSection="shelf"
          shelfCount={productsCount}
          familiesCount={0}
          onNavigate={(section) => {
            if (section === "shelf") onBack();
            if (section === "product-families") onBack();
          }}
          onSignOut={onSignOut}
        />
        <main className="product-detail__content">
          <header className="product-detail__header">
            <nav className="product-detail__breadcrumb" aria-label="Breadcrumb">
              <Button
                variant="ghost"
                size="medium"
                onClick={onBack}
                className="product-detail__breadcrumb-back"
                leftIcon={<ArrowLeft size={20} weight="regular" aria-hidden />}
              >
                Back to Main shelf
              </Button>
              <span className="product-detail__breadcrumb-sep">|</span>
              <span className="product-detail__breadcrumb-title">{product.name}</span>
            </nav>
          </header>

          <div className="product-detail__scroll">
            <div className="product-detail__sections">
              <section className="product-detail__section">
                <button
                  type="button"
                  className="product-detail__section-head"
                  onClick={() => toggle("general")}
                >
                  <h2>General</h2>
                  <span className="product-detail__chevron" aria-hidden>
                    {expanded.general ? <CaretUp size={12} /> : <CaretDown size={12} />}
                  </span>
                </button>
                {expanded.general && (
                  <div className="product-detail__section-body product-detail__section-body--card">
                    <div className="product-detail__general-fields">
                      <div className="product-detail__inline-field">
                        <label className="product-detail__label">Name</label>
                        <input type="text" defaultValue={product.name} className="product-detail__input" />
                      </div>
                      <div className="product-detail__inline-field">
                        <label className="product-detail__label">Description</label>
                        <input type="text" defaultValue={product.description} className="product-detail__input" />
                      </div>
                      <div className="product-detail__inline-field">
                        <label className="product-detail__label">Product category</label>
                        <select className="product-detail__select" defaultValue="Mortgage">
                          <option>Mortgage</option>
                        </select>
                      </div>
                      <div className="product-detail__inline-field">
                        <label className="product-detail__label">Product type</label>
                        <select className="product-detail__select" defaultValue={product.productType}>
                          <option>Residential</option>
                        </select>
                      </div>
                      {addedOptionalFields.map((fieldId) => {
                        const option = OPTIONAL_FIELD_OPTIONS.find((o) => o.id === fieldId);
                        if (!option) return null;
                        const value = optionalFieldValues[fieldId] ?? "";
                        return (
                          <div key={fieldId} className="product-detail__optional-field-row">
                            <div className="product-detail__optional-field-control">
                              <label className="product-detail__label">{option.label}</label>
                              {fieldId === "subtype" ? (
                                <input
                                  type="text"
                                  className="product-detail__input"
                                  value={value}
                                  onChange={(e) => setOptionalFieldValue(fieldId, e.target.value)}
                                  placeholder="Enter sub type…"
                                  aria-label={option.label}
                                />
                              ) : (
                                <select
                                  className="product-detail__select"
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
                              className="product-detail__optional-field-remove"
                              onClick={() => removeOptionalField(fieldId)}
                              aria-label={`Remove ${option.label}`}
                            >
                              <TrashSimple size={16} weight="regular" aria-hidden />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="product-detail__add-optional-wrap">
                      <Button
                        type="button"
                        variant="alt"
                        size="small"
                        className="product-detail__add-optional-trigger"
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
                            className="product-detail__add-optional-backdrop"
                            aria-hidden
                            onClick={() => setOptionalFieldDropdownOpen(false)}
                          />
                          <ul
                            className="product-detail__add-optional-dropdown"
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
                                  className={`product-detail__add-optional-option ${isAdded ? "product-detail__add-optional-option--added" : ""}`}
                                  onClick={() => !isAdded && addOptionalField(opt.id)}
                                >
                                  {opt.label}
                                  {isAdded && (
                                    <span className="product-detail__add-optional-check" aria-hidden>
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
                )}
              </section>

            <section className="product-detail__section">
              <button
                type="button"
                className="product-detail__section-head"
                onClick={() => toggle("productFamily")}
              >
                <h2>Product Family</h2>
                <span className="product-detail__chevron" aria-hidden>
                  {expanded.productFamily ? <CaretUp size={12} /> : <CaretDown size={12} />}
                </span>
              </button>
              {expanded.productFamily && (
                <div className="product-detail__section-body">
                  <div className="product-detail__radios">
                    {["Full Featured", "Limited", "Smart Save"].map((f) => (
                      <label key={f} className="product-detail__radio">
                        <input type="radio" name="family" value={f} defaultChecked={f === product.productFamily} />
                        {f}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="product-detail__section">
              <button
                type="button"
                className="product-detail__section-head"
                onClick={() => toggle("term")}
              >
                <h2>Term (Years)</h2>
                <span className="product-detail__chevron" aria-hidden>
                  {expanded.term ? <CaretUp size={12} /> : <CaretDown size={12} />}
                </span>
              </button>
              {expanded.term && (
                <div className="product-detail__section-body">
                  <div className="product-detail__radios">
                    {["2 years", "3 years", "4 years", "5 years", "7 years", "10 years"].map((t) => (
                      <label key={t} className="product-detail__radio">
                        <input type="radio" name="term" value={t} defaultChecked={t === `${product.termYears} years`} />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="product-detail__section">
              <button
                type="button"
                className="product-detail__section-head"
                onClick={() => toggle("rateType")}
              >
                <h2>Rate Type</h2>
                <span className="product-detail__chevron" aria-hidden>
                  {expanded.rateType ? <CaretUp size={12} /> : <CaretDown size={12} />}
                </span>
              </button>
              {expanded.rateType && (
                <div className="product-detail__section-body">
                  <div className="product-detail__radios">
                    {["Fixed", "Variable", "Adjustable"].map((r) => (
                      <label key={r} className="product-detail__radio">
                        <input type="radio" name="rateType" value={r} defaultChecked={r === product.rateType} />
                        {r}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="product-detail__section">
              <button
                type="button"
                className="product-detail__section-head"
                onClick={() => toggle("rateHold")}
              >
                <h2>Rate Hold (Days)</h2>
                <span className="product-detail__chevron" aria-hidden>
                  {expanded.rateHold ? <CaretUp size={12} /> : <CaretDown size={12} />}
                </span>
              </button>
              {expanded.rateHold && (
                <div className="product-detail__section-body">
                  <div className="product-detail__radios">
                    {["60 days", "90 days", "120 days", "150 days", "180 days"].map((d) => (
                      <label key={d} className="product-detail__radio">
                        <input type="radio" name="rateHold" value={d} />
                        {d}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="product-detail__section">
              <button
                type="button"
                className="product-detail__section-head"
                onClick={() => toggle("insurability")}
              >
                <h2>Insurability</h2>
                <span className="product-detail__chevron" aria-hidden>
                  {expanded.insurability ? <CaretUp size={12} /> : <CaretDown size={12} />}
                </span>
              </button>
              {expanded.insurability && (
                <div className="product-detail__section-body">
                  <div className="product-detail__radios">
                    <label className="product-detail__radio">
                      <input type="radio" name="insurability" value="Insured" defaultChecked />
                      Insured
                    </label>
                    <label className="product-detail__radio">
                      <input type="radio" name="insurability" value="Insurable" />
                      Insurable
                    </label>
                    <label className="product-detail__radio">
                      <input type="radio" name="insurability" value="Uninsurable" />
                      Uninsurable
                    </label>
                  </div>
                  <p className="product-detail__hint">User must choose the LTV min, max values for Insurability.</p>
                </div>
              )}
            </section>

            <section className="product-detail__section">
              <button
                type="button"
                className="product-detail__section-head"
                onClick={() => toggle("region")}
              >
                <h2>Region</h2>
                <span className="product-detail__chevron" aria-hidden>
                  {expanded.region ? <CaretUp size={12} /> : <CaretDown size={12} />}
                </span>
              </button>
              {expanded.region && (
                <div className="product-detail__section-body">
                  <div className="product-detail__radios">
                    {["Canada", "ROC", "QC", "ON", "AB FSA", "Western Canada Rural", "Canada (AB FSA)", "ROC (AB FSA)"].map((r) => (
                      <label key={r} className="product-detail__radio">
                        <input type="radio" name="region" value={r} defaultChecked={r === "Canada"} />
                        {r}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="product-detail__section">
              <button
                type="button"
                className="product-detail__section-head"
                onClick={() => toggle("attributes")}
              >
                <h2>Product Attributes</h2>
                <span className="product-detail__chevron" aria-hidden>
                  {expanded.attributes ? <CaretUp size={12} /> : <CaretDown size={12} />}
                </span>
              </button>
              {expanded.attributes && (
                <div className="product-detail__section-body">
                  <Button variant="secondary" size="small" className="product-detail__btn">Add attribute</Button>
                </div>
              )}
            </section>
            </div>
          </div>

          <footer className="product-detail__footer">
            <Button
              intent="negative"
              variant="primary"
              size="medium"
              leftIcon={<Check size={20} weight="bold" aria-hidden />}
              className="product-detail__footer-btn"
            >
              Save changes
            </Button>
          </footer>
        </main>
      </div>
    </div>
  );
}
