import { useState, useCallback } from "react";
import {
  ArrowLeft,
  AnchorSimple,
  CaretDown,
  Tilde,
  TrashSimple,
  CalendarBlank,
  Clock,
  Check,
  Plus,
  Minus,
} from "@phosphor-icons/react";
import type { Workspace } from "./SelectWorkspace";
import type { ShelfProduct, ProductRate } from "../types";
import { Button } from "./ui/Button";
import { SideNav } from "./SideNav";
import "./ManageRates.css";

/** Optional timeline fields: Expiry date, Channel (Broker/Branch). */
const TIMELINE_OPTIONAL_OPTIONS = [
  { id: "expiryDate" as const, label: "Expiry date" },
  { id: "channel" as const, label: "Channel" },
] as const;
const CHANNEL_OPTIONS = ["Broker", "Branch"] as const;

const ANCHOR_RATES = [
  { id: "prime", label: "Prime rate (4.95%)", value: 4.95 },
  { id: "lender", label: "Lender base (4.20%)", value: 4.2 },
];

const RATE_TYPES = ["Fixed", "Variable", "Adjustable"] as const;
const SUBRATE_TYPES = ["Target rate", "Ceiling rate", "Floor rate"] as const;
const SUBRATE_VALUE_TYPES = ["Static", "Relative to base"] as const;

export interface SubrateRow {
  id: string;
  subrateType: (typeof SUBRATE_TYPES)[number];
  valueType: (typeof SUBRATE_VALUE_TYPES)[number];
  staticRate: number;
  adjustment: number;
}

let subrateId = 0;
function nextSubrateId() {
  return `sub-${++subrateId}`;
}

