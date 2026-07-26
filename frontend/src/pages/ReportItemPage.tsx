import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Upload, X, ChevronRight, ChevronLeft, CheckCircle2,
  Loader2, ImagePlus, Tag, FileText, Navigation, Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createItem } from '../api/items';
import type { ItemCategory, ItemStatus } from '../types';

// ─── Campus Locations ────────────────────────────────────────────────────────
const CAMPUS_LOCATIONS = [
  { name: 'Main Library', area: 'Academic Zone' },
  { name: 'Science Block', area: 'Academic Zone' },
  { name: 'Engineering Building', area: 'Academic Zone' },
  { name: 'Computer Lab', area: 'Academic Zone' },
  { name: 'Lecture Hall Complex', area: 'Academic Zone' },
  { name: 'Auditorium', area: 'Academic Zone' },
  { name: 'Main Cafeteria', area: 'Campus Life' },
  { name: 'Food Court', area: 'Campus Life' },
  { name: 'Student Center', area: 'Campus Life' },
  { name: 'Sports Complex', area: 'Campus Life' },
  { name: 'Gymnasium', area: 'Campus Life' },
  { name: 'Hostel Block A', area: 'Residential' },
  { name: 'Hostel Block B', area: 'Residential' },
  { name: 'Hostel Block C', area: 'Residential' },
  { name: 'Main Gate', area: 'General' },
  { name: 'Parking Area', area: 'General' },
  { name: 'Admin Office', area: 'General' },
  { name: 'Medical Center', area: 'General' },
  { name: 'Bus Stop', area: 'General' },
];

const CATEGORIES: ItemCategory[] = [
  'Electronics', 'Clothing', 'Accessories', 'Books',
  'ID & Cards', 'Keys', 'Bags', 'Sports', 'Other',
];

