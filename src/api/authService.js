/**
 * Auth Service - Backend API Integration
 * Handles all authentication-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://binder-backend-0szj.onrender.com/api/';

/**
 * Returns the active storage backend.
 * localStorage persists across browser sessions ("Remember me").
 * sessionStorage is cleared when the browser/tab closes.
 */
const getStorage = () => {
  // If remember_me flag is set in localStorage, prefer localStorage.
  // Otherwise fall back to whichever store currently holds the token.
  if (localStorage.getItem('remember_me') === '1') return localStorage;
  if (sessionStorage.getItem('access_token')) return sessionStorage;
  return localStorage;
};

/**
 * Call once at login time to choose the storage backend for this session.
 */
const setRememberMe = (remember) => {
  if (remember) {
    localStorage.setItem('remember_me', '1');
  } else {
    localStorage.removeItem('remember_me');
  }
};

const getAccessToken = () => {
  return getStorage().getItem('access_token');
};

const getRefreshToken = () => {
  return getStorage().getItem('refresh_token');
};

const setTokens = (accessToken, refreshToken) => {
  const store = getStorage();
  store.setItem('access_token', accessToken);
  store.setItem('refresh_token', refreshToken);
};

const clearTokens = () => {
  // Clear from both stores to be safe
  for (const store of [localStorage, sessionStorage]) {
    store.removeItem('access_token');
    store.removeItem('refresh_token');
    store.removeItem('user');
  }
  localStorage.removeItem('remember_me');
};

const getUser = () => {
  const userStr = getStorage().getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

const setUser = (user) => {
  getStorage().setItem('user', JSON.stringify(user));
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
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });
    
    if (response.ok) {
      const data = await response.json();
      getStorage().setItem('access_token', data.access);
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
    // Send cookies so httpOnly auth cookies flow once cookie-mode is enabled.
    // Harmless in Bearer mode (there simply are no auth cookies to send).
    credentials: 'include',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('API Request:', fullUrl, config.method || 'GET');
    
    const response = await fetch(fullUrl, config);
    
    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && token) {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry request with new token
        config.headers['Authorization'] = `Bearer ${getAccessToken()}`;
        return await fetch(fullUrl, config);
      }
    }
    
    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

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
 * Check if a username is already taken.
 * Returns true if taken, false if available.
 */
export const checkUsernameAvailability = async (username) => {
  const response = await apiRequest(`auth/check-username/?username=${encodeURIComponent(username)}`);
  const data = await response.json();
  // Support { exists: bool } or { available: bool } response shapes
  if (typeof data?.exists === 'boolean') return data.exists;
  if (typeof data?.available === 'boolean') return !data.available;
  return false;
};

export const registerCompany = async (companyData) => {
  const formData = new FormData();
  Object.entries(companyData || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });
  const response = await apiRequest('auth/register-company/', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data?.message || data?.detail || 'Company registration failed');
    err.fieldErrors = data; // attach raw response for field-level error parsing
    throw err;
  }
  return data;
};

