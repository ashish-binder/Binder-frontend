import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import GenerateFactoryCode from '../GenerateFactoryCode/GenerateFactoryCode';
import ThemedSelect from '../IMS/StockSheet/ThemedSelect';
import { getIPOs, createIPO, updateIPO, getBuyerCodes } from '../../services/integration';
import { normalizeOrderType, toOrderTypeApiValue } from '../../utils/orderType';
import { scrollToFirstError } from '@/utils/scrollToFirstError';
import { useLoading } from '../../context/LoadingContext';

// Shared Tailwind class strings — flat/clean theme matching the StockSheet revamp.
const CARD = 'rounded-lg border border-[#e2e3e8] bg-card p-5 md:p-6';
const LABEL =
  'mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground';
const CTRL =
  'w-full rounded-md border border-[#e2e3e8] bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15';
const CTRL_ERR =
  'border-destructive focus:border-destructive focus:ring-destructive/20';
const BACK_BTN =
  'mb-5 inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#e2e3e8] bg-white px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-[#f5f5f5] hover:shadow-lg';
const PRIMARY_BTN =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';

const toOptions = (arr) => (arr || []).map((v) => ({ value: v, label: v }));

const Field = ({ label, required, error, className = '', children }) => (
  <div className={`flex flex-col ${className}`}>
    <label className={LABEL}>
      {label} {required && <span className="text-primary">*</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
    )}
  </div>
);

