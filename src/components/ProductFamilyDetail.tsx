import { useState, useCallback } from "react";
import { ArrowLeft, CaretDown, Check, Plus, TrashSimple } from "@phosphor-icons/react";
import type { Workspace } from "./SelectWorkspace";
import { Button } from "./ui/Button";
import { SideNav } from "./SideNav";
import "./ProductFamilyDetail.css";
import "./ProductGenerator.css";

export interface ProductFamily {
  id: string;
  familyName: string;
  status: string;
  productType: string;
  productFamilyId: string;
  prepayOptions: string;
  prepayDouble: string;
  prepayLumpSum: string;
}

/* Placeholder options — replace with real values when provided */
const PRODUCT_CATEGORY_OPTIONS = ["Mortgage"];
const PRODUCT_TYPE_OPTIONS = ["Mortgage"];
const PAYMENT_FREQUENCY_OPTIONS = ["MONTHLY"];
const PREPAYMENT_CHARGE_RULE_OPTIONS = ["3_MONTHS_INTEREST"];
const PREPAYMENT_PRIVILEGE_TYPE_OPTIONS = ["SEMI_ANNUAL"];
const PREPAYMENT_YEAR_BOUNDARY_OPTIONS = ["CALENDAR_YEAR"];
const PREPAYMENT_INCREASE_TYPE_OPTIONS: string[] = [];
const PENALTY_IRD_OPTIONS = ["Simplified_IRD"];
const PREPAYMENT_OPTION_YEAR_BOUNDARY_OPTIONS = ["MORTGAGE_ANNIVERSARY"];
const INTEREST_CALCULATION_OPTIONS = ["SEMIANNUALLY"];
const PAYMENT_FREQUENCY_CHANGE_OPTIONS = ["PAYMENT FREQUENCY CHANGE"];
const YEAR_BOUNDARY_OPTIONS = ["ANNIVERSARY"];
const RATE_COMPOUNDING_OPTIONS = ["SEMI_ANNUAL"];
const PREPAYMENT_INCREASE_PERIOD_OPTIONS = ["YEAR"];
const PRIME_RATE_UPDATE_OPTIONS = ["START_OF_CYCLE"];
const PREPAYMENT_POOL_OPTIONS = ["SHARED"];
const PRODUCT_VARIABLE_TYPE_OPTIONS = ["ARM"];

