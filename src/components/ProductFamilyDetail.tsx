import type { Workspace } from "./SelectWorkspace";
import { Button } from "./ui/Button";
import { SideNav } from "./SideNav";
import "./ProductFamilyDetail.css";

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
        <main className="product-family-detail__content">
          <nav className="product-family-detail__breadcrumb">
            <button type="button" className="product-family-detail__back" onClick={onBack}>
              ← Back to Families
            </button>
            <span className="product-family-detail__sep">|</span>
            <span className="product-family-detail__name">{family.familyName}</span>
            <button type="button" className="product-family-detail__kebab" aria-label="More options">
              ⋯
            </button>
          </nav>

          <section className="product-family-detail__section">
            <h2 className="product-family-detail__section-title">GENERAL</h2>
            <div className="product-family-detail__field">
              <label>Product family name</label>
              <input type="text" className="product-family-detail__input" defaultValue={family.familyName} />
            </div>
            <div className="product-family-detail__field">
              <label>Description</label>
              <textarea className="product-family-detail__textarea" rows={3} placeholder="Description" />
            </div>
            <Button variant="ghost" size="small" className="product-family-detail__link">Add field</Button>
          </section>

          <section className="product-family-detail__section">
            <h2 className="product-family-detail__section-title">DETAILS</h2>
            <div className="product-family-detail__field">
              <label>Logo URL</label>
              <input type="text" className="product-family-detail__input" defaultValue="Lorem" />
            </div>
            <div className="product-family-detail__field">
              <label>Presentation PDF URL</label>
              <input type="text" className="product-family-detail__input" defaultValue="Lorem" />
            </div>
            <div className="product-family-detail__field">
              <label>Product category</label>
              <select className="product-family-detail__select" defaultValue="Mortgage">
                <option>Mortgage</option>
              </select>
            </div>
            <div className="product-family-detail__field">
              <label>Product type</label>
              <select className="product-family-detail__select" defaultValue="Mortgage">
                <option>Mortgage</option>
              </select>
            </div>
          </section>

          <section className="product-family-detail__section">
            <h2 className="product-family-detail__section-title">MORTGAGE FIELDS</h2>
            <div className="product-family-detail__field">
              <label>Payment frequency</label>
              <select className="product-family-detail__select" defaultValue="MONTHLY">
                <option>MONTHLY</option>
              </select>
            </div>
            <Button variant="ghost" size="small" className="product-family-detail__link">Add optional field</Button>
          </section>

          <footer className="product-family-detail__footer">
            <Button variant="primary" size="medium" className="product-family-detail__save">
              ✓ Save
            </Button>
          </footer>
        </main>
      </div>
    </div>
  );
}
