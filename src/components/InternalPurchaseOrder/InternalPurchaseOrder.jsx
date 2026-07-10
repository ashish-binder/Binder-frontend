import { useState, useEffect } from 'react';
import GenerateFactoryCode from '../GenerateFactoryCode/GenerateFactoryCode';
import SearchableDropdown from '../GenerateFactoryCode/components/SearchableDropdown';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
// Dialog removed: IPO success is shown inline like Buyer/Vendor
import { FormCard, FullscreenContent } from '@/components/ui/form-layout';
import { getIPOs, createIPO, updateIPO, getBuyerCodes } from '../../services/integration';
import { normalizeOrderType, toOrderTypeApiValue } from '../../utils/orderType';
import { scrollToFirstError } from '@/utils/scrollToFirstError';
import { useLoading } from '../../context/LoadingContext';

const InternalPurchaseOrder = ({ onBack, onNavigateToCodeCreation, onNavigateToIPO, initialOpenIpo = null, specMode = 'create', initialFlowPhase, initialCurrentStep, initialSkuId, highlightOnMount = false }) => {
  const isSpecMode = specMode === 'spec';
  const [showInitialScreen, setShowInitialScreen] = useState(!isSpecMode);
  const [showIPOPopup, setShowIPOPopup] = useState(false);
  const [generatedIPOCode, setGeneratedIPOCode] = useState('');

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
  const normalizeKey = (value) => String(value || '').trim().toLowerCase();
  const findExistingIPO = (data, list) => {
    const dataOrderType = normalizeOrderType(data.orderType);
    return (list || []).find((ipo) => {
      if (normalizeKey(normalizeOrderType(ipo.orderType)) !== normalizeKey(dataOrderType)) return false;
      if (normalizeKey(ipo.programName) !== normalizeKey(data.programName)) return false;
      if (dataOrderType === 'Company') {
        return normalizeKey(ipo.type) === normalizeKey(data.type);
      }
      return normalizeKey(ipo.buyerCode) === normalizeKey(data.buyerCode);
    });
  };

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
    if (errors.orderType) {
      setErrors(prev => ({ ...prev, orderType: '' }));
    }
    // Clear related errors
    setErrors(prev => ({ ...prev, buyerCode: '', type: '' }));
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

  // Get next IPO sequential number - increment per Order Type + Buyer/Type + Program
  const getNextIPOSrNo = async (data) => {
    try {
      const response = await getIPOs();
      const ipos = response.results || response.data || response || [];
      const existingIPOs = Array.isArray(ipos) ? ipos.map(mapIpoResponseItem) : [];
      const dataOrderType = normalizeOrderType(data.orderType);
      const sameGroupIPOs = existingIPOs.filter((ipo) => {
        if (normalizeKey(normalizeOrderType(ipo.orderType)) !== normalizeKey(dataOrderType)) return false;
        if (normalizeKey(ipo.programName) !== normalizeKey(data.programName)) return false;
        if (dataOrderType === 'Company') {
          return normalizeKey(ipo.type) === normalizeKey(data.type);
        }
        return normalizeKey(ipo.buyerCode) === normalizeKey(data.buyerCode);
      });
      if (sameGroupIPOs.length === 0) {
        return 1;
      }
      const maxSrNo = Math.max(...sameGroupIPOs.map(ipo => ipo.poSrNo || 0));
      return maxSrNo + 1;
    } catch (error) {
      console.error('Error getting next IPO SR#:', error);
      return 1;
    }
  };

  // Generate IPO code based on order type
  const generateIPOCode = (orderType, buyerCodeOrType, programName, poSrNo) => {
    const baseCode = 'CHD/';
    let typeCode = '';
    
    if (orderType === 'Production') {
      typeCode = 'PD/';
      return `${baseCode}${typeCode}${buyerCodeOrType}/${programName}/${poSrNo}`;
    } else if (orderType === 'Sampling') {
      typeCode = 'SAM/';
      return `${baseCode}${typeCode}${buyerCodeOrType}/${programName}/${poSrNo}`;
    } else if (orderType === 'Company') {
      typeCode = 'SELF/';
      return `${baseCode}${typeCode}${buyerCodeOrType}/${programName}/${poSrNo}`;
    }
    return '';
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

  const FACTORY_CODE_STORAGE_KEY = 'factoryCodeFormData';

  const handleContinue = async () => {
    if (!validateInitialScreen()) return;

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

        console.log('IPO Update response:', response);

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
        setShowInitialScreen(false);
      } else {
        // Create new IPO via POST
        const response = await createIPO({
          order_type: toOrderTypeApiValue(initialData.orderType),
          buyer_code_text: initialData.orderType !== 'Company' ? (initialData.buyerCode || '') : '',
          company_type: initialData.orderType === 'Company' ? initialData.type : null,
          program_name: initialData.programName.trim(),
        });

        console.log('IPO API response:', response);

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
        setShowIPOPopup(true);
      }
    } catch (error) {
      console.error('Error saving IPO:', error);
      const errorMsg = error.message || error.data?.message || 'Failed to save IPO. Please try again.';
      alert(`Error: ${errorMsg}\nPlease try again.`);
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
      <FullscreenContent style={{ overflowY: 'auto' }}>
        <div className="content-header">
          <Button variant="outline" onClick={onBack} type="button" className="mb-6 bg-white">
            ← Back to Code Creation
          </Button>
          <h1 className="fullscreen-title">Internal Purchase Order</h1>
        </div>

        <div className="w-full max-w-3xl mx-auto">
          <FormCard className="rounded-2xl border-border bg-muted" style={{ padding: '24px 20px' }}>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-4xl font-bold mb-5">
                ✓
              </div>

              <div className="w-full" style={{ marginTop: '8px' }}>
                <div className="text-sm font-semibold text-foreground/80 mb-3">
                  Generated IPO Code
                </div>

                <FormCard className="rounded-xl border-border bg-card" style={{ padding: '20px 18px' }}>
                  <div className="flex items-center justify-center gap-3">
                    <span
                      className="text-primary font-black"
                      style={{
                        fontSize: '28px',
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        letterSpacing: '2px',
                        wordBreak: 'break-word',
                      }}
                    >
                      {generatedIPOCode}
                    </span>
                  </div>
                </FormCard>
              </div>

              <p
                className="text-foreground/80"
                style={{ marginTop: '28px', maxWidth: 560, fontSize: '15px', lineHeight: 1.5 }}
              >
                Further details of the IPO will be filled through the{' '}
                <strong>IPO Management &gt; IPO Type &gt; IPO Code &gt; IPC Spec</strong>.
              </p>
            </div>
          </FormCard>
        </div>
      </FullscreenContent>
    );
  }

  // Initial Selection Screen
  return (
    <FullscreenContent style={{ overflowY: 'auto' }}>
      <div className="content-header">
          <Button variant="outline" onClick={onBack} type="button" className="mb-6 bg-white">
            ← Back to Code Creation
          </Button>
        <h1 className="fullscreen-title">Internal Purchase Order</h1>
        <p className="fullscreen-description">Select order type and enter required information</p>
      </div>

      <div className="w-full max-w-6xl mx-auto">
        <FormCard className="rounded-2xl border-border bg-muted" style={{ padding: '24px 20px' }}>
          <div className="flex flex-wrap items-start" style={{ gap: '16px 12px', marginBottom: '32px' }}>
            {/* Order Type */}
            <Field 
              label="ORDER FOR" 
              required 
              error={errors.orderType}
              width="md"
              style={{ marginBottom: 0 }}
            >
              <SearchableDropdown
                value={initialData.orderType}
                onChange={handleOrderTypeChange}
                options={orderTypeOptions}
                placeholder="Select order type"
                className={errors.orderType ? 'border-destructive' : ''}
              />
            </Field>

            {/* Buyer Code (for Production/Sampling) or Type (for Company) */}
            {initialData.orderType === 'Company' ? (
              <Field 
                label="TYPE" 
                required 
                error={errors.type}
                width="md"
                style={{ marginBottom: 0 }}
              >
                <SearchableDropdown
                  value={initialData.type}
                  onChange={handleTypeChange}
                  options={companyTypeOptions}
                  placeholder="Select type (STOCK or SAM)"
                  className={errors.type ? 'border-destructive' : ''}
                />
              </Field>
            ) : (
              <Field 
                label="BUYER CODE" 
                required 
                error={errors.buyerCode}
                width="md"
                style={{ marginBottom: 0 }}
              >
                <SearchableDropdown
                  value={initialData.buyerCode}
                  onChange={handleBuyerCodeChange}
                  options={buyerCodeOptions}
                  placeholder="Select buyer code"
                  strictMode={true}
                  className={errors.buyerCode ? 'border-destructive' : ''}
                />
              </Field>
            )}

            {/* Program Name */}
            <Field 
              label="PO NAME" 
              required 
              error={errors.programName}
              width="md"
              style={{ marginBottom: 0 }}
            >
              <Input
                type="text"
                value={initialData.programName}
                onChange={handleProgramNameChange}
                placeholder="Enter PO name"
                aria-invalid={!!errors.programName}
              />
            </Field>
          </div>

          {/* Continue Button */}
          <div className="flex justify-start">
            <Button type="button" onClick={handleContinue} variant="default">
              {initialData.ipoId ? 'Save Changes →' : 'Continue →'}
            </Button>
          </div>
        </FormCard>

      </div>

      {/* IPO success is shown inline (no modal) */}
    </FullscreenContent>
  );
};

export default InternalPurchaseOrder;
