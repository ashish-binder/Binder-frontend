import { useState, useEffect } from 'react';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getBuyerCodes, getBuyerMasterSheet, deleteBuyerCode } from '../services/integration';
import { useLoading } from '../context/LoadingContext';

const hasValue = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || value === undefined) return false;
  return String(value).trim() !== '';
};

const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  return [];
};

const BuyerMasterSheet = ({ onBack, onEditBuyer }) => {
  const [buyers, setBuyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showLoading, hideLoading } = useLoading();

  const normalizeBuyer = (b) => ({
    id: b.id || b.code || '',
    code: b.code || b.id || '',
    buyerName: b.buyer_name || b.buyerName || '',
    buyerAddress: b.buyer_address || b.buyerAddress || '',
    contactPerson: b.contact_person || b.contactPerson || '',
    retailer: b.retailer || b.end_customer || '',
    createdAt: b.created_at || b.createdAt || new Date().toISOString()
  });

  useEffect(() => {
    const fetchBuyers = async () => {
      showLoading();
      try {
        setLoading(true);
        setError(null);

        let buyerList = [];

        // 1. Try the master-sheet endpoint first, then fall back to the list endpoint
        try {
          const masterSheetData = await getBuyerMasterSheet();
          buyerList = extractItems(masterSheetData);
        } catch (masterSheetError) {
          console.warn('Buyer master sheet fetch failed:', masterSheetError);
        }

        if (buyerList.length === 0) {
          try {
            const data = await getBuyerCodes();
            buyerList = extractItems(data);
          } catch (apiError) {
            console.warn('API fetch failed:', apiError);
          }
        }

        // 2. Normalize all buyer data
        const normalizedBuyers = buyerList.map(b => normalizeBuyer(b));
        setBuyers(normalizedBuyers);
      } catch (err) {
        console.error('Error fetching buyers:', err);
        setError('Failed to load buyers');
        setBuyers([]);
      } finally {
        setLoading(false);
        hideLoading();
      }
    };

    fetchBuyers();
  }, []);

  // Filter buyers based on search term
  const filteredBuyers = buyers.filter(buyer =>
    (buyer.buyerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (buyer.code || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (buyer.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (buyer.retailer || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort buyers
  const sortedBuyers = [...filteredBuyers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDeleteBuyer = async (buyer) => {
    if (window.confirm('Are you sure you want to delete this buyer?')) {
      const idsToTry = [buyer.id, buyer.code].filter(Boolean);
      for (const identifier of [...new Set(idsToTry)]) {
        try {
          await deleteBuyerCode(identifier);
          break;
        } catch (err) {
          console.warn(`API delete with "${identifier}" failed:`, err);
        }
      }
      setBuyers((prev) => prev.filter(b => b.code !== buyer.code));
    }
  };

  const handleViewDetails = (buyer) => {
    setSelectedBuyer(buyer);
  };

  const handleEditBuyer = (buyer) => {
    if (typeof onEditBuyer === 'function') {
      onEditBuyer(buyer);
      return;
    }
    alert('Edit buyer handler is not configured.');
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.7 }}>↕</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 1, color: 'var(--primary)' }}>↑</span> : 
      <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 1, color: 'var(--primary)' }}>↓</span>;
  };

  // Buyer Details Modal
  const BuyerDetailsModal = ({ buyer, onClose }) => (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid var(--border)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--foreground)' }}>
            Buyer Details - Code: {buyer.code}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            ×
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
              Buyer Name:
            </label>
            <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>{buyer.buyerName}</span>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
              Contact Person:
            </label>
            <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>{buyer.contactPerson}</span>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
              End Customer:
            </label>
            <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>{buyer.retailer}</span>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
              Created Date:
            </label>
            <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>{formatDate(buyer.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fullscreen-content" style={{ overflowY: 'auto' }}>
      <div className="content-header">
        <Button 
          variant="outline"
          onClick={onBack} 
          type="button"
          className="mb-6 bg-white"
        >
          ← Back to Buyer Management
        </Button>
        <h1 className="fullscreen-title">Buyer Master Sheet</h1>
        <p className="fullscreen-description">
          View and manage all registered buyers in the system
        </p>
      </div>

      <div style={{ maxWidth: '100%', width: '100%', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1, maxWidth: '500px' }}>
            <Input
              type="text"
              placeholder="Search by buyer name, code, contact person, or end customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Total Buyers: <strong className="text-foreground">{filteredBuyers.length}</strong>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted-foreground)' }}>
            Loading buyers...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--destructive)' }}>
            {error}
          </div>
        ) : sortedBuyers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted-foreground)' }}>
            No buyers found{searchTerm ? ' matching your search' : ''}.
          </div>
        ) : (
          <div style={{ 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius-lg)',
            overflowX: 'auto',
            overflowY: 'visible',
            backgroundColor: 'var(--card)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
              <thead>
                <tr style={{ 
                  backgroundColor: 'var(--muted)',
                  borderBottom: '2px solid var(--border)'
                }}>
                  <th 
                    onClick={() => handleSort('code')} 
                    style={{ 
                      padding: '16px 20px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: 'var(--foreground)',
                      cursor: 'pointer',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      width: '120px'
                    }}
                  >
                    BUYER CODE {getSortIcon('code')}
                  </th>
                  <th 
                    onClick={() => handleSort('buyerName')} 
                    style={{ 
                      padding: '16px 20px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: 'var(--foreground)',
                      cursor: 'pointer',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      width: '250px'
                    }}
                  >
                    BUYER NAME {getSortIcon('buyerName')}
                  </th>
                  <th 
                    onClick={() => handleSort('contactPerson')} 
                    style={{ 
                      padding: '16px 20px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: 'var(--foreground)',
                      cursor: 'pointer',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      width: '200px'
                    }}
                  >
                    CONTACT PERSON {getSortIcon('contactPerson')}
                  </th>
                  <th 
                    onClick={() => handleSort('retailer')} 
                    style={{ 
                      padding: '16px 20px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: 'var(--foreground)',
                      cursor: 'pointer',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      width: '250px'
                    }}
                  >
                    END CUSTOMER {getSortIcon('retailer')}
                  </th>
                  <th 
                    onClick={() => handleSort('createdAt')} 
                    style={{ 
                      padding: '16px 20px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: 'var(--foreground)',
                      cursor: 'pointer',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      width: '120px'
                    }}
                  >
                    CREATED {getSortIcon('createdAt')}
                  </th>
                  <th style={{ 
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: 'var(--foreground)',
                    whiteSpace: 'nowrap',
                    width: '130px'
                  }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedBuyers.map((buyer, index) => (
                  <tr 
                    key={buyer.code || index}
                    style={{
                      borderBottom: index < sortedBuyers.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background-color 0.15s',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ 
                      padding: '16px 20px', 
                      verticalAlign: 'middle',
                      borderRight: '1px solid var(--border)'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        backgroundColor: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        fontWeight: '600',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.5px'
                      }}>
                        {buyer.code || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                      <strong style={{ fontSize: '15px', fontWeight: '600', color: 'var(--foreground)' }}>
                        {buyer.buyerName || 'N/A'}
                      </strong>
                    </td>
                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--foreground)' }}>
                        {buyer.contactPerson || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                      <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>
                        {buyer.retailer || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                      <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>
                        {formatDate(buyer.createdAt)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(buyer)}
                          title="View Details"
                          className="h-8 w-8"
                        >
                          <FiEye style={{ fontSize: '16px' }} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditBuyer(buyer)}
                          title="Edit Buyer"
                          className="h-8 w-8"
                        >
                          <FiEdit2 style={{ fontSize: '16px' }} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBuyer(buyer)}
                          title="Delete Buyer"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <FiTrash2 style={{ fontSize: '16px' }} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && sortedBuyers.length > 0 && (
          <div style={{ 
            marginTop: '24px', 
            padding: '12px 16px',
            backgroundColor: 'var(--muted)',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            color: 'var(--muted-foreground)'
          }}>
            Showing {filteredBuyers.length} of {buyers.length} buyers
          </div>
        )}
      </div>

      {selectedBuyer && (
        <BuyerDetailsModal 
          buyer={selectedBuyer} 
          onClose={() => setSelectedBuyer(null)} 
        />
      )}
    </div>
  );
};

export default BuyerMasterSheet;
