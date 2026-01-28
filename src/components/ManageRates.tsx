import { useState, useCallback } from "react";
import {
  ArrowLeft,
  AnchorSimple,
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

const ANCHOR_RATES = [
  { id: "prime", label: "Prime rate (4.95%)", value: 4.95 },
  { id: "lender", label: "Lender base (4.20%)", value: 4.2 },
];

const SUBRATE_TYPES = ["Target rate", "Ceiling rate", "Posted rate", "Floor rate"] as const;
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
  onBack,
  onSave,
  onLogout,
}: {
  workspace: Workspace;
  product: ShelfProduct;
  onBack: () => void;
  onSave?: (productId: string, rate: ProductRate) => void;
  onLogout?: () => void;
}) {
  const [baseType, setBaseType] = useState<"static" | "relative">("static");
  const [baseStaticRate, setBaseStaticRate] = useState(4.4);
  const [baseAnchorId, setBaseAnchorId] = useState(ANCHOR_RATES[0].id);
  const [baseAdjustment, setBaseAdjustment] = useState(1);

  const [subrates, setSubrates] = useState<SubrateRow[]>([
    { id: nextSubrateId(), subrateType: "Target rate", valueType: "Static", staticRate: 4.45, adjustment: 0 },
    { id: nextSubrateId(), subrateType: "Ceiling rate", valueType: "Static", staticRate: 4.45, adjustment: 0 },
    { id: nextSubrateId(), subrateType: "Posted rate", valueType: "Relative to base", staticRate: 0, adjustment: 1 },
  ]);

  const baseCalculated =
    baseType === "static" ? baseStaticRate : (ANCHOR_RATES.find((a) => a.id === baseAnchorId)?.value ?? 0) + baseAdjustment;

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
    const rate: ProductRate = { baseRatePercent: baseCalculated };
    for (const row of subrates) {
      const value = subrateCalculated(row);
      if (row.subrateType === "Target rate") rate.targetRate = value;
      else if (row.subrateType === "Ceiling rate") rate.ceilingRate = value;
      else if (row.subrateType === "Posted rate") rate.postedRate = value;
      else if (row.subrateType === "Floor rate") rate.floorRate = value;
    }
    onSave?.(product.id, rate);
  }, [baseCalculated, subrates, product.id, onSave]);

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
          shelfCount={60}
          familiesCount={0}
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
                  <h2 className="manage-rates__card-title">Base rate</h2>
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
                    <div className="manage-rates__field-row">
                      <label className="manage-rates__label">Rate</label>
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
                  )}

                  {baseType === "relative" && (
                    <div className="manage-rates__relative-block">
                      <div className="manage-rates__field-row">
                        <label className="manage-rates__label">Anchor</label>
                        <select
                          className="manage-rates__select"
                          value={baseAnchorId}
                          onChange={(e) => setBaseAnchorId(e.target.value)}
                        >
                          {ANCHOR_RATES.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="manage-rates__field-row manage-rates__field-row--label-above">
                        <label className="manage-rates__label">Adjustment</label>
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
                    </div>
                  )}

                  <p className="manage-rates__calculated">
                    Calculated rate: <span className="manage-rates__calculated-value manage-rates__rate-badge">{baseCalculated.toFixed(2)}%</span>
                  </p>
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
                      <div className="manage-rates__subrate-row manage-rates__subrate-row--first">
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
                        <Button
                          type="button"
                          intent="negative"
                          variant="ghost"
                          size="xsmall"
                          iconOnly
                          onClick={() => removeSubrate(row.id)}
                          aria-label="Remove subrate"
                          className="manage-rates__delete-btn"
                        >
                          <TrashSimple size={18} weight="regular" aria-hidden />
                        </Button>
                      </div>
                      <div className="manage-rates__subrate-row manage-rates__subrate-row--second">
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
                        <span className="manage-rates__subrate-calc">Calculated rate: <span className="manage-rates__rate-badge">{subrateCalculated(row).toFixed(2)}%</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="manage-rates__section">
                <div className="manage-rates__card">
                  <h2 className="manage-rates__card-title">Timeline</h2>
                  <div className="manage-rates__date-row-pair">
                    <div className="manage-rates__field-row manage-rates__field-row--label-above manage-rates__date-row">
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
                  </div>
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
              intent="negative"
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
