/**
 * Binder-OS - Frontend API Integration File
 * React + Vite Frontend Integration
 * 
 * This file contains all API integration functions for the frontend.
 * Copy these functions to your React frontend project.
 * 
 * Base URL Configuration:
 * - Development: https://binder-backend-0szj.onrender.com/api/
 * - Production: https://binder-backend-0szj.onrender.com/api/
 * - Domain: https://erpbinder.com/api/
 * 
 * Frontend Deployment: https://binder-frontend-self.vercel.app/
 */

// Share a single token store with authService so that "Remember me"
// (sessionStorage vs localStorage) is honored consistently across the app.
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  getUser,
  setUser,
} from '../api/authService';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://binder-backend-0szj.onrender.com/api/';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Make authenticated API request
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getAccessToken();
  
  // Don't set Content-Type for FormData, browser will set it with boundary
  const isFormData = options.body instanceof FormData;
  
  const defaultHeaders = {};
  
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && token) {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry request with new token
        config.headers['Authorization'] = `Bearer ${getAccessToken()}`;
        return await fetch(`${API_BASE_URL}${endpoint}`, config);
      }
    }
    
    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * Refresh access token
 */
const refreshToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearTokens();
    return false;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });
    
    if (response.ok) {
      const data = await response.json();
      // Write back to the same store (sessionStorage/localStorage) the refresh came from.
      setTokens(data.access, refresh);
      return true;
    } else {
      clearTokens();
      return false;
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    clearTokens();
    return false;
  }
};

// ============================================================================
// AUTHENTICATION APIs
// ============================================================================

/**
 * Register new user
 */
export const register = async (userData) => {
  const response = await apiRequest('auth/register/', {
    method: 'POST',
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
      password_confirm: userData.passwordConfirm,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
    }),
  });
  
  return await response.json();
};

/**
 * Login user (direct login)
 */
export const login = async (email, password) => {
  const response = await apiRequest('auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    setTokens(data.data.tokens.access, data.data.tokens.refresh);
    setUser(data.data.user);
  }
  
  return data;
};

/**
 * Request OTP for login (Step 1)
 */
