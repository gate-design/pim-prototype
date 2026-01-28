import type { Workspace } from "./SelectWorkspace";
import { SideNav } from "./SideNav";
import "./LenderSettings.css";

function TenantLenderIconLarge() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="32" cy="32" r="12" fill="#e6b800" />
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="1.5" fill="none" opacity={0.6} />
    </svg>
  );
}

export function LenderSettings({
  workspace,
  lenderName = "TD residential",
  onBack,
  onSignOut,
}: {
  workspace: Workspace;
  lenderName?: string;
  onBack: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="lender-settings">
      <div className="lender-settings__body">
        <SideNav
          tenantName={workspace.name}
          lenderName={lenderName}
          userName="Josée Racicot"
          userEmail="josee.racicot@nesto.ca"
          userInitial="JR"
          currentSection="shelf"
          shelfCount={0}
          familiesCount={0}
          onNavigate={(section) => {
            if (section === "shelf") onBack();
            if (section === "product-families") onBack();
          }}
          onSignOut={onSignOut}
        />
        <main className="lender-settings__content">
          <h1 className="lender-settings__title">Lender settings</h1>
          <section className="lender-settings__card">
            <h2 className="lender-settings__card-title">GENERAL</h2>
            <div className="lender-settings__general">
              <span className="lender-settings__icon-wrap">
                <TenantLenderIconLarge />
              </span>
              <div className="lender-settings__fields">
                <div className="lender-settings__field">
                  <label>Lender ID</label>
                  <span>1234</span>
                </div>
                <div className="lender-settings__field">
                  <label>Lender name</label>
                  <span>{lenderName}</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
