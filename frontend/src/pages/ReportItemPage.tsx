import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Upload, X, ChevronRight, ChevronLeft, CheckCircle2,
  Loader2, ImagePlus, Tag, FileText, Navigation,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { createItem } from '../api/items';
import type { ItemCategory, ItemStatus } from '../types';

// ─── Fix default Leaflet marker icons ────────────────────────────────────────
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CATEGORIES: ItemCategory[] = [
  'Electronics', 'Clothing', 'Accessories', 'Books',
  'ID & Cards', 'Keys', 'Bags', 'Sports', 'Other',
];

const STATUSES: { value: ItemStatus; label: string; activeStyle: React.CSSProperties; inactiveStyle: React.CSSProperties }[] = [
  {
    value: 'Lost',
    label: '🔴 Lost',
    activeStyle: { background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.4)', color: '#fca5a5' },
    inactiveStyle: { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: '#4b5563' },
  },
  {
    value: 'Found',
    label: '🟢 Found',
    activeStyle: { background: 'rgba(0,212,184,0.12)', borderColor: 'rgba(0,212,184,0.35)', color: '#5ff0de' },
    inactiveStyle: { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: '#4b5563' },
  },
];

// ─── Map click handler ────────────────────────────────────────────────────────
interface MapClickHandlerProps { onMapClick: (lat: number, lng: number) => void; }
const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onMapClick }) => {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
};

// ─── Step Indicator ───────────────────────────────────────────────────────────
const STEPS = ['Details', 'Location', 'Photos'];