export const requestOTP = async (email, password) => {
  const response = await apiRequest('auth/login/request-otp/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  return await response.json();
};

/**
 * Verify OTP and login (Step 2)
 */
export const verifyOTP = async (email, otp) => {
  const response = await apiRequest('auth/login/verify-otp/', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    setTokens(data.data.tokens.access, data.data.tokens.refresh);
    setUser(data.data.user);
  }
  
  return data;
};

/**
 * Logout user
 */
export const logout = async () => {
  const refresh = getRefreshToken();
  
  if (refresh) {
    try {
      await apiRequest('auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  clearTokens();
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const response = await apiRequest('auth/me/');
  const data = await response.json();
  
  if (data.id) {
    setUser(data);
  }
  
  return data;
};

/**
 * Verify email
 */
export const verifyEmail = async (token) => {
  const response = await apiRequest('auth/verify-email/', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  
  return await response.json();
};

/**
 * Resend verification email
 */
export const resendVerification = async (email) => {
  const response = await apiRequest('auth/resend-verification/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  
  return await response.json();
};

/**
 * Set password (for new users)
 */
export const setPassword = async (token, password, passwordConfirm) => {
  const response = await apiRequest('auth/set-password/', {
    method: 'POST',
    body: JSON.stringify({
      token,
      password,
      password_confirm: passwordConfirm,
    }),
  });
  
  return await response.json();
};

// ============================================================================
// MEMBER MANAGEMENT APIs
// ============================================================================

/**
 * List members
 */
export const getMembers = async (params = {}) => {
  const queryParams = new URLSearchParams(params);
  const response = await apiRequest(`auth/members/?${queryParams}`);
  return await response.json();
};

/**
 * Get member details
 */
export const getMember = async (memberId) => {
  const response = await apiRequest(`auth/members/${memberId}/`);
  return await response.json();
};

/**
 * Create member
 */
export const createMember = async (memberData) => {
  const response = await apiRequest('auth/members/', {
    method: 'POST',
    body: JSON.stringify({
      email: memberData.email,
      password: memberData.password,
      first_name: memberData.firstName,
      last_name: memberData.lastName,
      phone: memberData.phone,
      role: memberData.role,
      custom_role_name: memberData.role === 'custom' ? memberData.customRoleName : null,
      designation: memberData.designation,
      permissions: memberData.permissions || [],
    }),
  });
  
  return await response.json();
};

/**
 * Update member
 */
export const updateMember = async (memberId, updates) => {
  const response = await apiRequest(`auth/members/${memberId}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  
  return await response.json();
};

/**
 * Deactivate member
 */
export const deactivateMember = async (memberId) => {
  const response = await apiRequest(`auth/members/${memberId}/`, {
    method: 'DELETE',
  });
  
  return await response.json();
};

/**
 * Update member permissions
 */
export const updateMemberPermissions = async (memberId, permissions) => {
  const response = await apiRequest(`auth/members/${memberId}/update-permissions/`, {
    method: 'POST',
    body: JSON.stringify({ permissions }),
  });
  
  return await response.json();
};

/**
 * Get available permissions for member
 */
export const getMemberAvailablePermissions = async (memberId) => {
  const response = await apiRequest(`auth/members/${memberId}/available-permissions/`);
  return await response.json();
};

// ============================================================================
// PERMISSION APIs
// ============================================================================

/**
 * Get all permissions grouped by category
 */
export const getAllPermissions = async () => {
  const response = await apiRequest('auth/permissions/');
  return await response.json();
};

/**
 * Toggle permission for user
 */
export const togglePermission = async (userId, permissionId) => {
  const response = await apiRequest(`auth/members/${userId}/permissions/${permissionId}/toggle/`, {
    method: 'POST',
  });
  
  return await response.json();
};

// ============================================================================
// TENANT MANAGEMENT APIs
// ============================================================================

/**
 * List tenants (Master Admin only)
 */
export const getTenants = async (params = {}) => {
  const queryParams = new URLSearchParams(params);
  const response = await apiRequest(`auth/tenants/?${queryParams}`);
  return await response.json();
};

/**
 * Get tenant details
 */
export const getTenant = async (tenantId) => {
  const response = await apiRequest(`auth/tenants/${tenantId}/`);
  return await response.json();
};

/**
 * Create tenant (Master Admin only)
 */
export const createTenant = async (tenantData) => {
  const response = await apiRequest('auth/tenants/', {
    method: 'POST',
    body: JSON.stringify({
      company_name: tenantData.companyName,
      company_email: tenantData.companyEmail,
      company_phone: tenantData.companyPhone,
      company_address: tenantData.companyAddress,
      user_limit: tenantData.userLimit,
      plan: tenantData.plan,
    }),
  });
  
  return await response.json();
};

/**
 * Update tenant
 */
export const updateTenant = async (tenantId, updates) => {
  const response = await apiRequest(`auth/tenants/${tenantId}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  
  return await response.json();
};

/**
 * Update tenant user limit (Master Admin only)
 */
export const updateTenantUserLimit = async (tenantId, userLimit, plan) => {
  const response = await apiRequest(`auth/tenants/${tenantId}/update-user-limit/`, {
    method: 'POST',
    body: JSON.stringify({
      user_limit: userLimit,
      plan: plan,
    }),
  });
  
  return await response.json();
};

/**
 * Upload tenant logo
 */
export const uploadTenantLogo = async (tenantId, logoFile) => {
  const formData = new FormData();
  formData.append('logo', logoFile);
  
  const response = await apiRequest(`auth/tenants/${tenantId}/upload-logo/`, {
    method: 'POST',
    body: formData,
  });
  
  return await response.json();
};

// ============================================================================
// DEPARTMENT MANAGEMENT APIs
// ============================================================================

/**
 * List departments
 */
export const getDepartments = async (params = {}) => {
  const queryParams = new URLSearchParams(params);
  const response = await apiRequest(`ims/departments/?${queryParams}`);
  return await response.json();
};

/**
 * Get department details
 */
export const getDepartment = async (departmentId) => {
  const response = await apiRequest(`ims/departments/${departmentId}/`);
  return await response.json();
};

/**
 * Create department
 */
export const createDepartment = async (departmentData) => {
  const response = await apiRequest('ims/departments/', {
    method: 'POST',
    body: JSON.stringify({
      code: departmentData.code,
      name: departmentData.name,
      description: departmentData.description,
      display_order: departmentData.displayOrder,
      is_active: departmentData.isActive,
      segments: departmentData.segments || [],
    }),
  });
  
  return await response.json();
};

/**
 * Update department
 */
export const updateDepartment = async (departmentId, updates) => {
  const response = await apiRequest(`ims/departments/${departmentId}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  
  return await response.json();
};

/**
 * Delete department
 */
export const deleteDepartment = async (departmentId) => {
  const response = await apiRequest(`ims/departments/${departmentId}/`, {
    method: 'DELETE',
  });
  
  return response.status === 204 ? { status: 'success' } : await response.json();
};

/**
 * Get department segments
 */
export const getDepartmentSegments = async (departmentId) => {
  const response = await apiRequest(`ims/departments/${departmentId}/segments/`);
  return await response.json();
};

/**
 * Add segment to department
 */
export const addSegmentToDepartment = async (departmentId, segmentData) => {
  const response = await apiRequest(`ims/departments/${departmentId}/add_segment/`, {
    method: 'POST',
    body: JSON.stringify({
      code: segmentData.code,
      name: segmentData.name,
      description: segmentData.description,
      display_order: segmentData.displayOrder,
      is_active: segmentData.isActive,
    }),
  });
  
  return await response.json();
};

/**
 * Get menu structure
 */
export const getMenuStructure = async () => {
  const response = await apiRequest('ims/menu-structure/');
  return await response.json();
};

// ============================================================================
// SEGMENT MANAGEMENT APIs
// ============================================================================

/**
 * List segments
 */
export const getSegments = async (params = {}) => {
  const queryParams = new URLSearchParams(params);
  const response = await apiRequest(`ims/segments/?${queryParams}`);
  return await response.json();
};

/**
 * Get segment details
 */
export const getSegment = async (segmentId) => {
  const response = await apiRequest(`ims/segments/${segmentId}/`);
  return await response.json();
};

/**
 * Create segment
 */
export const createSegment = async (segmentData) => {
  const response = await apiRequest('ims/segments/', {
    method: 'POST',
    body: JSON.stringify({
      code: segmentData.code,
      name: segmentData.name,
      description: segmentData.description,
      department: segmentData.departmentId,
      display_order: segmentData.displayOrder,
      is_active: segmentData.isActive,
    }),
  });
  
  return await response.json();
};

/**
 * Update segment
 */
export const updateSegment = async (segmentId, updates) => {
  const response = await apiRequest(`ims/segments/${segmentId}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  
  return await response.json();
};

/**
 * Delete segment
 */
export const deleteSegment = async (segmentId) => {
  const response = await apiRequest(`ims/segments/${segmentId}/`, {
    method: 'DELETE',
  });
  
  return await response.json();
};

// ============================================================================
// BUYER CODE APIs
// ============================================================================

/**
 * List buyer codes
 */
export const getBuyerCodes = async (params = {}) => {
  const queryParams = new URLSearchParams(params);
  const response = await apiRequest(`ims/buyer-codes/?${queryParams}`);
  return await response.json();
};

/**
 * Get buyer code details
 */
export const getBuyerCode = async (buyerCodeId) => {
  const response = await apiRequest(`ims/buyer-codes/${buyerCodeId}/`);
  return await response.json();
};

/**
 * Generate buyer code
 */
export const createBuyerCode = async (buyerData) => {
  const response = await apiRequest('ims/buyer-codes/', {
    method: 'POST',
    body: JSON.stringify({
      buyer_name: buyerData.buyerName,
      buyer_address: buyerData.buyerAddress,
      contact_person: buyerData.contactPerson,
      retailer: buyerData.retailer,
    }),
  });
  
  return await response.json();
};

/**
 * Update buyer code
 */
export const updateBuyerCode = async (buyerCodeId, updates) => {
  const response = await apiRequest(`ims/buyer-codes/${buyerCodeId}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  
  return await response.json();
};

/**
 * Delete buyer code
 */
export const deleteBuyerCode = async (buyerCodeId) => {
  const response = await apiRequest(`ims/buyer-codes/${buyerCodeId}/`, {
    method: 'DELETE',
  });

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return { status: 'success' };
  }
  return await response.json();
};

/**
 * Preview next buyer code
 */
export const previewNextBuyerCode = async () => {
  const response = await apiRequest('ims/buyer-codes/generate/');
  return await response.json();
};

/**
 * Get buyer master sheet
 */
export const getBuyerMasterSheet = async () => {
  const response = await apiRequest('ims/buyer-codes/master-sheet/');
  return await response.json();
};

// ============================================================================
// VENDOR CODE APIs
// ============================================================================

/**
 * List vendor codes
 */
export const getVendorCodes = async (params = {}) => {
  const queryParams = new URLSearchParams(params);
  const response = await apiRequest(`ims/vendor-codes/?${queryParams}`);
  return await response.json();
};

/**
 * Get vendor code details
 */
export const getVendorCode = async (vendorCodeId) => {
  const response = await apiRequest(`ims/vendor-codes/${vendorCodeId}/`);
  return await response.json();
};

/**
 * Generate vendor code
 */
export const createVendorCode = async (vendorData) => {
  const response = await apiRequest('ims/vendor-codes/', {
    method: 'POST',
    body: JSON.stringify({
      vendor_name: vendorData.vendorName,
      address: vendorData.address,
      gst: vendorData.gst,
      bank_name: vendorData.bankName,
      account_number: vendorData.accountNumber,
      ifsc_code: vendorData.ifscCode,
      job_work_category: vendorData.jobWorkCategory,
      job_work_sub_category: vendorData.jobWorkSubCategory,
      contact_person: vendorData.contactPerson,
      whatsapp_number: vendorData.whatsappNumber,
      alt_whatsapp_number: vendorData.altWhatsappNumber,
      email: vendorData.email,
      payment_terms: vendorData.paymentTerms,
    }),
  });
  
  return await response.json();
};

/**
 * Update vendor code
 */
export const updateVendorCode = async (vendorCodeId, updates) => {
  const response = await apiRequest(`ims/vendor-codes/${vendorCodeId}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  
  return await response.json();
};

/**
 * Delete vendor code
 */
export const deleteVendorCode = async (vendorCodeId) => {
  const response = await apiRequest(`ims/vendor-codes/${vendorCodeId}/`, {
    method: 'DELETE',
  });

  // DELETE may return 204 No Content with empty body
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return { status: 'success' };
  }
  return await response.json();
};

/**
 * Preview next vendor code
 */
export const previewNextVendorCode = async () => {
  const response = await apiRequest('ims/vendor-codes/generate/');
  return await response.json();
};

/**
 * Get vendor master sheet
 */
export const getVendorMasterSheet = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await apiRequest(`ims/vendor-codes/master-sheet/${query ? '?' + query : ''}`);
  return await response.json();
};

// ============================================================================
// HEALTH CHECK APIs
// ============================================================================

/**
 * Basic health check
 */
export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}health/`);
  return await response.json();
};

/**
 * Detailed health check
 */
export const detailedHealthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}health/detailed/`);
  return await response.json();
};

// ============================================================================
// GOOGLE SHEETS APIs (Legacy)
// ============================================================================

/**
 * Get departments (Legacy)
 */
export const getSheetsDepartments = async () => {
  const response = await apiRequest('sheets/departments/');
  return await response.json();
};

/**
 * Add department (Legacy)
 */
export const addSheetsDepartment = async (departmentData) => {
  const response = await apiRequest('sheets/departments/add/', {
    method: 'POST',
    body: JSON.stringify(departmentData),
  });
  
  return await response.json();
};

/**
 * Get accessories (Legacy)
 */
export const getSheetsAccessories = async () => {
  const response = await apiRequest('sheets/accessories/');
  return await response.json();
};

/**
 * Add accessory (Legacy)
 */
export const addSheetsAccessory = async (accessoryData) => {
  const response = await apiRequest('sheets/accessories/add/', {
    method: 'POST',
    body: JSON.stringify(accessoryData),
  });
  
  return await response.json();
};

// ============================================================================
// INTERNAL PURCHASE ORDERS (IPO)
// ============================================================================

export const getIPOs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await apiRequest(`ims/ipos/${query ? '?' + query : ''}`);
  return await response.json();
};

export const getIPO = async (ipoId) => {
  const response = await apiRequest(`ims/ipos/${ipoId}/`);
  return await response.json();
};

// Mark IPOs completed (or active again) — persisted server-side, tenant-wide.
export const setIposCompleted = async (ids, completed = true) => {
  const response = await apiRequest('ims/ipos/set-completed/', {
    method: 'POST',
    body: JSON.stringify({ ids, completed }),
  });
  return await response.json();
};

// Return every completed IPO for the tenant back to active.
export const clearCompletedIpos = async () => {
  const response = await apiRequest('ims/ipos/clear-completed/', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return await response.json();
};

export const createIPO = async (ipoData) => {
  const response = await apiRequest('ims/ipos/', {
    method: 'POST',
    body: JSON.stringify(ipoData),
  });
  return await response.json();
};

export const updateIPO = async (ipoId, updates) => {
  const response = await apiRequest(`ims/ipos/${ipoId}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return await response.json();
};

export const deleteIPO = async (ipoId) => {
  const response = await apiRequest(`ims/ipos/${ipoId}/`, {
    method: 'DELETE',
  });
  if (response.status === 204) return { success: true };
  return await response.json();
};

export const getNextIPOSrNo = async (programName) => {
  const response = await apiRequest(`ims/ipos/next-sr-no/?program=${encodeURIComponent(programName)}`);
  return await response.json();
};

export const getIPOMasterCNS = async (ipoId) => {
  const response = await apiRequest(`ims/ipos/${ipoId}/master-cns/`);
  return await response.json();
};

export const saveIPOMasterCNSRows = async (ipoId, rows) => {
  const response = await apiRequest(`ims/ipos/${ipoId}/master-cns/save-rows/`, {
    method: 'POST',
    body: JSON.stringify({ rows }),
  });
  return await response.json();
};

// ============================================================================
// INWARD STORE SHEETS
// ============================================================================

export const getInwardStoreSheets = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await apiRequest(`ims/inward-store-sheets/${query ? '?' + query : ''}`);
  return await response.json();
};

export const getInwardStoreSheet = async (id) => {
  const response = await apiRequest(`ims/inward-store-sheets/${id}/`);
  return await response.json();
};

export const createInwardStoreSheet = async (data) => {
  const response = await apiRequest('ims/inward-store-sheets/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return await response.json();
};

export const deleteInwardStoreSheet = async (id) => {
  const response = await apiRequest(`ims/inward-store-sheets/${id}/`, {
    method: 'DELETE',
  });
  if (response.status === 204) return { success: true };
  return await response.json();
};

export const getInwardStoreSheetChoices = async () => {
  const response = await apiRequest('ims/inward-store-sheets/choices/');
  return await response.json();
};

export const generateInwardStoreSheetCodes = async (id) => {
  const response = await apiRequest(`ims/inward-store-sheets/${id}/generate-codes/`, {
    method: 'POST',
  });
  return await response.json();
};

// ============================================================================
// OUTWARD STORE SHEETS
// ============================================================================

export const getOutwardStoreSheets = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await apiRequest(`ims/outward-store-sheets/${query ? '?' + query : ''}`);
  return await response.json();
};

export const getOutwardStoreSheet = async (id) => {
  const response = await apiRequest(`ims/outward-store-sheets/${id}/`);
  return await response.json();
};

export const createOutwardStoreSheet = async (data) => {
  const response = await apiRequest('ims/outward-store-sheets/', {
    method: 'POST',
    body: data,
  });
  return await response.json();
};

export const deleteOutwardStoreSheet = async (id) => {
  const response = await apiRequest(`ims/outward-store-sheets/${id}/`, {
    method: 'DELETE',
  });
  if (response.status === 204) return { success: true };
  return await response.json();
};

export const getOutwardStoreSheetChoices = async () => {
  const response = await apiRequest('ims/outward-store-sheets/choices/');
  return await response.json();
};

// ============================================================================
// COURIER RECORDS
// ============================================================================

const COURIER_API_PATH = (() => {
  const configuredPath = String(import.meta.env.VITE_COURIER_API_PATH || 'ims/courier-records/').trim();
  if (!configuredPath) return 'ims/courier-records/';
  return configuredPath.endsWith('/') ? configuredPath : `${configuredPath}/`;
})();

const parseJsonIfPresent = async (response) => {
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

const buildCourierApiEndpoint = (recordId = '', params = {}) => {
  const basePath = recordId ? `${COURIER_API_PATH}${recordId}/` : COURIER_API_PATH;
  const query = new URLSearchParams(params).toString();
  return query ? `${basePath}?${query}` : basePath;
};

const buildCourierFallbackResult = (message, data = null, status = null) => ({
  available: false,
  source: 'local',
  message,
  data,
  status,
});

const buildCourierSuccessResult = (data) => ({
  available: true,
  source: 'api',
  data,
  status: 200,
});

const tryCourierApiRequest = async (endpoint, options = {}) => {
  try {
    const response = await apiRequest(endpoint, options);
    const data = await parseJsonIfPresent(response);

    if (!response.ok) {
      console.warn(`Courier API request failed (${response.status}). Falling back to local storage.`, data);
      return buildCourierFallbackResult(`Courier API request failed (${response.status}).`, data, response.status);
    }

    return buildCourierSuccessResult(data);
  } catch (error) {
    console.warn('Courier API unavailable. Falling back to local storage.', error);
    return buildCourierFallbackResult('Courier API unavailable.', { error: error.message || 'Unknown error' });
  }
};

export const listCourierRecords = async (params = {}) => {
  return await tryCourierApiRequest(buildCourierApiEndpoint('', params));
};

export const createCourierRecord = async (payload) => {
  return await tryCourierApiRequest(COURIER_API_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateCourierRecord = async (recordId, payload) => {
  const endpoint = buildCourierApiEndpoint(recordId);
  const patchResult = await tryCourierApiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (patchResult.available || patchResult.status !== 405) {
    return patchResult;
  }

  return await tryCourierApiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

// ============================================================================
// PURCHASE ORDERS (PO)
// ============================================================================

export const getPurchaseOrders = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await apiRequest(`ims/purchase-orders/${query ? '?' + query : ''}`);
  return await response.json();
};

export const getPurchaseOrder = async (poId) => {
  const response = await apiRequest(`ims/purchase-orders/${poId}/`);
  return await response.json();
};

export const createPurchaseOrder = async (poData) => {
  const response = await apiRequest('ims/purchase-orders/', {
    method: 'POST',
    body: JSON.stringify(poData),
  });
  return await response.json();
};

export const deletePurchaseOrder = async (poId) => {
  const response = await apiRequest(`ims/purchase-orders/${poId}/`, {
    method: 'DELETE',
  });
  if (response.status === 204) return { success: true };
  return await response.json();
};

export const getNextPOCode = async () => {
  const response = await apiRequest('ims/purchase-orders/next-code/');
  return await response.json();
};

// ============================================================================
// COMPANY ESSENTIALS
// ============================================================================

export const getCompanyEssentials = async (category, params = {}) => {
  const query = new URLSearchParams({ ...params, ...(category ? { category } : {}) }).toString();
  const response = await apiRequest(`ims/company-essentials/${query ? '?' + query : ''}`);
  return await response.json();
};

export const getCompanyEssential = async (id) => {
  const response = await apiRequest(`ims/company-essentials/${id}/`);
  return await response.json();
};

export const createCompanyEssential = async (data) => {
  const response = await apiRequest('ims/company-essentials/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return await response.json();
};

export const bulkCreateCompanyEssentials = async (items) => {
  const response = await apiRequest('ims/company-essentials/bulk-create/', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
  return await response.json();
};

export const deleteCompanyEssential = async (id) => {
  const response = await apiRequest(`ims/company-essentials/${id}/`, {
    method: 'DELETE',
  });
  if (response.status === 204) return { success: true };
  return await response.json();
};

export const getNextEssentialsPONumber = async (category) => {
  const response = await apiRequest(`ims/company-essentials/next-po-number/?category=${encodeURIComponent(category)}`);
  return await response.json();
};

export const getEssentialCategories = async () => {
  const response = await apiRequest('ims/company-essentials/categories/');
  return await response.json();
};

// ============================================================================
// STOCK SHEETS (IMS → Stock Sheet)
// ============================================================================

export const getStockSheets = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await apiRequest(`ims/stock-sheets/${query ? '?' + query : ''}`);
  return await response.json();
};

export const getStockSheet = async (id) => {
  const response = await apiRequest(`ims/stock-sheets/${id}/`);
  return await response.json();
};

export const createStockSheet = async (data) => {
  // If data contains File objects, send as multipart; otherwise JSON
  const hasFile = (data?.items || []).some((it) => it && it.image instanceof File);
  if (hasFile) {
    const fd = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'items' || key === 'packages' || key === 'item_columns') return;
      if (data[key] !== undefined && data[key] !== null) fd.append(key, data[key]);
    });
    if (data.item_columns) {
      fd.append('item_columns', JSON.stringify(data.item_columns));
    }
    (data.items || []).forEach((it, i) => {
      fd.append(`items[${i}]sr_no`, it.sr_no ?? i + 1);
      fd.append(`items[${i}]material_description`, it.material_description ?? '');
      fd.append(`items[${i}]unit`, it.unit ?? '');
      fd.append(`items[${i}]details`, JSON.stringify(it.details || {}));
      if (it.image instanceof File) fd.append(`items[${i}]image`, it.image);
    });
    (data.packages || []).forEach((p, i) => {
      fd.append(`packages[${i}]package_no`, p.package_no ?? i + 1);
      fd.append(`packages[${i}]qty`, p.qty ?? 0);
      fd.append(`packages[${i}]unit`, p.unit ?? '');
    });
    const response = await apiRequest('ims/stock-sheets/', { method: 'POST', body: fd });
    return await response.json();
  }
  const response = await apiRequest('ims/stock-sheets/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return await response.json();
};

export const deleteStockSheet = async (id) => {
  const response = await apiRequest(`ims/stock-sheets/${id}/`, { method: 'DELETE' });
  if (response.status === 204) return { success: true };
  return await response.json();
};

export const getStockSheetChoices = async () => {
  const response = await apiRequest('ims/stock-sheets/choices/');
  return await response.json();
};

export const getStockSheetMaterialItems = async ({ ipc, ipcCode, category, yarnSubCategory }) => {
  const params = new URLSearchParams();
  if (ipc) params.set('ipc', ipc);
  if (ipcCode) params.set('ipc_code', ipcCode);
  if (category) params.set('category', category);
  if (yarnSubCategory) params.set('yarn_sub_category', yarnSubCategory);
  const response = await apiRequest(`ims/stock-sheets/material-items/?${params.toString()}`);
  return await response.json();
};

// ============================================================================
// FACTORY CODES (IPC)
// ============================================================================

export const getFactoryCodes = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await apiRequest(`ims/factory-codes/${query ? '?' + query : ''}`);
  return await response.json();
};

export const getFactoryCode = async (id) => {
  const response = await apiRequest(`ims/factory-codes/${id}/`);
  return await response.json();
};

export const createFactoryCode = async (data) => {
  const response = await apiRequest('ims/factory-codes/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return await response.json();
};

// Saves all 6 steps at once using the wizard endpoint
export const saveFactoryCodeWizard = async (wizardData) => {
  const response = await apiRequest('ims/factory-codes/wizard/', {
    method: 'POST',
    body: JSON.stringify(wizardData),
  });
  return await response.json();
};

export const deleteFactoryCode = async (id) => {
  const response = await apiRequest(`ims/factory-codes/${id}/`, {
    method: 'DELETE',
  });
  if (response.status === 204) return { success: true };
  return await response.json();
};

// ============================================================================
// MATERIAL OPTIONS (tenant-scoped custom dropdown values)
// ============================================================================

// Fetch tenant-scoped custom dropdown options. Filter by material_type /
// field_key / parent_key to scope to a single field (e.g. all custom Fabric
// Names for the "Cotton" fiber type).
export const getMaterialOptions = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null))
  ).toString();
  const response = await apiRequest(`ims/material-options/${query ? '?' + query : ''}`);
  return await response.json();
};

// Persist a custom value the user typed that wasn't in the built-in list, so it
// becomes available to the whole tenant next time. Idempotent on the backend.
export const saveMaterialOption = async ({ materialType, fieldKey, parentKey = '', value }) => {
  const response = await apiRequest('ims/material-options/', {
    method: 'POST',
    body: JSON.stringify({
      material_type: materialType,
      field_key: fieldKey,
      parent_key: parentKey || '',
      value,
    }),
  });
  return await response.json();
};

// Factory code draft (save/load per step - PostgreSQL, sync across devices).
// Drafts are scoped to (user, IPO). Pass `ipoId` when editing an existing IPO
// so that switching between IPOs doesn't clobber each other's in-progress
// work. Omit `ipoId` for the "new IPO" scratchpad (pre-IPO-creation wizard).
export const getFactoryCodeDraft = async (ipoId = null) => {
  const query = ipoId ? `?ipo_id=${encodeURIComponent(ipoId)}` : '';
  const response = await apiRequest(`ims/factory-codes/draft/${query}`);
  return await response.json();
};

export const saveFactoryCodeDraft = async (payload, ipoId = null) => {
  const query = ipoId ? `?ipo_id=${encodeURIComponent(ipoId)}` : '';
  const response = await apiRequest(`ims/factory-codes/draft/${query}`, {
    method: 'PUT',
    body: JSON.stringify({ payload }),
  });
  return await response.json();
};

// Factory code SECTIONS (IPO Management) — per-section JSON store. Splits the big
// draft so each wizard step saves/loads only its own compact slice, keyed by
// (ipo, sku_key, section). Requires the 0018 migration applied on the backend.
export const getFactoryCodeSection = async (ipoId, skuKey, section) => {
  const q = `?ipo_id=${encodeURIComponent(ipoId)}&sku_key=${encodeURIComponent(skuKey)}&section=${encodeURIComponent(section)}`;
  const response = await apiRequest(`ims/factory-codes/section/${q}`);
  return await response.json(); // { payload: <slice> | null }
};

export const saveFactoryCodeSection = async (ipoId, skuKey, section, payload) => {
  const q = `?ipo_id=${encodeURIComponent(ipoId)}&sku_key=${encodeURIComponent(skuKey)}&section=${encodeURIComponent(section)}`;
  const response = await apiRequest(`ims/factory-codes/section/${q}`, {
    method: 'PUT',
    body: JSON.stringify({ payload }),
  });
  return await response.json();
};

// All saved section slices for an IPO (for rehydrate): { sections: [...] }.
export const getFactoryCodeSections = async (ipoId) => {
  const response = await apiRequest(`ims/factory-codes/sections/?ipo_id=${encodeURIComponent(ipoId)}`);
  return await response.json();
};

// Fetch all committed factory codes for a single IPO (nested/complete shape).
// Used by the IPC Spec restore path when the draft is missing or stale.
export const getFactoryCodesByIpo = async (ipoId) => {
  if (!ipoId) return { results: [] };
  const response = await apiRequest(
    `ims/factory-codes/?ipo=${encodeURIComponent(ipoId)}`
  );
  return await response.json();
};

// ============================================================================
// PUBLIC COMPANY ESSENTIAL (share link - no auth)
// ============================================================================

export const getPublicEssentialByToken = async (token) => {
  const response = await fetch(`${API_BASE_URL}public/essentials/${token}/`);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || data?.error || 'Invalid or expired link');
  return data;
};

export const markPublicEssentialTaken = async (token, data) => {
  const response = await fetch(`${API_BASE_URL}public/essentials/${token}/taken/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json?.detail || json?.error || 'Failed to submit');
  return json;
};

// ============================================================================
// UQR FORMS (save/load draft, filled indicator)
// ============================================================================

export const getUQRFormsList = async () => {
  const response = await apiRequest('ims/uqr-forms/');
  return await response.json();
};

export const getUQRFormDraft = async (formId) => {
  const response = await apiRequest(`ims/uqr-forms/${encodeURIComponent(formId)}/`);
  return await response.json();
};

export const saveUQRFormDraft = async (formId, payload) => {
  const response = await apiRequest(`ims/uqr-forms/${encodeURIComponent(formId)}/`, {
    method: 'PUT',
    body: JSON.stringify({ payload }),
  });
  return await response.json();
};

// Contextual UQR draft APIs (Section/IPO/IPC/Form scoped)
// DRF-ready contract:
// GET  ims/uqr-forms/contextual/?order_type=...&ipo_code=...&ipc_code=...&form_id=...
// PUT  ims/uqr-forms/contextual/
// body: { order_type, ipo_code, ipc_code, form_id, payload }
export const getContextualUQRFormDraft = async ({
  orderType = '',
  ipoCode = '',
  ipcCode = '',
  formId = '',
}) => {
  const query = new URLSearchParams({
    order_type: orderType,
    ipo_code: ipoCode,
    ipc_code: ipcCode,
    form_id: formId,
  }).toString();

  const response = await apiRequest(`ims/uqr-forms/contextual/${query ? `?${query}` : ''}`);
  return await response.json();
};

export const saveContextualUQRFormDraft = async ({
  orderType = '',
  ipoCode = '',
  ipcCode = '',
  formId = '',
  payload = {},
}) => {
  const response = await apiRequest('ims/uqr-forms/contextual/', {
    method: 'PUT',
    body: JSON.stringify({
      order_type: orderType,
      ipo_code: ipoCode,
      ipc_code: ipcCode,
      form_id: formId,
      payload,
    }),
  });
  return await response.json();
};

// ============================================================================
// PURCHASE SECTION
// ============================================================================

export const shareIpoToPurchase = async (ipoId) => {
  const response = await apiRequest(`ims/ipos/${ipoId}/share-to-purchase/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return await response.json();
};

export const getPurchaseIpos = async (type) => {
  const query = type ? `?type=${encodeURIComponent(type)}` : '';
  const response = await apiRequest(`ims/purchase/ipos/${query}`);
  return await response.json();
};

export const getPurchaseGrid = async (ipoId, { tab, category } = {}) => {
  const params = new URLSearchParams();
  if (tab) params.set('tab', tab);
  if (category) params.set('category', category);
  const q = params.toString();
  const response = await apiRequest(`ims/purchase/${ipoId}/grid/${q ? `?${q}` : ''}`);
  return await response.json();
};

export const patchPurchaseLineItem = async (sourceType, sourceId, patch) => {
  const response = await apiRequest(
    `ims/purchase/line-items/${sourceType}/${sourceId}/`,
    { method: 'PATCH', body: JSON.stringify(patch) }
  );
  return await response.json();
};

export const previewVpo = async (ipoId, lines) => {
  const response = await apiRequest(`ims/purchase/${ipoId}/vpo/preview/`, {
    method: 'POST',
    body: JSON.stringify({ lines }),
  });
  return await response.json();
};

// `body` includes `lines` plus optional vendor/header fields for the printable
// Purchase Order: { lines, vendor_id, payment_terms, delivery_due_date, remarks }.
export const issueVpo = async (ipoId, body) => {
  const payload = Array.isArray(body) ? { lines: body } : (body || {});
  const response = await apiRequest(`ims/purchase/${ipoId}/vpo/issue/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return await response.json();
};

// ---- Job Work -------------------------------------------------------------

export const getJobWorkGrid = async (ipoId, { category } = {}) => {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  const q = params.toString();
  const response = await apiRequest(`ims/purchase/${ipoId}/job-work/${q ? `?${q}` : ''}`);
  return await response.json();
};

export const previewJobWorkVpo = async (ipoId, body) => {
  const response = await apiRequest(`ims/purchase/${ipoId}/job-work/vpo/preview/`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return await response.json();
};

export const issueJobWorkVpo = async (ipoId, body) => {
  const response = await apiRequest(`ims/purchase/${ipoId}/job-work/vpo/issue/`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return await response.json();
};

export const getVpoHistory = async ({ ipoId, status } = {}) => {
  const params = new URLSearchParams();
  if (ipoId) params.set('ipo', ipoId);
  if (status) params.set('status', status);
  const q = params.toString();
  const response = await apiRequest(`ims/purchase/vpos/${q ? `?${q}` : ''}`);
  return await response.json();
};

export const getVpoDetail = async (vpoId) => {
  const response = await apiRequest(`ims/purchase/vpos/${vpoId}/`);
  return await response.json();
};

// Print-ready Purchase Order structure (server-side source of truth). Useful
// for debugging the printable VPO and for any server-rendered copy.
export const getVpoDocument = async (vpoId) => {
  const response = await apiRequest(`ims/purchase/vpos/${vpoId}/document/`);
  return await response.json();
};

export const getStockLookup = async ({ category, material, ipo } = {}) => {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (material) params.set('material', material);
  if (ipo) params.set('ipo', ipo);
  const q = params.toString();
  const response = await apiRequest(`ims/stock/${q ? `?${q}` : ''}`);
  return await response.json();
};

export const requestUqr = async ({ stockItemId, stockItemUin, notes, fileRef } = {}) => {
  const response = await apiRequest('ims/stock/uqr/', {
    method: 'POST',
    body: JSON.stringify({
      stock_item_id: stockItemId || null,
      stock_item_uin: stockItemUin || '',
      notes: notes || '',
      file_ref: fileRef || '',
    }),
  });
  return await response.json();
};

export const issueStockToIpo = async (ipoId, lines) => {
  const response = await apiRequest(`ims/purchase/${ipoId}/stock-issue/`, {
    method: 'POST',
    body: JSON.stringify({ lines }),
  });
  return await response.json();
};

// ============================================================================
// TASKS (Kanban board) — /api/ims/tasks/
// ============================================================================
// The board is tenant-wide: every member sees every task in their company.
// Payloads are camelCase to match what the Tasks components render.

// Pull a readable message out of a DRF error body so the toast says what was
// actually wrong ("Only the assignee can accept this task.") instead of a code.
const extractError = async (response, fallback) => {
  try {
    const data = await response.json();
    if (typeof data === 'string') return data;
    if (data?.detail) return data.detail;
    const first = Object.values(data || {})[0];
    if (Array.isArray(first) && first.length) return String(first[0]);
    if (typeof first === 'string') return first;
  } catch {
    /* non-JSON body — fall through */
  }
  return fallback;
};

export const getTasks = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await apiRequest(`ims/tasks/${query ? '?' + query : ''}`);
  if (!response.ok) throw new Error('Failed to load tasks');
  return await response.json();
};

export const createTask = async (payload) => {
  const response = await apiRequest('ims/tasks/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await extractError(response, 'Failed to create task'));
  return await response.json();
};

export const updateTask = async (taskId, payload) => {
  const response = await apiRequest(`ims/tasks/${taskId}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await extractError(response, 'Failed to update task'));
  return await response.json();
};

export const deleteTask = async (taskId) => {
  const response = await apiRequest(`ims/tasks/${taskId}/`, { method: 'DELETE' });
  if (!response.ok) throw new Error(await extractError(response, 'Failed to delete task'));
  return true;
};

// Drag & drop — status + position only, kept small so the card lands instantly.
export const moveTask = async (taskId, status, position) => {
  const response = await apiRequest(`ims/tasks/${taskId}/move/`, {
    method: 'PATCH',
    body: JSON.stringify({ status, position }),
  });
  if (!response.ok) throw new Error(await extractError(response, 'Failed to move task'));
  return await response.json();
};

// The assignee acknowledges an assignment (clears their sticky toast).
export const acceptTask = async (taskId) => {
  const response = await apiRequest(`ims/tasks/${taskId}/accept/`, { method: 'POST' });
  if (!response.ok) throw new Error(await extractError(response, 'Failed to accept task'));
  return await response.json();
};

export const getPendingAcceptanceTasks = async () => {
  const response = await apiRequest('ims/tasks/pending-acceptance/');
  if (!response.ok) throw new Error('Failed to load pending tasks');
  return await response.json();
};

export const addTaskComment = async (taskId, message) => {
  const response = await apiRequest(`ims/tasks/${taskId}/comments/`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error(await extractError(response, 'Failed to add comment'));
  return await response.json();
};

// Flip one checklist item; omit `done` to toggle. Returns the whole task so the
// card's progress bar re-renders from the server's copy.
export const toggleTaskSubtask = async (taskId, subtaskId, done) => {
  const response = await apiRequest(`ims/tasks/${taskId}/subtask/`, {
    method: 'PATCH',
    body: JSON.stringify(done === undefined ? { subtaskId } : { subtaskId, done }),
  });
  if (!response.ok) throw new Error(await extractError(response, 'Failed to update sub-task'));
  return await response.json();
};

export const getAssignableUsers = async () => {
  const response = await apiRequest('ims/tasks/assignable-users/');
  if (!response.ok) throw new Error('Failed to load team members');
  return await response.json();
};

export const getTaskChoices = async () => {
  const response = await apiRequest('ims/tasks/choices/');
  if (!response.ok) throw new Error('Failed to load task choices');
  return await response.json();
};
