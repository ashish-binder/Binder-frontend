import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SidebarContext } from "../context/SidebarContext";
import { getIPOs, getCompanyEssentials } from "../services/integration";
import { useLoading } from "../context/LoadingContext";
import "./Dashboard.css";
import { normalizeOrderType } from "../utils/orderType";
import Sidebar from "../components/sidebar/Sidebar";
import HoverPanel from "../components/sidebar/HoverPanel";
import DashboardContent from "../components/dashboard/DashboardContent";
import DeleteIpoDialog from "../components/dashboard/DeleteIpoDialog";

const resolveDashboardBasePath = (pathname) => {
  if (pathname.startsWith("/admin/dashboard")) return "/admin/dashboard";
  if (pathname.startsWith("/manager/dashboard")) return "/manager/dashboard";
  if (pathname.startsWith("/tenant/dashboard")) return "/tenant/dashboard";
  return "/dashboard";
};

const getSectionFromPath = (pathname, basePath) => {
  if (pathname === basePath || pathname === `${basePath}/`) return null;
  if (!pathname.startsWith(`${basePath}/`)) return null;
  const rest = pathname.slice(basePath.length + 1);
  return rest.split("/")[0] || null;
};

const sectionToPage = (section) => {
  if (section === "home") return "home";
  if (section === "task" || section === "tasks") return "tasks";
  if (section === "code-creation") return "code-creation";
  if (section === "ipo-management") return "ipo-management";
  if (section === "purchase") return "purchase";
  if (section === "ims") return "ims";
  return null;
};

