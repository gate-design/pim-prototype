import type { Workspace } from "./SelectWorkspace";
import { SideNav } from "./SideNav";
import "./TenantSettings.css";

function TenantLenderIconLarge() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="32" cy="32" r="12" fill="#e6b800" />
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="1.5" fill="none" opacity={0.6} />
    </svg>
  );
}

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
                <TenantLenderIconLarge />
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
