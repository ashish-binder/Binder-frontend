import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConsumptionSheet from '../GenerateFactoryCode/components/ConsumptionSheet';
import { getFactoryCodeDraft } from '../../services/integration';
import { useLoading } from '../../context/LoadingContext';

const base64ToFile = (base64Obj) => {
  if (!base64Obj || !base64Obj.data) return null;
  try {
    const arr = base64Obj.data.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || base64Obj.type;
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], base64Obj.name, { type: mime });
  } catch {
    return null;
  }
};

const rehydrateSkuImages = (data) => {
  (data?.skus || []).forEach((sku) => {
    if (sku?.imageBase64) {
      sku.image = base64ToFile(sku.imageBase64);
      sku.imagePreview = sku.imageBase64.data;
    }
    (sku?.subproducts || []).forEach((sub) => {
      if (sub?.imageBase64) {
        sub.image = base64ToFile(sub.imageBase64);
        sub.imagePreview = sub.imageBase64.data;
      }
    });
  });
  return data;
};

const IPODerivedCNS = ({ ipo, onNavigateToSpec, onNavigateToMasterCNS }) => {
  const ipoCode = ipo?.ipoCode || ipo?.code || '';
  const ipoId = ipo?.ipoId || ipo?.id || null;
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const consumptionSheetRef = useRef(null);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    let cancelled = false;
    if (!ipoId && !ipoCode) {
      setLoading(false);
      return () => {};
    }

    // Load from the database (the per-IPO draft blob is the persisted form
    // data, scoped server-side by ipo_id). This is the same source IPO Master
    // CNS uses, so the two screens always agree. The browser localStorage
    // snapshot is only a fallback for when the server draft is unavailable.
    setLoading(true);
    showLoading();
    (async () => {
      try {
        let draft = null;
        if (ipoId) {
          const res = await getFactoryCodeDraft(ipoId);
          draft = res?.payload || null;
        }
        if (cancelled) return;

        const draftUsable = draft && (
          draft.skus?.length ||
          Object.keys(draft).some((k) => k !== 'skus' && draft[k] != null)
        );

        // Database is the only source. No localStorage fallback.
        setFormData(draftUsable ? rehydrateSkuImages(draft) : null);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load derived consumption sheet.');
      } finally {
        if (!cancelled) setLoading(false);
        hideLoading();
      }
    })();

    return () => { cancelled = true; };
  }, [ipoId, ipoCode]);

  const mergedFormData = useMemo(() => {
    if (!formData) return null;
    return {
      ...formData,
      ipoCode: formData.ipoCode || ipoCode,
      orderType: formData.orderType || ipo?.orderType || '',
      buyerCode: formData.buyerCode || ipo?.buyerCode || '',
    };
  }, [formData, ipoCode, ipo?.orderType, ipo?.buyerCode]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: '#6b7280' }}>Loading derived consumption sheet…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: '#b91c1c' }}>{error}</p>
      </div>
    );
  }

  if (!mergedFormData) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: '#6b7280', maxWidth: 640 }}>
          No derived consumption sheet is available for <strong>{ipoCode}</strong> yet.
          Complete the IPC Spec and click <strong>Save</strong> on the final step to
          generate the sheet.
        </p>
      </div>
    );
  }

  const handleEditSection = (sectionKey, skuId) => {
    if (onNavigateToSpec) onNavigateToSpec(sectionKey, skuId);
  };

  return (
    <div className="mb-8 mx-auto min-w-0 w-full max-w-[2400px] px-4 overflow-x-auto">
      <div className="flex justify-end gap-3 mb-4 px-2 sm:px-0">
        <Button
          type="button"
          variant={editMode ? 'default' : 'outline'}
          onClick={() => setEditMode((v) => !v)}
        >
          {editMode ? 'Done Editing' : 'Edit'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowShareSuccess(true)}
        >
          Share to IPC MASTER CNS
        </Button>
      </div>
      {editMode && (
        <p className="text-sm text-muted-foreground mb-4 px-2 sm:px-0">
          Click on any section to navigate to the page where you can edit those values.
        </p>
      )}
      <ConsumptionSheet
        ref={consumptionSheetRef}
        formData={mergedFormData}
        isEditMode={editMode}
        onEditSection={handleEditSection}
      />

      <Dialog open={showShareSuccess} onOpenChange={setShowShareSuccess}>
        <DialogContent className="max-w-md" showCloseButton={true}>
          <div className="flex flex-col items-center text-center" style={{ padding: '32px' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4">
              ✓
            </div>
            <DialogHeader>
              <DialogTitle className="text-lg">Shared to IPC Master CNS</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground" style={{ marginTop: '6px' }}>
              Consumption sheet has been shared successfully.
            </p>
            <Button
              type="button"
              className="mt-6 min-w-[140px]"
              style={{ marginTop: '16px' }}
              onClick={() => {
                setShowShareSuccess(false);
                onNavigateToMasterCNS?.();
              }}
            >
              Go to IPC Master CNS
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IPODerivedCNS;
