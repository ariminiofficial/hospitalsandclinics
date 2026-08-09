import { useEffect, useState } from 'react';
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

export default function PrescriptionForm({ value, onChange }) {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');

  const loadTemplates = (q = '') => {
    const query = q ? `?q=${encodeURIComponent(q)}` : '';
    api.get(`/portal/prescriptions/templates${query}`).then(setTemplates).catch(console.error);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

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
    setSearch('');
    loadTemplates();
  };

  const filteredTemplates = templates.filter((t) => {
    if (!search.trim()) return true;
    return t.medicineName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="rx-form">
      <div className="rx-saved-panel card card-muted">
        <div className="rx-saved-header">
          <FieldLabel title={FIELD_HELP.savedMedicines.title} hint={FIELD_HELP.savedMedicines.hint} />
          <input
            className="rx-search"
            placeholder="Search saved..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              loadTemplates(e.target.value);
            }}
          />
        </div>
        {filteredTemplates.length > 0 ? (
          <div className="rx-template-chips">
            {filteredTemplates.map((t) => (
              <button key={t.id} type="button" className="rx-template-chip" onClick={() => addFromTemplate(t)} title={templateLabel(t)}>
                <strong>{t.medicineName}</strong>
                <span>{[t.dose, formatFrequency(t.timesPerDay, t.timing), t.duration].filter(Boolean).join(' · ')}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-body-sm rx-saved-empty">Medicines you prescribe will appear here for quick reuse.</p>
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

            <label className="rx-field rx-field-full">
              <FieldLabel title={FIELD_HELP.medicine.title} hint={FIELD_HELP.medicine.hint} />
              <input
                list={`rx-meds-${idx}`}
                placeholder="e.g. Paracetamol 650mg"
                value={item.medicineName}
                onChange={(e) => updateItem(idx, { medicineName: e.target.value })}
              />
              <datalist id={`rx-meds-${idx}`}>
                {[...new Set(templates.map((t) => t.medicineName))].map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>

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