export function ManageRates({
  workspace,
  product,
  shelfCount = 0,
  familiesCount = 0,
  onBack,
  onSave,
  onLogout,
}: {
  workspace: Workspace;
  product: ShelfProduct;
  shelfCount?: number;
  familiesCount?: number;
  onBack: () => void;
  onSave?: (productId: string, rate: ProductRate) => void;
  onLogout?: () => void;
}) {
  const [rateType, setRateType] = useState(product.rateType || "Fixed");
  const [baseType, setBaseType] = useState<"static" | "relative">("static");
  const [baseStaticRate, setBaseStaticRate] = useState(4.4);
  const [lenderSpread, setLenderSpread] = useState(0);
  const [investorSpread, setInvestorSpread] = useState(0);
  const [baseAnchorId, setBaseAnchorId] = useState(ANCHOR_RATES[0].id);
  const [baseAdjustment, setBaseAdjustment] = useState(1);
  const [netRateOverride, setNetRateOverride] = useState<number | null>(null);

  const [subrates, setSubrates] = useState<SubrateRow[]>([
    { id: nextSubrateId(), subrateType: "Floor rate", valueType: "Static", staticRate: 4.45, adjustment: 0 },
    { id: nextSubrateId(), subrateType: "Ceiling rate", valueType: "Static", staticRate: 4.45, adjustment: 0 },
    { id: nextSubrateId(), subrateType: "Target rate", valueType: "Static", staticRate: 4.45, adjustment: 0 },
  ]);

  const [showExpiryDate, setShowExpiryDate] = useState(false);
  const [showChannel, setShowChannel] = useState(false);
  const [channelValue, setChannelValue] = useState<typeof CHANNEL_OPTIONS[number] | "">("");
  const [addOptionalDropdownOpen, setAddOptionalDropdownOpen] = useState(false);

  const baseCalculated =
    baseType === "static" ? baseStaticRate : (ANCHOR_RATES.find((a) => a.id === baseAnchorId)?.value ?? 0) + baseAdjustment;
  const netRateCalculated = baseCalculated + lenderSpread + investorSpread;
  const effectiveNetRate = netRateOverride ?? netRateCalculated;

  const updateSubrate = useCallback((id: string, updates: Partial<SubrateRow>) => {
    setSubrates((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const addSubrate = useCallback(() => {
    setSubrates((prev) => [
      ...prev,
      {
        id: nextSubrateId(),
        subrateType: "Target rate",
        valueType: "Static",
        staticRate: 4.45,
        adjustment: 0,
      },
    ]);
  }, []);

  const removeSubrate = useCallback((id: string) => {
    setSubrates((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const subrateCalculated = (row: SubrateRow) =>
    row.valueType === "Static" ? row.staticRate : baseCalculated + row.adjustment;

  const handleSave = useCallback(() => {
    const rate: ProductRate = { baseRatePercent: effectiveNetRate };
    for (const row of subrates) {
      const value = subrateCalculated(row);
      if (row.subrateType === "Target rate") rate.targetRate = value;
      else if (row.subrateType === "Ceiling rate") rate.ceilingRate = value;
      else if (row.subrateType === "Floor rate") rate.floorRate = value;
    }
    onSave?.(product.id, rate);
  }, [effectiveNetRate, subrates, product.id, onSave]);

  return (
    <div className="manage-rates">
      <div className="manage-rates__body">
        <SideNav
          tenantName={workspace.name}
          lenderName="TD residential"
          userName="Josée Racicot"
          userEmail="josee.racicot@nesto.ca"
          userInitial="JR"
          currentSection="shelf"
          shelfCount={shelfCount}
          familiesCount={familiesCount}
          onNavigate={(section) => {
            if (section === "shelf") onBack();
          }}
          onSignOut={() => onLogout?.()}
        />

        <div className="manage-rates__main">
          <header className="manage-rates__header">
            <nav className="manage-rates__breadcrumb" aria-label="Breadcrumb">
              <Button
                variant="ghost"
                size="medium"
                onClick={onBack}
                className="manage-rates__breadcrumb-back"
                leftIcon={<ArrowLeft size={20} weight="regular" aria-hidden />}
              >
                Back to Main shelf
              </Button>
              <span className="manage-rates__breadcrumb-sep">|</span>
              <span className="manage-rates__breadcrumb-title">Rate for {product.name}</span>
            </nav>
            <span className="manage-rates__draft">Draft</span>
          </header>

          <div className="manage-rates__scroll">
            <div className="manage-rates__scroll-content">
              <section className="manage-rates__section">
                <div className="manage-rates__card">
                  <h2 className="manage-rates__card-title">General</h2>
                  <div className="manage-rates__field-row manage-rates__rate-field manage-rates__rate-type-row">
                    <label className="manage-rates__label">Rate type</label>
                    <select
                      className="manage-rates__select"
                      value={rateType}
                      onChange={(e) => setRateType(e.target.value)}
                      aria-label="Rate type"
                    >
                      {RATE_TYPES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="manage-rates__base-type">
                    <label className={`manage-rates__type-option ${baseType === "static" ? "manage-rates__type-option--active" : ""}`}>
                      <input
                        type="radio"
                        name="baseType"
                        checked={baseType === "static"}
                        onChange={() => setBaseType("static")}
                      />
                      <div className="manage-rates__type-content">
                        <AnchorSimple size={20} weight="regular" className="manage-rates__type-icon" aria-hidden />
                        <span className="manage-rates__type-label">Static</span>
                        <span className="manage-rates__type-desc">Standalone value</span>
                      </div>
                    </label>
                    <label className={`manage-rates__type-option ${baseType === "relative" ? "manage-rates__type-option--active" : ""}`}>
                      <input
                        type="radio"
                        name="baseType"
                        checked={baseType === "relative"}
                        onChange={() => setBaseType("relative")}
                      />
                      <div className="manage-rates__type-content">
                        <Tilde size={20} weight="regular" className="manage-rates__type-icon" aria-hidden />
                        <span className="manage-rates__type-label">Relative</span>
                        <span className="manage-rates__type-desc">
                          {baseType === "relative" ? "References the lender rate as an anchor" : "References an anchor"}
                        </span>
                      </div>
                    </label>
                  </div>

                  {baseType === "static" && (
                    <div className="manage-rates__rate-fields-row">
                      <div className="manage-rates__field-row manage-rates__rate-field">
                        <label className="manage-rates__label">Base rate</label>
                        <div className="manage-rates__input-wrap">
                          <input
                            type="number"
                            step="0.01"
                            className="manage-rates__input"
                            value={baseStaticRate}
                            onChange={(e) => setBaseStaticRate(Number(e.target.value) || 0)}
                          />
                          <span className="manage-rates__unit">%</span>
                        </div>
                      </div>
                      <div className="manage-rates__field-row manage-rates__rate-field">
                        <label className="manage-rates__label">Lender spread</label>
                        <div className="manage-rates__input-wrap">
                          <input
                            type="number"
                            step="0.01"
                            className="manage-rates__input"
                            value={lenderSpread}
                            onChange={(e) => setLenderSpread(Number(e.target.value) || 0)}
                          />
                          <span className="manage-rates__unit">%</span>
                        </div>
                      </div>
                      <div className="manage-rates__field-row manage-rates__rate-field">
                        <label className="manage-rates__label">Investor spread</label>
                        <div className="manage-rates__input-wrap">
                          <input
                            type="number"
                            step="0.01"
                            className="manage-rates__input"
                            value={investorSpread}
                            onChange={(e) => setInvestorSpread(Number(e.target.value) || 0)}
                          />
                          <span className="manage-rates__unit">%</span>
                        </div>
                      </div>
                      <div className="manage-rates__field-row manage-rates__rate-field">
                        <label className="manage-rates__label">Net rate</label>
                        <div className="manage-rates__input-wrap">
                          <input
                            type="number"
                            step="0.01"
                            className="manage-rates__input"
                            value={effectiveNetRate}
                            onChange={(e) => {
                              const v = e.target.value;
                              const num = v === "" ? null : parseFloat(v);
                              setNetRateOverride(num !== null && !Number.isNaN(num) ? num : null);
                            }}
                            aria-label="Net rate"
                          />
                          <span className="manage-rates__unit">%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {baseType === "relative" && (
                    <div className="manage-rates__rate-fields-row">
                      <div className="manage-rates__field-row manage-rates__rate-field">
                        <label className="manage-rates__label">Base rate anchor</label>
                        <select
                          className="manage-rates__select"
                          value={baseAnchorId}
                          onChange={(e) => setBaseAnchorId(e.target.value)}
                          aria-label="Base rate anchor"
                        >
                          {ANCHOR_RATES.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="manage-rates__field-row manage-rates__rate-field">
                        <label className="manage-rates__label">Base rate adjustment</label>
                        <div className="manage-rates__input-inline">
                          <div className="manage-rates__stepper">
                            <button
                              type="button"
                              className="manage-rates__stepper-btn"
                              onClick={() => setBaseAdjustment((v) => v - 0.25)}
                              aria-label="Decrease"
                            >
                              <Minus size={18} weight="bold" aria-hidden />
                            </button>
                            <input
                              type="number"
                              step="0.25"
                              className="manage-rates__stepper-input"
                              value={baseAdjustment}
                              onChange={(e) => setBaseAdjustment(Number(e.target.value) || 0)}
                            />
                            <button
                              type="button"
                              className="manage-rates__stepper-btn"
                              onClick={() => setBaseAdjustment((v) => v + 0.25)}
                              aria-label="Increase"
                            >
                              <Plus size={18} weight="bold" aria-hidden />
                            </button>
                          </div>
                          <span className="manage-rates__unit">%</span>
                        </div>
                      </div>
                      <div className="manage-rates__field-row manage-rates__rate-field">
                        <label className="manage-rates__label">Lender spread</label>
                        <div className="manage-rates__input-wrap">
                          <input
                            type="number"
                            step="0.01"
                            className="manage-rates__input"
                            value={lenderSpread}
                            onChange={(e) => setLenderSpread(Number(e.target.value) || 0)}
                          />
                          <span className="manage-rates__unit">%</span>
                        </div>
                      </div>
                      <div className="manage-rates__field-row manage-rates__rate-field">
                        <label className="manage-rates__label">Investor spread</label>
                        <div className="manage-rates__input-wrap">
                          <input
                            type="number"
                            step="0.01"
                            className="manage-rates__input"
                            value={investorSpread}
                            onChange={(e) => setInvestorSpread(Number(e.target.value) || 0)}
                          />
                          <span className="manage-rates__unit">%</span>
                        </div>
                      </div>
                      <div className="manage-rates__field-row manage-rates__rate-field">
                        <label className="manage-rates__label">Net rate</label>
                        <div className="manage-rates__input-wrap">
                          <input
                            type="number"
                            step="0.01"
                            className="manage-rates__input"
                            value={effectiveNetRate}
                            onChange={(e) => {
                              const v = e.target.value;
                              const num = v === "" ? null : parseFloat(v);
                              setNetRateOverride(num !== null && !Number.isNaN(num) ? num : null);
                            }}
                            aria-label="Net rate"
                          />
                          <span className="manage-rates__unit">%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="manage-rates__misc-subsection">
                    <div className="manage-rates__misc-fields-grid">
                      <div className="manage-rates__field-row manage-rates__field-row--label-above manage-rates__date-row manage-rates__misc-field">
                        <label className="manage-rates__label">Effective date</label>
                        <div className="manage-rates__input-with-icons">
                          <CalendarBlank size={18} weight="regular" className="manage-rates__input-icon" aria-hidden />
                          <input
                            type="text"
                            className="manage-rates__input manage-rates__input--date"
                            placeholder="YYYY | MM | DD, 12:30:00 PM"
                            readOnly
                          />
                        </div>
                      </div>
                      {showExpiryDate && (
                        <div className="manage-rates__optional-date-row manage-rates__misc-field">
                          <div className="manage-rates__field-row manage-rates__field-row--label-above manage-rates__date-row">
                            <label className="manage-rates__label">Expiry date</label>
                            <div className="manage-rates__input-with-icons">
                              <CalendarBlank size={18} weight="regular" className="manage-rates__input-icon" aria-hidden />
                              <input
                                type="text"
                                className="manage-rates__input manage-rates__input--date"
                                placeholder="YYYY | MM | DD, 12:30:00 PM"
                                readOnly
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            className="manage-rates__optional-field-remove"
                            onClick={() => setShowExpiryDate(false)}
                            aria-label="Remove Expiry date"
                          >
                            <TrashSimple size={16} weight="regular" aria-hidden />
                          </button>
                        </div>
                      )}
                      {showChannel && (
                        <div className="manage-rates__optional-date-row manage-rates__misc-field">
                          <div className="manage-rates__field-row manage-rates__field-row--label-above manage-rates__date-row">
                            <label className="manage-rates__label">Channel</label>
                            <div className="manage-rates__input-wrap">
                              <select
                                className="manage-rates__select"
                                value={channelValue}
                                onChange={(e) => setChannelValue(e.target.value as typeof CHANNEL_OPTIONS[number] | "")}
                                aria-label="Channel"
                              >
                                <option value="">Select…</option>
                                {CHANNEL_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="manage-rates__optional-field-remove"
                            onClick={() => {
                              setShowChannel(false);
                              setChannelValue("");
                            }}
                            aria-label="Remove Channel"
                          >
                            <TrashSimple size={16} weight="regular" aria-hidden />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="manage-rates__add-optional-wrap">
                      <Button
                        type="button"
                        variant="alt"
                        size="small"
                        className="manage-rates__add-optional-trigger"
                        onClick={() => setAddOptionalDropdownOpen((o) => !o)}
                        aria-expanded={addOptionalDropdownOpen}
                        aria-haspopup="listbox"
                        aria-label="Add optional field"
                        leftIcon={<Plus size={16} weight="regular" aria-hidden />}
                        rightIcon={<CaretDown size={16} weight="regular" aria-hidden />}
                      >
                        Add optional field
                      </Button>
                      {addOptionalDropdownOpen && (
                        <>
                          <div
                            className="manage-rates__add-optional-backdrop"
                            aria-hidden
                            onClick={() => setAddOptionalDropdownOpen(false)}
                          />
                          <ul
                            className="manage-rates__add-optional-dropdown"
                            role="listbox"
                            aria-label="Optional timeline fields"
                          >
                            {TIMELINE_OPTIONAL_OPTIONS.map((opt) => {
                              const isAdded =
                                (opt.id === "expiryDate" && showExpiryDate) || (opt.id === "channel" && showChannel);
                              const handleSelect = () => {
                                if (opt.id === "expiryDate" && !showExpiryDate) setShowExpiryDate(true);
                                if (opt.id === "channel" && !showChannel) setShowChannel(true);
                                setAddOptionalDropdownOpen(false);
                              };
                              return (
                                <li
                                  key={opt.id}
                                  role="option"
                                  aria-selected={isAdded}
                                  className={`manage-rates__add-optional-option ${isAdded ? "manage-rates__add-optional-option--added" : ""}`}
                                  onClick={() => !isAdded && handleSelect()}
                                >
                                  {opt.label}
                                  {isAdded && (
                                    <span className="manage-rates__add-optional-check" aria-hidden>
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
              </section>

              <section className="manage-rates__section">
                <div className="manage-rates__card">
                  <div className="manage-rates__card-head">
                    <h2 className="manage-rates__card-title">Subrates</h2>
                    <Button variant="alt" size="small" onClick={addSubrate} leftIcon={<Plus size={16} weight="bold" aria-hidden />}>
                      Add
                    </Button>
                  </div>

                  {subrates.map((row) => (
                    <div key={row.id} className="manage-rates__subrate-card">
                      <div className="manage-rates__subrate-row">
                        <div className="manage-rates__subrate-field">
                          <label className="manage-rates__label">Subrate</label>
                          <select
                            className="manage-rates__select manage-rates__select--sub"
                            value={row.subrateType}
                            onChange={(e) => updateSubrate(row.id, { subrateType: e.target.value as SubrateRow["subrateType"] })}
                          >
                            {SUBRATE_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="manage-rates__subrate-field">
                          <label className="manage-rates__label">Type</label>
                          <select
                            className="manage-rates__select manage-rates__select--sub"
                            value={row.valueType}
                            onChange={(e) => updateSubrate(row.id, { valueType: e.target.value as SubrateRow["valueType"] })}
                          >
                            {SUBRATE_VALUE_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="manage-rates__subrate-field">
                          {row.valueType === "Static" ? (
                            <>
                              <label className="manage-rates__label">Rate</label>
                              <div className="manage-rates__input-inline">
                                <input
                                  type="number"
                                  step="0.01"
                                  className="manage-rates__input manage-rates__input--sm"
                                  value={row.staticRate}
                                  onChange={(e) => updateSubrate(row.id, { staticRate: Number(e.target.value) || 0 })}
                                />
                                <span className="manage-rates__unit">%</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <label className="manage-rates__label">Rate adjustment</label>
                              <div className="manage-rates__input-inline">
                                <div className="manage-rates__stepper manage-rates__stepper--sm">
                                  <button
                                    type="button"
                                    className="manage-rates__stepper-btn"
                                    onClick={() => updateSubrate(row.id, { adjustment: row.adjustment - 0.25 })}
                                    aria-label="Decrease"
                                  >
                                    <Minus size={18} weight="bold" aria-hidden />
                                  </button>
                                  <input
                                    type="number"
                                    step="0.25"
                                    className="manage-rates__stepper-input"
                                    value={row.adjustment}
                                    onChange={(e) => updateSubrate(row.id, { adjustment: Number(e.target.value) || 0 })}
                                  />
                                  <button
                                    type="button"
                                    className="manage-rates__stepper-btn"
                                    onClick={() => updateSubrate(row.id, { adjustment: row.adjustment + 0.25 })}
                                    aria-label="Increase"
                                  >
                                    <Plus size={18} weight="bold" aria-hidden />
                                  </button>
                                </div>
                                <span className="manage-rates__unit">%</span>
                              </div>
                            </>
                          )}
                        </div>
                        <span className="manage-rates__subrate-calc">Net rate: <span className="manage-rates__rate-badge">{subrateCalculated(row).toFixed(2)}%</span></span>
                        <button
                          type="button"
                          className="manage-rates__delete-btn"
                          onClick={() => removeSubrate(row.id)}
                          aria-label="Remove subrate"
                        >
                          <TrashSimple size={16} weight="regular" aria-hidden />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <Button
                variant="secondary"
                size="medium"
                leftIcon={<Clock size={18} weight="regular" aria-hidden />}
                className="manage-rates__schedule-btn"
              >
                Schedule rate change
              </Button>
            </div>
          </div>

          <footer className="manage-rates__footer">
            <Button
              intent="brand"
              variant="primary"
              size="medium"
              leftIcon={<Check size={20} weight="bold" aria-hidden />}
              onClick={handleSave}
              className="manage-rates__footer-btn"
            >
              Save
            </Button>
          </footer>
        </div>
      </div>
    </div>
  );
}