const STATUSES: { value: ItemStatus; label: string; activeStyle: React.CSSProperties; inactiveStyle: React.CSSProperties }[] = [
  {
    value: 'Lost',
    label: '🔴 Lost',
    activeStyle: { background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' },
    inactiveStyle: { background: 'transparent', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' },
  },
  {
    value: 'Found',
    label: '🟢 Found',
    activeStyle: { background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.4)', color: '#22C55E' },
    inactiveStyle: { background: 'transparent', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' },
  },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────
const STEPS = ['Details', 'Location', 'Photos'];

const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '2rem' }}>
    {STEPS.map((label, i) => (
      <React.Fragment key={label}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 800,
              border: '2px solid',
              transition: 'all 0.3s ease',
              ...(i < current
                ? { background: 'var(--accent-gradient)', borderColor: 'transparent', color: '#ffffff', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }
                : i === current
                  ? { borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)', background: 'var(--accent-light)' }
                  : { borderColor: 'var(--border-subtle)', color: 'var(--text-tertiary)', background: 'var(--bg-card)' }),
            }}
          >
            {i < current ? <CheckCircle2 size={18} /> : i + 1}
          </div>
          <span style={{
            fontSize: '0.6875rem',
            marginTop: '0.5rem',
            fontWeight: 700,
            color: i <= current ? 'var(--text-primary)' : 'var(--text-tertiary)',
          }}>
            {label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div style={{
            width: 64,
            height: 3,
            borderRadius: 'var(--radius-full)',
            marginBottom: 20,
            marginLeft: 12,
            marginRight: 12,
            transition: 'all 0.5s ease',
            background: i < current ? 'var(--accent-purple)' : 'var(--border-subtle)',
          }} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', color: 'var(--accent-purple)' }}>
    <div style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)', background: 'var(--accent-light)' }}>
      {icon}
    </div>
    <span style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {label}
    </span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ReportItemPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory | ''>('');
  const [status, setStatus] = useState<ItemStatus>('Lost');

  const [locationName, setLocationName] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [specificArea, setSpecificArea] = useState('');

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const finalLocationName = locationName === '__custom__'
    ? customLocation.trim()
    : specificArea
      ? `${locationName} — ${specificArea}`
      : locationName;

  const validateStep1 = (): boolean => {
    if (!title.trim() || title.trim().length < 3) { toast.error('Title must be at least 3 characters.'); return false; }
    if (!description.trim() || description.trim().length < 10) { toast.error('Description must be at least 10 characters.'); return false; }
    if (!category) { toast.error('Please select a category.'); return false; }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!locationName) { toast.error('Please select a campus location.'); return false; }
    if (locationName === '__custom__' && !customLocation.trim()) { toast.error('Please enter a location name.'); return false; }
    return true;
  };

  const nextStep = () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const handleImageAdd = useCallback((files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - images.length;
    if (remaining <= 0) { toast.error('Maximum 5 images allowed.'); return; }
    const newFiles = Array.from(files).slice(0, remaining).filter((f) => f.type.startsWith('image/'));
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, [images]);

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleImageAdd(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) return;
    setSubmitting(true);
    try {
      const item = await createItem({
        title: title.trim(),
        description: description.trim(),
        category: category as ItemCategory,
        status,
        locationName: finalLocationName,
        coordinates: { lat: 0, lng: 0 }, // Not meaningful for campus app, backend still requires it
        images,
      });
      toast.success('Item reported successfully!');
      navigate(`/items/${item._id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit report.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-xl)',
    padding: '2rem',
  };

  // Group locations by area
  const locationsByArea = CAMPUS_LOCATIONS.reduce<Record<string, typeof CAMPUS_LOCATIONS>>((acc, loc) => {
    if (!acc[loc.area]) acc[loc.area] = [];
    acc[loc.area].push(loc);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 720, padding: '1rem 0' }} className="animate-fadeInUp">
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          marginBottom: '0.5rem',
        }}>
          Report an Item
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Help reunite lost items with their owners.
        </p>
      </div>

      <StepIndicator current={step} />

      {/* ─── Step 0: Details ────────────────────────────────────────────────── */}
      {step === 0 && (
        <div style={cardStyle} className="animate-fadeIn">
          <SectionHeader icon={<Tag size={16} />} label="Item Details" />

          {/* Status selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              Item Type
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px solid',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    ...(status === s.value ? s.activeStyle : s.inactiveStyle),
                  }}
                  id={`status-${s.value}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="input-field"
              style={{ height: 44 }}
              placeholder="e.g. Black AirPods Pro, Blue backpack..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              id="item-title"
            />
            <div style={{ textAlign: 'right', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
              {title.length}/120
            </div>
          </div>

          {/* Category grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              Category <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    border: '1px solid',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    ...(category === c
                      ? { background: 'var(--accent-light)', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }
                      : { background: 'transparent', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }),
                  }}
                  id={`cat-${c}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              className="input-field"
              style={{ resize: 'none', minHeight: 100 }}
              rows={4}
              placeholder="Describe the item — color, brand, distinguishing features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              id="item-description"
            />
            <div style={{ textAlign: 'right', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
              {description.length}/1000
            </div>
          </div>

          <button
            type="button"
            onClick={nextStep}
            className="btn-primary"
            style={{ width: '100%', padding: '0.875rem', fontSize: '0.9375rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
            id="step1-next"
          >
            Next: Location <ChevronRight size={18} style={{ marginLeft: 4 }} />
          </button>
        </div>
      )}

      {/* ─── Step 1: Location ───────────────────────────────────────────────── */}
      {step === 1 && (
        <div style={cardStyle} className="animate-fadeIn">
          <SectionHeader icon={<Navigation size={16} />} label="Campus Location" />

          {/* Campus location picker */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              Where on campus? <span style={{ color: '#ef4444' }}>*</span>
            </label>

            {Object.entries(locationsByArea).map(([area, locations]) => (
              <div key={area} style={{ marginBottom: '1rem' }}>
                <p style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  marginBottom: '0.5rem',
                  paddingLeft: '0.25rem',
                }}>
                  {area}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {locations.map((loc) => {
                    const isSelected = locationName === loc.name;
                    return (
                      <button
                        key={loc.name}
                        type="button"
                        onClick={() => {
                          setLocationName(loc.name);
                          setCustomLocation('');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.5rem 0.875rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          border: '1px solid',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          ...(isSelected
                            ? {
                                background: 'var(--accent-light)',
                                borderColor: 'var(--accent-purple)',
                                color: 'var(--accent-purple)',
                                boxShadow: 'var(--shadow-glow)',
                              }
                            : {
                                background: 'transparent',
                                borderColor: 'var(--border-subtle)',
                                color: 'var(--text-secondary)',
                              }),
                        }}
                      >
                        <Building2 size={14} />
                        {loc.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Custom location option */}
            <div style={{ marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setLocationName('__custom__');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  border: '1px dashed',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  ...(locationName === '__custom__'
                    ? {
                        background: 'var(--accent-light)',
                        borderColor: 'var(--accent-purple)',
                        color: 'var(--accent-purple)',
                      }
                    : {
                        background: 'transparent',
                        borderColor: 'var(--border-default)',
                        color: 'var(--text-tertiary)',
                      }),
                }}
                id="custom-location-btn"
              >
                <MapPin size={14} />
                Other Location...
              </button>
            </div>
          </div>

          {/* Custom location input */}
          {locationName === '__custom__' && (
            <div style={{ marginBottom: '1.5rem' }} className="animate-fadeIn">
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                Location Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', height: 44 }}
                  placeholder="e.g. Vedanta Auditorium, North Corridor..."
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  id="custom-location-input"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Specific area within the location */}
          {locationName && locationName !== '__custom__' && (
            <div style={{ marginBottom: '1.5rem' }} className="animate-fadeIn">
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                Specific area <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>(optional)</span>
              </label>
              <input
                type="text"
                className="input-field"
                style={{ height: 44 }}
                placeholder="e.g. 2nd Floor, Room 301, Near entrance..."
                value={specificArea}
                onChange={(e) => setSpecificArea(e.target.value)}
                id="specific-area"
              />
            </div>
          )}

          {/* Selected location preview */}
          {locationName && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                marginBottom: '1.5rem',
              }}
              className="animate-fadeIn"
            >
              <CheckCircle2 size={16} style={{ color: '#22C55E', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#22C55E' }}>
                {finalLocationName}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={prevStep}
              className="btn-secondary"
              style={{ padding: '0.875rem 1.25rem' }}
              id="step2-back"
            >
              <ChevronLeft size={18} /> Back
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary"
              style={{ flex: 1, padding: '0.875rem', fontSize: '0.9375rem', fontWeight: 700 }}
              id="step2-next"
            >
              Next: Photos <ChevronRight size={18} style={{ marginLeft: 4 }} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Photos ─────────────────────────────────────────────────── */}
      {step === 2 && (
        <div style={cardStyle} className="animate-fadeIn">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <SectionHeader icon={<ImagePlus size={16} />} label="Photos" />
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.625rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}>
              {images.length}/5
            </span>
          </div>

          {/* Upload zone */}
          <div
            onClick={() => images.length < 5 && fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            id="image-dropzone"
            style={{
              border: `2px dashed ${images.length >= 5 ? 'var(--border-subtle)' : 'var(--accent-purple)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              cursor: images.length >= 5 ? 'not-allowed' : 'pointer',
              opacity: images.length >= 5 ? 0.5 : 1,
              background: 'var(--accent-light)',
              transition: 'all 0.2s ease',
              marginBottom: '1.25rem',
            }}
          >
            <Upload size={32} style={{ margin: '0 auto 12px', color: 'var(--accent-purple)', opacity: 0.8 }} />
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              {images.length >= 5 ? 'Maximum images reached' : 'Drop images here or click to browse'}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
              JPEG, PNG, WebP — max 5MB each
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleImageAdd(e.target.files)}
            id="image-input"
          />

          {previews.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}>
              {previews.map((src, i) => (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    overflow: 'hidden',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <img src={src} alt={`preview-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0'; }}
                    id={`remove-img-${i}`}
                  >
                    <X size={14} />
                  </button>
                  {i === 0 && (
                    <div style={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      fontSize: '0.5625rem',
                      padding: '0.125rem 0.375rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--accent-gradient)',
                      color: '#fff',
                      fontWeight: 800,
                    }}>
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Summary card */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}>
            <p style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: 'var(--text-tertiary)',
              marginBottom: '0.75rem',
            }}>
              Report Summary
            </p>
            {[
              { label: 'Type', value: status, style: { color: status === 'Lost' ? '#EF4444' : '#22C55E' } as React.CSSProperties },
              { label: 'Title', value: title },
              { label: 'Category', value: category },
              { label: 'Location', value: finalLocationName },
              { label: 'Photos', value: `${images.length} attached` },
            ].map(({ label, value, style }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>{label}</span>
                <span className="truncate" style={{ fontWeight: 700, color: 'var(--text-primary)', maxWidth: 200, ...style }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={prevStep}
              className="btn-secondary"
              style={{ padding: '0.875rem 1.25rem' }}
              id="step3-back"
            >
              <ChevronLeft size={18} /> Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary"
              style={{ flex: 1, padding: '0.875rem', fontSize: '0.9375rem', fontWeight: 700 }}
              id="submit-report"
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" style={{ marginRight: 8 }} /> Submitting...</>
              ) : (
                <><FileText size={18} style={{ marginRight: 8 }} /> Submit Report</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportItemPage;