const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {STEPS.map((label, i) => (
      <React.Fragment key={label}>
        <div className="flex flex-col items-center">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300"
            style={
              i < current
                ? { background: 'linear-gradient(135deg, #00bfa5, #5ff0de)', borderColor: 'transparent', color: '#06080c', boxShadow: '0 0 12px rgba(0,212,184,0.4)' }
                : i === current
                ? { borderColor: '#00d4b8', color: '#00d4b8', background: 'rgba(0,212,184,0.08)' }
                : { borderColor: 'rgba(255,255,255,0.08)', color: '#374151', background: 'rgba(255,255,255,0.02)' }
            }
          >
            {i < current ? <CheckCircle2 size={16} /> : i + 1}
          </div>
          <span
            className="text-xs mt-1.5 font-medium"
            style={{ color: i <= current ? '#94a3b8' : '#374151' }}
          >
            {label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div
            className="mb-5 mx-2 transition-all duration-500"
            style={{ width: 48, height: 1, background: i < current ? '#00d4b8' : 'rgba(255,255,255,0.08)' }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2 mb-2" style={{ color: '#00d4b8' }}>
    {icon}
    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const validateStep1 = (): boolean => {
    if (!title.trim() || title.trim().length < 3) { toast.error('Title must be at least 3 characters.'); return false; }
    if (!description.trim() || description.trim().length < 10) { toast.error('Description must be at least 10 characters.'); return false; }
    if (!category) { toast.error('Please select a category.'); return false; }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!locationName.trim()) { toast.error('Please enter a location name.'); return false; }
    if (!coords) { toast.error('Please click on the map to pin the location.'); return false; }
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
        locationName: locationName.trim(),
        coordinates: coords!,
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
    background: 'rgba(11,15,23,0.7)',
    border: '1px solid rgba(0,212,184,0.09)',
    borderRadius: '20px',
    padding: '2rem',
  };

  return (
    <div className="flex-1 page-container py-10 max-w-2xl">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-white mb-1"
          style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.03em' }}
        >
          Report an Item
        </h1>
        <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>Help reunite lost items with their owners.</p>
      </div>

      <StepIndicator current={step} />

      {/* ─── Step 0: Details ────────────────────────────────────────────────── */}
      {step === 0 && (
        <div style={cardStyle} className="animate-fadeIn space-y-6">
          <SectionHeader icon={<Tag size={15} />} label="Item Details" />

          {/* Status selector */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: '#94a3b8' }}>Item Type</label>
            <div className="flex gap-3">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className="flex-1 py-3 rounded-2xl border-2 text-sm font-semibold transition-all"
                  style={status === s.value ? s.activeStyle : s.inactiveStyle}
                  id={`status-${s.value}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
              Title <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Black AirPods Pro, Blue backpack..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              id="item-title"
            />
            <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#374151', marginTop: '4px' }}>{title.length}/120</div>
          </div>

          {/* Category grid */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
              Category <span style={{ color: '#f87171' }}>*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`tag-pill ${category === c ? 'active' : 'inactive'}`}
                  id={`cat-${c}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
              Description <span style={{ color: '#f87171' }}>*</span>
            </label>
            <textarea
              className="input-field resize-none"
              rows={4}
              placeholder="Describe the item — color, brand, distinguishing features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              id="item-description"
            />
            <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#374151', marginTop: '4px' }}>{description.length}/1000</div>
          </div>

          <button type="button" onClick={nextStep} className="btn-primary w-full py-3" id="step1-next">
            Next: Location <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ─── Step 1: Location ───────────────────────────────────────────────── */}
      {step === 1 && (
        <div style={cardStyle} className="animate-fadeIn space-y-6">
          <SectionHeader icon={<Navigation size={15} />} label="Location" />

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
              Location Name <span style={{ color: '#f87171' }}>*</span>
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4b5563' }} />
              <input
                type="text"
                className="input-field pl-10"
                placeholder="e.g. Library 2nd Floor, Cafeteria entrance..."
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                id="location-name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
              Pin on Map <span style={{ color: '#f87171' }}>*</span>
              <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#374151', fontWeight: 400 }}>
                (click to place marker)
              </span>
            </label>
            <div className="overflow-hidden" style={{ height: 320, borderRadius: 16, border: '1px solid rgba(0,212,184,0.12)' }}>
              <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={(lat, lng) => setCoords({ lat, lng })} />
                {coords && <Marker position={[coords.lat, coords.lng]} />}
              </MapContainer>
            </div>
            {coords ? (
              <p className="flex items-center gap-1 mt-2" style={{ fontSize: '0.78rem', color: '#00d4b8' }}>
                <CheckCircle2 size={12} />
                Pinned at {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            ) : (
              <p style={{ fontSize: '0.78rem', color: '#374151', marginTop: '8px' }}>No location pinned yet.</p>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={prevStep} className="btn-secondary flex-1 py-3" id="step2-back">
              <ChevronLeft size={16} /> Back
            </button>
            <button type="button" onClick={nextStep} className="btn-primary flex-1 py-3" id="step2-next">
              Next: Photos <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Photos ─────────────────────────────────────────────────── */}
      {step === 2 && (
        <div style={cardStyle} className="animate-fadeIn space-y-6">
          <div className="flex items-center justify-between">
            <SectionHeader icon={<ImagePlus size={15} />} label="Photos" />
            <span style={{ fontSize: '0.78rem', color: '#374151' }}>{images.length}/5</span>
          </div>

          {/* Upload zone */}
          <div
            onClick={() => images.length < 5 && fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            id="image-dropzone"
            style={{
              border: `2px dashed ${images.length >= 5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,212,184,0.2)'}`,
              borderRadius: 16,
              padding: '2.5rem 1rem',
              textAlign: 'center',
              cursor: images.length >= 5 ? 'not-allowed' : 'pointer',
              opacity: images.length >= 5 ? 0.4 : 1,
              background: 'rgba(0,212,184,0.02)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (images.length < 5)
                (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,184,0.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,184,0.02)';
            }}
          >
            <Upload size={30} style={{ margin: '0 auto 12px', color: '#00d4b8', opacity: 0.6 }} />
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>
              {images.length >= 5 ? 'Maximum images reached' : 'Drop images here or click to browse'}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#374151', marginTop: '4px' }}>
              JPEG, PNG, WebP — max 5MB each
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleImageAdd(e.target.files)}
            id="image-input"
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden group"
                  style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(6,8,12,0.8)', color: '#fff' }}
                    id={`remove-img-${i}`}
                  >
                    <X size={12} />
                  </button>
                  {i === 0 && (
                    <div
                      className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,212,184,0.85)', color: '#06080c', fontWeight: 700 }}
                    >
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Summary card */}
          <div
            style={{
              background: 'rgba(0,212,184,0.04)',
              border: '1px solid rgba(0,212,184,0.1)',
              borderRadius: 14,
              padding: '1rem',
            }}
          >
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', marginBottom: '0.75rem' }}>
              Report Summary
            </p>
            {[
              { label: 'Type', value: status, style: { color: status === 'Lost' ? '#fca5a5' : '#5ff0de' } },
              { label: 'Title', value: title },
              { label: 'Category', value: category },
              { label: 'Location', value: locationName },
              { label: 'Photos', value: `${images.length} attached` },
            ].map(({ label, value, style }) => (
              <div key={label} className="flex justify-between text-sm mb-1.5">
                <span style={{ color: '#4b5563' }}>{label}</span>
                <span className="font-medium text-white truncate max-w-[200px]" style={style}>{value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={prevStep} className="btn-secondary flex-1 py-3" id="step3-back">
              <ChevronLeft size={16} /> Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex-1 py-3"
              id="submit-report"
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Submitting...</>
              ) : (
                <><FileText size={16} /> Submit Report</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportItemPage;