export const createTenantOwner = async ({ tenantId, email, password }) => {
  const response = await apiRequest('auth/create-tenant-owner/', {
    method: 'POST',
    body: JSON.stringify({
      tenant_id: tenantId,
      email,
      password,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data?.message || 'Failed to create tenant owner');
    err.fieldErrors = data;
    throw err;
  }
  return data;
};

/**
 * Login user (direct login)
 * @param {string} loginValue - Email or username
 * @param {string} password
 */
export const login = async (loginValue, password, rememberMe = false) => {
  setRememberMe(rememberMe);
  const url = `${API_BASE_URL}auth/login/`;
  console.log('Login request to:', url);

  const response = await apiRequest('auth/login/', {
    method: 'POST',
    body: JSON.stringify({ login: loginValue, password }),
  });
  
  console.log('Login response status:', response.status);
  
  // Check if response is ok before parsing
  if (!response.ok) {
    let errorData;
    try {
      const text = await response.text();
      console.error('Login error response:', text);
      errorData = JSON.parse(text);
    } catch (e) {
      errorData = {
        message: `Server error: ${response.status} ${response.statusText}`,
        status_code: response.status,
      };
    }
    
    // Throw error with proper structure
    const error = new Error(errorData.message || errorData.detail || errorData.error || 'Login failed');
    error.status = errorData.status_code || response.status;
    error.data = errorData;
    throw error;
  }
  
  const data = await response.json();
  console.log('Login success data:', data);
  
  if (data.status === 'success') {
    setTokens(data.data.tokens.access, data.data.tokens.refresh);
    setUser(data.data.user);
  }
  
  return data;
};

/**
 * Request OTP for login (Step 1)
 */
export const requestOTP = async (loginValue, password) => {
  const response = await apiRequest('auth/login/request-otp/', {
    method: 'POST',
    body: JSON.stringify({ login: loginValue, password }),
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
 * Set new password via welcome email token (first-time setup)
 * Returns JWT tokens on success so the caller can auto-login.
 */
export const setPassword = async (token, password, passwordConfirm) => {
  const response = await apiRequest('auth/set-password/', {
    method: 'POST',
    body: JSON.stringify({ token, password, password_confirm: passwordConfirm }),
  });
  const data = await response.json();
  if (data.status === 'success' && data.data?.tokens) {
    setTokens(data.data.tokens.access, data.data.tokens.refresh);
    if (data.data?.user) setUser(data.data.user);
  }
  return data;
};

/**
 * Logout user.
 * Always calls the backend so it can invalidate the session server-side
 * (blacklist the refresh token + reject all outstanding access tokens),
 * then clears local tokens no matter what the network did.
 */
export const logout = async () => {
  const refresh = getRefreshToken();

  try {
    await apiRequest('auth/logout/', {
      method: 'POST',
      // Send the refresh token when we still have it (Bearer mode). In cookie
      // mode the backend reads it from the httpOnly cookie instead.
      body: JSON.stringify(refresh ? { refresh } : {}),
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearTokens();
  }
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
 * Get organization summary (member count, owner, company name)
 */
export const getOrgSummary = async () => {
  const response = await apiRequest('auth/me/org-summary/');
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Failed to load org summary');
  return data?.data || data;
};

/**
 * List members of current user's tenant (master admin / admin)
 */
export const getMembers = async () => {
  const response = await apiRequest('auth/members/');
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || data?.message || 'Failed to load members');
  return Array.isArray(data) ? data : data?.results || data?.data || [];
};

/**
 * Get Binder COO chat WebSocket config for the currently authenticated user.
 * The backend gates this by tenant (env allowlist or `coo_chat` feature flag) and
 * only returns the gateway authToken to authenticated users — never bundled in JS.
 * Returns { gatewayUrl, authToken, userId, tenantId, handle } on success.
 */
export const getCooChatConfig = async () => {
  const response = await apiRequest('auth/me/coo-chat-config/');
  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data?.message || data?.detail || 'COO chat config unavailable');
    err.status = response.status;
    throw err;
  }
  return data?.data || data;
};

/**
 * Get current tenant's feature flags (key -> bool) for plan-based feature gating
 */
export const getFeatureFlags = async () => {
  const response = await apiRequest('auth/me/feature-flags/');
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || data?.message || 'Failed to load feature flags');
  return data?.data || data;
};

export const getTenantActivityLogs = async () => {
  const response = await apiRequest('auth/tenant-activity-logs/');
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || data?.message || 'Failed to load activity logs');
  return Array.isArray(data) ? data : data?.results || data?.data || [];
};

export const getFilteredActivityLogs = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.user) params.append('user', filters.user);
  if (filters.action) params.append('action', filters.action);
  if (filters.entity_type) params.append('entity_type', filters.entity_type);
  if (filters.from_date) params.append('from_date', filters.from_date);
  if (filters.to_date) params.append('to_date', filters.to_date);
  if (filters.page) params.append('page', filters.page);
  if (filters.page_size) params.append('page_size', filters.page_size);
  const query = params.toString();
  const response = await apiRequest(`auth/tenant-activity-logs/${query ? '?' + query : ''}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || data?.message || 'Failed to load activity logs');
  const results = Array.isArray(data) ? data : data?.results || data?.data || [];
  const count = Number.isFinite(data?.count) ? data.count : results.length;
  return { results, count };
};

export const updateTenantFeatureOverrides = async (tenantId, items) => {
  const response = await apiRequest(`auth/tenants/${tenantId}/feature-overrides/`, {
    method: 'PUT',
    body: JSON.stringify({ items }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || data?.message || 'Failed to update feature overrides');
  return data;
};

export const getTenantFeatureOverrides = async (tenantId) => {
  const response = await apiRequest(`auth/tenants/${tenantId}/feature-overrides/`);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || data?.message || 'Failed to load feature overrides');
  return data?.data || [];
};

export const updateMemberRolePermissions = async (memberId, payload) => {
  const response = await apiRequest(`auth/members/${memberId}/role-permissions/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || data?.message || 'Failed to update member role permissions');
  return data;
};

export const getMemberRolePermissions = async (memberId) => {
  const response = await apiRequest(`auth/members/${memberId}/role-permissions/`);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || data?.message || 'Failed to load member role permissions');
  return data?.data || null;
};

/**
 * Get onboarding state and saved data
 */
export const getOnboarding = async () => {
  const response = await apiRequest('auth/me/onboarding/');
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Failed to load onboarding');
  return data?.data || data;
};

/**
 * Save onboarding step (2 or 3). Step 1 is password set elsewhere.
 */
export const updateOnboarding = async (step, payload) => {
  const response = await apiRequest('auth/me/onboarding/update/', {
    method: 'PUT',
    body: JSON.stringify({ step, ...payload }),
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Server error (${response.status}). Please try again.`);
  }
  if (!response.ok) throw new Error(data?.message || 'Failed to save');
  return data;
};

/**
 * Send invite email via Google Apps Script (deployment). Requires can_create_members.
 */
export const sendInviteEmail = async (params) => {
  const response = await apiRequest('auth/send-invite/', {
    method: 'POST',
    body: JSON.stringify({
      toEmail: params.toEmail,
      memberName: params.memberName,
      tempPassword: params.tempPassword,
      companyName: params.companyName,
      loginUrl: params.loginUrl,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Failed to send invite');
  return data;
};

/**
 * Create user and send invite email (combined endpoint)
 */
export const createUserAndSendInvite = async (params) => {
  const response = await apiRequest('auth/create-user-invite/', {
    method: 'POST',
    body: JSON.stringify({
      email: params.email,
      memberName: params.memberName,
      firstName: params.firstName,
      lastName: params.lastName,
      designation: params.designation,
      tempPassword: params.tempPassword,
      companyName: params.companyName,
      loginUrl: params.loginUrl,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Failed to create user');
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

// Export utility functions for use in other parts of the app
export { getAccessToken, getRefreshToken, setTokens, getUser, setUser, clearTokens };

