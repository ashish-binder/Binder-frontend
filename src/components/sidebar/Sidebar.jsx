import { Link } from "react-router-dom";
import { Home, Menu, Search } from "lucide-react";
import {
  FingerprintScanIcon,
  ReceiptIcon,
  ShoppingBagIcon,
  Stack3Icon,
  StorefrontIcon,
} from "../icons/SidebarIcons";

const IMS_ACTIVE_PAGES = [
  "uqr-forms",
  "uqr-database",
  "courier-slip",
  "courier-master",
  "inward-store-sheet",
  "inward-store-sheet-db",
  "outward-store-sheet",
  "outward-store-sheet-db",
  "stock-sheet",
  "stock-sheet-db",
];

const getMenuItems = () => [
  { id: "home", label: "Home", icon: Home },
  { id: "tasks", label: "Tasks", icon: ReceiptIcon },
  { id: "code-creation", label: "Code Creation", icon: FingerprintScanIcon },
  { id: "ipo-management", label: "IPO Management", icon: Stack3Icon },
  { id: "purchase", label: "Purchase", icon: ShoppingBagIcon },
  { id: "ims", label: "IMS", icon: StorefrontIcon },
];

const Sidebar = ({
  sidebarRef,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  companyLogo,
  companyDisplayName,
  companyInitials,
  activePage,
  setActivePage,
  setHoveredMenu,
  setCodeCreationView,
  setSelectedIpoForCNS,
  setSelectedIpoForSpec,
  setSelectedIpoForDerivedCNS,
  profileMenuRef,
  showProfileMenu,
  setShowProfileMenu,
  displayName,
  showEmailLine,
  user,
  handleLogout,
}) => (
  <aside
    className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}
    ref={sidebarRef}
  >
    <div className="sidebar-header">
      <div className="logo-wrapper">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
        {companyLogo ? (
          <img
            src={companyLogo}
            alt={companyDisplayName}
            className="company-logo-dash"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling && (e.target.nextSibling.style.display = "");
            }}
          />
        ) : null}
        <div
          className="logo-icon-dash"
          style={companyLogo ? { display: "none" } : undefined}
        >
          {companyInitials}
        </div>
        <div className="logo-text-wrap-dash">
          <span className="logo-text-dash">{companyDisplayName.split(" ")[0]}</span>
          {/* <span className="logo-subtitle-dash">Powered by Binder-OS</span> */}
        </div>
      </div>
    </div>

    {!isSidebarCollapsed && (
      <div className="sidebar-search">
        <Search size={16} className="sidebar-search-icon" />
        <input type="text" className="sidebar-search-input" placeholder="Search..." />
      </div>
    )}

    <nav className="sidebar-nav">
      {getMenuItems().map((item) => (
        <button
          key={item.id}
          className={`nav-item ${
            activePage === item.id ||
            (item.id === "ims" && IMS_ACTIVE_PAGES.includes(activePage))
              ? "active"
              : ""
          }`}
          onClick={() => {
            if (item.id === "home" || item.id === "tasks" || item.id === "purchase") {
              setActivePage(item.id);
              setHoveredMenu(null);
              return;
            }
            if (item.id === "code-creation") {
              setCodeCreationView(null);
            }
            if (item.id === "ipo-management") {
              setSelectedIpoForCNS(null);
              setSelectedIpoForSpec(null);
              setSelectedIpoForDerivedCNS(null);
            }
            setActivePage(item.id);
            setHoveredMenu(item.id);
          }}
        >
          <span className="nav-icon" aria-hidden="true">
            <item.icon size={18} />
          </span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>

    <div className="sidebar-footer" ref={profileMenuRef}>
      <button
        type="button"
        className="sidebar-profile"
        onClick={() => setShowProfileMenu((prev) => !prev)}
        aria-label="Open profile menu"
      >
        <span className="user-avatar">{displayName?.charAt(0)?.toUpperCase() || "U"}</span>
        <span className="profile-username">{displayName}</span>
      </button>
      {showProfileMenu && (
        <div className="profile-menu profile-menu--sidebar">
          <div className="profile-menu-header">
            {showEmailLine && <div className="profile-menu-email">{user.email}</div>}
          </div>
          <div className="profile-menu-divider" />
          <Link
            to="/company-profile"
            className="profile-menu-item"
            style={{
              display: "block",
              padding: "8px 12px",
              textDecoration: "none",
              color: "inherit",
            }}
            onClick={() => setShowProfileMenu(false)}
          >
            Profile
          </Link>
          <div className="profile-menu-divider" />
          <Link
            to="/profile"
            className="profile-menu-item"
            style={{
              display: "block",
              padding: "8px 12px",
              textDecoration: "none",
              color: "inherit",
            }}
            onClick={() => setShowProfileMenu(false)}
          >
            Master Panel
          </Link>
          <div className="profile-menu-divider" />
          <button type="button" className="profile-menu-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  </aside>
);

export default Sidebar;
