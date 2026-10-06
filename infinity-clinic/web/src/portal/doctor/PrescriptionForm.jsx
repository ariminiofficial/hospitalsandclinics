import { useEffect, useState, useRef } from 'react';
import { api } from '../../shared/api/client.js';
import {
  DOSE_OPTIONS,
  DURATION_OPTIONS,
  TIMES_PER_DAY_OPTIONS,
  TIMING_OPTIONS,
  emptyPrescriptionItem,
  formatFrequency,
  normalizePrescriptionItem,
  templateToPrescriptionItem,
} from '../../shared/schema/prescription.js';
import FieldLabel from '../shared/FieldLabel.jsx';
import { FIELD_HELP } from '../shared/portalHelp.js';

function templateLabel(item) {
  const parts = [item.medicineName];
  if (item.dose) parts.push(item.dose);
  const freq = formatFrequency(item.timesPerDay, item.timing);
  if (freq) parts.push(freq);
  if (item.duration) parts.push(item.duration);
  return parts.join(' · ');
}

function MedicineAutocompleteInput({
  value,
  onChange,
  onSelectTemplate,
  onToggleFavorite,
  templates = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const filterText = (value || '').trim().toLowerCase();
  const filtered = templates.filter((t) => {
    if (!filterText) return true;
    return (t.medicineName || '').toLowerCase().includes(filterText);
  }).slice(0, 12);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="rx-autocomplete-wrapper" ref={wrapperRef}>
      <input
        type="text"
        placeholder="Type medicine name (e.g. Paracetamol, Augmentin, Pan 40)..."
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <div className="rx-autocomplete-dropdown">
          <div className="rx-autocomplete-header">
            {filterText ? `Matching Medicines (${filtered.length})` : 'Medicine Formulary & Suggestions'}
          </div>
          {filtered.length > 0 ? (
            filtered.map((t, idx) => (
              <div
                key={t.id || idx}
                className={`rx-autocomplete-item ${t.isFavorite ? 'favorite' : t.isFormulary ? 'formulary' : ''}`}
                onMouseDown={(e) => {
                  if (e.target.closest('.rx-fav-star-btn')) return;
                  e.preventDefault();
                  onSelectTemplate(t);
                  setIsOpen(false);
                }}
              >
                <div className="rx-autocomplete-item-main">
                  <span className="rx-autocomplete-item-name">
                    {t.medicineName}
                  </span>
                  <div className="rx-autocomplete-actions">
                    <span className="rx-autocomplete-item-badge">
                      {t.isFavorite ? 'Favorite' : t.isFormulary ? 'Standard' : 'History'}
                    </span>
                    <button
                      type="button"
                      className={`rx-fav-star-btn ${t.isFavorite ? 'active' : ''}`}
                      title={t.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onToggleFavorite(t);
                      }}
                    >
                      {t.isFavorite ? '★' : '☆'}
                    </button>
                  </div>
                </div>
                <div className="rx-autocomplete-item-details">
                  {t.dose && <span><strong>Dose:</strong> {t.dose}</span>}
                  {t.timesPerDay && <span><strong>Schedule:</strong> {formatFrequency(t.timesPerDay, t.timing)}</span>}
                  {t.duration && <span><strong>Duration:</strong> {t.duration}</span>}
                  {t.instructions && <span>· {t.instructions}</span>}
                </div>
              </div>
            ))
          ) : (
            <div className="rx-autocomplete-empty">
              No preset found. You can type freely to prescribe custom medicine.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PrescriptionForm({ value, onChange, doctorId }) {
  const [favorites, setFavorites] = useState([]);
  const [templates, setTemplates] = useState([]);

  const loadFavorites = () => {
    const params = new URLSearchParams();
    params.set('favoritesOnly', 'true');
    if (doctorId) params.set('doctorId', doctorId);
    api.get(`/portal/prescriptions/templates?${params}`).then(setFavorites).catch(console.error);
  };

  const loadTemplates = (q = '') => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (doctorId) params.set('doctorId', doctorId);
    const query = params.toString() ? `?${params}` : '';
    api.get(`/portal/prescriptions/templates${query}`).then(setTemplates).catch(console.error);
  };

  useEffect(() => {
    loadFavorites();
    loadTemplates();
  }, [doctorId]);

  const toggleFavorite = async (item) => {
    try {
      await api.post('/portal/prescriptions/templates/toggle-favorite', {
        medicineName: item.medicineName,
        isFavorite: !item.isFavorite,
        dose: item.dose,
        timesPerDay: item.timesPerDay,
        timing: item.timing,
        duration: item.duration,
        instructions: item.instructions,
      });
      loadFavorites();
      loadTemplates();
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const updateItem = (idx, patch) => {
    const items = value.items.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    onChange({ ...value, items });
  };

  const updateTiming = (idx, key, checked) => {
    const item = value.items[idx];
    updateItem(idx, { timing: { ...item.timing, [key]: checked } });
  };

  const addItem = (item = emptyPrescriptionItem()) => {
    onChange({ ...value, items: [...value.items, item] });
  };

  const removeItem = (idx) => {
    const items = value.items.filter((_, i) => i !== idx);
    onChange({ ...value, items: items.length ? items : [emptyPrescriptionItem()] });
  };

  const addFromTemplate = (template) => {
    addItem(templateToPrescriptionItem(template));
  };

  return (
    <div className="rx-form">
      {/* Top Favorite Medicines Quick Access Panel */}
      <div className="rx-saved-panel card card-muted">
        <div className="rx-fav-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)' }}>Favorite Presets</span>
            <span className="rx-fav-badge">{favorites.length} Starred</span>
          </div>
          <span className="text-body-sm" style={{ color: 'var(--ink-soft)' }}>
            1-Click add to Rx · Star any medicine to pin here
          </span>
        </div>
        {favorites.length > 0 ? (
          <div className="rx-template-chips">
            {favorites.map((t) => (
              <div
                key={t.id || t.medicineName}
                className="rx-template-chip favorite"
                onClick={() => addFromTemplate(t)}
                title={templateLabel(t)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <strong style={{ color: '#0f172a' }}>{t.medicineName}</strong>
                  <button
                    type="button"
                    className="rx-fav-star-btn active"
                    title="Remove from favorites"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(t);
                    }}
                  >
                    ★
                  </button>
                </div>
                <span>{[t.dose, formatFrequency(t.timesPerDay, t.timing), t.duration].filter(Boolean).join(' · ')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-body-sm rx-saved-empty" style={{ padding: '4px 0' }}>
            No favorites pinned yet. Click the star icon (★) in the search dropdown below on any medicine to pin it here.
          </p>
        )}
      </div>

      <div className="rx-items">
        {value.items.map((item, idx) => (
          <div key={idx} className="rx-item-card card">
            <div className="rx-item-top">
              <span className="rx-item-num">#{idx + 1}</span>
              {value.items.length > 1 && (
                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(idx)}>Remove</button>
              )}
            </div>

            <div className="rx-field rx-field-full">
              <FieldLabel title={FIELD_HELP.medicine.title} hint={FIELD_HELP.medicine.hint} />
              <MedicineAutocompleteInput
                value={item.medicineName}
                onChange={(name) => updateItem(idx, { medicineName: name })}
                onSelectTemplate={(template) => {
                  const populated = templateToPrescriptionItem(template);
                  updateItem(idx, populated);
                }}
                onToggleFavorite={toggleFavorite}
                templates={templates}
              />
            </div>

            <div className="rx-field-row">
              <label className="rx-field">
                <FieldLabel title={FIELD_HELP.dose.title} hint={FIELD_HELP.dose.hint} />
                <input
                  list={`rx-dose-${idx}`}
                  placeholder="1 tablet"
                  value={item.dose}
                  onChange={(e) => updateItem(idx, { dose: e.target.value })}
                />
                <datalist id={`rx-dose-${idx}`}>
                  {DOSE_OPTIONS.map((d) => <option key={d} value={d} />)}
                </datalist>
              </label>

              <label className="rx-field">
                <FieldLabel title={FIELD_HELP.timesPerDay.title} hint={FIELD_HELP.timesPerDay.hint} />
                <select
                  value={item.timesPerDay}
                  onChange={(e) => updateItem(idx, { timesPerDay: e.target.value ? Number(e.target.value) : '' })}
                >
                  <option value="">—</option>
                  {TIMES_PER_DAY_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}×</option>
                  ))}
                </select>
              </label>

              <label className="rx-field">
                <FieldLabel title={FIELD_HELP.duration.title} hint={FIELD_HELP.duration.hint} />
                <input
                  list={`rx-dur-${idx}`}
                  placeholder="5 days"
                  value={item.duration}
                  onChange={(e) => updateItem(idx, { duration: e.target.value })}
                />
                <datalist id={`rx-dur-${idx}`}>
                  {DURATION_OPTIONS.map((d) => <option key={d} value={d} />)}
                </datalist>
              </label>
            </div>

            <div className="rx-timing">
              <FieldLabel title={FIELD_HELP.whenToTake.title} hint={FIELD_HELP.whenToTake.hint} />
              <div className="rx-timing-chips">
                {TIMING_OPTIONS.map((t) => (
                  <label key={t.key} className={`rx-timing-chip ${item.timing?.[t.key] ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={Boolean(item.timing?.[t.key])}
                      onChange={(e) => updateTiming(idx, t.key, e.target.checked)}
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>

            {(item.timesPerDay || TIMING_OPTIONS.some((t) => item.timing?.[t.key])) && (
              <p className="rx-preview text-body-sm">
                {formatFrequency(item.timesPerDay, item.timing) || 'Select times or timing'}
              </p>
            )}

            <label className="rx-field rx-field-full">
              <FieldLabel title={FIELD_HELP.extraInstructions.title} hint={FIELD_HELP.extraInstructions.hint} />
              <input
                placeholder="After food, avoid alcohol..."
                value={item.instructions}
                onChange={(e) => updateItem(idx, { instructions: e.target.value })}
              />
            </label>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-sm btn-secondary" onClick={() => addItem()}>+ Add medicine</button>

      <label className="rx-advice">
        <FieldLabel title={FIELD_HELP.generalAdvice.title} hint={FIELD_HELP.generalAdvice.hint} />
        <textarea
          className="portal-textarea"
          value={value.advice}
          onChange={(e) => onChange({ ...value, advice: e.target.value })}
          rows={2}
          placeholder="Rest, fluids, follow-up in 1 week..."
        />
      </label>
    </div>
  );
}

export { normalizePrescriptionItem, emptyPrescriptionItem };
