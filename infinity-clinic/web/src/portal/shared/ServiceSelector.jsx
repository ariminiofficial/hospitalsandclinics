import { useState, useEffect, useMemo } from 'react';
import { api } from '../../shared/api/client.js';

export default function ServiceSelector({
  value = [],
  onChange,
  title = 'Select Clinic Services & Tests',
  hint = 'Add tests or clinical services (e.g. Sugar test, BP test, MRI, ECG, Dressing)',
  compact = false,
}) {
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    api.get('/public/website/services')
      .then((data) => {
        setAllServices(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to load services:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    allServices.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ['All', ...Array.from(set)];
  }, [allServices]);

  const filteredServices = useMemo(() => {
    return allServices.filter((s) => {
      const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
      const matchSearch =
        !search.trim() ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(search.toLowerCase())) ||
        (s.category && s.category.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [allServices, selectedCategory, search]);

  const isSelected = (serviceId, title) => {
    return value.some((item) => (serviceId && item.serviceId === serviceId) || item.serviceName === title);
  };

  const toggleService = (service) => {
    const exists = isSelected(service.id, service.title);
    if (exists) {
      const next = value.filter((item) => (service.id ? item.serviceId !== service.id : item.serviceName !== service.title));
      onChange(next);
    } else {
      const newItem = {
        serviceId: service.id,
        serviceName: service.title,
        price: Number(service.price) || 0,
        quantity: 1,
        notes: '',
      };
      onChange([...value, newItem]);
    }
  };

  const removeService = (idx) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  };

  const updateServiceItem = (idx, patch) => {
    const next = value.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    onChange(next);
  };

  const totalServicesPrice = useMemo(() => {
    return value.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  }, [value]);

  return (
    <div className={`service-selector-box ${compact ? 'service-selector-compact' : ''}`}>
      <div className="service-selector-header">
        <div>
          <label className="service-selector-title">{title}</label>
          {hint && <span className="field-label-hint">{hint}</span>}
        </div>
        {value.length > 0 && (
          <div className="service-total-pill">
            {value.length} service{value.length > 1 ? 's' : ''} · ₹{totalServicesPrice.toLocaleString('en-IN')}
          </div>
        )}
      </div>

      <div className="service-search-row">
        <input
          type="search"
          className="search-input service-search-input"
          placeholder="Search test e.g. Sugar, BP, MRI, ECG, CBC, Dressing..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {categories.length > 2 && (
          <div className="service-category-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`service-cat-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-body-sm text-muted">Loading available clinic services...</p>
      ) : (
        <div className="service-chips-grid">
          {filteredServices.map((service) => {
            const active = isSelected(service.id, service.title);
            return (
              <button
                key={service.id}
                type="button"
                className={`service-chip-card ${active ? 'service-chip-active' : ''}`}
                onClick={() => toggleService(service)}
              >
                <div className="service-chip-header">
                  <span className="service-chip-title">{service.title}</span>
                  <span className="service-chip-price">₹{Number(service.price || 0).toLocaleString('en-IN')}</span>
                </div>
                {service.category && <span className="service-chip-category">{service.category}</span>}
              </button>
            );
          })}
          {filteredServices.length === 0 && (
            <p className="text-body-sm text-muted" style={{ padding: '8px 0' }}>
              No matching services found for &ldquo;{search}&rdquo;.
            </p>
          )}
        </div>
      )}

      {value.length > 0 && (
        <div className="selected-services-summary">
          <label className="service-summary-title">Selected Services &amp; Line Items</label>
          <div className="selected-services-list">
            {value.map((item, idx) => (
              <div key={idx} className="selected-service-row">
                <div className="service-row-info">
                  <strong>{item.serviceName}</strong>
                  <span className="service-row-rate">₹{Number(item.price || 0).toLocaleString('en-IN')} each</span>
                </div>
                <div className="service-row-controls">
                  <label className="service-qty-label">
                    Qty:
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={item.quantity || 1}
                      onChange={(e) => updateServiceItem(idx, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                      className="service-qty-input"
                    />
                  </label>
                  <span className="service-row-subtotal">
                    ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-IN')}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger btn-icon-only"
                    onClick={() => removeService(idx)}
                    title="Remove service"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
