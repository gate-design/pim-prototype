import { Buildings, SignOut } from "@phosphor-icons/react";
import { Button } from "./ui/Button";
import "./SelectWorkspace.css";

export interface Workspace {
  id: string;
  name: string;
  role: string;
}

const WORKSPACES: Workspace[] = [
  { id: "1", name: "TD group", role: "Administrator" },
  { id: "2", name: "TDSI Wealth Management", role: "Administrator" },
  { id: "3", name: "Global Industries", role: "Auditor" },
];

function WorkspaceCard({
  workspace,
  onLaunch,
}: {
  workspace: Workspace;
  onLaunch: () => void;
}) {
  return (
    <article className="workspace-card">
      <div className="workspace-card__icon">
        <Buildings size={20} weight="regular" aria-hidden />
      </div>
      <div className="workspace-card__content">
        <h3 className="workspace-card__name">{workspace.name}</h3>
        <p className="workspace-card__role">{workspace.role}</p>
      </div>
      <Button variant="secondary" size="medium" onClick={onLaunch} className="workspace-card__launch">
        Launch
      </Button>
    </article>
  );
}

export function SelectWorkspace({
  onLaunch,
  onLogout,
}: {
  onLaunch: (workspace: Workspace) => void;
  onLogout?: () => void;
}) {
  return (
    <main className="select-workspace">
      <header className="select-workspace__header">
        <h1 className="select-workspace__title">Select Your Workspace</h1>
        <p className="select-workspace__subtitle">
          Choose which tenant you'd like to access.
        </p>
      </header>

      <ul className="select-workspace__list" role="list">
        {WORKSPACES.map((workspace) => (
          <li key={workspace.id}>
            <WorkspaceCard
              workspace={workspace}
              onLaunch={() => onLaunch(workspace)}
            />
          </li>
        ))}
      </ul>

      <footer className="select-workspace__footer">
        <Button variant="alt" size="medium" leftIcon={<SignOut size={20} weight="regular" aria-hidden />} onClick={() => onLogout?.()} className="select-workspace__logout">
          Logout
        </Button>
      </footer>
    </main>
  );
}
