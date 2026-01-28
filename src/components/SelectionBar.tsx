import { Archive, Copy, Percent, PushPin, RocketLaunch, X } from "@phosphor-icons/react";
import { Button } from "./ui/Button";
import "./SelectionBar.css";

export function SelectionBar({
  count,
  onClear,
  onPin,
  onClone,
  onManageRate,
  onArchive,
  onPublish,
}: {
  count: number;
  onClear: () => void;
  onPin: () => void;
  onClone: () => void;
  onManageRate: () => void;
  onArchive: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="selection-bar" role="toolbar" aria-label="Actions for selected products">
      <span className="selection-bar__count">{count} selected</span>
      <Button
        variant="ghost"
        size="small"
        leftIcon={<X size={16} weight="regular" aria-hidden />}
        onClick={onClear}
        className="selection-bar__btn"
      >
        Clear
      </Button>
      <Button
        variant="ghost"
        size="small"
        leftIcon={<PushPin size={16} weight="regular" aria-hidden />}
        onClick={onPin}
        className="selection-bar__btn"
      >
        Pin
      </Button>
      <Button
        variant="ghost"
        size="small"
        leftIcon={<Copy size={16} weight="regular" aria-hidden />}
        onClick={onClone}
        className="selection-bar__btn"
      >
        Clone
      </Button>
      <Button
        variant="ghost"
        size="small"
        leftIcon={<Percent size={16} weight="regular" aria-hidden />}
        onClick={onManageRate}
        className="selection-bar__btn"
      >
        Manage rate
      </Button>
      <Button
        intent="negative"
        variant="ghost"
        size="small"
        leftIcon={<Archive size={16} weight="regular" aria-hidden />}
        onClick={onArchive}
        className="selection-bar__btn"
      >
        Archive
      </Button>
      <Button
        variant="primary"
        size="medium"
        leftIcon={<RocketLaunch size={16} weight="regular" aria-hidden />}
        onClick={onPublish}
        className="selection-bar__publish"
      >
        Publish
      </Button>
    </div>
  );
}
