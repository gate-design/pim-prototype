import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
  SidebarSimple,
  Buildings,
  Dresser,
  TagSimple,
  Gear,
  CaretUpDown,
  CaretRight,
  Check,
  SignOut,
  Plus,
} from "@phosphor-icons/react";
import { TdLogo } from "./icons/TdLogo";
import { Nestologo } from "./icons/Nestologo";
import "./SideNav.css";

const SIDE_NAV_WIDTH = 280;
const DROPDOWN_OFFSET = 4;
const DROPDOWN_WIDTH = 268; /* min-width 260 + margin */
const USER_DROPDOWN_EST_HEIGHT = 160;

const LENDERS = [
  { id: "nesto-residential", name: "TD residential" },
  { id: "nesto-commercial", name: "TD commercial" },
];
const VIEWPORT_PADDING = 16;

const iconProps = { "aria-hidden": true, weight: "regular" as const };
const icon24 = { ...iconProps, size: 24 };
const icon20 = { ...iconProps, size: 20 };
const icon18 = { ...iconProps, size: 18 };
const icon16 = { ...iconProps, size: 16 };

export type SideNavSection = "shelf" | "product-families";

export function SideNav({
  tenantName,
  lenderName = "TD residential",
  userName = "Josée Racicot",
  userEmail = "josee.racicot@nesto.ca",
  userInitial = "JR",
  currentSection,
  shelfCount = 60,
  familiesCount = 0,
  onNavigate,
  onSignOut,
  onTenantSettings,
  onLenderSettings,
}: {
  tenantName: string;
  lenderName?: string;
  userName?: string;
  userEmail?: string;
  userInitial?: string;
  currentSection: SideNavSection;
  shelfCount?: number;
  familiesCount?: number;
  onNavigate: (section: SideNavSection) => void;
  onSignOut: () => void;
  onTenantSettings?: () => void;
  onLenderSettings?: () => void;
}) {
  const [openDropdown, setOpenDropdown] = useState<"tenant" | "lender" | "lender-switch" | "user" | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const tenantRef = useRef<HTMLDivElement>(null);
  const lenderRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const switchLenderLeaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    if (openDropdown === "tenant" && tenantRef.current) {
      const r = tenantRef.current.getBoundingClientRect();
      setDropdownPosition({ top: r.top, left: r.right + DROPDOWN_OFFSET });
    } else if ((openDropdown === "lender" || openDropdown === "lender-switch") && lenderRef.current) {
      const r = lenderRef.current.getBoundingClientRect();
      setDropdownPosition({ top: r.top, left: r.right + DROPDOWN_OFFSET });
    } else if (openDropdown === "user" && userRef.current) {
      const r = userRef.current.getBoundingClientRect();
      let top = r.top;
      if (typeof window !== "undefined" && top + USER_DROPDOWN_EST_HEIGHT > window.innerHeight - VIEWPORT_PADDING) {
        top = Math.max(VIEWPORT_PADDING, window.innerHeight - USER_DROPDOWN_EST_HEIGHT - VIEWPORT_PADDING);
      }
      setDropdownPosition({ top, left: r.right + DROPDOWN_OFFSET });
    } else {
      setDropdownPosition(null);
    }
  }, [openDropdown]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      const el = t as Element;
      if (document.getElementById("side-nav-root")?.contains(t)) return;
      if (el.closest?.("[data-side-nav-dropdown]")) return;
      setOpenDropdown(null);
    };
    document.addEventListener("click", close, true);
    return () => document.removeEventListener("click", close, true);
  }, []);

  useEffect(() => {
    if (openDropdown !== "lender-switch" && switchLenderLeaveTimeoutRef.current) {
      clearTimeout(switchLenderLeaveTimeoutRef.current);
      switchLenderLeaveTimeoutRef.current = null;
    }
    return () => {
      if (switchLenderLeaveTimeoutRef.current) {
        clearTimeout(switchLenderLeaveTimeoutRef.current);
      }
    };
  }, [openDropdown]);

  const closeAll = () => setOpenDropdown(null);

  return (
    <aside id="side-nav-root" className="side-nav" style={{ width: SIDE_NAV_WIDTH }}>
      <div className="side-nav__inner">
        <div className="side-nav__logo-row">
          <div className="side-nav__logo">
            <Nestologo />
          </div>
          <button type="button" className="side-nav__expand" aria-label="Expand sidebar">
            <SidebarSimple {...icon20} />
          </button>
        </div>

        <nav className="side-nav__nav">
          <div className="side-nav__selector-wrap" ref={tenantRef}>
            <button
              type="button"
              className={`side-nav__selector ${openDropdown === "tenant" ? "side-nav__selector--open" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown((d) => (d === "tenant" ? null : "tenant"));
              }}
            >
              <span className="side-nav__selector-icon">
                <TdLogo size={24} />
              </span>
              <span className="side-nav__selector-text">
                <span className="side-nav__selector-name">{tenantName}</span>
                <span className="side-nav__selector-role">Tenant</span>
              </span>
              <CaretUpDown {...icon16} />
            </button>
            {openDropdown === "tenant" &&
              dropdownPosition &&
              createPortal(
                <div
                  data-side-nav-dropdown
                  className="side-nav__dropdown side-nav__dropdown--portaled"
                  style={{
                    position: "fixed",
                    left: dropdownPosition.left,
                    top: dropdownPosition.top,
                    zIndex: 1000,
                  }}
                >
                  <div className="side-nav__dropdown-item side-nav__dropdown-item--selected">
                    <TdLogo size={24} />
                    <span>{tenantName}</span>
                    <Check {...icon18} />
                  </div>
                  <button
                    type="button"
                    className="side-nav__dropdown-item"
                    onClick={() => {
                      setOpenDropdown(null);
                      onTenantSettings?.();
                    }}
                  >
                    <Gear {...icon18} />
                    <span>Tenant settings</span>
                  </button>
                </div>,
                document.body
              )}
          </div>

          <div className="side-nav__selector-wrap" ref={lenderRef}>
            <button
              type="button"
              className={`side-nav__selector ${openDropdown === "lender" || openDropdown === "lender-switch" ? "side-nav__selector--open" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown((d) => (d === "lender" || d === "lender-switch" ? null : "lender"));
              }}
            >
              <span className="side-nav__selector-icon">
                <TdLogo size={24} />
              </span>
              <span className="side-nav__selector-text">
                <span className="side-nav__selector-name">{lenderName}</span>
                <span className="side-nav__selector-role">Lender</span>
              </span>
              <CaretUpDown {...icon16} />
            </button>
            {(openDropdown === "lender" || openDropdown === "lender-switch") &&
              dropdownPosition &&
              createPortal(
                <div
                  data-side-nav-dropdown
                  className="side-nav__dropdown side-nav__dropdown--portaled"
                  style={{
                    position: "fixed",
                    left: dropdownPosition.left,
                    top: dropdownPosition.top,
                    zIndex: 1000,
                  }}
                >
                  <div className="side-nav__dropdown-item side-nav__dropdown-item--selected">
                    <TdLogo size={24} />
                    <span>{lenderName}</span>
                    <Check {...icon18} />
                  </div>
                  <button
                    type="button"
                    className="side-nav__dropdown-item"
                    onClick={() => {
                      setOpenDropdown(null);
                      onLenderSettings?.();
                    }}
                  >
                    <Gear {...icon18} />
                    <span>Lender settings</span>
                  </button>
                  <button
                    type="button"
                    className={`side-nav__dropdown-item side-nav__dropdown-item--switch-lender ${openDropdown === "lender-switch" ? "side-nav__dropdown-item--selected" : ""}`}
                    onClick={() => setOpenDropdown(null)}
                    onMouseEnter={() => {
                      if (switchLenderLeaveTimeoutRef.current) {
                        clearTimeout(switchLenderLeaveTimeoutRef.current);
                        switchLenderLeaveTimeoutRef.current = null;
                      }
                      setOpenDropdown("lender-switch");
                    }}
                    onMouseLeave={() => {
                      switchLenderLeaveTimeoutRef.current = setTimeout(() => {
                        switchLenderLeaveTimeoutRef.current = null;
                        setOpenDropdown("lender");
                      }, 150);
                    }}
                  >
                    <Buildings {...icon18} />
                    <span>Switch lender</span>
                    <CaretRight {...icon16} />
                  </button>
                </div>,
                document.body
              )}
            {openDropdown === "lender-switch" &&
              dropdownPosition &&
              createPortal(
                <div
                  data-side-nav-dropdown
                  className="side-nav__dropdown side-nav__dropdown--portaled side-nav__dropdown--nested"
                  style={{
                    position: "fixed",
                    left: dropdownPosition.left + DROPDOWN_WIDTH + 8,
                    top: dropdownPosition.top,
                    zIndex: 1001,
                  }}
                  onMouseEnter={() => {
                    if (switchLenderLeaveTimeoutRef.current) {
                      clearTimeout(switchLenderLeaveTimeoutRef.current);
                      switchLenderLeaveTimeoutRef.current = null;
                    }
                  }}
                  onMouseLeave={() => setOpenDropdown("lender")}
                >
                  {LENDERS.map((l) => (
                    <div
                      key={l.id}
                      className={`side-nav__dropdown-item ${lenderName === l.name ? "side-nav__dropdown-item--selected" : ""}`}
                    >
                      <TdLogo size={24} />
                      <span>{l.name}</span>
                      {lenderName === l.name && <Check {...icon18} />}
                    </div>
                  ))}
                  <button type="button" className="side-nav__dropdown-item side-nav__dropdown-item--add">
                    + Add Lender
                  </button>
                </div>,
                document.body
              )}
          </div>

          <div className="side-nav__section">
            <div className="side-nav__section-head">
              <Dresser {...icon24} />
              <span>Shelves</span>
              <button type="button" className="side-nav__add" aria-label="Add shelf">
                <Plus {...icon20} />
              </button>
            </div>
            <button
              type="button"
              className={`side-nav__subsection ${currentSection === "shelf" ? "side-nav__subsection--active" : ""}`}
              onClick={() => onNavigate("shelf")}
            >
              Main shelf
              <span className="side-nav__badge">{shelfCount}</span>
            </button>
          </div>

          <button
            type="button"
            className={`side-nav__link ${currentSection === "product-families" ? "side-nav__link--active" : ""}`}
            onClick={() => onNavigate("product-families")}
          >
            <TagSimple {...icon24} />
            <span>Product families</span>
            <span className="side-nav__badge">{familiesCount}</span>
          </button>

        </nav>

        <div className="side-nav__user-wrap" ref={userRef}>
          <button
            type="button"
            className={`side-nav__user ${openDropdown === "user" ? "side-nav__user--open" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown((d) => (d === "user" ? null : "user"));
            }}
          >
            <span className="side-nav__user-avatar">{userInitial}</span>
            <span className="side-nav__user-text">
              <span className="side-nav__user-name">{userName}</span>
              <span className="side-nav__user-email">{userEmail.replace(/(.{12}).*(@.*)/, "$1...$2")}</span>
            </span>
            <CaretUpDown {...icon16} />
          </button>
          {openDropdown === "user" &&
            dropdownPosition &&
            createPortal(
              <div
                data-side-nav-dropdown
                className="side-nav__dropdown side-nav__dropdown--portaled side-nav__dropdown--user"
                style={{
                  position: "fixed",
                  left: dropdownPosition.left,
                  top: dropdownPosition.top,
                  zIndex: 1000,
                }}
              >
                <div className="side-nav__user-dropdown-header">
                  <span className="side-nav__user-avatar">{userInitial}</span>
                  <div>
                    <div className="side-nav__user-name">{userName}</div>
                    <div className="side-nav__user-email side-nav__user-email--full">{userEmail}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="side-nav__dropdown-item side-nav__dropdown-item--signout"
                  onClick={() => {
                    closeAll();
                    onSignOut();
                  }}
                >
                  <SignOut {...icon18} />
                  Sign out
                </button>
              </div>,
              document.body
            )}
        </div>
      </div>
    </aside>
  );
}