export function ProductFamilyDetail({
  workspace,
  family,
  onBack,
  onSignOut,
  shelfCount = 0,
  familiesCount = 0,
}: {
  workspace: Workspace;
  family: ProductFamily;
  onBack: () => void;
  onSignOut: () => void;
  shelfCount?: number;
  familiesCount?: number;
}) {
  const [productFamilyName, setProductFamilyName] = useState(family.familyName);
  const [showDescription, setShowDescription] = useState(true);
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("Lorem");
  const [presentationPdfUrl, setPresentationPdfUrl] = useState("Lorem");
  const [productCategory, setProductCategory] = useState("Mortgage");
  const [productType, setProductType] = useState("Mortgage");
  const [paymentFrequency, setPaymentFrequency] = useState("MONTHLY");
  const [prepaymentChargeRule, setPrepaymentChargeRule] = useState("3_MONTHS_INTEREST");
  const [prepaymentPrivilegeType, setPrepaymentPrivilegeType] = useState("SEMI_ANNUAL");
  const [prepaymentPrivilegeAmount, setPrepaymentPrivilegeAmount] = useState("");
  const [prepaymentChargeStaticAmount, setPrepaymentChargeStaticAmount] = useState("");
  const [paymentFrequencyChangeAllowed, setPaymentFrequencyChangeAllowed] = useState(true);
  const [prepaymentDoubleOption, setPrepaymentDoubleOption] = useState(true);
  const [prepaymentYearBoundary, setPrepaymentYearBoundary] = useState("CALENDAR_YEAR");
  const [lumpSumMinimum, setLumpSumMinimum] = useState("");
  const [prepaymentIncreaseType, setPrepaymentIncreaseType] = useState("");
  const [lumpSumMultipleAllowed, setLumpSumMultipleAllowed] = useState(true);
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [addOptionalMortgageOpen, setAddOptionalMortgageOpen] = useState(false);
  const [customAttributeValue, setCustomAttributeValue] = useState("");
  const [addAttributeOpen, setAddAttributeOpen] = useState(false);
  const [serviceable, setServiceable] = useState(true);

  return (
    <div className="product-family-detail">
      <div className="product-family-detail__body">
        <SideNav
          tenantName={workspace.name}
          lenderName="TD residential"
          userName="Josée Racicot"
          userEmail="josee.racicot@nesto.ca"
          userInitial="JR"
          currentSection="product-families"
          shelfCount={shelfCount}
          familiesCount={familiesCount}
          onNavigate={(section) => {
            if (section === "shelf") onBack();
            if (section === "product-families") onBack();
          }}
          onSignOut={onSignOut}
        />
        <div className="product-family-detail__main">
          <header className="product-family-detail__header">
            <nav className="product-family-detail__breadcrumb" aria-label="Breadcrumb">
              <button type="button" className="product-family-detail__breadcrumb-back" onClick={onBack}>
                <ArrowLeft size={20} weight="regular" aria-hidden />
                Back to Families
              </button>
              <span className="product-family-detail__breadcrumb-sep">|</span>
              <span className="product-family-detail__breadcrumb-title">{family.familyName}</span>
              <button type="button" className="product-family-detail__kebab" aria-label="More options">
                ⋯
              </button>
            </nav>
          </header>
          <div className="product-family-detail__main-row">
            <div className="product-family-detail__scroll">
              <div className="product-family-detail__scroll-content">
                <section className="product-family-detail__section">
                  <div className="product-family-detail__section-body">
                    {/* GENERAL */}
                    <div className="product-generator__card">
                      <div className="product-generator__card-header">
                        <h3 className="product-generator__card-title">GENERAL</h3>
                      </div>
                      <div className="product-generator__subsection">
                        <div className="product-generator__general-fields">
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Product family name</label>
                            <input
                              type="text"
                              className="product-generator__input"
                              value={productFamilyName}
                              onChange={(e) => setProductFamilyName(e.target.value)}
                              aria-label="Product family name"
                            />
                          </div>
                          {showDescription && (
                            <div className="product-generator__optional-field-row">
                              <div className="product-generator__field-cell product-generator__optional-field-control">
                                <label className="product-generator__label">Description</label>
                                <input
                                  type="text"
                                  className="product-generator__input"
                                  placeholder="Description"
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                  aria-label="Description"
                                />
                              </div>
                              <button
                                type="button"
                                className="product-generator__optional-field-remove"
                                onClick={() => setShowDescription(false)}
                                aria-label="Remove Description"
                              >
                                <TrashSimple size={16} weight="regular" aria-hidden />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="product-generator__add-optional-wrap">
                          <Button
                            type="button"
                            variant="alt"
                            size="small"
                            className="product-generator__add-optional-trigger"
                            onClick={() => setShowDescription(true)}
                            disabled={showDescription}
                            leftIcon={<Plus size={16} weight="regular" aria-hidden />}
                          >
                            Add field
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* DETAILS */}
                    <div className="product-generator__card">
                      <div className="product-generator__card-header">
                        <h3 className="product-generator__card-title">DETAILS</h3>
                      </div>
                      <div className="product-generator__subsection product-generator__subsection--inline">
                        <div className="product-generator__general-fields">
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Logo URL</label>
                            <input
                              type="text"
                              className="product-generator__input"
                              value={logoUrl}
                              onChange={(e) => setLogoUrl(e.target.value)}
                              aria-label="Logo URL"
                            />
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Presentation PDF URL</label>
                            <input
                              type="text"
                              className="product-generator__input"
                              value={presentationPdfUrl}
                              onChange={(e) => setPresentationPdfUrl(e.target.value)}
                              aria-label="Presentation PDF URL"
                            />
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Product category</label>
                            <select
                              className="product-generator__select"
                              value={productCategory}
                              onChange={(e) => setProductCategory(e.target.value)}
                              aria-label="Product category"
                            >
                              {PRODUCT_CATEGORY_OPTIONS.map((opt) => (
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
                              {PRODUCT_TYPE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MORTGAGE FIELDS */}
                    <div className="product-generator__card">
                      <div className="product-generator__card-header">
                        <h3 className="product-generator__card-title">MORTGAGE FIELDS</h3>
                      </div>
                      <div className="product-generator__subsection product-generator__subsection--inline">
                        <div className="product-generator__general-fields">
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Payment frequency</label>
                            <select
                              className="product-generator__select"
                              value={paymentFrequency}
                              onChange={(e) => setPaymentFrequency(e.target.value)}
                              aria-label="Payment frequency"
                            >
                              {PAYMENT_FREQUENCY_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Prepayment charge rule</label>
                            <select
                              className="product-generator__select"
                              value={prepaymentChargeRule}
                              onChange={(e) => setPrepaymentChargeRule(e.target.value)}
                              aria-label="Prepayment charge rule"
                            >
                              {PREPAYMENT_CHARGE_RULE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Prepayment privilege type</label>
                            <select
                              className="product-generator__select"
                              value={prepaymentPrivilegeType}
                              onChange={(e) => setPrepaymentPrivilegeType(e.target.value)}
                              aria-label="Prepayment privilege type"
                            >
                              {PREPAYMENT_PRIVILEGE_TYPE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Prepayment privilege amount</label>
                            <input
                              type="text"
                              className="product-generator__input"
                              value={prepaymentPrivilegeAmount}
                              onChange={(e) => setPrepaymentPrivilegeAmount(e.target.value)}
                              aria-label="Prepayment privilege amount"
                            />
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Prepayment charge static amount</label>
                            <input
                              type="text"
                              className="product-generator__input"
                              value={prepaymentChargeStaticAmount}
                              onChange={(e) => setPrepaymentChargeStaticAmount(e.target.value)}
                              aria-label="Prepayment charge static amount"
                            />
                          </div>
                          <div className="product-generator__field-cell product-generator__field-cell--toggle-row">
                            <label className="product-generator__label">Payment frequency change allowed</label>
                            <label className="product-generator__toggle">
                              <input
                                type="checkbox"
                                checked={paymentFrequencyChangeAllowed}
                                onChange={(e) => setPaymentFrequencyChangeAllowed(e.target.checked)}
                                aria-label="Payment frequency change allowed"
                              />
                              <span className="product-generator__toggle-slider" aria-hidden />
                            </label>
                          </div>
                          <div className="product-generator__field-cell product-generator__field-cell--toggle-row">
                            <label className="product-generator__label">Prepayment double option</label>
                            <label className="product-generator__toggle">
                              <input
                                type="checkbox"
                                checked={prepaymentDoubleOption}
                                onChange={(e) => setPrepaymentDoubleOption(e.target.checked)}
                                aria-label="Prepayment double option"
                              />
                              <span className="product-generator__toggle-slider" aria-hidden />
                            </label>
                          </div>
                          <div className="product-generator__optional-field-row">
                            <div className="product-generator__field-cell product-generator__optional-field-control">
                              <label className="product-generator__label">Prepayment year boundary</label>
                              <select
                                className="product-generator__select"
                                value={prepaymentYearBoundary}
                                onChange={(e) => setPrepaymentYearBoundary(e.target.value)}
                                aria-label="Prepayment year boundary"
                              >
                                {PREPAYMENT_YEAR_BOUNDARY_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                            <button type="button" className="product-generator__optional-field-remove" aria-label="Remove Prepayment year boundary">
                              <TrashSimple size={16} weight="regular" aria-hidden />
                            </button>
                          </div>
                          <div className="product-generator__optional-field-row">
                            <div className="product-generator__field-cell product-generator__optional-field-control">
                              <label className="product-generator__label">Lump sum minimum</label>
                              <input
                                type="text"
                                className="product-generator__input"
                                value={lumpSumMinimum}
                                onChange={(e) => setLumpSumMinimum(e.target.value)}
                                aria-label="Lump sum minimum"
                              />
                            </div>
                            <button type="button" className="product-generator__optional-field-remove" aria-label="Remove Lump sum minimum">
                              <TrashSimple size={16} weight="regular" aria-hidden />
                            </button>
                          </div>
                          <div className="product-generator__optional-field-row">
                            <div className="product-generator__field-cell product-generator__optional-field-control">
                              <label className="product-generator__label">Prepayment increase type</label>
                              <select
                                className="product-generator__select"
                                value={prepaymentIncreaseType}
                                onChange={(e) => setPrepaymentIncreaseType(e.target.value)}
                                aria-label="Prepayment increase type"
                              >
                                <option value="">Select…</option>
                                {PREPAYMENT_INCREASE_TYPE_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                            <button type="button" className="product-generator__optional-field-remove" aria-label="Remove Prepayment increase type">
                              <TrashSimple size={16} weight="regular" aria-hidden />
                            </button>
                          </div>
                          <div className="product-generator__field-cell product-generator__field-cell--toggle-row">
                            <label className="product-generator__label">Lump sum multiple allowed</label>
                            <label className="product-generator__toggle">
                              <input
                                type="checkbox"
                                checked={lumpSumMultipleAllowed}
                                onChange={(e) => setLumpSumMultipleAllowed(e.target.checked)}
                                aria-label="Lump sum multiple allowed"
                              />
                              <span className="product-generator__toggle-slider" aria-hidden />
                            </label>
                          </div>
                          <div className="product-generator__optional-field-row">
                            <div className="product-generator__field-cell product-generator__optional-field-control">
                              <label className="product-generator__label">Insurance provider</label>
                              <input
                                type="text"
                                className="product-generator__input"
                                value={insuranceProvider}
                                onChange={(e) => setInsuranceProvider(e.target.value)}
                                placeholder=""
                                aria-label="Insurance provider"
                              />
                            </div>
                            <button type="button" className="product-generator__optional-field-remove" aria-label="Remove Insurance provider">
                              <TrashSimple size={16} weight="regular" aria-hidden />
                            </button>
                          </div>
                        </div>
                        <div className="product-generator__add-optional-wrap">
                          <Button
                            type="button"
                            variant="alt"
                            size="small"
                            className="product-generator__add-optional-trigger"
                            onClick={() => setAddOptionalMortgageOpen((o) => !o)}
                            aria-expanded={addOptionalMortgageOpen}
                            aria-haspopup="listbox"
                            aria-label="Add optional field"
                            leftIcon={<Plus size={16} weight="regular" aria-hidden />}
                            rightIcon={<CaretDown size={16} weight="regular" aria-hidden />}
                          >
                            Add optional field
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* FAMILY ATTRIBUTE */}
                    <div className="product-generator__card">
                      <div className="product-generator__card-header">
                        <h3 className="product-generator__card-title">FAMILY ATTRIBUTE</h3>
                      </div>
                      <div className="product-generator__subsection">
                        <div className="product-generator__general-fields">
                          <div className="product-generator__optional-field-row">
                            <div className="product-generator__field-cell product-generator__optional-field-control">
                              <label className="product-generator__label">Custom attribute 1</label>
                              <select
                                className="product-generator__select"
                                value={customAttributeValue}
                                onChange={(e) => setCustomAttributeValue(e.target.value)}
                                aria-label="Custom attribute 1"
                              >
                                <option value="">Select value</option>
                              </select>
                            </div>
                            <button type="button" className="product-generator__optional-field-remove" aria-label="Remove Custom attribute 1">
                              <TrashSimple size={16} weight="regular" aria-hidden />
                            </button>
                          </div>
                        </div>
                        <div className="product-generator__add-optional-wrap">
                          <Button
                            type="button"
                            variant="alt"
                            size="small"
                            className="product-generator__add-optional-trigger"
                            onClick={() => setAddAttributeOpen((o) => !o)}
                            aria-expanded={addAttributeOpen}
                            aria-label="Add attribute"
                            leftIcon={<Plus size={16} weight="regular" aria-hidden />}
                          >
                            Add attribute
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* SERVICEABLE */}
                    <div className="product-generator__card">
                      <div className="product-generator__card-header product-family-detail__card-header-with-toggle">
                        <h3 className="product-generator__card-title">SERVICEABLE</h3>
                        <label className="product-generator__toggle">
                          <input
                            type="checkbox"
                            checked={serviceable}
                            onChange={(e) => setServiceable(e.target.checked)}
                            aria-label="Serviceable"
                          />
                          <span className="product-generator__toggle-slider" aria-hidden />
                        </label>
                      </div>
                      <div className="product-generator__subsection product-generator__subsection--inline">
                        <div className="product-generator__general-fields">
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Penalty IRD calculation strategy</label>
                            <select className="product-generator__select" defaultValue="Simplified_IRD" aria-label="Penalty IRD calculation strategy">
                              {PENALTY_IRD_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Penalty months of interest</label>
                            <input type="text" className="product-generator__input" placeholder="" aria-label="Penalty months of interest" />
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Penalty extra fees</label>
                            <input type="text" className="product-generator__input" placeholder="" aria-label="Penalty extra fees" />
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Pre-payment lump sum minimum amount</label>
                            <div className="product-family-detail__input-with-unit">
                              <input type="text" className="product-generator__input" placeholder="" aria-label="Pre-payment lump sum minimum amount" />
                              <span className="product-family-detail__unit">%</span>
                            </div>
                          </div>
                          <div className="product-generator__field-cell product-generator__field-cell--toggle-row">
                            <label className="product-generator__label">Pre-payment lump sum allowed beyond yearly eligible</label>
                            <label className="product-generator__toggle">
                              <input type="checkbox" defaultChecked aria-label="Pre-payment lump sum allowed beyond yearly eligible" />
                              <span className="product-generator__toggle-slider" aria-hidden />
                            </label>
                          </div>
                          <div className="product-generator__field-cell product-generator__field-cell--toggle-row">
                            <label className="product-generator__label">Payment increase locked</label>
                            <label className="product-generator__toggle">
                              <input type="checkbox" defaultChecked aria-label="Payment increase locked" />
                              <span className="product-generator__toggle-slider" aria-hidden />
                            </label>
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Pre-payment option year boundary</label>
                            <select className="product-generator__select" defaultValue="MORTGAGE_ANNIVERSARY" aria-label="Pre-payment option year boundary">
                              {PREPAYMENT_OPTION_YEAR_BOUNDARY_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="product-generator__field-cell product-generator__field-cell--toggle-row">
                            <label className="product-generator__label">Pre-payment lump sum max count per year</label>
                            <label className="product-generator__toggle">
                              <input type="checkbox" defaultChecked aria-label="Pre-payment lump sum max count per year" />
                              <span className="product-generator__toggle-slider" aria-hidden />
                            </label>
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Addons</label>
                            <input type="text" className="product-generator__input" placeholder="" aria-label="Addons" />
                          </div>
                          <div className="product-generator__field-cell product-generator__field-cell--toggle-row">
                            <label className="product-generator__label">Payment frequency change max count per year</label>
                            <label className="product-generator__toggle">
                              <input type="checkbox" defaultChecked aria-label="Payment frequency change max count per year" />
                              <span className="product-generator__toggle-slider" aria-hidden />
                            </label>
                          </div>
                          <div className="product-generator__field-cell product-generator__field-cell--toggle-row">
                            <label className="product-generator__label">Prepayment base increase max count per year</label>
                            <label className="product-generator__toggle">
                              <input type="checkbox" defaultChecked aria-label="Prepayment base increase max count per year" />
                              <span className="product-generator__toggle-slider" aria-hidden />
                            </label>
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Interest calculation compound period</label>
                            <select className="product-generator__select" defaultValue="SEMIANNUALLY" aria-label="Interest calculation compound period">
                              {INTEREST_CALCULATION_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="product-generator__field-cell product-generator__field-cell--toggle-row">
                            <label className="product-generator__label">Pre-payment reduce base increase option</label>
                            <label className="product-generator__toggle">
                              <input type="checkbox" defaultChecked aria-label="Pre-payment reduce base increase option" />
                              <span className="product-generator__toggle-slider" aria-hidden />
                            </label>
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Payment frequency change free count per year</label>
                            <select className="product-generator__select" defaultValue="PAYMENT FREQUENCY CHANGE" aria-label="Payment frequency change free count per year">
                              {PAYMENT_FREQUENCY_CHANGE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Year boundary</label>
                            <select className="product-generator__select" defaultValue="ANNIVERSARY" aria-label="Year boundary">
                              {YEAR_BOUNDARY_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Rate compounding period</label>
                            <select className="product-generator__select" defaultValue="SEMI_ANNUAL" aria-label="Rate compounding period">
                              {RATE_COMPOUNDING_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Penalty mortgage balance percent</label>
                            <div className="product-family-detail__input-with-unit">
                              <input type="text" className="product-generator__input" placeholder="" aria-label="Penalty mortgage balance percent" />
                              <span className="product-family-detail__unit">%</span>
                            </div>
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Pre-payment lump sum yearly eligible percent</label>
                            <input type="text" className="product-generator__input" placeholder="" aria-label="Pre-payment lump sum yearly eligible percent" />
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Prepayment increase period</label>
                            <select className="product-generator__select" defaultValue="YEAR" aria-label="Prepayment increase period">
                              {PREPAYMENT_INCREASE_PERIOD_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="product-generator__field-cell product-generator__field-cell--toggle-row">
                            <label className="product-generator__label">Pre-payment double max count per year</label>
                            <label className="product-generator__toggle">
                              <input type="checkbox" defaultChecked aria-label="Pre-payment double max count per year" />
                              <span className="product-generator__toggle-slider" aria-hidden />
                            </label>
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Pre-payment base increase percent</label>
                            <input type="text" className="product-generator__input" placeholder="" aria-label="Pre-payment base increase percent" />
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Prime rate update strategy</label>
                            <select className="product-generator__select" defaultValue="START_OF_CYCLE" aria-label="Prime rate update strategy">
                              {PRIME_RATE_UPDATE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Pre-payment pool option</label>
                            <select className="product-generator__select" defaultValue="SHARED" aria-label="Pre-payment pool option">
                              {PREPAYMENT_POOL_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="product-generator__field-cell">
                            <label className="product-generator__label">Product variable type</label>
                            <select className="product-generator__select" defaultValue="ARM" aria-label="Product variable type">
                              {PRODUCT_VARIABLE_TYPE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
          <footer className="product-family-detail__footer">
            <Button intent="brand" variant="primary" size="medium" className="product-family-detail__save">
              ✓ Save
            </Button>
          </footer>
        </div>
      </div>
    </div>
  );
}
