import { useState, useCallback } from "react";
import type { Workspace } from "./SelectWorkspace";
import type { ShelfProduct } from "../types";
import { Button } from "./ui/Button";
import { SelectionBar } from "./SelectionBar";
import { SideNav } from "./SideNav";
import "./MainShelf.css";

function KebabIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="4" r="1.5" fill="currentColor" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      <circle cx="10" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2 3h12M4 8h8M6 13h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatRate(value: number | undefined): string {
  return value != null ? `${Number(value).toFixed(2)}%` : "—";
}

export function MainShelf({
  workspace,
  products,
  familiesCount = 0,
  onLogout,
  onCreateProduct,
  onManageRates,
  onProductFamilies,
  onTenantSettings,
  onLenderSettings,
  onProductClick,
}: {
  workspace: Workspace;
  products: ShelfProduct[];
  familiesCount?: number;
  onLogout: () => void;
  onCreateProduct: () => void;
  onManageRates?: (product: ShelfProduct) => void;
  onProductFamilies?: () => void;
  onTenantSettings?: () => void;
  onLenderSettings?: () => void;
  onProductClick?: (product: ShelfProduct) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const selectedCount = selectedIds.size;
  const showBar = selectedCount > 0;

  const handleManageRate = useCallback(() => {
    if (selectedCount === 1 && onManageRates) {
      const product = products.find((p) => selectedIds.has(p.id));
      if (product) onManageRates(product);
    }
  }, [selectedCount, selectedIds, products, onManageRates]);

  return (
    <div className="main-shelf">
      <div className="main-shelf__body">
        <SideNav
          tenantName={workspace.name}
          lenderName="TD residential"
          userName="Josée Racicot"
          userEmail="josee.racicot@nesto.ca"
          userInitial="JR"
          currentSection="shelf"
          shelfCount={products.length}
          familiesCount={familiesCount}
          onNavigate={(section) => {
            if (section === "product-families") onProductFamilies?.();
          }}
          onSignOut={onLogout}
          onTenantSettings={onTenantSettings}
          onLenderSettings={onLenderSettings}
        />

        <main className="main-shelf__content">
          <header className="main-shelf__content-header">
            <div className="main-shelf__content-header-left">
              <h1 className="main-shelf__content-title">
                Main shelf
                <span className="main-shelf__content-badge" aria-hidden>
                  {products.length}
                </span>
              </h1>
              <p className="main-shelf__content-subtitle">
                View all product instances generated from your product lines within
                this shelf and monitor key metrics.
              </p>
            </div>
            <div className="main-shelf__content-header-actions">
              <Button variant="alt" size="medium" className="main-shelf__content-header-btn">
                Manage
              </Button>
              <Button variant="secondary" size="medium" onClick={onCreateProduct} className="main-shelf__content-header-btn">
                + Create product
              </Button>
              <Button variant="primary" size="medium" className="main-shelf__content-header-btn">
                Publish all
              </Button>
            </div>
          </header>

          <div className="main-shelf__toolbar">
            <div className="main-shelf__search">
              <SearchIcon />
              <input
                type="search"
                placeholder="Search"
                className="main-shelf__search-input"
                aria-label="Search main shelf"
              />
            </div>
            <button type="button" className="main-shelf__filters-btn">
              <FilterIcon />
              Filters
            </button>
          </div>

          <div className="main-shelf__table-area">
            <div className="main-shelf__table-wrapper">
            <table className="main-shelf__table">
              <thead>
                <tr>
                  <th className="main-shelf__th-checkbox" aria-label="Select row">
                    <input
                      type="checkbox"
                      checked={selectedCount === products.length && products.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(new Set(products.map((p) => p.id)));
                        else setSelectedIds(new Set());
                      }}
                      aria-label="Select all"
                    />
                  </th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Description (ID)</th>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Visibility</th>
                  <th>Rate audience</th>
                  <th>Base rate</th>
                  <th>Target rate</th>
                  <th>Ceiling rate</th>
                  <th>Floor rate</th>
                  <th>Effective date</th>
                  <th>Property value max</th>
                  <th>Credit score max</th>
                  <th>Expiry date</th>
                  <th>Product category</th>
                  <th>Product type</th>
                  <th>Repayment type</th>
                  <th>Transaction type</th>
                  <th>Product family</th>
                  <th>Term (years)</th>
                  <th>Rate type</th>
                  <th>LTV range</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {products.map((row) => (
                  <tr
                    key={row.id}
                    className={selectedIds.has(row.id) ? "main-shelf__row--selected" : ""}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest(".main-shelf__td-checkbox")) return;
                      onProductClick?.(row);
                    }}
                  >
                    <td className="main-shelf__td-checkbox" onClick={(e) => { e.stopPropagation(); toggleSelection(row.id); }}>
                      <label className="main-shelf__checkbox-label" aria-hidden onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row.id)}
                          onChange={() => toggleSelection(row.id)}
                          aria-label={`Select ${row.name}`}
                        />
                      </label>
                    </td>
                    <td>{row.name}</td>
                    <td>{row.description}</td>
                    <td>{row.descriptionId}</td>
                    <td>{row.productId}</td>
                    <td>
                      <span
                        className={`main-shelf__badge main-shelf__badge--${row.status.toLowerCase()}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <span className="main-shelf__badge main-shelf__badge--muted">
                        all channels
                      </span>
                    </td>
                    <td>
                      <span className="main-shelf__badge main-shelf__badge--muted">
                        {row.rateEmbodiment}
                      </span>
                    </td>
                    <td>
                      {row.rate?.baseRatePercent != null ? (
                        <span className="main-shelf__rate-value">{Number(row.rate.baseRatePercent).toFixed(2)}%</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{formatRate(row.rate?.targetRate)}</td>
                    <td>{formatRate(row.rate?.ceilingRate)}</td>
                    <td>{formatRate(row.rate?.floorRate)}</td>
                    <td>{row.effectiveDate}</td>
                    <td>{row.propertyValueMax != null && row.propertyValueMax !== "" ? String(row.propertyValueMax) : "—"}</td>
                    <td>{row.creditScoreMax != null && row.creditScoreMax !== "" ? String(row.creditScoreMax) : "—"}</td>
                    <td>{row.expiryDate}</td>
                    <td>{row.productCategory}</td>
                    <td>{row.productType}</td>
                    <td>{row.repaymentType}</td>
                    <td>{row.transactionType}</td>
                    <td>{row.productFamily}</td>
                    <td>{row.termYears}</td>
                    <td>{row.rateType}</td>
                    <td>{row.ltvRange?.replace(/\s*LTV\s*$/i, "") ?? "—"}</td>
                    <td>
                      <button type="button" className="main-shelf__row-menu" aria-label="Row actions">
                        <KebabIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {showBar && (
              <SelectionBar
                count={selectedCount}
                onClear={clearSelection}
                onPin={() => {}}
                onClone={() => {}}
                onManageRate={handleManageRate}
                onArchive={() => {}}
                onPublish={() => {}}
              />
            )}
          </div>

          <footer className="main-shelf__pagination">
            <span className="main-shelf__pagination-info">
              Showing 1–{products.length} of {products.length} results
            </span>
            <div className="main-shelf__pagination-controls">
              <button type="button" className="main-shelf__pagination-btn" disabled aria-label="Previous page">
                &lt;
              </button>
              <span className="main-shelf__pagination-page">1 / 1</span>
              <button type="button" className="main-shelf__pagination-btn" disabled aria-label="Next page">
                &gt;
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
