import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SidebarContext } from '../context/SidebarContext';
import HomeContent from '../components/HomeContent';
import TasksContent from '../components/TasksContent';
import PurchaseContent from '../components/PurchaseContent';
import GenerateBuyerCode from '../components/GenerateBuyerCode';
import GenerateVendorCode from '../components/GenerateVendorCode';
import CompanyEssentials from '../components/CompanyEssentials';
import InternalPurchaseOrder from '../components/InternalPurchaseOrder/InternalPurchaseOrder';
import IPOMasterCNS from '../components/IPOManagement/IPOMasterCNS';
import IPODerivedCNS from '../components/IPOManagement/IPODerivedCNS';
import GeneratePOCode from '../components/GeneratePOCode';
import BuyerMasterSheet from '../components/BuyerMasterSheet';
import VendorMasterSheet from '../components/VendorMasterSheet';
import CompanyEssentialsMasterSheet from '../components/CompanyEssentialsMasterSheet';
import IPOMasterSheet from '../components/IPOMasterSheet';
import CompletedIPOs from '../components/CompletedIPOs';
import UQRFormsPreview from '../components/UQR_forms/UQRFormsPreview.jsx';
import CourierManagement from '../components/CourierManagement.jsx';
import InwardStoreSheet from '../components/InwardStoreSheet.jsx';
import InwardStoreSheetDatabase from '../components/InwardStoreSheetDatabase.jsx';
import OutwardStoreSheet from '../components/OutwardStoreSheet.jsx';
import OutwardStoreSheetDatabase from '../components/OutwardStoreSheetDatabase.jsx';
import StockSheet from '../components/StockSheet.jsx';
import MasterStockSheet from '../components/MasterStockSheet.jsx';
import { getIPOs, deleteIPO } from '../services/integration';
import { useLoading } from '../context/LoadingContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Menu,
  Home,
  Calculator,
  Search,
  Trash2
} from 'lucide-react';
import './Dashboard.css';
import { normalizeOrderType } from '../utils/orderType';

