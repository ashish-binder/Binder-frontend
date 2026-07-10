import { useState, useEffect } from 'react';
import { getBuyerCodes, getVendorCodes, getPurchaseOrders, createPurchaseOrder } from '../services/integration';
import { scrollToFirstError } from '@/utils/scrollToFirstError';

const GeneratePOCode = ({ onBack }) => {
  const [formData, setFormData] = useState({
    orderDate: '',
    orderTime: '',
    factoryPo: '',
    codeBuyer: '',
    codeVendor: '',
    code: '',
    productCategory: '',
    categoryCode: '',
    poDescription: '',
    particulars: '',
    qty: '',
    unitRate: '',
    amount: '',
    deliveryDate: '',
    paymentTerms: '',
    remarks: '',
    lastPoNo: '',
    poNo: ''
  });
  
  const [errors, setErrors] = useState({});
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [buyerCodes, setBuyerCodes] = useState([]);
  const [vendorCodes, setVendorCodes] = useState([]);
  const [poCodes, setPoCodes] = useState([]);

  useEffect(() => {
    const loadCodes = async () => {
      try {
        // Load buyer codes from API
        const buyerResponse = await getBuyerCodes();
        const buyers = buyerResponse.results || buyerResponse.data || buyerResponse || [];
        const mappedBuyers = Array.isArray(buyers) ? buyers.map(item => ({
          id: item.id,
          code: item.code,
          buyerName: item.buyer_name || item.buyerName || '',
        })) : [];
        setBuyerCodes(mappedBuyers);
        
        // Load vendor codes from API
        const vendorResponse = await getVendorCodes();
        const vendors = vendorResponse.results || vendorResponse.data || vendorResponse || [];
        const mappedVendors = Array.isArray(vendors) ? vendors.map(item => ({
          id: item.id,
          code: item.code,
          vendorName: item.vendor_name || item.vendorName || '',
        })) : [];
        setVendorCodes(mappedVendors);

        // Load existing purchase orders from API
        const poResponse = await getPurchaseOrders();
        const pos = poResponse.results || poResponse.data || poResponse || [];
        setPoCodes(Array.isArray(pos) ? pos : []);
      } catch (error) {
        console.warn('Failed to load codes from API:', error);
        setBuyerCodes([]);
        setVendorCodes([]);
        setPoCodes([]);
      }
    };
    loadCodes();

    // Set current date and time as default (user can change)
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);
    setFormData(prev => ({
      ...prev,
      orderDate: dateStr,
      orderTime: timeStr
    }));
  }, []);

  // Calculate amount when qty or unitRate changes
  useEffect(() => {
    if (formData.qty && formData.unitRate) {
      const qty = parseFloat(formData.qty);
      const rate = parseFloat(formData.unitRate);
      if (!isNaN(qty) && !isNaN(rate)) {
        const calculatedAmount = (qty * rate).toFixed(2);
        setFormData(prev => ({
          ...prev,
          amount: calculatedAmount
        }));
      }
    }
  }, [formData.qty, formData.unitRate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'orderDate', 'orderTime', 'factoryPo', 'codeBuyer', 'codeVendor',
      'code', 'productCategory', 'categoryCode', 'poDescription',
      'particulars', 'qty', 'unitRate', 'deliveryDate', 'paymentTerms'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || !formData[field].toString().trim()) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        newErrors[field] = `${fieldName} is required`;
      }
    });

    if (formData.qty && (isNaN(formData.qty) || parseFloat(formData.qty) <= 0)) {
      newErrors.qty = 'Please enter a valid quantity';
    }

    if (formData.unitRate && (isNaN(formData.unitRate) || parseFloat(formData.unitRate) <= 0)) {
      newErrors.unitRate = 'Please enter a valid unit rate';
    }

    if (formData.orderDate && formData.deliveryDate) {
      if (new Date(formData.deliveryDate) < new Date(formData.orderDate)) {
        newErrors.deliveryDate = 'Delivery date cannot be before order date';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(newErrors);
      return false;
    }
    return true;
  };

  const generatePOCode = () => {
    try {
      const existingPOs = poCodes;
      let nextNumber = 1001;
      
      if (existingPOs.length > 0) {
        const numbers = existingPOs.map(item => {
          const numStr = item.poNo?.replace('PO', '') || '1000';
          return parseInt(numStr) || 1000;
        });
        const maxNumber = Math.max(...numbers);
        nextNumber = maxNumber + 1;
      }
      
      return `PO${nextNumber}`;
    } catch (error) {
      console.error('Error generating PO code:', error);
      return `PO${Date.now().toString().slice(-4)}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // Find buyer and vendor IDs from loaded codes
      const selectedBuyer = buyerCodes.find(b => b.code === formData.codeBuyer);
      const selectedVendor = vendorCodes.find(v => v.code === formData.codeVendor);
      
      // Call backend API - PO code is auto-generated by the server
      const response = await createPurchaseOrder({
        order_date: formData.orderDate,
        order_time: formData.orderTime,
        factory_po_number: formData.factoryPo.trim(),
        buyer: selectedBuyer?.id || null,
        vendor: selectedVendor?.id || null,
        product_category: formData.productCategory.trim(),
        category_code: formData.categoryCode.trim(),
        po_description: formData.poDescription.trim(),
        particulars: formData.particulars.trim(),
        quantity: parseFloat(formData.qty) || 0,
        unit_rate: parseFloat(formData.unitRate) || 0,
        amount: parseFloat(formData.amount) || 0,
        delivery_date: formData.deliveryDate || null,
        payment_terms: formData.paymentTerms.trim(),
        remarks: formData.remarks.trim(),
        last_po_number: formData.lastPoNo.trim(),
      });
      
      console.log('PO API response:', response);
      
      if (response.status === 'success' && response.data) {
        const newPOCode = response.data.po_code;

        setPoCodes((prev) => [...prev, {
          poNo: newPOCode,
          ...formData,
          createdAt: new Date().toISOString()
        }]);

        setGeneratedCode(newPOCode);
      } else {
        throw new Error(response.message || 'Failed to create Purchase Order');
      }
      
    } catch (error) {
      console.error('Error in submission:', error);
      const errorMsg = error.message || error.data?.message || 'An error occurred while generating the PO code.';
      alert(`Error: ${errorMsg}\nPlease try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      alert('PO code copied to clipboard!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = generatedCode;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        alert('PO code copied to clipboard!');
      } catch (copyErr) {
        alert('Failed to copy code. Please copy manually: ' + generatedCode);
      }
      
      document.body.removeChild(textArea);
    }
  };

  const resetForm = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);
    
    setFormData({
      orderDate: dateStr,
      orderTime: timeStr,
      factoryPo: '',
      codeBuyer: '',
      codeVendor: '',
      code: '',
      productCategory: '',
      categoryCode: '',
      poDescription: '',
      particulars: '',
      qty: '',
      unitRate: '',
      amount: '',
      deliveryDate: '',
      paymentTerms: '',
      remarks: '',
      lastPoNo: '',
      poNo: ''
    });
    setErrors({});
    setGeneratedCode('');
    setIsGenerating(false);
  };

  if (generatedCode) {
    return (
      <div style={styles.container}>
        <div style={styles.generatedCodeDisplay}>
          <div style={styles.successAnimation}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successTitle}>PO Code Generated Successfully!</h2>
          </div>
          
          <div style={styles.codeDisplayCard}>
            <h3 style={styles.codeLabel}>Your PO Code:</h3>
            <div style={styles.codeDisplay}>
              <span style={styles.codeText}>{generatedCode}</span>
            </div>
          </div>

          <div style={styles.actionButtons}>
            <button
              onClick={resetForm}
              style={styles.generateAnotherBtn}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              type="button"
            >
              Generate Another PO
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.formHeader}>
        <button 
          onClick={onBack} 
          style={styles.backButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e5e7eb';
            e.currentTarget.style.transform = 'translateX(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
          type="button"
        >
          ← Back to Code Creation
        </button>
        <h1 style={styles.formTitle}>Generate PO Code</h1>
        <p style={styles.formDescription}>Fill in the purchase order details to generate a unique PO code</p>
      </div>

      <div style={styles.poForm}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label htmlFor="orderDate" style={styles.formLabel}>
              Order Date <span style={styles.required}>*</span>
            </label>
            <input
              type="date"
              id="orderDate"
              name="orderDate"
              value={formData.orderDate}
              onChange={handleInputChange}
              style={{...styles.formInput, ...(errors.orderDate && styles.formInputError)}}
              required
            />
            {errors.orderDate && <span style={styles.errorMessage}>{errors.orderDate}</span>}
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="orderTime" style={styles.formLabel}>
              Order Time <span style={styles.required}>*</span>
            </label>
            <input
              type="time"
              id="orderTime"
              name="orderTime"
              value={formData.orderTime}
              onChange={handleInputChange}
              style={{...styles.formInput, ...(errors.orderTime && styles.formInputError)}}
              required
            />
            {errors.orderTime && <span style={styles.errorMessage}>{errors.orderTime}</span>}
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="factoryPo" style={styles.formLabel}>
              Factory PO <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="factoryPo"
              name="factoryPo"
              value={formData.factoryPo}
              onChange={handleInputChange}
              style={{...styles.formInput, ...(errors.factoryPo && styles.formInputError)}}
              placeholder="Enter factory PO number"
              required
            />
            {errors.factoryPo && <span style={styles.errorMessage}>{errors.factoryPo}</span>}
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="codeBuyer" style={styles.formLabel}>
              Buyer Code <span style={styles.required}>*</span>
            </label>
            <select
              id="codeBuyer"
              name="codeBuyer"
              value={formData.codeBuyer}
              onChange={handleInputChange}
              style={{...styles.formInput, ...(errors.codeBuyer && styles.formInputError)}}
              required
            >
              <option value="">Select Buyer Code</option>
              {buyerCodes.map((buyer, index) => (
                <option key={index} value={buyer.code}>
                  {buyer.code} - {buyer.buyerName}
                </option>
              ))}
            </select>
            {errors.codeBuyer && <span style={styles.errorMessage}>{errors.codeBuyer}</span>}
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="codeVendor" style={styles.formLabel}>
              Vendor Code <span style={styles.required}>*</span>
            </label>
            <select
              id="codeVendor"
              name="codeVendor"
              value={formData.codeVendor}
              onChange={handleInputChange}
              style={{...styles.formInput, ...(errors.codeVendor && styles.formInputError)}}
              required
            >
              <option value="">Select Vendor Code</option>
              {vendorCodes.map((vendor, index) => (
                <option key={index} value={vendor.code}>
                  {vendor.code} - {vendor.vendorName}
                </option>
              ))}
            </select>
            {errors.codeVendor && <span style={styles.errorMessage}>{errors.codeVendor}</span>}
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="code" style={styles.formLabel}>
              Code <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              style={{...styles.formInput, ...(errors.code && styles.formInputError)}}
              placeholder="Enter code"
              required
            />
            {errors.code && <span style={styles.errorMessage}>{errors.code}</span>}
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="productCategory" style={styles.formLabel}>
              Product Category <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="productCategory"
              name="productCategory"
              value={formData.productCategory}
              onChange={handleInputChange}
              style={{...styles.formInput, ...(errors.productCategory && styles.formInputError)}}
              placeholder="Enter product category"
              required
            />
            {errors.productCategory && <span style={styles.errorMessage}>{errors.productCategory}</span>}
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="categoryCode" style={styles.formLabel}>
              Category Code <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="categoryCode"
              name="categoryCode"
              value={formData.categoryCode}
              onChange={handleInputChange}
              style={{...styles.formInput, ...(errors.categoryCode && styles.formInputError)}}
              placeholder="Enter category code"
              required
            />
            {errors.categoryCode && <span style={styles.errorMessage}>{errors.categoryCode}</span>}
          </div>

          <div style={styles.formGroupFullWidth}>
            <label htmlFor="poDescription" style={styles.formLabel}>
              PO Description <span style={styles.required}>*</span>
            </label>
            <textarea
              id="poDescription"
              name="poDescription"
              value={formData.poDescription}
              onChange={handleInputChange}
              style={{...styles.formTextarea, ...(errors.poDescription && styles.formInputError)}}
              placeholder="Enter PO description"
              rows={3}
              required
            />
            {errors.poDescription && <span style={styles.errorMessage}>{errors.poDescription}</span>}
          </div>

          <div style={styles.formGroupFullWidth}>
            <label htmlFor="particulars" style={styles.formLabel}>
              Particulars <span style={styles.required}>*</span>
            </label>
            <textarea
              id="particulars"
              name="particulars"
              value={formData.particulars}
              onChange={handleInputChange}
              style={{...styles.formTextarea, ...(errors.particulars && styles.formInputError)}}
              placeholder="Enter particulars"
              rows={3}
              required
            />
            {errors.particulars && <span style={styles.errorMessage}>{errors.particulars}</span>}
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="qty" style={styles.formLabel}>
              Quantity <span style={styles.required}>*</span>
            </label>
            <input
              type="number"
              id="qty"
              name="qty"
              value={formData.qty}
              onChange={handleInputChange}
              style={{...styles.formInput, ...(errors.qty && styles.formInputError)}}
              placeholder="Enter quantity"
              min="0"
              step="0.01"
              required
            />
            {errors.qty && <span style={styles.errorMessage}>{errors.qty}</span>}
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="unitRate" style={styles.formLabel}>
              Unit Rate <span style={styles.required}>*</span>
            </label>
            <input
              type="number"
              id="unitRate"
              name="unitRate"
              value={formData.unitRate}
              onChange={handleInputChange}
              style={{...styles.formInput, ...(errors.unitRate && styles.formInputError)}}
              placeholder="Enter unit rate"
              min="0"
              step="0.01"
              required
            />
            {errors.unitRate && <span style={styles.errorMessage}>{errors.unitRate}</span>}
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="amount" style={styles.formLabel}>
              Amount <span style={styles.required}>*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              style={{...styles.formInput, backgroundColor: '#f9fafb', cursor: 'not-allowed'}}
              placeholder="Auto-calculated"
              min="0"
              step="0.01"
              readOnly
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="deliveryDate" style={styles.formLabel}>
              Delivery Date <span style={styles.required}>*</span>
            </label>
            <input
              type="date"
              id="deliveryDate"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleInputChange}
              style={{...styles.formInput, ...(errors.deliveryDate && styles.formInputError)}}
              required
            />
            {errors.deliveryDate && <span style={styles.errorMessage}>{errors.deliveryDate}</span>}
          </div>

          <div style={styles.formGroupFullWidth}>
            <label htmlFor="paymentTerms" style={styles.formLabel}>
              Payment Terms <span style={styles.required}>*</span>
            </label>
            <textarea
              id="paymentTerms"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleInputChange}
              style={{...styles.formTextarea, ...(errors.paymentTerms && styles.formInputError)}}
              placeholder="Enter payment terms"
              rows={3}
              required
            />
            {errors.paymentTerms && <span style={styles.errorMessage}>{errors.paymentTerms}</span>}
          </div>

          <div style={styles.formGroupFullWidth}>
            <label htmlFor="remarks" style={styles.formLabel}>
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              style={styles.formTextarea}
              placeholder="Enter any additional remarks (Optional)"
              rows={3}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="lastPoNo" style={styles.formLabel}>
              Last PO No
            </label>
            <input
              type="text"
              id="lastPoNo"
              name="lastPoNo"
              value={formData.lastPoNo}
              onChange={handleInputChange}
              style={styles.formInput}
              placeholder="Enter last PO number (Optional)"
            />
          </div>
        </div>

        <div style={styles.formActions}>
          <button 
            onClick={handleSubmit}
            style={{...styles.generateBtn, ...(isGenerating && {opacity: 0.7, cursor: 'not-allowed'})}}
            onMouseEnter={(e) => !isGenerating && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !isGenerating && (e.currentTarget.style.transform = 'translateY(0)')}
            disabled={isGenerating}
            type="button"
          >
            {isGenerating ? (
              <>
                <span style={styles.spinner}></span>
                Generating PO Code...
              </>
            ) : (
              <>
                🎯 Generate PO Code
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    height: '100%',
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    animation: 'fadeIn 0.3s ease',
    overflowY: 'auto',
  },
  formHeader: {
    marginBottom: '40px',
  },
  backButton: {
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    color: '#374151',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  formDescription: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '24px',
  },
  poForm: {
    maxWidth: '1000px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '32px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroupFullWidth: {
    display: 'flex',
    flexDirection: 'column',
    gridColumn: '1 / -1',
  },
  formLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  required: {
    color: '#dc2626',
  },
  formInput: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s',
    background: 'white',
    color: '#1a1a1a',
  },
  formInputError: {
    borderColor: '#dc2626',
  },
  formTextarea: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s',
    background: 'white',
    color: '#1a1a1a',
    resize: 'vertical',
    minHeight: '80px',
  },
  errorMessage: {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '4px',
    fontWeight: '500',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '32px',
  },
  generateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    minWidth: '200px',
    justifyContent: 'center',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #ffffff40',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    display: 'inline-block',
  },
  generatedCodeDisplay: {
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto',
  },
  successAnimation: {
    marginBottom: '40px',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    fontWeight: 'bold',
    margin: '0 auto 20px',
    animation: 'bounceIn 0.6s ease',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  codeDisplayCard: {
    background: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '32px',
  },
  codeLabel: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '16px',
    fontWeight: '600',
  },
  codeDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: 'white',
    border: '3px solid #667eea',
    borderRadius: '12px',
    padding: '20px',
  },
  codeText: {
    fontSize: '36px',
    fontWeight: '900',
    color: '#667eea',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '3px',
  },
  copyButton: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  actionButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  generateAnotherBtn: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  backBtn: {
    padding: '12px 24px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: '#f3f4f6',
    color: '#374151',
  },
};

export default GeneratePOCode;
