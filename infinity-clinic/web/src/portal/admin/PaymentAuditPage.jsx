import { useEffect, useState, useMemo } from 'react';
import { api } from '../../shared/api/client.js';
import Modal from '../../shared/components/Modal.jsx';
import PaymentReceipt from '../receptionist/PaymentReceipt.jsx';

export default function PaymentAuditPage() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [preset, setPreset] = useState('today');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [method, setMethod] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Receipt Modal
  const [receiptAppointmentId, setReceiptAppointmentId] = useState(null);

  // Fetch summary metrics
  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams();
      if (preset === 'custom') {
        if (fromDate) params.append('from', fromDate);
        if (toDate) params.append('to', toDate);
      } else {
        params.append('preset', preset);
      }
      const res = await api.get(`/portal/payments/audit/summary?${params.toString()}`);
      setSummary(res);
    } catch (err) {
      console.error('Failed to fetch payment summary:', err);
    }
  };

  // Fetch transactions list
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '50',
      });
      if (preset === 'custom') {
        if (fromDate) params.append('from', fromDate);
        if (toDate) params.append('to', toDate);
      } else {
        params.append('preset', preset);
      }
      if (method !== 'all') params.append('method', method);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/portal/payments/audit/transactions?${params.toString()}`);
      setTransactions(res.items || []);
      setTotalCount(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchSummary(), fetchTransactions()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSummary();
    fetchTransactions();
  }, [preset, fromDate, toDate, method, page]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!transactions.length) {
      alert('No transactions to export for the current filters');
      return;
    }
    const headers = [
      'Receipt/ID',
      'Paid Date',
      'Time',
      'Patient Name',
      'Patient Phone',
      'Doctor',
      'Specialization',
      'Payment Method',
      'Transaction Ref / UTR',
      'Total Amount (INR)',
      'Billed By Staff',
      'Notes',
    ];
    const rows = transactions.map((t) => [
      `"${t.id}"`,
      `"${t.appointment_date || ''}"`,
      `"${t.paid_at ? new Date(t.paid_at).toLocaleTimeString('en-IN') : t.appointment_time?.slice(0, 5) || ''}"`,
      `"${t.patient_name || ''}"`,
      `"${t.patient_phone || ''}"`,
      `"${t.doctor_name || ''}"`,
      `"${t.doctor_specialization || ''}"`,
      `"${t.method || ''}"`,
      `"${t.transaction_ref || ''}"`,
      t.amount,
      `"${t.recorded_by_name || t.recorded_by_email || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `payment_audit_${preset}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Method breakdown metrics calculations & percentage shares
  const methodMap = useMemo(() => {
    const map = {
      cash: { count: 0, total: 0 },
      upi_offline: { count: 0, total: 0 },
      card_offline: { count: 0, total: 0 },
      net_banking: { count: 0, total: 0 },
      insurance: { count: 0, total: 0 },
      razorpay: { count: 0, total: 0 },
    };
    if (summary?.methodBreakdown) {
      summary.methodBreakdown.forEach((m) => {
        if (map[m.method]) {
          map[m.method].count = m.count;
          map[m.method].total = m.total_amount;
        }
      });
    }
    return map;
  }, [summary]);

  const totalRev = Number(summary?.totalRevenue || 0);

  const getPercentage = (amount) => {
    if (!totalRev || totalRev === 0) return '0%';
    return `${Math.round((amount / totalRev) * 100)}%`;
  };

  return (
    <div className="portal-page">
      {/* 1. Header with Title and Global Actions */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2>Payment Ledger &amp; Collections Audit</h2>
          <p className="page-header-sub">
            Day-end financial settlement ledger and multi-mode collections breakdown (Cash, UPI, Cards, Net Banking, and Insurance).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportCSV}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Audit CSV
          </button>
        </div>
      </div>

      {/* 2. Date Filter Segmented Bar */}
      <div className="audit-filter-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div className="audit-pills-group">
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 4 }}>
              Period:
            </span>
            {[
              { key: 'today', label: 'Today' },
              { key: 'yesterday', label: 'Yesterday' },
              { key: 'last7days', label: 'Last 7 Days' },
              { key: 'last30days', label: 'Last 30 Days' },
              { key: 'thisMonth', label: 'This Month' },
              { key: 'custom', label: 'Custom Range' },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                className={`audit-pill-btn ${preset === p.key ? 'active' : ''}`}
                onClick={() => { setPreset(p.key); setPage(1); }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {preset === 'custom' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink)' }}>
                From:
                <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid var(--line)' }} />
              </label>
              <label style={{ fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink)' }}>
                To:
                <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid var(--line)' }} />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* 3. KPI Cards: Method Breakdown & Revenue Share */}
      <div className="audit-kpi-grid">
        <div className="audit-card audit-card-total">
          <div className="audit-card-label">
            <span>Total Collections</span>
            <span className="badge badge-primary">{summary?.totalTransactions || 0} Receipts</span>
          </div>
          <div className="audit-card-amount" style={{ color: 'var(--teal-deep)' }}>
            ₹{totalRev.toLocaleString('en-IN')}
          </div>
          <div className="audit-card-sub">
            <span>Net total across all payment modes</span>
          </div>
        </div>

        <div className="audit-card audit-card-cash">
          <div className="audit-card-label">
            <span>Physical Cash</span>
            <span className="badge badge-mode-cash">{getPercentage(methodMap.cash.total)}</span>
          </div>
          <div className="audit-card-amount" style={{ color: '#16a34a' }}>
            ₹{Number(methodMap.cash.total).toLocaleString('en-IN')}
          </div>
          <div className="audit-card-sub">
            <span>{methodMap.cash.count} receipts (Cash drawer count)</span>
          </div>
        </div>

        <div className="audit-card audit-card-upi">
          <div className="audit-card-label">
            <span>UPI / QR Code</span>
            <span className="badge badge-mode-upi">{getPercentage(methodMap.upi_offline.total)}</span>
          </div>
          <div className="audit-card-amount" style={{ color: '#0284c7' }}>
            ₹{Number(methodMap.upi_offline.total).toLocaleString('en-IN')}
          </div>
          <div className="audit-card-sub">
            <span>{methodMap.upi_offline.count} receipts (Digital UTR tracking)</span>
          </div>
        </div>

        <div className="audit-card audit-card-card">
          <div className="audit-card-label">
            <span>Card / POS Machine</span>
            <span className="badge badge-mode-card">{getPercentage(methodMap.card_offline.total)}</span>
          </div>
          <div className="audit-card-amount" style={{ color: '#9333ea' }}>
            ₹{Number(methodMap.card_offline.total).toLocaleString('en-IN')}
          </div>
          <div className="audit-card-sub">
            <span>{methodMap.card_offline.count} receipts (EDC batch settle)</span>
          </div>
        </div>

        <div className="audit-card audit-card-other">
          <div className="audit-card-label">
            <span>Net Banking &amp; Insurance</span>
            <span className="badge badge-mode-net">{getPercentage(methodMap.net_banking.total + methodMap.insurance.total)}</span>
          </div>
          <div className="audit-card-amount" style={{ color: '#ea580c' }}>
            ₹{Number(methodMap.net_banking.total + methodMap.insurance.total).toLocaleString('en-IN')}
          </div>
          <div className="audit-card-sub">
            <span>{methodMap.net_banking.count + methodMap.insurance.count} claims / direct transfers</span>
          </div>
        </div>
      </div>

      {/* 4. Staff Cashier & Shift Breakdown Table */}
      {summary?.staffBreakdown && summary.staffBreakdown.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden', borderRadius: 12 }}>
          <div style={{ padding: '14px 18px', background: 'var(--paper-raised)', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', margin: 0, fontWeight: 700, color: 'var(--ink)' }}>
                Staff Cashier &amp; Reception Desk Settlement
              </h3>
              <p className="text-body-sm text-muted" style={{ margin: 0 }}>
                Shift collections breakdown per front-desk staff member
              </p>
            </div>
            <span className="badge badge-secondary">{summary.staffBreakdown.length} Active Cashier{summary.staffBreakdown.length > 1 ? 's' : ''}</span>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th style={{ textAlign: 'center' }}>Receipts</th>
                  <th style={{ textAlign: 'right' }}>Cash (₹)</th>
                  <th style={{ textAlign: 'right' }}>UPI / QR (₹)</th>
                  <th style={{ textAlign: 'right' }}>Card POS (₹)</th>
                  <th style={{ textAlign: 'right' }}>Other (₹)</th>
                  <th style={{ textAlign: 'right', fontWeight: 700 }}>Total Collected (₹)</th>
                </tr>
              </thead>
              <tbody>
                {summary.staffBreakdown.map((staff, idx) => {
                  const initials = (staff.staff_name || 'Staff')
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={staff.recorded_by || idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="staff-avatar-circle">{initials}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{staff.staff_name}</div>
                            {staff.staff_email && <div className="text-body-sm text-muted">{staff.staff_email}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{staff.count}</td>
                      <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>
                        ₹{Number(staff.cash_total || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', color: '#0284c7', fontWeight: 600 }}>
                        ₹{Number(staff.upi_total || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', color: '#9333ea', fontWeight: 600 }}>
                        ₹{Number(staff.card_total || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', color: '#ea580c' }}>
                        ₹{Number(staff.other_total || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--teal-deep)', fontSize: '1.02rem' }}>
                        ₹{Number(staff.total_amount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Filter & Search Controls */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: '1.25rem', background: 'var(--paper-raised)', border: '1px solid var(--line)', borderRadius: 12 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <input
              type="search"
              placeholder="Search by patient name, phone, UTR #, doctor, cashier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '12px' }}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select value={method} onChange={(e) => { setMethod(e.target.value); setPage(1); }}>
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="upi_offline">UPI / QR Code</option>
              <option value="card_offline">Card / POS Terminal</option>
              <option value="net_banking">Net Banking</option>
              <option value="insurance">Insurance / TPA</option>
              <option value="razorpay">Razorpay Online</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>
            Search
          </button>
          {(search || method !== 'all') && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setMethod('all');
                setPage(1);
              }}
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* 6. Main Payment Transactions Table */}
      <div className="card" style={{ overflow: 'hidden', borderRadius: 12 }}>
        <div style={{ padding: '14px 18px', background: 'var(--paper-raised)', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.98rem', margin: 0, fontWeight: 700, color: 'var(--ink)' }}>
            Payment Transactions Ledger ({totalCount} record{totalCount === 1 ? '' : 's'})
          </h3>
          <span className="text-body-sm text-muted">
            Page {page} of {totalPages}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-soft)' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>Loading transactions ledger...</div>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--ink-soft)' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
              No payments found
            </div>
            <p className="text-body-sm text-muted" style={{ maxWidth: '400px', margin: '0 auto 16px' }}>
              No transactions match the selected filters or date range. Try switching to &ldquo;This Month&rdquo; or clearing the search filter.
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setPreset('thisMonth');
                setSearch('');
                setMethod('all');
                setPage(1);
              }}
            >
              Show This Month&rsquo;s Transactions
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date &amp; Time</th>
                  <th>Patient Details</th>
                  <th>Doctor &amp; Specialization</th>
                  <th>Invoice Line Items</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th>Payment Mode</th>
                  <th>Transaction Ref / UTR</th>
                  <th>Billed By</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const methodClass =
                    t.method === 'cash' ? 'badge-mode-cash' :
                    t.method === 'upi_offline' ? 'badge-mode-upi' :
                    t.method === 'card_offline' ? 'badge-mode-card' :
                    t.method === 'net_banking' ? 'badge-mode-net' :
                    t.method === 'insurance' ? 'badge-mode-ins' :
                    'badge-primary';

                  const methodDisplay =
                    t.method === 'cash' ? 'Cash' :
                    t.method === 'upi_offline' ? 'UPI / QR' :
                    t.method === 'card_offline' ? 'Card / POS' :
                    t.method === 'net_banking' ? 'Net Banking' :
                    t.method === 'insurance' ? 'Insurance' :
                    t.method?.replace(/_/g, ' ').toUpperCase();

                  return (
                    <tr key={t.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{t.appointment_date}</div>
                        <div className="text-body-sm text-muted">
                          {t.paid_at ? new Date(t.paid_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : t.appointment_time?.slice(0, 5)}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--ink)' }}>{t.patient_name}</strong>
                        <div className="text-body-sm text-muted">{t.patient_phone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{t.doctor_name}</div>
                        <div className="text-body-sm text-muted">{t.doctor_specialization}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--ink-soft)' }}>Consultation: </span>
                          <strong style={{ color: 'var(--ink)' }}>₹{Number(t.doctor_consultation_fee || 0).toLocaleString('en-IN')}</strong>
                          {Array.isArray(t.services) && t.services.length > 0 && (
                            <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: 2 }}>
                              +{t.services.length} test{t.services.length > 1 ? 's' : ''}: {t.services.map((s) => s.service_name).join(', ')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.05rem', color: 'var(--teal-deep)', whiteSpace: 'nowrap' }}>
                        ₹{Number(t.amount).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`badge ${methodClass}`}>
                          {methodDisplay}
                        </span>
                      </td>
                      <td>
                        {t.transaction_ref ? (
                          <span className="audit-utr-badge" title={`UTR / Ref: ${t.transaction_ref}`}>
                            {t.transaction_ref}
                          </span>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.82rem' }}>—</span>
                        )}
                        {t.notes && <div className="text-body-sm text-muted" style={{ marginTop: 2 }}>{t.notes}</div>}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ink)' }}>{t.recorded_by_name}</div>
                        {t.recorded_by_email && <div className="text-body-sm text-muted" style={{ fontSize: '0.78rem' }}>{t.recorded_by_email}</div>}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => setReceiptAppointmentId(t.appointment_id)}
                          title="Print / View Receipt"
                          style={{ padding: '5px 12px', fontSize: '0.82rem', fontWeight: 600 }}
                        >
                          Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 7. Pagination Bar */}
        {totalPages > 1 && (
          <div style={{ padding: '12px 18px', background: 'var(--paper-raised)', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous Page
            </button>
            <span style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
              Showing Page {page} of {totalPages} ({totalCount} total receipts)
            </span>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next Page
            </button>
          </div>
        )}
      </div>

      {/* Tax Invoice / Receipt Modal */}
      <Modal
        open={!!receiptAppointmentId}
        onClose={() => setReceiptAppointmentId(null)}
        title="Payment Tax Invoice / Receipt"
        size="lg"
      >
        {receiptAppointmentId && (
          <PaymentReceipt
            appointmentId={receiptAppointmentId}
            onClose={() => setReceiptAppointmentId(null)}
          />
        )}
      </Modal>
    </div>
  );
}
