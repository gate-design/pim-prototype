import type { Workspace } from "./SelectWorkspace";
import type { ProductFamily } from "./ProductFamilyDetail";
import { SideNav } from "./SideNav";
import "./ProductFamilies.css";

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
      <path d="M2 3h12M4 8h8M6 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const SAMPLE_FAMILIES = [
  {
    id: "1",
    familyName: "Full Featured Fixed",
    status: "Published",
    productType: "Mortgage",
    productFamilyId: "FULL_FEATURED_FIXED",
    prepayOptions: "STANDARD",
    prepayDouble: "NO_DOUBLE_UP_PAYMENTS",
    prepayLumpSum: "LUMP_SUM",
  },
  {
    id: "2",
    familyName: "Full Featured Variable",
    status: "Published",
    productType: "Mortgage",
    productFamilyId: "FULL_FEATURED_VARIABLE",
    prepayOptions: "STANDARD",
    prepayDouble: "NO_DOUBLE_UP_PAYMENTS",
    prepayLumpSum: "LUMP_SUM",
  },
  {
    id: "3",
    familyName: "Limited Variable",
    status: "Published",
    productType: "Mortgage",
    productFamilyId: "LIMITED_VARIABLE",
    prepayOptions: "—",
    prepayDouble: "NO_DOUBLE_UP_PAYMENTS",
    prepayLumpSum: "LUMP_SUM",
  },
  {
    id: "4",
    familyName: "Smart Save Fixed",
    status: "Published",
    productType: "Mortgage",
    productFamilyId: "SMART_SAVE_FIXED",
    prepayOptions: "STANDARD",
    prepayDouble: "NO_DOUBLE_UP_PAYMENTS",
    prepayLumpSum: "LUMP_SUM",
  },
  {
    id: "5",
    familyName: "Limited Fixed",
    status: "Published",
    productType: "Mortgage",
    productFamilyId: "LIMITED_FIXED",
    prepayOptions: "STANDARD",
    prepayDouble: "NO_DOUBLE_UP_PAYMENTS",
    prepayLumpSum: "LUMP_SUM",
  },
  {
    id: "6",
    familyName: "Smart Save Variable",
    status: "Published",
    productType: "Mortgage",
    productFamilyId: "SMART_SAVE_VARIABLE",
    prepayOptions: "—",
    prepayDouble: "NO_DOUBLE_UP_PAYMENTS",
    prepayLumpSum: "LUMP_SUM",
  },
  {
    id: "7",
    familyName: "2nd Rank HELOC",
    status: "Published",
    productType: "Mortgage",
    productFamilyId: "2ND_RANK_HELOC",
    prepayOptions: "STANDARD",
    prepayDouble: "NO_DOUBLE_UP_PAYMENTS",
    prepayLumpSum: "LUMP_SUM",
  },
];

export function ProductFamilies({
  workspace,
  onBackToShelf,
  onLogout,
  onTenantSettings,
  onLenderSettings,
  onFamilyClick,
}: {
  workspace: Workspace;
  onBackToShelf: () => void;
  onLogout?: () => void;
  onTenantSettings?: () => void;
  onLenderSettings?: () => void;
  onFamilyClick?: (family: ProductFamily) => void;
}) {
  const count = SAMPLE_FAMILIES.length;

  return (
    <div className="product-families">
      <div className="product-families__body">
        <SideNav
          tenantName={workspace.name}
          lenderName="TD residential"
          userName="Josée Racicot"
          userEmail="josee.racicot@nesto.ca"
          userInitial="JR"
          currentSection="product-families"
          shelfCount={0}
          familiesCount={count}
          onNavigate={(section) => {
            if (section === "shelf") onBackToShelf();
          }}
          onSignOut={() => onLogout?.()}
          onTenantSettings={onTenantSettings}
          onLenderSettings={onLenderSettings}
        />

        <main className="product-families__content">
          <header className="product-families__content-header">
            <div className="product-families__content-header-left">
              <h1 className="product-families__content-title">
                Product families
                <span className="product-families__content-badge" aria-hidden>
                  {count}
                </span>
              </h1>
            </div>
          </header>

          <div className="product-families__toolbar">
            <div className="product-families__search">
              <SearchIcon />
              <input
                type="search"
                placeholder="Search"
                className="product-families__search-input"
                aria-label="Search product families"
              />
            </div>
            <button type="button" className="product-families__filters-btn">
              <FilterIcon />
              Filters
            </button>
          </div>

          <div className="product-families__table-wrapper">
            <table className="product-families__table">
              <thead>
                <tr>
                  <th>Family name</th>
                  <th>Status</th>
                  <th>Product type</th>
                  <th>Product family ID</th>
                  <th>Pre-payment options</th>
                  <th>Pre-payment options double</th>
                  <th>Pre-payment options lump sum</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_FAMILIES.map((row) => (
                  <tr
                    key={row.id}
                    className="product-families__row--clickable"
                    onClick={() => onFamilyClick?.(row)}
                  >
                    <td>{row.familyName}</td>
                    <td>
                      <span className="product-families__badge product-families__badge--published">
                        {row.status}
                      </span>
                    </td>
                    <td>{row.productType}</td>
                    <td>{row.productFamilyId}</td>
                    <td>{row.prepayOptions}</td>
                    <td>{row.prepayDouble}</td>
                    <td>{row.prepayLumpSum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="product-families__pagination">
            <span className="product-families__pagination-info">
              Showing 1–{count} of {count} results
            </span>
            <div className="product-families__pagination-controls">
              <button type="button" className="product-families__pagination-btn" disabled aria-label="First page">
                «
              </button>
              <button type="button" className="product-families__pagination-btn" disabled aria-label="Previous page">
                ‹
              </button>
              <span className="product-families__pagination-page">1 / 1</span>
              <button type="button" className="product-families__pagination-btn" disabled aria-label="Next page">
                ›
              </button>
              <button type="button" className="product-families__pagination-btn" disabled aria-label="Last page">
                »
              </button>
            </div>
            <select className="product-families__page-size" aria-label="Results per page">
              <option value="25">Show 25</option>
              <option value="50">Show 50</option>
              <option value="100">Show 100</option>
            </select>
          </footer>
        </main>
      </div>
    </div>
  );
}