const pageToSection = (page) => {
  if (page === "home") return "home";
  if (page === "tasks") return "task";
  if (
    page === "code-creation" ||
    [
      "buyer",
      "buyer-existing",
      "vendor",
      "vendor-existing",
      "company-essentials",
      "company-essentials-master",
      "internal-purchase-order",
      "internal-purchase-order-master",
      "completed-ipos",
      "generate-po",
    ].includes(page)
  ) {
    return "code-creation";
  }
  if (page === "ipo-management") return "ipo-management";
  if (page === "purchase") return "purchase";
  if (
    page === "ims" ||
    [
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
    ].includes(page)
  ) {
    return "ims";
  }
  return "home";
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dashboardBasePath = resolveDashboardBasePath(location.pathname);
  const initialPageFromPath =
    sectionToPage(getSectionFromPath(location.pathname, dashboardBasePath)) ||
    "home";
  const [activePage, setActivePageState] = useState(initialPageFromPath);
  const [tasksView, setTasksView] = useState("assign");
  const [codeCreationView, setCodeCreationView] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [hoveredSubmenu, setHoveredSubmenu] = useState(null);
  const [existingIPOs, setExistingIPOs] = useState([]);
  const [selectedIpoForCNS, setSelectedIpoForCNS] = useState(null);
  const [selectedIpoForSpec, setSelectedIpoForSpec] = useState(null);
  const [selectedIpoForDerivedCNS, setSelectedIpoForDerivedCNS] =
    useState(null);
  const [specStepHint, setSpecStepHint] = useState(null); // { flowPhase, currentStep }
  const [existingCompanyEssentials, setExistingCompanyEssentials] = useState(
    [],
  );
  const [ipoToDelete, setIpoToDelete] = useState(null);
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const profileMenuRef = useRef(null);
  const sidebarLoadedOnceRef = useRef(false);
  const { showLoading, hideLoading } = useLoading();
  const sidebarRef = useRef(null);
  const hoverPanelRef = useRef(null);

  const setActivePage = (nextPage) => {
    setActivePageState(nextPage);
    const targetSection = pageToSection(nextPage);
    const targetPath = `${dashboardBasePath}/${targetSection}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const getDisplayName = () => {
    const firstLast = [user?.first_name, user?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    const firstLastAlt = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return (
      firstLast ||
      firstLastAlt ||
      user?.full_name?.trim() ||
      user?.name?.trim() ||
      user?.username?.trim() ||
      user?.email ||
      "User"
    );
  };

  const displayName = getDisplayName();
  const showEmailLine = Boolean(user?.email && displayName !== user?.email);

  // Company name for header/sidebar: tenant company_name, else derive from email domain, default BINDER-OS
  const getCompanyDisplayName = () => {
    const fromTenant = user?.tenant_details?.company_name;
    if (fromTenant && String(fromTenant).trim())
      return String(fromTenant).trim();
    const email = user?.email;
    if (email && email.includes("@")) {
      const domain = email.split("@")[1] || "";
      const base = domain.replace(/\.(com|in|org|net)$/i, "").trim();
      if (base)
        return base
          .split(/[-._]/)
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
          .join(" ");
    }
    return "BINDER-OS";
  };
  const companyDisplayName = getCompanyDisplayName();
  const companyLogo = user?.tenant_details?.logo || null;
  const companyInitials =
    companyDisplayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s.charAt(0).toUpperCase())
      .join("") || "B";

  // Redirect to onboarding if tenant exists and onboarding not completed
  useEffect(() => {
    const tenantDetails = user?.tenant_details;
    if (tenantDetails && tenantDetails.onboarding_completed === false) {
      navigate("/onboarding", { replace: true });
    }
  }, [user?.tenant_details?.onboarding_completed, navigate]);

  useEffect(() => {
    const section = getSectionFromPath(location.pathname, dashboardBasePath);
    const resolvedPage = sectionToPage(section);

    if (!resolvedPage) {
      setActivePageState("home");
      const homePath = `${dashboardBasePath}/home`;
      if (location.pathname !== homePath) {
        navigate(homePath, { replace: true });
      }
      return;
    }

    setActivePageState(resolvedPage);
  }, [location.pathname, dashboardBasePath, navigate]);

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  const requestDeleteIpo = (ipo) => {
    if (!ipo) return;
    setIpoToDelete(ipo);
  };

  const loadSidebarData = async () => {
    const showOverlay = !sidebarLoadedOnceRef.current;
    if (showOverlay) showLoading();
    try {
      try {
        const response = await getIPOs();
        const ipos = response?.results || response?.data || response || [];
        const normalized = Array.isArray(ipos)
          ? ipos.map((ipo) => ({
              ipoId: ipo.id || ipo.ipoId || null,
              ipoCode: ipo.ipo_code || ipo.ipoCode || "",
              orderType: normalizeOrderType(
                ipo.order_type || ipo.orderType || "",
              ),
              buyerCode: ipo.buyer_code_text || ipo.buyerCode || "",
              type: ipo.company_type || ipo.type || "",
              programName: ipo.program_name || ipo.programName || "",
              poSrNo: ipo.po_sr_no || ipo.poSrNo || 1,
              createdAt: ipo.created_at || ipo.createdAt || "",
            }))
          : [];
        setExistingIPOs(normalized);
      } catch (e) {
        setExistingIPOs([]);
      }
      try {
        const essRes = await getCompanyEssentials();
        const essentials = essRes?.results || essRes?.data || essRes || [];
        setExistingCompanyEssentials(Array.isArray(essentials) ? essentials : []);
      } catch (e) {
        setExistingCompanyEssentials([]);
      }
    } finally {
      sidebarLoadedOnceRef.current = true;
      if (showOverlay) hideLoading();
    }
  };

  useEffect(() => {
    loadSidebarData();
  }, [hoveredMenu]);

  useEffect(() => {
    const handleIpoUpdate = () => loadSidebarData();
    window.addEventListener("internalPurchaseOrdersUpdated", handleIpoUpdate);
    return () =>
      window.removeEventListener(
        "internalPurchaseOrdersUpdated",
        handleIpoUpdate,
      );
  }, []);

  useEffect(() => {
    if (!hoveredMenu) {
      setHoveredSubmenu(null);
      return;
    }
    setHoveredSubmenu(null);
  }, [hoveredMenu]);

  useEffect(() => {
    if (
      activePage === "home" ||
      activePage === "tasks" ||
      activePage === "uqr-forms" ||
      activePage === "uqr-database" ||
      activePage === "courier-slip" ||
      activePage === "courier-master" ||
      activePage === "inward-store-sheet" ||
      activePage === "inward-store-sheet-db" ||
      activePage === "outward-store-sheet" ||
      activePage === "outward-store-sheet-db" ||
      activePage === "stock-sheet" ||
      activePage === "stock-sheet-db"
    ) {
      setHoveredMenu(null);
    }
  }, [activePage]);

  useEffect(() => {
    if (!hoveredMenu) return;
    const handleClickOutside = (event) => {
      const sidebarEl = sidebarRef.current;
      const panelEl = hoverPanelRef.current;
      if (sidebarEl?.contains(event.target)) return;
      if (panelEl?.contains(event.target)) return;
      setHoveredMenu(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [hoveredMenu]);

  return (
    <SidebarContext.Provider value={{ isSidebarCollapsed }}>
      <div className="dashboard-container">
        <Sidebar
          sidebarRef={sidebarRef}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          companyLogo={companyLogo}
          companyDisplayName={companyDisplayName}
          companyInitials={companyInitials}
          activePage={activePage}
          setActivePage={setActivePage}
          setHoveredMenu={setHoveredMenu}
          setCodeCreationView={setCodeCreationView}
          setSelectedIpoForCNS={setSelectedIpoForCNS}
          setSelectedIpoForSpec={setSelectedIpoForSpec}
          setSelectedIpoForDerivedCNS={setSelectedIpoForDerivedCNS}
          profileMenuRef={profileMenuRef}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          displayName={displayName}
          showEmailLine={showEmailLine}
          user={user}
          handleLogout={handleLogout}
        />

        <main className="main-content ">
          <div className="content-wrapper ">
            <DashboardContent
              activePage={activePage}
              user={user}
              tasksView={tasksView}
              setActivePage={setActivePage}
              codeCreationView={codeCreationView}
              setCodeCreationView={setCodeCreationView}
              selectedIpoForCNS={selectedIpoForCNS}
              setSelectedIpoForCNS={setSelectedIpoForCNS}
              selectedIpoForSpec={selectedIpoForSpec}
              setSelectedIpoForSpec={setSelectedIpoForSpec}
              selectedIpoForDerivedCNS={selectedIpoForDerivedCNS}
              setSelectedIpoForDerivedCNS={setSelectedIpoForDerivedCNS}
              specStepHint={specStepHint}
              setSpecStepHint={setSpecStepHint}
              editingBuyer={editingBuyer}
              setEditingBuyer={setEditingBuyer}
              editingVendor={editingVendor}
              setEditingVendor={setEditingVendor}
              setHoveredMenu={setHoveredMenu}
            />
            <HoverPanel
              hoveredMenu={hoveredMenu}
              setHoveredMenu={setHoveredMenu}
              hoveredSubmenu={hoveredSubmenu}
              setHoveredSubmenu={setHoveredSubmenu}
              hoverPanelRef={hoverPanelRef}
              existingIPOs={existingIPOs}
              existingCompanyEssentials={existingCompanyEssentials}
              activePage={activePage}
              setActivePage={setActivePage}
              setCodeCreationView={setCodeCreationView}
              setEditingBuyer={setEditingBuyer}
              setEditingVendor={setEditingVendor}
              setSelectedIpoForCNS={setSelectedIpoForCNS}
              setSelectedIpoForSpec={setSelectedIpoForSpec}
              setSelectedIpoForDerivedCNS={setSelectedIpoForDerivedCNS}
              requestDeleteIpo={requestDeleteIpo}
              setTasksView={setTasksView}
            />
          </div>
        </main>
      </div>
      <DeleteIpoDialog
        ipoToDelete={ipoToDelete}
        setIpoToDelete={setIpoToDelete}
        setHoveredSubmenu={setHoveredSubmenu}
        setHoveredMenu={setHoveredMenu}
        selectedIpoForCNS={selectedIpoForCNS}
        setSelectedIpoForCNS={setSelectedIpoForCNS}
        selectedIpoForSpec={selectedIpoForSpec}
        setSelectedIpoForSpec={setSelectedIpoForSpec}
        selectedIpoForDerivedCNS={selectedIpoForDerivedCNS}
        setSelectedIpoForDerivedCNS={setSelectedIpoForDerivedCNS}
        onReloadSidebarData={loadSidebarData}
      />
    </SidebarContext.Provider>
  );
};

export default Dashboard;