const Stack3Icon = ({ size = 18 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M20.894 17.553a1 1 0 0 1 -.447 1.341l-8 4a1 1 0 0 1 -.894 0l-8 -4a1 1 0 0 1 .894 -1.788l7.553 3.774l7.554 -3.775a1 1 0 0 1 1.341 .447m0 -4a1 1 0 0 1 -.447 1.341l-8 4a1 1 0 0 1 -.894 0l-8 -4a1 1 0 0 1 .894 -1.788l7.552 3.775l7.554 -3.775a1 1 0 0 1 1.341 .447m0 -4a1 1 0 0 1 -.447 1.341l-8 4a1 1 0 0 1 -.894 0l-8 -4a1 1 0 0 1 .894 -1.788l7.552 3.775l7.554 -3.775a1 1 0 0 1 1.341 .447m-8.887 -8.552q .056 0 .111 .007l.111 .02l.086 .024l.012 .006l.012 .002l.029 .014l.05 .019l.016 .009l.012 .005l8 4a1 1 0 0 1 0 1.788l-8 4a1 1 0 0 1 -.894 0l-8 -4a1 1 0 0 1 0 -1.788l8 -4l.011 -.005l.018 -.01l.078 -.032l.011 -.002l.013 -.006l.086 -.024l.11 -.02l.056 -.005z" />
  </svg>
);

const NotepadPenIcon = ({ size = 18 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M8 4h6v4h-6z" />
    <path d="M18 6h1a1 1 0 0 1 1 1v3.5" />
    <path d="M5 14v5a1 1 0 0 0 1 1h6.5" />
    <path d="M4 6a1 1 0 0 1 1 -1h1" />
    <path d="M4 6v4" />
    <path d="M4 14v-1" />
    <path d="M8 12h3" />
    <path d="M8 16h2" />
    <path d="M18.42 15.61a2.1 2.1 0 0 1 2.97 2.97l-3.39 3.42h-3v-3z" />
  </svg>
);

const ScannerIcon = ({ size = 18 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 7v-1a2 2 0 0 1 2 -2h2" />
    <path d="M3 17v1a2 2 0 0 0 2 2h2" />
    <path d="M17 4h2a2 2 0 0 1 2 2v1" />
    <path d="M17 20h2a2 2 0 0 0 2 -2v-1" />
    <path d="M5 12h14" />
    <path d="M8 9v-1" />
    <path d="M11 9v-1" />
    <path d="M14 9v-1" />
    <path d="M8 16v-1" />
    <path d="M11 16v-1" />
    <path d="M14 16v-1" />
  </svg>
);

const ShoppingBagIcon = ({ size = 18 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M6.331 8h11.339a2 2 0 0 1 1.977 2.304l-1.255 8.152a3 3 0 0 1 -2.966 2.544h-6.852a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304" />
    <path d="M9 11v-5a3 3 0 0 1 6 0v5" />
  </svg>
);

const StorefrontIcon = ({ size = 18 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
    />
  </svg>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('home');
  const [tasksView, setTasksView] = useState('assign');
  const [codeCreationView, setCodeCreationView] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [hoveredSubmenu, setHoveredSubmenu] = useState(null);
  const [existingIPOs, setExistingIPOs] = useState([]);
  const [selectedIpoForCNS, setSelectedIpoForCNS] = useState(null);
  const [selectedIpoForSpec, setSelectedIpoForSpec] = useState(null);
  const [selectedIpoForDerivedCNS, setSelectedIpoForDerivedCNS] = useState(null);
  const [specStepHint, setSpecStepHint] = useState(null); // { flowPhase, currentStep }
  const [existingCompanyEssentials, setExistingCompanyEssentials] = useState([]);
  const [ipoToDelete, setIpoToDelete] = useState(null);
  const [isDeletingIpo, setIsDeletingIpo] = useState(false);
  const [ipoDeleteError, setIpoDeleteError] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('0');
  const [editingBuyer, setEditingBuyer] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const profileMenuRef = useRef(null);
  const calculatorRef = useRef(null);
  const sidebarLoadedOnceRef = useRef(false);
  const { showLoading, hideLoading } = useLoading();
  const sidebarRef = useRef(null);
  const hoverPanelRef = useRef(null);

  const getDisplayName = () => {
    const firstLast = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
    const firstLastAlt = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    return (
      firstLast ||
      firstLastAlt ||
      user?.full_name?.trim() ||
      user?.name?.trim() ||
      user?.username?.trim() ||
      user?.email ||
      'User'
    );
  };

  const displayName = getDisplayName();
  const showEmailLine = Boolean(user?.email && displayName !== user?.email);

  // Company name for header/sidebar: tenant company_name, else derive from email domain, default BINDER-OS
  const getCompanyDisplayName = () => {
    const fromTenant = user?.tenant_details?.company_name;
    if (fromTenant && String(fromTenant).trim()) return String(fromTenant).trim();
    const email = user?.email;
    if (email && email.includes('@')) {
      const domain = email.split('@')[1] || '';
      const base = domain.replace(/\.(com|in|org|net)$/i, '').trim();
      if (base) return base.split(/[-._]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(' ');
    }
    return 'BINDER-OS';
  };
  const companyDisplayName = getCompanyDisplayName();
  const companyLogo = user?.tenant_details?.logo || null;
  const companyInitials = companyDisplayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join('') || 'B';

  // Redirect to onboarding if tenant exists and onboarding not completed
  useEffect(() => {
    const tenantDetails = user?.tenant_details;
    if (tenantDetails && tenantDetails.onboarding_completed === false) {
      navigate('/onboarding', { replace: true });
    }
  }, [user?.tenant_details?.onboarding_completed, navigate]);

  // Intercept the browser back button on the dashboard. Instead of leaving for
  // the login page, ask the user whether they want to log out.
  useEffect(() => {
    // Seed an extra history entry so the first back press fires popstate
    // without navigating away from the dashboard.
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      // Re-seed the entry so we stay put, then surface the logout prompt.
      window.history.pushState(null, '', window.location.href);
      setShowLogoutConfirm(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isOperator = (value) => ['+', '-', '*', '/'].includes(value);

  const appendCalcValue = (value) => {
    setCalcInput((prev) => {
      if (value === '.') {
        const lastSegment = prev.split(/[\+\-\*\/]/).pop() || '';
        if (lastSegment.includes('.')) {
          return prev;
        }
      }

      if (isOperator(value)) {
        if (!prev && value !== '-') {
          return prev;
        }
        if (prev && isOperator(prev.slice(-1))) {
          return `${prev.slice(0, -1)}${value}`;
        }
      }

      return `${prev}${value}`;
    });
  };

  const handleCalcClear = () => {
    setCalcInput('');
    setCalcResult('0');
  };

  const handleCalcDelete = () => {
    setCalcInput((prev) => prev.slice(0, -1));
  };

  const evaluateCalculation = () => {
    if (!calcInput) {
      return;
    }

    const safeExpression = calcInput.replace(/[^0-9+\-*/().]/g, '');
    if (!safeExpression || isOperator(safeExpression.slice(-1))) {
      return;
    }

    try {
      const raw = Function(`"use strict"; return (${safeExpression});`)();
      if (!Number.isFinite(raw)) {
        setCalcResult('Error');
        return;
      }
      const formatted = Number.isInteger(raw) ? raw.toString() : Number(raw.toFixed(8)).toString();
      setCalcResult(formatted);
      setCalcInput(formatted);
    } catch (error) {
      setCalcResult('Error');
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getMenuItems = () => {
    return [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'tasks', label: 'Tasks', icon: NotepadPenIcon },
      { id: 'code-creation', label: 'Code Creation', icon: ScannerIcon },
      { id: 'ipo-management', label: 'IPO Management', icon: Stack3Icon },
      { id: 'purchase', label: 'Purchase', icon: ShoppingBagIcon },
      { id: 'ims', label: 'IMS', icon: StorefrontIcon },
    ];
  };

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return <HomeContent user={user} />;
      case 'uqr-forms':
        return <UQRFormsPreview mode="forms" />;
      case 'uqr-database':
        return <UQRFormsPreview mode="database" />;
      case 'courier-slip':
        return <CourierManagement mode="slip" />;
      case 'courier-master':
        return <CourierManagement mode="master" />;
      case 'inward-store-sheet':
        return <InwardStoreSheet onBack={() => setActivePage('home')} />;
      case 'inward-store-sheet-db':
        return <InwardStoreSheetDatabase onBack={() => setActivePage('home')} onOpenForm={() => setActivePage('inward-store-sheet')} />;
      case 'outward-store-sheet':
        return <OutwardStoreSheet onBack={() => setActivePage('home')} />;
      case 'outward-store-sheet-db':
        return <OutwardStoreSheetDatabase onBack={() => setActivePage('home')} onOpenForm={() => setActivePage('outward-store-sheet')} />;
      case 'stock-sheet':
        return <StockSheet onBack={() => setActivePage('stock-sheet-db')} onSaved={() => setActivePage('stock-sheet-db')} />;
      case 'stock-sheet-db':
        return <MasterStockSheet onBack={() => setActivePage('home')} onOpenForm={() => setActivePage('stock-sheet')} />;
      case 'tasks':
        return <TasksContent initialView={tasksView} />;
      case 'purchase':
        return <PurchaseContent />;
      case 'ipo-management':
        if (selectedIpoForSpec) {
          return (
            <InternalPurchaseOrder
              specMode="spec"
              initialOpenIpo={selectedIpoForSpec}
              initialFlowPhase={specStepHint?.flowPhase}
              initialCurrentStep={specStepHint?.currentStep}
              initialSkuId={specStepHint?.skuId}
              highlightOnMount={!!specStepHint}
              onBack={() => { setSelectedIpoForSpec(null); setSpecStepHint(null); setActivePage('ipo-management'); }}
              onNavigateToCodeCreation={() => { setSelectedIpoForSpec(null); setSpecStepHint(null); setActivePage('code-creation'); setCodeCreationView(null); setHoveredMenu('code-creation'); }}
              onNavigateToIPO={() => { setSelectedIpoForSpec(null); setSpecStepHint(null); setActivePage('ipo-management'); }}
            />
          );
        }
        if (selectedIpoForDerivedCNS) {
          return (
            <div className="dashboard-content" style={{ padding: 24, overflowY: 'auto' }}>
              <button
                type="button"
                onClick={() => setSelectedIpoForDerivedCNS(null)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  marginBottom: 16,
                }}
              >
                ← Back
              </button>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>IPC Derived CNS</h1>
              <p style={{ color: '#6b7280', fontFamily: 'ui-monospace, Menlo, Consolas, monospace', marginBottom: 16 }}>
                {selectedIpoForDerivedCNS.ipoCode}
              </p>
              <IPODerivedCNS
                ipo={selectedIpoForDerivedCNS}
                onNavigateToSpec={(sectionKey, skuId) => {
                  const SECTION_MAP = {
                    'product-spec': { flowPhase: 'step0', currentStep: 0 },
                    'cut-sew': { flowPhase: 'ipcFlow', currentStep: 0 },
                    'raw-material': { flowPhase: 'ipcFlow', currentStep: 1 },
                    'consumption': { flowPhase: 'ipcFlow', currentStep: 1 },
                    'artwork': { flowPhase: 'ipcFlow', currentStep: 2 },
                    'packaging': { flowPhase: 'packaging', currentStep: 0 },
                  };
                  const hint = SECTION_MAP[sectionKey] || { flowPhase: 'step0', currentStep: 0 };
                  setSpecStepHint({ ...hint, skuId });
                  setSelectedIpoForDerivedCNS(null);
                  setSelectedIpoForSpec({
                    ...selectedIpoForDerivedCNS,
                  });
                }}
              />
            </div>
          );
        }
        if (selectedIpoForCNS) {
          return (
            <div className="dashboard-content" style={{ padding: 24, overflowY: 'auto' }}>
              <button
                type="button"
                onClick={() => setSelectedIpoForCNS(null)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  marginBottom: 16,
                }}
              >
                ← Back
              </button>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>IPO Master CNS</h1>
              <p style={{ color: '#6b7280', fontFamily: 'ui-monospace, Menlo, Consolas, monospace', marginBottom: 16 }}>
                {selectedIpoForCNS.ipoCode}
              </p>
              <IPOMasterCNS ipo={selectedIpoForCNS} />
            </div>
          );
        }
        return (
          <div className="dashboard-content" style={{ padding: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>IPO Management</h1>
          </div>
        );
      case 'code-creation':
        if (codeCreationView === 'buyer') {
          return (
            <GenerateBuyerCode
              initialData={editingBuyer}
              onBack={() => {
                if (editingBuyer) {
                  setEditingBuyer(null);
                  setCodeCreationView('buyer-existing');
                } else {
                  setCodeCreationView(null);
                }
                setActivePage('code-creation');
                setHoveredMenu('code-creation');
              }}
              onSaved={() => {
                setEditingBuyer(null);
                setActivePage('code-creation');
                setCodeCreationView('buyer-existing');
                setHoveredMenu('code-creation');
              }}
            />
          );
        }
        if (codeCreationView === 'buyer-existing') {
          return (
            <BuyerMasterSheet
              onBack={() => { setActivePage('code-creation'); setCodeCreationView(null); setHoveredMenu('code-creation'); }}
              onEditBuyer={(buyer) => {
                setEditingBuyer(buyer);
                setActivePage('code-creation');
                setCodeCreationView('buyer');
                setHoveredMenu('code-creation');
              }}
            />
          );
        }
        if (codeCreationView === 'vendor') {
          return (
            <GenerateVendorCode
              initialData={editingVendor}
              onBack={() => {
                if (editingVendor) {
                  setEditingVendor(null);
                  setCodeCreationView('vendor-existing');
                } else {
                  setCodeCreationView(null);
                }
                setActivePage('code-creation');
                setHoveredMenu('code-creation');
              }}
              onSaved={() => {
                setEditingVendor(null);
                setActivePage('code-creation');
                setCodeCreationView('vendor-existing');
                setHoveredMenu('code-creation');
              }}
            />
          );
        }
        if (codeCreationView === 'vendor-existing') {
          return (
            <VendorMasterSheet
              onBack={() => { setActivePage('code-creation'); setCodeCreationView(null); setHoveredMenu('code-creation'); }}
              onEditVendor={(vendor) => {
                setEditingVendor(vendor);
                setActivePage('code-creation');
                setCodeCreationView('vendor');
                setHoveredMenu('code-creation');
              }}
            />
          );
        }
        if (codeCreationView === 'company-essentials') {
          return <CompanyEssentials onBack={() => { setActivePage('code-creation'); setCodeCreationView(null); setHoveredMenu('code-creation'); }} />;
        }
        if (codeCreationView === 'company-essentials-master') {
          return (
            <CompanyEssentialsMasterSheet
              onBack={() => { setActivePage('code-creation'); setCodeCreationView(null); setHoveredMenu('code-creation'); }}
            />
          );
        }
        if (codeCreationView === 'internal-purchase-order') {
          return (
            <InternalPurchaseOrder
              specMode="create"
              onBack={() => { setActivePage('code-creation'); setCodeCreationView(null); setHoveredMenu('code-creation'); }}
              onNavigateToCodeCreation={() => { setActivePage('code-creation'); setCodeCreationView(null); setHoveredMenu('code-creation'); }}
              onNavigateToIPO={() => setActivePage('code-creation')}
            />
          );
        }
        if (codeCreationView === 'internal-purchase-order-master') {
          return (
            <IPOMasterSheet
              onBack={() => { setActivePage('code-creation'); setCodeCreationView(null); setHoveredMenu('code-creation'); }}
            />
          );
        }
        if (codeCreationView === 'completed-ipos') {
          return (
            <CompletedIPOs
              onBack={() => { setActivePage('code-creation'); setCodeCreationView(null); setHoveredMenu('code-creation'); }}
            />
          );
        }
        if (codeCreationView === 'generate-po') {
          return <GeneratePOCode onBack={() => { setActivePage('code-creation'); setCodeCreationView(null); setHoveredMenu('code-creation'); }} />;
        }
        return <div className="dashboard-content" />;
      default:
        return <div className="dashboard-content" />;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  useEffect(() => {
    if (!showCalculator) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      calculatorRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [showCalculator]);

  const handleCalculatorKeyDown = (event) => {
    const { key } = event;

    if (/^\d$/.test(key)) {
      event.preventDefault();
      appendCalcValue(key);
      return;
    }

    if (key === '.') {
      event.preventDefault();
      appendCalcValue('.');
      return;
    }

    if (['+', '-', '*', '/'].includes(key)) {
      event.preventDefault();
      appendCalcValue(key);
      return;
    }

    if (key === 'Enter' || key === '=') {
      event.preventDefault();
      evaluateCalculation();
      return;
    }

    if (key === 'Backspace') {
      event.preventDefault();
      handleCalcDelete();
      return;
    }

    if (key === 'Delete') {
      event.preventDefault();
      handleCalcClear();
    }
  };

  const requestDeleteIpo = (ipo) => {
    if (!ipo) return;
    setIpoDeleteError('');
    setIpoToDelete(ipo);
  };

  const cancelDeleteIpo = () => {
    if (isDeletingIpo) return;
    setIpoToDelete(null);
    setIpoDeleteError('');
  };

  const confirmDeleteIpo = async () => {
    if (!ipoToDelete) return;
    const targetId = ipoToDelete.ipoId || ipoToDelete.id;
    if (!targetId) {
      setIpoDeleteError('Cannot delete this IPO: missing identifier.');
      return;
    }
    setIsDeletingIpo(true);
    setIpoDeleteError('');
    try {
      await deleteIPO(targetId);
      const deletedCode = ipoToDelete.ipoCode || ipoToDelete.code || '';
      // Scrub the deleted IPO from the local "completed" cache so it doesn't
      // leave a stale entry behind. Tracked by id-or-code, so try both.
      try {
        const raw = localStorage.getItem('completedIpos');
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const deletedId = String(targetId);
          const deletedCodeStr = String(deletedCode);
          const next = parsed.filter((k) => {
            const s = String(k);
            return s !== deletedId && s !== deletedCodeStr;
          });
          if (next.length !== parsed.length) {
            localStorage.setItem('completedIpos', JSON.stringify(next));
          }
        }
      } catch (cleanupErr) {
        console.warn('Failed to clean completedIpos cache:', cleanupErr);
      }
      setIpoToDelete(null);
      setHoveredSubmenu(null);
      setHoveredMenu(null);
      if (selectedIpoForCNS && (selectedIpoForCNS.ipoId === targetId || selectedIpoForCNS.ipoCode === deletedCode)) {
        setSelectedIpoForCNS(null);
      }
      if (selectedIpoForSpec && (selectedIpoForSpec.ipoId === targetId || selectedIpoForSpec.ipoCode === deletedCode)) {
        setSelectedIpoForSpec(null);
      }
      if (selectedIpoForDerivedCNS && (selectedIpoForDerivedCNS.ipoId === targetId || selectedIpoForDerivedCNS.ipoCode === deletedCode)) {
        setSelectedIpoForDerivedCNS(null);
      }
      await loadSidebarData();
      window.dispatchEvent(new Event('internalPurchaseOrdersUpdated'));
    } catch (error) {
      console.error('Failed to delete IPO:', error);
      setIpoDeleteError(error?.message || error?.detail || 'Failed to delete IPO. Please try again.');
    } finally {
      setIsDeletingIpo(false);
    }
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
            ipoCode: ipo.ipo_code || ipo.ipoCode || '',
            orderType: normalizeOrderType(ipo.order_type || ipo.orderType || ''),
            buyerCode: ipo.buyer_code_text || ipo.buyerCode || '',
            type: ipo.company_type || ipo.type || '',
            programName: ipo.program_name || ipo.programName || '',
            poSrNo: ipo.po_sr_no || ipo.poSrNo || 1,
            createdAt: ipo.created_at || ipo.createdAt || '',
          }))
          : [];
        setExistingIPOs(normalized);
        localStorage.setItem('internalPurchaseOrders', JSON.stringify(normalized));
      } catch (e) {
        setExistingIPOs([]);
      }
      try {
        const storedEssentials = JSON.parse(localStorage.getItem('companyEssentials') || '[]');
        setExistingCompanyEssentials(storedEssentials);
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
    window.addEventListener('internalPurchaseOrdersUpdated', handleIpoUpdate);
    return () => window.removeEventListener('internalPurchaseOrdersUpdated', handleIpoUpdate);
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
      activePage === 'home'
      || activePage === 'tasks'
      || activePage === 'uqr-forms'
      || activePage === 'uqr-database'
      || activePage === 'courier-slip'
      || activePage === 'courier-master'
      || activePage === 'inward-store-sheet'
      || activePage === 'inward-store-sheet-db'
      || activePage === 'outward-store-sheet'
      || activePage === 'outward-store-sheet-db'
      || activePage === 'stock-sheet'
      || activePage === 'stock-sheet-db'
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hoveredMenu]);

  const ipoByType = (type) => {
    const normalizedType = normalizeOrderType(type);
    return existingIPOs.filter((ipo) =>
      normalizeOrderType(ipo.orderType || ipo.order_type) === normalizedType && (ipo.ipoCode || ipo.code)
    );
  };

  const getCompanyEssentialsItems = () =>
    existingCompanyEssentials.map((entry, index) => {
      const label = entry.code || entry.poNumber || 'CHD/E/.../PO-';
      return {
        key: entry.code || entry.poNumber || `${entry.category || 'ce'}-${index}`,
        label
      };
    });

  const getIpoItems = (orderType) => {
    const normalizedType = normalizeOrderType(orderType);
    const prefixByType = {
      Production: 'CHD/PD/',
      Sampling: 'CHD/SAM/',
      Company: 'CHD/SELF/'
    };
    const expectedPrefix = prefixByType[normalizedType];
    return ipoByType(normalizedType)
      .filter((ipo) => {
        if (!expectedPrefix) return true;
        const code = (ipo.ipoCode || ipo.code || '').toUpperCase();
        if (code.includes('/E/')) return false;
        return code.startsWith(expectedPrefix);
      })
      .map((ipo, index) => ({
        key: ipo.ipoCode || ipo.code || `${normalizedType}-${index}`,
        label: ipo.ipoCode || ipo.code || 'IPO'
      }));
  };

  const getItemsForCategory = (categoryKey, categoryType) => {
    if (categoryKey === 'company-essentials') {
      return getCompanyEssentialsItems();
    }
    return getIpoItems(categoryType);
  };

  const renderHoverPanel = () => {
    if (!hoveredMenu) return null;

    if (hoveredMenu === 'code-creation') {
      const activeCategory = hoveredSubmenu?.menu === 'code-creation' ? hoveredSubmenu.category : null;
      return (
        <div className="hover-panel-group" ref={hoverPanelRef} onMouseLeave={() => setHoveredSubmenu(null)}>
          <div className="hover-panel">
            <div className="hover-panel-column">
              <button
                className={`hover-panel-item ${activeCategory === 'buyer' ? 'active' : ''}`}
                onMouseEnter={() => setHoveredSubmenu({ menu: 'code-creation', category: 'buyer' })}
              >
                Buyer
              </button>
              <button
                className={`hover-panel-item ${activeCategory === 'vendor' ? 'active' : ''}`}
                onMouseEnter={() => setHoveredSubmenu({ menu: 'code-creation', category: 'vendor' })}
              >
                Vendor
              </button>
              <button
                className={`hover-panel-item ${activeCategory === 'company-essentials' ? 'active' : ''}`}
                onMouseEnter={() => setHoveredSubmenu({ menu: 'code-creation', category: 'company-essentials' })}
              >
                Company Essentials
              </button>
              <button
                className={`hover-panel-item ${activeCategory === 'internal-purchase-order' ? 'active' : ''}`}
                onMouseEnter={() => setHoveredSubmenu({ menu: 'code-creation', category: 'internal-purchase-order' })}
              >
                Internal Purchase Order
              </button>
            </div>
          </div>
          {activeCategory === 'buyer' && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Buyer</div>
                <button className="hover-panel-item" onClick={() => { setEditingBuyer(null); setActivePage('code-creation'); setCodeCreationView('buyer'); setHoveredMenu(null); setHoveredSubmenu(null); }}>
                  Generate Buyer Code
                </button>
                <button className="hover-panel-item" onClick={() => { setActivePage('code-creation'); setCodeCreationView('buyer-existing'); setHoveredMenu(null); setHoveredSubmenu(null); }}>
                  Master Buyer Sheet
                </button>
              </div>
            </div>
          )}
          {activeCategory === 'vendor' && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Vendor</div>
                <button className="hover-panel-item" onClick={() => { setEditingVendor(null); setActivePage('code-creation'); setCodeCreationView('vendor'); setHoveredMenu(null); setHoveredSubmenu(null); }}>
                  Generate Vendor Code
                </button>
                <button className="hover-panel-item" onClick={() => { setActivePage('code-creation'); setCodeCreationView('vendor-existing'); setHoveredMenu(null); setHoveredSubmenu(null); }}>
                  Master Vendor Sheet
                </button>
              </div>
            </div>
          )}
          {activeCategory === 'company-essentials' && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Company Essentials</div>
                <button className="hover-panel-item" onClick={() => { setActivePage('code-creation'); setCodeCreationView('company-essentials'); setHoveredMenu(null); setHoveredSubmenu(null); }}>
                  Generate Company Essentials Code
                </button>
                <button className="hover-panel-item" onClick={() => { setActivePage('code-creation'); setCodeCreationView('company-essentials-master'); setHoveredMenu(null); setHoveredSubmenu(null); }}>
                  Master Company Essentials Sheet
                </button>
              </div>
            </div>
          )}
          {activeCategory === 'internal-purchase-order' && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Internal Purchase Order</div>
                <button className="hover-panel-item" onClick={() => { setActivePage('code-creation'); setCodeCreationView('internal-purchase-order'); setHoveredMenu(null); setHoveredSubmenu(null); }}>
                  Generate IPO Code
                </button>
                <button className="hover-panel-item" onClick={() => { setActivePage('code-creation'); setCodeCreationView('internal-purchase-order-master'); setHoveredMenu(null); setHoveredSubmenu(null); }}>
                  Master IPO Sheet
                </button>
                <button className="hover-panel-item" onClick={() => { setActivePage('code-creation'); setCodeCreationView('completed-ipos'); setHoveredMenu(null); setHoveredSubmenu(null); }}>
                  Completed IPOs
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }


    if (hoveredMenu === 'ipo-management') {
      const categories = [
        { label: 'Company', key: 'Company' },
        { label: 'Production', key: 'Production' },
        { label: 'Sampling', key: 'Sampling' },
      ];
      const activeCategory =
        hoveredSubmenu?.menu === 'ipo-management' ? hoveredSubmenu.category : null;
      const activeIpoCode =
        hoveredSubmenu?.menu === 'ipo-management' ? hoveredSubmenu.ipoCode : null;
      const items = activeCategory ? ipoByType(activeCategory) : [];
      const activeIpo = activeIpoCode
        ? items.find((i) => (i.ipoCode || i.code) === activeIpoCode)
        : null;

      const openIpoLeaf = (ipo) => {
        if (!ipo) return;
        setSelectedIpoForCNS(null);
        setSelectedIpoForDerivedCNS(null);
        setSelectedIpoForSpec({
          ...ipo,
          orderType: normalizeOrderType(ipo.orderType || ipo.order_type || ''),
        });
        setActivePage('ipo-management');
        setHoveredSubmenu(null);
        setHoveredMenu(null);
      };

      const openCnsLeaf = (ipo) => {
        if (!ipo) return;
        setSelectedIpoForSpec(null);
        setSelectedIpoForDerivedCNS(null);
        setSelectedIpoForCNS({
          ...ipo,
          orderType: normalizeOrderType(ipo.orderType || ipo.order_type || ''),
        });
        setActivePage('ipo-management');
        setHoveredSubmenu(null);
        setHoveredMenu(null);
      };

      const openDerivedCnsLeaf = (ipo) => {
        if (!ipo) return;
        setSelectedIpoForSpec(null);
        setSelectedIpoForCNS(null);
        setSelectedIpoForDerivedCNS({
          ...ipo,
          orderType: normalizeOrderType(ipo.orderType || ipo.order_type || ''),
        });
        setActivePage('ipo-management');
        setHoveredSubmenu(null);
        setHoveredMenu(null);
      };

      return (
        <div className="hover-panel-group" ref={hoverPanelRef} onMouseLeave={() => setHoveredSubmenu(null)}>
          <div className="hover-panel">
            <div className="hover-panel-column">
              <div className="hover-panel-title">IPO Type</div>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`hover-panel-item ${activeCategory === cat.key ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredSubmenu({ menu: 'ipo-management', category: cat.key })}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {activeCategory && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">
                  {categories.find((c) => c.key === activeCategory)?.label}
                </div>
                {items.length === 0 ? (
                  <div className="hover-panel-subitem muted">No IPOs</div>
                ) : (
                  items.map((ipo) => {
                    const code = ipo.ipoCode || ipo.code;
                    return (
                      <button
                        key={code}
                        type="button"
                        className={`hover-panel-item ${activeIpoCode === code ? 'active' : ''}`}
                        onMouseEnter={() =>
                          setHoveredSubmenu({ menu: 'ipo-management', category: activeCategory, ipoCode: code })
                        }
                      >
                        {code}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeIpo && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">{activeIpo.ipoCode || activeIpo.code}</div>
                <button
                  type="button"
                  className="hover-panel-item"
                  onClick={() => openIpoLeaf(activeIpo)}
                >
                  IPC Spec
                </button>
                <button
                  type="button"
                  className="hover-panel-item"
                  onClick={() => openDerivedCnsLeaf(activeIpo)}
                >
                  IPC Derived CNS
                </button>
                <button
                  type="button"
                  className="hover-panel-item"
                  onClick={() => openCnsLeaf(activeIpo)}
                >
                  IPO Master CNS
                </button>
                <button
                  type="button"
                  className="hover-panel-item hover-panel-item--danger"
                  onClick={() => requestDeleteIpo(activeIpo)}
                >
                  <Trash2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Delete IPO
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (hoveredMenu === 'purchase') {
      const categories = [
        { label: 'Production', key: 'Production' },
        { label: 'Sampling', key: 'Sampling' },
        { label: 'Company Essentials', key: 'Company' },
      ];
      const activeCategory =
        hoveredSubmenu?.menu === 'purchase' ? hoveredSubmenu.category : null;
      const items = activeCategory ? ipoByType(activeCategory) : [];
      return (
        <div className="hover-panel-group" ref={hoverPanelRef} onMouseLeave={() => setHoveredSubmenu(null)}>
          <div className="hover-panel">
            <div className="hover-panel-column">
              <div className="hover-panel-title">Purchase</div>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`hover-panel-item ${activeCategory === cat.key ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredSubmenu({ menu: 'purchase', category: cat.key })}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          {activeCategory && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">{categories.find((c) => c.key === activeCategory)?.label}</div>
                {items.map((ipo) => (
                  <div key={ipo.ipoCode} className="hover-panel-subitem">{ipo.ipoCode}</div>
                ))}
                {items.length === 0 && <div className="hover-panel-subitem muted">No IPOs</div>}
                {activeCategory === 'Company' && (
                  <button className="hover-panel-action" onClick={() => { setActivePage('code-creation'); setCodeCreationView('generate-po'); setHoveredMenu(null); }}>
                    Generate PO
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (hoveredMenu === 'ims') {
      const categories = [
        { label: 'Production', key: 'production', type: 'Production' },
        { label: 'Sampling', key: 'sampling', type: 'Sampling' },
        { label: 'Company Essentials', key: 'company-essentials', type: 'Company Essentials' },
        { label: 'Company', key: 'company', type: 'Company' },
      ];
      const actionsBySection = {
        inward: { key: 'receive', label: 'Receive Challan' },
        outward: { key: 'generate', label: 'Generate Challan' },
      };
      const activeSection = hoveredSubmenu?.menu === 'ims' ? hoveredSubmenu.section : null;
      const activeAction = hoveredSubmenu?.menu === 'ims' ? hoveredSubmenu.action : null;
      const activeCategory = hoveredSubmenu?.menu === 'ims' ? hoveredSubmenu.category : null;
      const activeCategoryMeta = categories.find((cat) => cat.key === activeCategory);
      const items = activeCategory ? getItemsForCategory(activeCategory, activeCategoryMeta?.type) : [];
      return (
        <div className="hover-panel-group" ref={hoverPanelRef} onMouseLeave={() => setHoveredSubmenu(null)}>
          <div className="hover-panel">
            <div className="hover-panel-column">
              <div className="hover-panel-title">IMS</div>
              <button
                type="button"
                className={`hover-panel-item ${activeSection === 'inward' || ['inward-store-sheet', 'inward-store-sheet-db'].includes(activePage) ? 'active' : ''}`}
                onMouseEnter={() => setHoveredSubmenu({ menu: 'ims', section: 'inward', action: null, category: null })}
              >
                Inward Store Sheet
              </button>
              <button
                type="button"
                className={`hover-panel-item ${activeSection === 'outward' || ['outward-store-sheet', 'outward-store-sheet-db'].includes(activePage) ? 'active' : ''}`}
                onMouseEnter={() => setHoveredSubmenu({ menu: 'ims', section: 'outward', action: null, category: null })}
              >
                Outward Store Sheet
              </button>
              <button
                type="button"
                className={`hover-panel-item ${activeSection === 'stock' || ['stock-sheet', 'stock-sheet-db'].includes(activePage) ? 'active' : ''}`}
                onMouseEnter={() => setHoveredSubmenu({ menu: 'ims', section: 'stock', action: null, category: null })}
              >
                Stock Sheet
              </button>
              <button
                type="button"
                className={`hover-panel-item ${activeSection === 'uqr' || activePage === 'uqr-forms' || activePage === 'uqr-database' ? 'active' : ''}`}
                onMouseEnter={() => setHoveredSubmenu({ menu: 'ims', section: 'uqr', action: null, category: null })}
              >
                UQR
              </button>
              <button
                type="button"
                className={`hover-panel-item ${activeSection === 'courier' || activePage === 'courier-slip' || activePage === 'courier-master' ? 'active' : ''}`}
                onMouseEnter={() => setHoveredSubmenu({ menu: 'ims', section: 'courier', action: null, category: null })}
              >
                Courier
              </button>
            </div>
          </div>
          {activeSection === 'inward' && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Inward Store Sheet</div>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === 'inward-store-sheet' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('inward-store-sheet');
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  Inward Store Sheet Form
                </button>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === 'inward-store-sheet-db' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('inward-store-sheet-db');
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  Inward Store Sheet Database
                </button>
              </div>
            </div>
          )}
          {activeSection === 'outward' && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Outward Store Sheet</div>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === 'outward-store-sheet' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('outward-store-sheet');
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  Outward Store Sheet Form
                </button>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === 'outward-store-sheet-db' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('outward-store-sheet-db');
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  Outward Store Sheet Database
                </button>
              </div>
            </div>
          )}
          {activeSection === 'stock' && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Stock Sheet</div>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === 'stock-sheet' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('stock-sheet');
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  Add Stock Items
                </button>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === 'stock-sheet-db' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('stock-sheet-db');
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  Master Stock Sheet
                </button>
              </div>
            </div>
          )}
          {activeSection === 'uqr' && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">UQR</div>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === 'uqr-forms' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('uqr-forms');
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  UQR Forms
                </button>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === 'uqr-database' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('uqr-database');
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  UQR Database
                </button>
              </div>
            </div>
          )}
          {activeSection === 'courier' && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Courier</div>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === 'courier-slip' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('courier-slip');
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  Courier Slip
                </button>
                <button
                  type="button"
                  className={`hover-panel-item ${activePage === 'courier-master' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage('courier-master');
                    setHoveredSubmenu(null);
                    setHoveredMenu(null);
                  }}
                >
                  Master Courier Sheet
                </button>
              </div>
            </div>
          )}
          {activeSection && activeSection !== 'uqr' && activeSection !== 'courier' && activeSection !== 'inward' && activeSection !== 'outward' && activeSection !== 'stock' && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">
                  {activeSection === 'inward' ? 'Inward Store Sheet' : 'Outward Store Sheet'}
                </div>
                <button
                  key={`${activeSection}-${actionsBySection[activeSection]?.key}`}
                  type="button"
                  className={`hover-panel-item ${activeAction === actionsBySection[activeSection]?.key ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredSubmenu({
                    menu: 'ims',
                    section: activeSection,
                    action: actionsBySection[activeSection]?.key,
                    category: null
                  })}
                >
                  {actionsBySection[activeSection]?.label}
                </button>
              </div>
            </div>
          )}
          {activeAction && activeSection !== 'uqr' && activeSection !== 'courier' && activeSection !== 'inward' && activeSection !== 'outward' && activeSection !== 'stock' && (
            <div className="hover-panel nested-panel second">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Select Type</div>
                {categories.map((cat) => (
                  <button
                    key={`${activeSection}-${cat.key}`}
                    type="button"
                    className={`hover-panel-item ${activeCategory === cat.key ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredSubmenu({
                      menu: 'ims',
                      section: activeSection,
                      action: activeAction,
                      category: cat.key
                    })}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeCategory && activeSection !== 'uqr' && activeSection !== 'courier' && activeSection !== 'inward' && activeSection !== 'outward' && activeSection !== 'stock' && (
            <div className="hover-panel nested-panel third">
              <div className="hover-panel-column">
                <div className="hover-panel-title">{activeCategoryMeta?.label}</div>
                {items.map((item) => (
                  <div key={`${activeSection}-${activeCategory}-${item.key}`} className="hover-panel-subitem">
                    {item.label}
                  </div>
                ))}
                {items.length === 0 && <div className="hover-panel-subitem muted">No PO codes</div>}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (hoveredMenu === 'tasks') {
      const poTypes = [
        { label: 'Production', key: 'production', type: 'Production' },
        { label: 'Sampling', key: 'sampling', type: 'Sampling' },
        { label: 'Company', key: 'company', type: 'Company' },
      ];
      const departments = ['Department 1', 'Department 2', 'Department 3'];
      const users = ['User 1', 'User 2', 'User 3'];
      const priorities = ['Low', 'Medium', 'High', 'Urgent'];

      const activeAction = hoveredSubmenu?.menu === 'tasks' ? hoveredSubmenu.action : null;
      const activeType = hoveredSubmenu?.menu === 'tasks' ? hoveredSubmenu.type : null;
      const activeIpo = hoveredSubmenu?.menu === 'tasks' ? hoveredSubmenu.ipo : null;
      const activeDepartment = hoveredSubmenu?.menu === 'tasks' ? hoveredSubmenu.department : null;
      const activeUser = hoveredSubmenu?.menu === 'tasks' ? hoveredSubmenu.user : null;

      const activeTypeMeta = poTypes.find((t) => t.key === activeType);
      const ipoItems = activeTypeMeta ? getIpoItems(activeTypeMeta.type) : [];

      return (
        <div className="hover-panel-group" ref={hoverPanelRef} onMouseLeave={() => setHoveredSubmenu(null)}>
          <div className="hover-panel">
            <div className="hover-panel-column">
              <div className="hover-panel-title">Tasks</div>
              <button
                type="button"
                className={`hover-panel-item ${activeAction === 'assigned' ? 'active' : ''}`}
                onMouseEnter={() => setHoveredSubmenu({ menu: 'tasks', action: 'assigned', type: null, ipo: null, department: null, user: null })}
                onClick={() => {
                  setTasksView('assigned');
                  setActivePage('tasks');
                  setHoveredMenu(null);
                }}
              >
                Tasks Assigned To You
              </button>
              <button
                type="button"
                className={`hover-panel-item ${activeAction === 'assign' ? 'active' : ''}`}
                onMouseEnter={() => setHoveredSubmenu({ menu: 'tasks', action: 'assign', type: null, ipo: null, department: null, user: null })}
                onClick={() => {
                  setTasksView('assign');
                  setActivePage('tasks');
                  setHoveredMenu(null);
                }}
              >
                Assign Tasks
              </button>
            </div>
          </div>

          {activeAction === 'assign' && (
            <div className="hover-panel nested-panel">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Select PO Type</div>
                {poTypes.map((po) => (
                  <button
                    key={po.key}
                    type="button"
                    className={`hover-panel-item ${activeType === po.key ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredSubmenu({
                      menu: 'tasks',
                      action: activeAction,
                      type: po.key,
                      ipo: null,
                      department: null,
                      user: null
                    })}
                  >
                    {po.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeType && (
            <div className="hover-panel nested-panel second">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Select IPO</div>
                {ipoItems.map((ipo) => (
                  <button
                    key={ipo.key}
                    type="button"
                    className={`hover-panel-item ${activeIpo === ipo.key ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredSubmenu({
                      menu: 'tasks',
                      action: activeAction,
                      type: activeType,
                      ipo: ipo.key,
                      department: null,
                      user: null
                    })}
                  >
                    {ipo.label}
                  </button>
                ))}
                {ipoItems.length === 0 && <div className="hover-panel-subitem muted">No IPOs</div>}
              </div>
            </div>
          )}

          {activeIpo && (
            <div className="hover-panel nested-panel third">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Select Department</div>
                {departments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    className={`hover-panel-item ${activeDepartment === dept ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredSubmenu({
                      menu: 'tasks',
                      action: activeAction,
                      type: activeType,
                      ipo: activeIpo,
                      department: dept,
                      user: null
                    })}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeDepartment && (
            <div className="hover-panel nested-panel fourth">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Users</div>
                {users.map((user) => (
                  <button
                    key={user}
                    type="button"
                    className={`hover-panel-item ${activeUser === user ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredSubmenu({
                      menu: 'tasks',
                      action: activeAction,
                      type: activeType,
                      ipo: activeIpo,
                      department: activeDepartment,
                      user
                    })}
                  >
                    {user}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeUser && (
            <div className="hover-panel nested-panel fifth">
              <div className="hover-panel-column">
                <div className="hover-panel-title">Define Task</div>
                <input className="hover-panel-input" placeholder="Define task" />
                <input className="hover-panel-input" placeholder="Add sub task" />
                <input className="hover-panel-input" placeholder="Remarks" />
                <input className="hover-panel-input" placeholder="Due date" />
                <div className="hover-panel-subtitle">Priority</div>
                {priorities.map((priority) => (
                  <button key={priority} type="button" className="hover-panel-subitem">
                    {priority}
                  </button>
                ))}
                <button type="button" className="hover-panel-action">Assign</button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <SidebarContext.Provider value={{ isSidebarCollapsed }}>
      <div className="dashboard-container">
        <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`} ref={sidebarRef}>
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
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = ''); }}
              />
            ) : null}
            <div className="logo-icon-dash" style={companyLogo ? { display: 'none' } : undefined}>
              {companyInitials}
            </div>
            <div className="logo-text-wrap-dash">
              <span className="logo-text-dash">{companyDisplayName.split(' ')[0]}</span>
              {/* <span className="logo-subtitle-dash">Powered by Binder-OS</span> */}
            </div>
          </div>
        </div>

        {!isSidebarCollapsed && (
          <div className="sidebar-search">
            <Search size={16} className="sidebar-search-icon" />
            <input
              type="text"
              className="sidebar-search-input"
              placeholder="Search..."
            />
          </div>
        )}

        <nav className="sidebar-nav">
          {getMenuItems().map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                activePage === item.id
                || (item.id === 'ims' && ['uqr-forms', 'uqr-database', 'courier-slip', 'courier-master', 'inward-store-sheet', 'inward-store-sheet-db', 'outward-store-sheet', 'outward-store-sheet-db', 'stock-sheet', 'stock-sheet-db'].includes(activePage))
                  ? 'active'
                  : ''
              }`}
              onClick={() => {
                if (item.id === 'home' || item.id === 'tasks' || item.id === 'purchase') {
                  setActivePage(item.id);
                  setHoveredMenu(null);
                  return;
                }
                if (item.id === 'code-creation') {
                  setCodeCreationView(null);
                }
                if (item.id === 'ipo-management') {
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
            <span className="user-avatar">
              {displayName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
            <span className="profile-username">{displayName}</span>
          </button>
          {showProfileMenu && (
            <div className="profile-menu profile-menu--sidebar">
              <div className="profile-menu-header">
                {showEmailLine && <div className="profile-menu-email">{user.email}</div>}
              </div>
              <div className="profile-menu-divider" />
              <Link to="/company-profile" className="profile-menu-item" style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: 'inherit' }} onClick={() => setShowProfileMenu(false)}>
                Profile
              </Link>
              <div className="profile-menu-divider" />
              <Link to="/profile" className="profile-menu-item" style={{ display: 'block', padding: '8px 12px', textDecoration: 'none', color: 'inherit' }} onClick={() => setShowProfileMenu(false)}>
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

      <main className="main-content">
        {showCalculator && (
          <div
            className="calculator-overlay"
            role="presentation"
          >
            <div
              className="calculator-popup"
              role="dialog"
              aria-label="Calculator"
              aria-modal="true"
              onClick={(event) => event.stopPropagation()}
              ref={calculatorRef}
              tabIndex={0}
              onKeyDown={handleCalculatorKeyDown}
            >
              <div className="calculator-header">
                <div>
                  <div className="calculator-title">Calculator</div>
                  <div className="calculator-subtitle">Quick math</div>
                </div>
                <button
                  type="button"
                  className="calculator-close"
                  onClick={() => setShowCalculator(false)}
                  aria-label="Close calculator"
                >
                  x
                </button>
              </div>
              <div className="calculator-display">
                <div className="calculator-expression">{calcInput || '0'}</div>
                <div className="calculator-result">{calcResult}</div>
              </div>
              <div className="calculator-keys">
                <button type="button" className="calc-key util" onClick={handleCalcClear}>
                  C
                </button>
                <button type="button" className="calc-key util" onClick={handleCalcDelete}>
                  DEL
                </button>
                <button type="button" className="calc-key util" onClick={() => appendCalcValue('/')}>
                  /
                </button>
                <button type="button" className="calc-key operator" onClick={() => appendCalcValue('*')}>
                  x
                </button>

                <button type="button" className="calc-key" onClick={() => appendCalcValue('7')}>
                  7
                </button>
                <button type="button" className="calc-key" onClick={() => appendCalcValue('8')}>
                  8
                </button>
                <button type="button" className="calc-key" onClick={() => appendCalcValue('9')}>
                  9
                </button>
                <button type="button" className="calc-key operator" onClick={() => appendCalcValue('-')}>
                  -
                </button>

                <button type="button" className="calc-key" onClick={() => appendCalcValue('4')}>
                  4
                </button>
                <button type="button" className="calc-key" onClick={() => appendCalcValue('5')}>
                  5
                </button>
                <button type="button" className="calc-key" onClick={() => appendCalcValue('6')}>
                  6
                </button>
                <button type="button" className="calc-key operator" onClick={() => appendCalcValue('+')}>
                  +
                </button>

                <button type="button" className="calc-key" onClick={() => appendCalcValue('1')}>
                  1
                </button>
                <button type="button" className="calc-key" onClick={() => appendCalcValue('2')}>
                  2
                </button>
                <button type="button" className="calc-key" onClick={() => appendCalcValue('3')}>
                  3
                </button>
                <button type="button" className="calc-key equals" onClick={evaluateCalculation}>
                  =
                </button>

                <button type="button" className="calc-key zero" onClick={() => appendCalcValue('0')}>
                  0
                </button>
                <button type="button" className="calc-key" onClick={() => appendCalcValue('.')}>
                  .
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="content-wrapper">
          {renderContent()}
          {renderHoverPanel()}
        </div>
      </main>
      </div>
      <Dialog
        open={!!ipoToDelete}
        onOpenChange={(open) => {
          if (!open) cancelDeleteIpo();
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          style={{ padding: '28px 32px', gap: '20px' }}
          showCloseButton={!isDeletingIpo}
        >
          <DialogHeader className="gap-3" style={{ paddingRight: '24px' }}>
            <DialogTitle>Delete IPO?</DialogTitle>
            <DialogDescription className="leading-relaxed">
              This will permanently delete{' '}
              <span className="font-semibold text-foreground">
                {ipoToDelete?.ipoCode || ipoToDelete?.code || 'this IPO'}
              </span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {ipoDeleteError && (
            <div className="text-sm text-destructive">{ipoDeleteError}</div>
          )}
          <DialogFooter className="gap-3 sm:gap-3" style={{ paddingTop: '8px' }}>
            <Button
              type="button"
              variant="outline"
              onClick={cancelDeleteIpo}
              disabled={isDeletingIpo}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteIpo}
              disabled={isDeletingIpo}
            >
              {isDeletingIpo ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showLogoutConfirm}
        onOpenChange={(open) => {
          if (!open) setShowLogoutConfirm(false);
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          style={{ padding: '28px 32px', gap: '20px' }}
        >
          <DialogHeader className="gap-3" style={{ paddingRight: '24px' }}>
            <DialogTitle>Log out?</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Do you want to log out? Click <span className="font-semibold text-foreground">Yes</span> to
              log out, or <span className="font-semibold text-foreground">No</span> to stay on this page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-3" style={{ paddingTop: '8px' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
            >
              No
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setShowLogoutConfirm(false);
                handleLogout();
              }}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarContext.Provider>
  );
};

export default Dashboard;
