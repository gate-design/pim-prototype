import type { Workspace } from "./SelectWorkspace";
import { TdLogo } from "./icons/TdLogo";
import { SideNav } from "./SideNav";
import "./TenantSettings.css";

export function TenantSettings({
  workspace,
  onBack,
  onSignOut,
  onLenderSettings,
}: {
  workspace: Workspace;
  onBack: () => void;
  onSignOut: () => void;
  onLenderSettings?: () => void;
}) {
  return (
    <div className="tenant-settings">
      <div className="tenant-settings__body">
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
            if (section === "shelf") onBack();
            if (section === "product-families") onBack();
          }}
          onSignOut={onSignOut}
          onLenderSettings={onLenderSettings}
        />
        <main className="tenant-settings__content">
          <h1 className="tenant-settings__title">Tenant settings</h1>
          <section className="tenant-settings__card">
            <h2 className="tenant-settings__card-title">GENERAL</h2>
            <div className="tenant-settings__general">
              <span className="tenant-settings__icon-wrap">
                <TdLogo size={64} />
              </span>
              <div className="tenant-settings__fields">
                <div className="tenant-settings__field">
                  <label>Tenant ID</label>
                  <span>1234</span>
                </div>
                <div className="tenant-settings__field">
                  <label>Tenant name</label>
                  <span>{workspace.name}</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
