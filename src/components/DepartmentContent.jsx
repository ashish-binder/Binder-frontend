import React, { useState, useRef, useEffect } from "react";
import GenerateBuyerCode from "./GenerateBuyerCode";
import GenerateVendorCode from "./GenerateVendorCode";
import GeneratePOCode from "./GeneratePOCode";
import GenerateFactoryCode from "./GenerateFactoryCode";
import VendorMasterSheet from "./VendorMasterSheet";
import BuyerMasterSheet from "./BuyerMasterSheet";
import CompanyEssentials from "./CompanyEssentials";
import CompanyEssentialsMasterSheet from "./CompanyEssentialsMasterSheet";
import InternalPurchaseOrder from "./InternalPurchaseOrder/InternalPurchaseOrder";
import IPOMasterSheet from "./IPOMasterSheet";

const DepartmentContent = ({ resetKey }) => {
  const [hoveredDeptItem, setHoveredDeptItem] = useState(null);
  const [selectedSubMenuItem, setSelectedSubMenuItem] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showGenerateBuyerCode, setShowGenerateBuyerCode] = useState(false);
  const [showGenerateVendorCode, setShowGenerateVendorCode] = useState(false);
  const [showGeneratePOCode, setShowGeneratePOCode] = useState(false);
  const [showGenerateFactoryCode, setShowGenerateFactoryCode] = useState(false);
  const [showVendorMasterSheet, setShowVendorMasterSheet] = useState(false);
  const [showBuyerMasterSheet, setShowBuyerMasterSheet] = useState(false);
  const [showCompanyEssentials, setShowCompanyEssentials] = useState(false);
  const [
    showCompanyEssentialsMasterSheet,
    setShowCompanyEssentialsMasterSheet,
  ] = useState(false);
  const [showInternalPurchaseOrder, setShowInternalPurchaseOrder] =
    useState(false);
  const [showIPOMasterSheet, setShowIPOMasterSheet] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);

  const subMenuRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // Reset department view when resetKey changes (e.g., sidebar Departments clicked)
  useEffect(() => {
    if (resetKey !== undefined) {
      handleBackToDepartments();
    }
  }, [resetKey]);

  const departmentItems = [
    { id: "chd-code", label: "CODE CREATION", hasSubMenu: true },
    { id: "chd-po", label: "PO ISSUE", hasSubMenu: true },
    { id: "sourcing", label: "SOURCING", hasSubMenu: true },
    { id: "ims", label: "IMS", hasSubMenu: true },
    { id: "operations", label: "OPERATIONS", hasSubMenu: true },
    { id: "quality", label: "TOTAL QUALITY MANAGEMENT", hasSubMenu: true },
    { id: "designing", label: "DESIGNING", hasSubMenu: true },
    { id: "shipping", label: "SHIPPING", hasSubMenu: true },
    { id: "accounts", label: "ACCOUNTS", hasSubMenu: true },
    { id: "hr", label: "HR", hasSubMenu: true },
  ];

  const subMenuItems = {
    "chd-code": [
      { id: "buyer", label: "BUYER" },
      { id: "vendor", label: "VENDOR" },
      { id: "company essentials", label: "COMPANY ESSENTIALS" },
      { id: "Internal Purchase Order", label: "INTERNAL PURCHASE ORDER" },
    ],
    "chd-po": [
      { id: "generate-po", label: "GENERATE PO" },
      { id: "po-master", label: "PO MASTER" },
    ],
    ims: [
      { id: "inward-store-sheet", label: "INWARD STORE LOGS" },
      { id: "outward-store-sheet", label: "OUTWARD STORE LOGS" },
    ],
    sourcing: [
      { id: "yarn", label: "YARN" },
      { id: "recycled-yarn", label: "RECYCLED YARN" },
      { id: "fabric", label: "FABRIC" },
      { id: "dye", label: "DYE" },
      { id: "knitting", label: "KNITTING" },
      { id: "quilting", label: "QUILTING" },
      { id: "embroidery", label: "EMBROIDERY" },
      { id: "cut-sew", label: "CUT & SEW" },
      { id: "artworks-trims", label: "ARTWORKS AND TRIMS" },
      { id: "packaging-material", label: "PACKAGING MATERIAL" },
      { id: "factory-supplies", label: "FACTORY SUPPLIES" },
      { id: "fiber", label: "FIBER" },
      { id: "weaving", label: "WEAVING" },
      { id: "braided", label: "BRAIDED" },
      { id: "printing", label: "PRINTING" },
      { id: "job-card-service", label: "JOB CARD SERVICE" },
      { id: "tufting", label: "TUFTING" },
      { id: "carpet", label: "CARPET" },
      { id: "manpower", label: "MANPOWER" },
    ],
    operations: [
      { id: "production", label: "PRODUCTION" },
      { id: "merchandising", label: "MERCHANDISING" },
      { id: "sampling", label: "SAMPLING" },
    ],
    quality: [
      { id: "goods-receipt-note", label: "GOODS RECEIPT NOTE" },
      { id: "quality-formats", label: "QUALITY FORMATS" },
      { id: "prod-quality-formats", label: "PROD-QUALITY FORMATS" },
    ],
    designing: [{ id: "product-category", label: "PRODUCT CATEGORY" }],
    shipping: [
      { id: "shipped-goods", label: "SHIPPED GOODS" },
      { id: "shipping-master", label: "SHIPPING MASTER" },
    ],
    accounts: [
      { id: "accounts-tally", label: "ACCOUNTS TALLY" },
      { id: "sbi-4034", label: "SBI-4034" },
      { id: "cashbook", label: "CASHBOOK" },
    ],
    hr: [
      { id: "leave-application", label: "LEAVE APPLICATION" },
      { id: "personal-aspiration", label: "PERSONAL ASPIRATION" },
      { id: "advance-request", label: "ADVANCE REQUEST" },
      { id: "exit-interview", label: "EXIT INTERVIEW" },
      { id: "attendance", label: "ATTENDANCE" },
    ],
  };

  // Define button configurations for each submenu item
  const subMenuButtonConfigs = {
    // SOURCING buttons
    yarn: [
      "Acrylic Yarn",
      "Fine Count UV 24Ne to 60Ne",
      "Rafiya Yarn",
      "Viscose Yarn",
      "Fancy Yarn",
      "Hemp Yarn",
      "Roto Yarn",
      "Wool Yarn",
      "Chenille Yarn",
      "Jute Yarn",
      "Silk Yarn",
      "Pet Yarn",
      "Linen Yarn",
      "Slub Yarn",
      "Polyester Yarn",
      "Coarse Count",
    ],
    "recycled-yarn": [
      "Non UV Natural",
      "Fine Count 24Ne to 40Ne",
      "Coarse Count 2Ne to 20Ne",
      "Melange Yarn",
    ],
    fabric: [
      "Recycled Fabric",
      "Non Wooven",
      "Designer Fabric",
      "Plain Fabric",
      "Fancy Fabric",
    ],
    dye: [
      "Natural Yarn",
      "Artificial Yarn",
      "Artificial Fabric",
      "Natural Fabric",
      "Cotton Bathmat",
      "Polyester Bathmat",
      "StoneWash",
    ],
    knitting: ["Crochet", "Circular", "Flat Bed"],
    quilting: [
      "Single Needle",
      "Multi Needle + Embroidery",
      "Multi Needle",
      "Hand Quilting",
    ],
    embroidery: [
      "Rice Stitch",
      "Dori",
      "Multi thread",
      "Single thread",
      "Aari embroidery",
    ],
    "cut-sew": [
      "Machine/Material Supplier",
      "Stiching Centre",
      "Stiching Contractor",
      "Complete Packaging Unit",
    ],
    "artworks-trims": [
      "Tyvek Labels",
      "Taffta Labels",
      "Woven Labels",
      "Embossing Labels",
      "Insert Cards",
      "Belly Bands",
      "Ribbon",
      "Carton Marking",
    ],
    "packaging-material": ["Zip", "Cartoon", "Tape", "Packaging Accessories"],
    "factory-supplies": [
      "Admin Stationery",
      "Sharp Tools",
      "Quality Accessories",
      "Maintenance ",
    ],
    fiber: ["Foam", "Fiber Sheets", "Only Bale", "Virgin", "Mix", "Conjugated"],
    weaving: [
      "Frameloom",
      "Powerloom",
      "Dobby",
      "Jumbo Jacquard",
      "Pitloom",
      "Shuttleless",
      "Jacquard",
      "Airjet",
    ],
    braided: ["Hand Braided", "Machine Braided"],
    printing: [
      "Screen Print",
      "Lamination Polyster Digital Print",
      "Rotary Print",
      "Block Print",
      "Cotton Digital Print",
    ],
    "job-card-service": [
      "Flocking",
      "Applique",
      "Gel Backing",
      "Latex",
      "Tassle Making",
      "Lamination",
      "TPR",
      "Niwar Backing",
      "Niwar",
      "Beads Work",
    ],
    tufting: ["Table Tufting", "Multi Needle", "Computerized"],
    carpet: ["Hand tufting", "Machine Made - Vandewiele", "Broadloom"],
    manpower: [
      "Marketing",
      "Production Operations",
      "HR",
      "Security",
      "Sales",
      "Quality Operations",
      "Auditory Compliances",
      "Trader",
      "Designing",
      "Resarch & Development",
      "Merchendising",
      "IT",
      "Accounts",
      "Machine Manufacturing",
      "Management",
    ],
    // OPERATIONS buttons
    production: [
      "CHD/002A/1/JUTE PLACEMAT",
      "CHD/003A/3/QUILTED PILLOW",
      "CHD/005A/5/ RECYCLE WOVEN RUG",
      "CHD/002A/6/BEIGE&OFFWHITE RUG-3047",
    ],
    merchandising: [],
    sampling: [],
    // QUALITY buttons
    "goods-receipt-note": ["Generate GRN"],
    "quality-formats": [
      "FABRIC CHECKING REPORT",
      "CUTTING INSPECTION REPORT",
      "FIRST PCS REPORT",
      "SHARP TOOLS",
      "CARTON AUDIT REPORT",
      "STITCHING INSPECTION REPORT",
      "FINAL RANDOM INSPECTION REPORT",
      "PACKING INSPECTION REPORT",
      "METAL DETECTION CALLIBRATION",
    ],
    "prod-quality-formats": [
      "PROD-CUTTING INSPECTION REPORT",
      "PROD-CARTON INSPECTION REPORT",
      "PROD-PACKING INSPECTION REPORT",
      "PROD-STITCHING INSPECTION REPORT",
    ],
    // DESIGNING buttons
    "product-category": ["Product Category"],
    // SHIPPING buttons
    "shipped-goods": ["Shipped Goods"],
    "shipping-master": ["Shipping Master"],
    // ACCOUNTS buttons
    "accounts-tally": ["CREDITORS LIST", "DEBITORS LIST"],
    "sbi-4034": ["SBI-4034"],
    cashbook: ["CASHBOOK"],
    // HR buttons
    "leave-application": [
      "LEAVE APPLICATION-FORM",
      "LEAVE APPLICATION-RESPONSES",
    ],
    "personal-aspiration": [
      "PERSONAL ASPIRATION-FORM",
      "PERSONAL ASPIRATION-MASTER",
    ],
    "advance-request": ["ADVANCE REQUEST-FORM", "ADVANCE REQUEST-MASTER"],
    "exit-interview": ["EXIT INTERVIEW-FORM", "EXIT INTERVIEW-MASTER"],
    attendance: ["ATTENDANCE"],
  };

  // Handle hover to show submenu temporarily
  const handleDeptItemHover = (itemId) => {
    // Clear any pending timeout when hovering a new item
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (departmentItems.find((item) => item.id === itemId)?.hasSubMenu) {
      setHoveredDeptItem(itemId);
    }
  };

  // Handle mouse leave from department item
  // Don't clear immediately - allow mouse to move to submenu panel or submenu items
  const handleDeptItemLeave = (itemId) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Longer delay to allow mouse to move to submenu panel (especially for items far down like HR)
    hoverTimeoutRef.current = setTimeout(() => {
      // Only clear if we're still on the same item (not moved to panel)
      if (hoveredDeptItem === itemId) {
        setHoveredDeptItem(null);
      }
    }, 600);
  };

  // Handle mouse enter on submenu panel - keep it visible
  const handleSubMenuPanelEnter = (deptId) => {
    // Clear any pending timeout and keep submenu visible
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    // Always set to keep the correct submenu visible
    setHoveredDeptItem(deptId);
  };

  // Handle mouse leave from submenu panel
  const handleSubMenuPanelLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredDeptItem(null);
  };

  // Handle submenu item click - hide both menus and show fullscreen content
  const handleSubItemClick = (subItemId) => {
    setSelectedSubMenuItem(subItemId);
    setHoveredDeptItem(null);
    setSelectedDepartment(null);
  };

  // Handle back to departments
  const handleBackToDepartments = () => {
    setSelectedSubMenuItem(null);
    setSelectedDepartment(null);
    setHoveredDeptItem(null);
    setShowGenerateBuyerCode(false);
    setShowGenerateVendorCode(false);
    setShowGeneratePOCode(false);
    setShowGenerateFactoryCode(false);
    setShowVendorMasterSheet(false);
    setShowBuyerMasterSheet(false);
    setShowCompanyEssentials(false);
    setShowCompanyEssentialsMasterSheet(false);
    setShowInternalPurchaseOrder(false);
    setShowIPOMasterSheet(false);
    setEditingBuyer(null);
    setEditingVendor(null);
  };

  // Determine if submenu should be shown (hover only)
  const shouldShowSubMenu = (itemId) => {
    return hoveredDeptItem === itemId;
  };

  // Get department name from item ID
  const getDepartmentName = (itemId) => {
    const dept = departmentItems.find((item) => item.id === itemId);
    return dept ? dept.label : "";
  };

  // Generic multi-button content renderer
  const renderMultiButtonContent = (title, description, buttons) => (
    <div className="fullscreen-content">
      <div className="content-header">
        <button className="back-button" onClick={handleBackToDepartments}>
          ← Back to Code Creation
        </button>
        <h1 className="fullscreen-title">{title}</h1>
        <p className="fullscreen-description">{description}</p>
      </div>
      <div className="fullscreen-buttons multi-button-grid">
        {buttons.map((buttonLabel, index) => (
          <button key={index} className="fullscreen-action-button primary">
            <div className="button-content">
              <span className="button-title">{buttonLabel}</span>
              <span className="button-subtitle">
                Access {buttonLabel.toLowerCase()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Content renderer for CHD CODE CREATION menu
  const renderCodeCreationContent = () => (
    <div className="fullscreen-content">
      <div className="content-header">
        <button className="back-button" onClick={handleBackToDepartments}>
          ← Back to Code Creation
        </button>
        <h1 className="fullscreen-title">Code Creation</h1>
        <p className="fullscreen-description">
          Generate codes for buyers, vendors, and manage company essentials
        </p>
      </div>
      <div className="fullscreen-buttons">
        <button
          className="fullscreen-action-button primary"
          onClick={() => setSelectedSubMenuItem("buyer")}
        >
          <div className="button-content">
            <span className="button-title">BUYER</span>
            <span className="button-subtitle">Generate buyer codes</span>
          </div>
        </button>
        <button
          className="fullscreen-action-button primary"
          onClick={() => setSelectedSubMenuItem("vendor")}
        >
          <div className="button-content">
            <span className="button-title">VENDOR</span>
            <span className="button-subtitle">Generate vendor codes</span>
          </div>
        </button>
        <button
          className="fullscreen-action-button primary"
          onClick={() => setSelectedSubMenuItem("company essentials")}
        >
          <div className="button-content">
            <span className="button-title">COMPANY ESSENTIALS</span>
            <span className="button-subtitle">Manage company essentials</span>
          </div>
        </button>
        <button
          className="fullscreen-action-button primary"
          onClick={() => setSelectedSubMenuItem("Internal Purchase Order")}
        >
          <div className="button-content">
            <span className="button-title">INTERNAL PURCHASE ORDER</span>
            <span className="button-subtitle">
              Create internal purchase orders
            </span>
          </div>
        </button>
      </div>
    </div>
  );

  // Content renderers for CHD CODE CREATION
  const renderBuyerContent = () => (
    <div className="fullscreen-content">
      <div className="content-header">
        <button className="back-button" onClick={handleBackToDepartments}>
          ← Back to Code Creation
        </button>
        <h1 className="fullscreen-title">Buyer Management</h1>
        <p className="fullscreen-description">
          Generate buyer codes and manage buyer master sheets
        </p>
      </div>
      <div className="fullscreen-buttons">
        <button
          className="fullscreen-action-button primary"
          onClick={() => {
            setEditingBuyer(null);
            setShowGenerateBuyerCode(true);
          }}
        >
          <div className="button-content">
            <span className="button-title">GENERATE BUYER CODE</span>
            <span className="button-subtitle">
              Create new buyer codes for procurement
            </span>
          </div>
        </button>
        <button
          className="fullscreen-action-button secondary"
          onClick={() => setShowBuyerMasterSheet(true)}
        >
          <div className="button-content">
            <span className="button-title">BUYER MASTER SHEET</span>
            <span className="button-subtitle">
              View and manage buyer master data
            </span>
          </div>
        </button>
      </div>
    </div>
  );

  const renderVendorContent = () => (
    <div className="fullscreen-content">
      <div className="content-header">
        <button className="back-button" onClick={handleBackToDepartments}>
          ← Back to Code Creation
        </button>
        <h1 className="fullscreen-title">Vendor Management</h1>
        <p className="fullscreen-description">
          Generate vendor codes and manage vendor master sheets
        </p>
      </div>
      <div className="fullscreen-buttons">
        <button
          className="fullscreen-action-button primary"
          onClick={() => {
            setEditingVendor(null);
            setShowGenerateVendorCode(true);
          }}
        >
          <div className="button-content">
            <span className="button-title">GENERATE VENDOR CODE</span>
            <span className="button-subtitle">
              Create new vendor codes for suppliers
            </span>
          </div>
        </button>
        <button
          className="fullscreen-action-button secondary"
          onClick={() => setShowVendorMasterSheet(true)}
        >
          <div className="button-content">
            <span className="button-title">VENDOR MASTER SHEET</span>
            <span className="button-subtitle">
              View and manage vendor master data
            </span>
          </div>
        </button>
      </div>
    </div>
  );

  const renderCompanyEssentialsContent = () => (
    <div className="fullscreen-content">
      <div className="content-header">
        <button className="back-button" onClick={handleBackToDepartments}>
          ← Back to Code Creation
        </button>
        <h1 className="fullscreen-title">Company Essentials</h1>
        <p className="fullscreen-description">
          Generate company essentials codes and manage the master sheet
        </p>
      </div>
      <div className="fullscreen-buttons">
        <button
          className="fullscreen-action-button primary"
          onClick={() => setShowCompanyEssentials(true)}
        >
          <div className="button-content">
            <span className="button-title">
              GENERATE COMPANY ESSENTIALS CODE
            </span>
            <span className="button-subtitle">
              Create codes for stationary, pantry, machinery and more
            </span>
          </div>
        </button>
        <button
          className="fullscreen-action-button secondary"
          onClick={() => setShowCompanyEssentialsMasterSheet(true)}
        >
          <div className="button-content">
            <span className="button-title">
              MASTER COMPANY ESSENTIALS SHEET
            </span>
            <span className="button-subtitle">
              View and manage company essentials master data
            </span>
          </div>
        </button>
      </div>
    </div>
  );

  const renderInternalPurchaseOrderContent = () => (
    <div className="fullscreen-content">
      <div className="content-header">
        <button className="back-button" onClick={handleBackToDepartments}>
          ← Back to Code Creation
        </button>
        <h1 className="fullscreen-title">Internal Purchase Order</h1>
        <p className="fullscreen-description">
          Generate internal purchase order codes and manage the master sheet
        </p>
      </div>
      <div className="fullscreen-buttons">
        <button
          className="fullscreen-action-button primary"
          onClick={() => setShowInternalPurchaseOrder(true)}
        >
          <div className="button-content">
            <span className="button-title">GENERATE IPO CODE</span>
            <span className="button-subtitle">
              Create internal purchase order with factory code steps
            </span>
          </div>
        </button>
        <button
          className="fullscreen-action-button secondary"
          onClick={() => setShowIPOMasterSheet(true)}
        >
          <div className="button-content">
            <span className="button-title">MASTER IPO SHEET</span>
            <span className="button-subtitle">
              View and manage internal purchase order master data
            </span>
          </div>
        </button>
      </div>
    </div>
  );

  // Content renderers for CHD PO ISSUE
  const renderGeneratePOContent = () => (
    <div className="fullscreen-content">
      <div className="content-header">
        <button className="back-button" onClick={handleBackToDepartments}>
          ← Back to Code Creation
        </button>
        <h1 className="fullscreen-title">Generate PO</h1>
        <p className="fullscreen-description">
          Create and manage purchase orders
        </p>
      </div>
      <div className="fullscreen-buttons">
        <button
          className="fullscreen-action-button primary"
          onClick={() => setShowGeneratePOCode(true)}
        >
          <div className="button-content">
            <span className="button-title">GENERATE PO CODE</span>
            <span className="button-subtitle">Create new purchase orders</span>
          </div>
        </button>
      </div>
    </div>
  );

  const renderPOMasterContent = () => (
    <div className="fullscreen-content">
      <div className="content-header">
        <button className="back-button" onClick={handleBackToDepartments}>
          ← Back to Code Creation
        </button>
        <h1 className="fullscreen-title">PO Master</h1>
        <p className="fullscreen-description">
          View and manage purchase order master data
        </p>
      </div>
      <div className="fullscreen-buttons">
        <button className="fullscreen-action-button primary">
          <div className="button-content">
            <span className="button-title">PO MASTER</span>
            <span className="button-subtitle">
              Access purchase order master sheet
            </span>
          </div>
        </button>
      </div>
    </div>
  );

  // Content renderers for IMS
  const renderInwardStoreSheetContent = () => (
    <div className="fullscreen-content">
      <div className="content-header">
        <button className="back-button" onClick={handleBackToDepartments}>
          ← Back to Code Creation
        </button>
        <h1 className="fullscreen-title">Inward Store Logs</h1>
        <p className="fullscreen-description">
          Manage incoming inventory and stock receipts
        </p>
      </div>
      <div className="fullscreen-buttons">
        <button className="fullscreen-action-button primary">
          <div className="button-content">
            <span className="button-title">INWARD STORE LOGS</span>
            <span className="button-subtitle">
              Track and manage incoming stock
            </span>
          </div>
        </button>
      </div>
    </div>
  );

  const renderOutwardStoreSheetContent = () => (
    <div className="fullscreen-content">
      <div className="content-header">
        <button className="back-button" onClick={handleBackToDepartments}>
          ← Back to Code Creation
        </button>
        <h1 className="fullscreen-title">Outward Store Logs</h1>
        <p className="fullscreen-description">
          Manage outgoing inventory and stock dispatch
        </p>
      </div>
      <div className="fullscreen-buttons">
        <button className="fullscreen-action-button primary">
          <div className="button-content">
            <span className="button-title">OUTWARD STORE LOGS</span>
            <span className="button-subtitle">
              Track and manage outgoing stock
            </span>
          </div>
        </button>
      </div>
    </div>
  );

  const renderDepartmentMainContent = () => {
    // Handle Code Creation menu FIRST (before showGenerateFactoryCode check)
    if (selectedSubMenuItem === "code-creation-menu") {
      return renderCodeCreationContent();
    }

    // Handle Internal Purchase Order
    if (showInternalPurchaseOrder) {
      return (
        <InternalPurchaseOrder
          onBack={() => {
            setShowInternalPurchaseOrder(false);
          }}
          onNavigateToCodeCreation={() => {
            setShowInternalPurchaseOrder(false);
            setSelectedSubMenuItem("code-creation-menu");
          }}
          onNavigateToIPO={() => {
            // This will be handled by InternalPurchaseOrder itself
            // to reset to initial screen - the handleNavigateToIPO function
            // in InternalPurchaseOrder will handle this
            console.log(
              "IPO navigation requested - handled by InternalPurchaseOrder",
            );
          }}
        />
      );
    }

    if (showGenerateBuyerCode) {
      return (
        <GenerateBuyerCode
          initialData={editingBuyer}
          onBack={() => {
            setShowGenerateBuyerCode(false);
            if (editingBuyer) {
              setEditingBuyer(null);
              setShowBuyerMasterSheet(true);
            }
          }}
          onSaved={() => {
            setShowGenerateBuyerCode(false);
            setEditingBuyer(null);
            setShowBuyerMasterSheet(true);
          }}
        />
      );
    }

    if (showGenerateVendorCode) {
      return (
        <GenerateVendorCode
          initialData={editingVendor}
          onBack={() => {
            setShowGenerateVendorCode(false);
            if (editingVendor) {
              setEditingVendor(null);
              setShowVendorMasterSheet(true);
            }
          }}
          onSaved={() => {
            setShowGenerateVendorCode(false);
            setEditingVendor(null);
            setShowVendorMasterSheet(true);
          }}
        />
      );
    }

    if (showGeneratePOCode) {
      return <GeneratePOCode onBack={() => setShowGeneratePOCode(false)} />;
    }

    if (showGenerateFactoryCode) {
      return (
        <GenerateFactoryCode
          onBack={() => setShowGenerateFactoryCode(false)}
          onNavigateToCodeCreation={() => {
            console.log("Navigating to Code Creation menu");
            setShowGenerateFactoryCode(false);
            setSelectedSubMenuItem("code-creation-menu");
            console.log("State updated:", {
              showGenerateFactoryCode: false,
              selectedSubMenuItem: "code-creation-menu",
            });
          }}
          onNavigateToIPO={() => {
            console.log("Navigating to IPO from GenerateFactoryCode");
            setShowGenerateFactoryCode(false);
            // Navigate to IPO screen
            setShowInternalPurchaseOrder(true);
            setSelectedSubMenuItem("Internal Purchase Order");
          }}
        />
      );
    }

    if (showVendorMasterSheet) {
      return (
        <VendorMasterSheet
          onBack={() => setShowVendorMasterSheet(false)}
          onEditVendor={(vendor) => {
            setEditingVendor(vendor);
            setShowVendorMasterSheet(false);
            setShowGenerateVendorCode(true);
          }}
        />
      );
    }

    if (showBuyerMasterSheet) {
      return (
        <BuyerMasterSheet
          onBack={() => setShowBuyerMasterSheet(false)}
          onEditBuyer={(buyer) => {
            setEditingBuyer(buyer);
            setShowBuyerMasterSheet(false);
            setShowGenerateBuyerCode(true);
          }}
        />
      );
    }

    if (showCompanyEssentials) {
      return (
        <CompanyEssentials
          onBack={() => {
            setShowCompanyEssentials(false);
          }}
        />
      );
    }

    if (showCompanyEssentialsMasterSheet) {
      return (
        <CompanyEssentialsMasterSheet
          onBack={() => setShowCompanyEssentialsMasterSheet(false)}
        />
      );
    }

    if (showIPOMasterSheet) {
      return <IPOMasterSheet onBack={() => setShowIPOMasterSheet(false)} />;
    }

    // Handle specific content for CHD CODE CREATION
    if (selectedSubMenuItem === "buyer") {
      return renderBuyerContent();
    }
    if (selectedSubMenuItem === "vendor") {
      return renderVendorContent();
    }
    if (selectedSubMenuItem === "company essentials") {
      return renderCompanyEssentialsContent();
    }
    if (selectedSubMenuItem === "Internal Purchase Order") {
      return renderInternalPurchaseOrderContent();
    }

    // Handle specific content for CHD PO ISSUE
    if (selectedSubMenuItem === "generate-po") {
      return renderGeneratePOContent();
    }
    if (selectedSubMenuItem === "po-master") {
      return renderPOMasterContent();
    }

    // Handle specific content for IMS
    if (selectedSubMenuItem === "inward-store-sheet") {
      return renderInwardStoreSheetContent();
    }
    if (selectedSubMenuItem === "outward-store-sheet") {
      return renderOutwardStoreSheetContent();
    }

    // Handle all other submenu items with multi-button content
    if (selectedSubMenuItem && subMenuButtonConfigs[selectedSubMenuItem]) {
      // Find the submenu item label
      let subMenuLabel = "";
      Object.values(subMenuItems).forEach((items) => {
        const found = items.find((item) => item.id === selectedSubMenuItem);
        if (found) {
          subMenuLabel = found.label;
        }
      });

      const buttons = subMenuButtonConfigs[selectedSubMenuItem];
      const description = `Manage ${subMenuLabel.toLowerCase()} operations and related activities`;

      return renderMultiButtonContent(subMenuLabel, description, buttons);
    }
  };

  // If a submenu item is selected, show fullscreen content
  if (
    selectedSubMenuItem ||
    showGenerateBuyerCode ||
    showGenerateVendorCode ||
    showGeneratePOCode ||
    showGenerateFactoryCode ||
    showVendorMasterSheet ||
    showBuyerMasterSheet ||
    showCompanyEssentials ||
    showCompanyEssentialsMasterSheet ||
    showInternalPurchaseOrder ||
    showIPOMasterSheet
  ) {
    return renderDepartmentMainContent();
  }

  return (
    <div className="department-layout">
      {/* Left Department Menu */}
      <div className="department-menu">
        <h3 className="dept-menu-title">Department Sections</h3>
        <div className="dept-menu-list">
          {departmentItems.map((deptItem) => (
            <div
              key={deptItem.id}
              className="dept-menu-item-wrapper"
              onMouseEnter={() => handleDeptItemHover(deptItem.id)}
              onMouseLeave={() => handleDeptItemLeave(deptItem.id)}
            >
              <div
                className={`dept-menu-item ${
                  selectedDepartment === deptItem.id ||
                  hoveredDeptItem === deptItem.id
                    ? "active"
                    : ""
                }`}
              >
                <span className="dept-menu-label">{deptItem.label}</span>
                {deptItem.hasSubMenu && (
                  <span
                    className={`forward-arrow ${hoveredDeptItem === deptItem.id ? "active" : ""}`}
                  >
                    →
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submenu - appears as a separate menu panel on hover or when sticky */}
      {Object.keys(subMenuItems).map((deptId) => {
        const isTwoColumn = subMenuItems[deptId].length > 6;

        return (
          shouldShowSubMenu(deptId) && (
            <div
              key={deptId}
              className="department-submenu-panel hover"
              ref={subMenuRef}
              onMouseEnter={() => handleSubMenuPanelEnter(deptId)}
              onMouseLeave={handleSubMenuPanelLeave}
              style={
                isTwoColumn
                  ? {
                      minWidth: "500px",
                      maxWidth: "600px",
                      maxHeight: "90vh",
                      overflowY: "auto",
                    }
                  : {}
              }
            >
              <h3 className="dept-menu-title">{getDepartmentName(deptId)}</h3>
              <div
                className="dept-menu-list"
                style={
                  isTwoColumn
                    ? {
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "8px",
                        columnGap: "16px",
                      }
                    : {}
                }
              >
                {subMenuItems[deptId].map((subItem) => (
                  <div
                    key={subItem.id}
                    className="dept-menu-item-wrapper"
                    style={isTwoColumn ? { width: "100%" } : {}}
                    onMouseEnter={() => handleSubMenuPanelEnter(deptId)}
                  >
                    <div
                      className="dept-menu-item submenu-item"
                      onClick={() => handleSubItemClick(subItem.id)}
                      style={isTwoColumn ? { width: "100%" } : {}}
                    >
                      <span className="dept-menu-label">{subItem.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        );
      })}
    </div>
  );
};

export default DepartmentContent;
