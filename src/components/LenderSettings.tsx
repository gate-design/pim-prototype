import type { Workspace } from "./SelectWorkspace";
import { TdLogo } from "./icons/TdLogo";
import { SideNav } from "./SideNav";
import "./LenderSettings.css";

export function LenderSettings({
  workspace,
  lenderName = "TD residential",
  shelfCount = 0,
  familiesCount = 0,
  onBack,
  onSignOut,
}: {
  workspace: Workspace;
  lenderName?: string;
  shelfCount?: number;
  familiesCount?: number;
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
          shelfCount={shelfCount}
          familiesCount={familiesCount}
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
                <TdLogo size={64} />
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