const InternalPurchaseOrder = ({ onBack, onNavigateToCodeCreation, onNavigateToIPO, initialOpenIpo = null, specMode = 'create', initialFlowPhase, initialCurrentStep, initialSkuId, highlightOnMount = false }) => {
  const isSpecMode = specMode === 'spec';
  const [showInitialScreen, setShowInitialScreen] = useState(!isSpecMode);
  const [showIPOPopup, setShowIPOPopup] = useState(false);
  const [generatedIPOCode, setGeneratedIPOCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle navigation to IPO - reset to initial screen
  // When called from GenerateFactoryCode opened via InternalPurchaseOrder,
  // we should always reset to the IPO initial screen
  const handleNavigateToIPO = () => {
    console.log('Resetting to IPO initial screen');
    if (isSpecMode) {
      if (onNavigateToIPO) onNavigateToIPO();
      return;
    }
    setShowInitialScreen(true);
  };
  const [initialData, setInitialData] = useState(() => {
    if (isSpecMode && initialOpenIpo?.ipoCode) {
      return {
        orderType: normalizeOrderType(initialOpenIpo.orderType || ''),
        buyerCode: initialOpenIpo.buyerCode || '',
        type: initialOpenIpo.type || '',
        programName: initialOpenIpo.programName || '',
        ipoCode: initialOpenIpo.ipoCode || '',
        poSrNo: initialOpenIpo.poSrNo ?? null,
        ipoId: initialOpenIpo.ipoId || initialOpenIpo.id || null,
      };
    }
    return {
      orderType: '',      // 'Production' | 'Sampling' | 'Company'
      buyerCode: '',
      type: '',          // 'STOCK' | 'SAM' (for Company only)
      programName: '',
      ipoCode: '',      // Generated IPO code
      poSrNo: null,     // Sequential number
      ipoId: null       // UUID from database
    };
  });
  const [buyerCodeOptions, setBuyerCodeOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const { showLoading, hideLoading } = useLoading();

  const mapIpoResponseItem = (item) => ({
    ipoId: item.id || item.ipoId || null,
    ipoCode: item.ipo_code || item.ipoCode || '',
    orderType: normalizeOrderType(item.order_type || item.orderType || ''),
    buyerCode: item.buyer_code_text || item.buyerCode || '',
    type: item.company_type || item.type || '',
    programName: item.program_name || item.programName || '',
    poSrNo: item.po_sr_no || item.poSrNo || 1,
    createdAt: item.created_at || item.createdAt || '',
  });

  const syncIposFromApi = async () => {
    const response = await getIPOs();
    const ipos = response.results || response.data || response || [];
    const mapped = Array.isArray(ipos) ? ipos.map(mapIpoResponseItem) : [];
    window.dispatchEvent(new Event('internalPurchaseOrdersUpdated'));
    return mapped;
  };

  useEffect(() => {
    const loadIPOs = async () => {
      showLoading();
      try {
        await syncIposFromApi();
      } catch (error) {
        console.warn('Failed to load IPOs from API:', error);
      } finally {
        hideLoading();
      }
    };
    loadIPOs();
  }, [showInitialScreen]);

  const orderTypeOptions = ['Company', 'Production', 'Sampling'];
  const companyTypeOptions = ['SAM', 'STOCK'];

  // Load buyer codes from API
  useEffect(() => {
    const loadBuyerCodes = async () => {
      try {
        const response = await getBuyerCodes();
        const buyers = response.results || response.data || response || [];
        const codes = Array.isArray(buyers) ? buyers.map(b => b.code) : [];
        setBuyerCodeOptions(codes);
      } catch (error) {
        console.warn('Failed to load buyer codes from API:', error);
        setBuyerCodeOptions([]);
      }
    };
    loadBuyerCodes();
  }, []);

  const handleOrderTypeChange = (value) => {
    // Clear buyerCode/type when orderType changes
    setInitialData(prev => ({
      ...prev,
      orderType: value,
      buyerCode: '',
      type: ''
    }));
    // Clear related errors
    setErrors(prev => ({ ...prev, orderType: '', buyerCode: '', type: '' }));
  };

  const handleBuyerCodeChange = (value) => {
    setInitialData(prev => ({ ...prev, buyerCode: value }));
    if (errors.buyerCode) {
      setErrors(prev => ({ ...prev, buyerCode: '' }));
    }
  };

  const handleTypeChange = (value) => {
    setInitialData(prev => ({ ...prev, type: value }));
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: '' }));
    }
  };

  const handleProgramNameChange = (e) => {
    const value = e.target.value;
    setInitialData(prev => ({ ...prev, programName: value }));
    if (errors.programName) {
      setErrors(prev => ({ ...prev, programName: '' }));
    }
  };

  const validateInitialScreen = () => {
    const newErrors = {};

    if (!initialData.orderType?.trim()) {
      newErrors.orderType = 'Order Type is required';
    }

    // For Company, validate type instead of buyerCode
    if (initialData.orderType === 'Company') {
      if (!initialData.type?.trim()) {
        newErrors.type = 'Type is required';
      }
    } else {
      // For Production/Sampling, validate buyerCode
      if (!initialData.buyerCode?.trim()) {
        newErrors.buyerCode = 'Buyer Code is required';
      }
    }

    if (!initialData.programName?.trim()) {
      newErrors.programName = 'Program Name is required';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(newErrors);
      return false;
    }
    return true;
  };

  const handleContinue = async () => {
    if (isSubmitting) return;
    if (!validateInitialScreen()) return;

    setIsSubmitting(true);
    try {
      const isEditing = !!initialData.ipoId;

      if (isEditing) {
        // Update existing IPO via PATCH
        const response = await updateIPO(initialData.ipoId, {
          order_type: toOrderTypeApiValue(initialData.orderType),
          buyer_code_text: initialData.orderType !== 'Company' ? (initialData.buyerCode || '') : '',
          company_type: initialData.orderType === 'Company' ? initialData.type : null,
          program_name: initialData.programName.trim(),
        });

        if (response.status !== 'success' && !response.data && !response.id) {
          throw new Error(
            response?.message || response?.error || response?.detail || 'Failed to update IPO.'
          );
        }

        const responseData = response.data || response;
        const updatedData = {
          ...initialData,
          ipoCode: responseData.ipo_code || initialData.ipoCode,
          poSrNo: responseData.po_sr_no || initialData.poSrNo,
          ipoId: responseData.id || initialData.ipoId,
        };

        await syncIposFromApi();
        setInitialData(updatedData);
        toast.success('IPO updated successfully.');
        setShowInitialScreen(false);
      } else {
        // Create new IPO via POST
        const response = await createIPO({
          order_type: toOrderTypeApiValue(initialData.orderType),
          buyer_code_text: initialData.orderType !== 'Company' ? (initialData.buyerCode || '') : '',
          company_type: initialData.orderType === 'Company' ? initialData.type : null,
          program_name: initialData.programName.trim(),
        });

        if (response.status !== 'success' || !response.data) {
          throw new Error(
            response?.message || response?.error || response?.detail || 'Failed to save IPO to database.'
          );
        }

        const updatedData = {
          ...initialData,
          ipoCode: response.data.ipo_code,
          poSrNo: response.data.po_sr_no,
          ipoId: response.data.id
        };

        await syncIposFromApi();
        setInitialData(updatedData);
        setGeneratedIPOCode(response.data.ipo_code);
        toast.success(`IPO code ${response.data.ipo_code} generated successfully!`);
        setShowIPOPopup(true);
      }
    } catch (error) {
      console.error('Error saving IPO:', error);
      toast.error(
        error?.message || error?.data?.message || 'Failed to save IPO. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenExistingIPO = (item) => {
    if (!item) return;
    setInitialData({
      orderType: normalizeOrderType(item.orderType || ''),
      buyerCode: item.buyerCode || '',
      type: item.type || '',
      programName: item.programName || '',
      ipoCode: item.ipoCode || '',
      poSrNo: item.poSrNo ?? null,
      ipoId: item.ipoId || item.id || null
    });
    setShowInitialScreen(false);
  };

  useEffect(() => {
    if (!initialOpenIpo?.ipoCode) return;
    handleOpenExistingIPO(initialOpenIpo);
  }, [initialOpenIpo]);

  const shellStyle = {
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    // The theme's --accent is a pinkish grey used for react-select's option hover;
    // recolor it to a neutral grey so hovered options match the other components.
    '--accent': '#edeef1',
  };

  // Spec mode: render the full GenerateFactoryCode wizard (Step 0 onwards) for the selected IPO.
  if (isSpecMode) {
    return (
      <GenerateFactoryCode
        key={`spec-${initialFlowPhase || ''}-${initialCurrentStep || ''}-${initialSkuId || ''}-${initialData.ipoCode || ''}-${initialData.programName || ''}-${initialData.buyerCode || ''}-${initialData.type || ''}`}
        onBack={onBack}
        initialFormData={initialData}
        onNavigateToCodeCreation={onNavigateToCodeCreation}
        onNavigateToIPO={handleNavigateToIPO}
        initialFlowPhase={initialFlowPhase || 'step0'}
        initialCurrentStep={initialCurrentStep || 0}
        initialSkuId={initialSkuId}
        highlightOnMount={highlightOnMount}
      />
    );
  }

  // Inline success screen (no modal) - matches Buyer/Vendor
  if (showIPOPopup) {
    return (
      <div
        className="min-h-full w-full overflow-y-auto bg-[#f3f4f6] py-9"
        style={shellStyle}
      >
        <div className="mx-auto max-w-[95%] space-y-5">
          <div>
            <button type="button" onClick={onBack} className={BACK_BTN}>
              ← Back to Code Creation
            </button>
            <h1 className="text-3xl font-bold text-foreground">
              Internal Purchase Order
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your IPO code has been generated.
            </p>
          </div>

          <div className="mx-auto max-w-xl">
            <div className={`${CARD} flex flex-col items-center text-center`}>
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-600">
                ✓
              </div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Generated IPO Code
              </div>
              <div className="w-full rounded-lg border border-[#e2e3e8] bg-muted/40 px-6 py-5">
                <span className="break-words font-mono text-2xl font-black tracking-wide text-primary">
                  {generatedIPOCode}
                </span>
              </div>
              <p className="mt-7 max-w-md text-sm leading-relaxed text-foreground/70">
                Further details of the IPO will be filled through the{' '}
                <strong className="text-foreground">
                  IPO Management &gt; IPO Type &gt; IPO Code &gt; IPC Spec
                </strong>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial Selection Screen
  return (
    <div
      className="min-h-full w-full overflow-y-auto bg-[#f3f4f6] py-9"
      style={shellStyle}
    >
      <div className="mx-auto max-w-[95%] space-y-5">
        <div>
          <button type="button" onClick={onBack} className={BACK_BTN}>
            ← Back to Code Creation
          </button>
          <h1 className="text-3xl font-bold text-foreground">
            Internal Purchase Order
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select order type and enter required information.
          </p>
        </div>

        <div className={CARD}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Order Type */}
            <Field label="Order For" required error={errors.orderType}>
              <ThemedSelect
                value={initialData.orderType}
                onChange={handleOrderTypeChange}
                options={toOptions(orderTypeOptions)}
                placeholder="Select order type"
              />
            </Field>

            {/* Buyer Code (for Production/Sampling) or Type (for Company) */}
            {initialData.orderType === 'Company' ? (
              <Field label="Type" required error={errors.type}>
                <ThemedSelect
                  value={initialData.type}
                  onChange={handleTypeChange}
                  options={toOptions(companyTypeOptions)}
                  placeholder="Select type (STOCK or SAM)"
                />
              </Field>
            ) : (
              <Field label="Buyer Code" required error={errors.buyerCode}>
                <ThemedSelect
                  value={initialData.buyerCode}
                  onChange={handleBuyerCodeChange}
                  options={toOptions(buyerCodeOptions)}
                  placeholder="Select buyer code"
                />
              </Field>
            )}

            {/* Program Name */}
            <Field label="PO Name" required error={errors.programName}>
              <input
                type="text"
                value={initialData.programName}
                onChange={handleProgramNameChange}
                placeholder="Enter PO name"
                aria-invalid={!!errors.programName}
                className={`${CTRL} ${errors.programName ? CTRL_ERR : ''}`}
              />
            </Field>
          </div>

          {/* Continue Button */}
          <div className="mt-6 flex justify-start">
            <button
              type="button"
              onClick={handleContinue}
              disabled={isSubmitting}
              className={PRIMARY_BTN}
            >
              {isSubmitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {isSubmitting
                ? 'Saving...'
                : initialData.ipoId
                  ? 'Save Changes →'
                  : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternalPurchaseOrder;
