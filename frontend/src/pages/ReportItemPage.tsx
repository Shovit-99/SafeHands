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
    activeStyle: { background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' },
    inactiveStyle: { background: 'transparent', borderColor: 'var(--divider)', color: 'var(--text-secondary)' },
  },
  {
    value: 'Found',
    label: '🟢 Found',
    activeStyle: { background: 'var(--accent-light)', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' },
    inactiveStyle: { background: 'transparent', borderColor: 'var(--divider)', color: 'var(--text-secondary)' },
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
  <div className="flex items-center justify-center gap-0 mb-12">
    {STEPS.map((label, i) => (
      <React.Fragment key={label}>
        <div className="flex flex-col items-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all duration-300 shadow-sm"
            style={
              i < current
                ? { background: 'var(--accent-gradient)', borderColor: 'transparent', color: '#ffffff', boxShadow: '0 4px 12px var(--accent-light)' }
                : i === current
                ? { borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', background: 'var(--accent-light)' }
                : { borderColor: 'var(--divider)', color: 'var(--text-secondary)', background: 'var(--card-bg)' }
            }
          >
            {i < current ? <CheckCircle2 size={18} /> : i + 1}
          </div>
          <span
            className="text-xs mt-2 font-bold"
            style={{ color: i <= current ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            {label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div
            className="mb-6 mx-3 transition-all duration-500 rounded-full"
            style={{ width: 64, height: 4, background: i < current ? 'var(--accent-primary)' : 'var(--divider)' }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2.5 mb-4" style={{ color: 'var(--accent-primary)' }}>
    <div className="p-1.5 rounded-lg" style={{ background: 'var(--accent-light)' }}>
      {icon}
    </div>
    <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
    background: 'var(--card-bg)',
    border: '1px solid var(--divider)',
    borderRadius: '24px',
    padding: '2.5rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
  };

  return (
    <div className="flex-1 page-container py-12 max-w-3xl transition-colors duration-300">
      <div className="mb-10 text-center">
        <h1
          className="text-4xl font-black mb-3 tracking-tight text-[var(--text-primary)]"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          Report an Item
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: 500 }}>Help reunite lost items with their owners.</p>
      </div>

      <StepIndicator current={step} />

      {/* ─── Step 0: Details ────────────────────────────────────────────────── */}
      {step === 0 && (
        <div style={cardStyle} className="animate-fadeIn space-y-8">
          <SectionHeader icon={<Tag size={16} />} label="Item Details" />

          {/* Status selector */}
          <div>
            <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>Item Type</label>
            <div className="flex gap-4">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className="flex-1 py-3.5 rounded-2xl border-2 text-base font-bold transition-all shadow-sm"
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
            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="input-field shadow-sm text-base h-12 rounded-xl"
              style={{ background: 'var(--bg-color)', border: '1px solid var(--divider)' }}
              placeholder="e.g. Black AirPods Pro, Blue backpack..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              id="item-title"
            />
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 500 }}>{title.length}/120</div>
          </div>

          {/* Category grid */}
          <div>
            <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>
              Category <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${category === c ? 'shadow-sm' : ''}`}
                  style={category === c
                    ? { background: 'var(--text-primary)', borderColor: 'var(--text-primary)', color: 'var(--bg-color)' }
                    : { background: 'var(--bg-color)', borderColor: 'var(--divider)', color: 'var(--text-secondary)' }
                  }
                  id={`cat-${c}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              className="input-field resize-none shadow-sm text-base rounded-xl"
              style={{ background: 'var(--bg-color)', border: '1px solid var(--divider)' }}
              rows={4}
              placeholder="Describe the item — color, brand, distinguishing features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              id="item-description"
            />
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 500 }}>{description.length}/1000</div>
          </div>

          <button type="button" onClick={nextStep} className="btn-primary w-full py-4 text-lg font-bold rounded-2xl shadow-md" id="step1-next">
            Next: Location <ChevronRight size={20} className="ml-1" />
          </button>
        </div>
      )}

      {/* ─── Step 1: Location ───────────────────────────────────────────────── */}
      {step === 1 && (
        <div style={cardStyle} className="animate-fadeIn space-y-8">
          <SectionHeader icon={<Navigation size={16} />} label="Location" />

          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Location Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="input-field pl-12 shadow-sm text-base h-12 rounded-xl"
                style={{ background: 'var(--bg-color)', border: '1px solid var(--divider)' }}
                placeholder="e.g. Library 2nd Floor, Cafeteria entrance..."
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                id="location-name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>
              Pin on Map <span style={{ color: '#ef4444' }}>*</span>
              <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', fontWeight: 500 }}>
                (click to place marker)
              </span>
            </label>
            <div className="overflow-hidden shadow-sm" style={{ height: 350, borderRadius: 20, border: '1px solid var(--divider)', background: 'var(--bg-color)' }}>
              <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={(lat, lng) => setCoords({ lat, lng })} />
                {coords && <Marker position={[coords.lat, coords.lng]} />}
              </MapContainer>
            </div>
            {coords ? (
              <p className="flex items-center gap-1.5 mt-3 font-bold" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                <CheckCircle2 size={14} />
                Pinned at {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            ) : (
              <p className="font-medium" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '10px' }}>No location pinned yet.</p>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={prevStep} className="px-6 py-4 rounded-2xl font-bold border flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5" style={{ color: 'var(--text-secondary)', borderColor: 'var(--divider)' }} id="step2-back">
              <ChevronLeft size={20} className="mr-1" /> Back
            </button>
            <button type="button" onClick={nextStep} className="btn-primary flex-1 py-4 text-lg font-bold rounded-2xl shadow-md" id="step2-next">
              Next: Photos <ChevronRight size={20} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Photos ─────────────────────────────────────────────────── */}
      {step === 2 && (
        <div style={cardStyle} className="animate-fadeIn space-y-8">
          <div className="flex items-center justify-between">
            <SectionHeader icon={<ImagePlus size={16} />} label="Photos" />
            <span className="font-bold px-3 py-1 rounded-full" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-color)', border: '1px solid var(--divider)' }}>{images.length}/5 photos</span>
          </div>

          {/* Upload zone */}
          <div
            onClick={() => images.length < 5 && fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            id="image-dropzone"
            style={{
              border: `2px dashed ${images.length >= 5 ? 'var(--divider)' : 'var(--accent-primary)'}`,
              borderRadius: 20,
              padding: '3rem 1.5rem',
              textAlign: 'center',
              cursor: images.length >= 5 ? 'not-allowed' : 'pointer',
              opacity: images.length >= 5 ? 0.5 : 1,
              background: 'var(--accent-light)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (images.length < 5)
                (e.currentTarget as HTMLElement).style.background = 'var(--divider)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--accent-light)';
            }}
          >
            <Upload size={36} style={{ margin: '0 auto 16px', color: 'var(--accent-primary)', opacity: 0.8 }} />
            <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              {images.length >= 5 ? 'Maximum images reached' : 'Drop images here or click to browse'}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 500 }}>
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
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden group shadow-sm"
                  style={{ borderRadius: 16, border: '1px solid var(--divider)' }}
                >
                  <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-md"
                    style={{ background: 'rgba(255,255,255,0.9)', color: '#ef4444' }}
                    id={`remove-img-${i}`}
                  >
                    <X size={16} />
                  </button>
                  {i === 0 && (
                    <div
                      className="absolute bottom-2 left-2 text-[0.7rem] px-2.5 py-0.5 rounded-full"
                      style={{ background: 'var(--accent-primary)', color: '#ffffff', fontWeight: 800 }}
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
              background: 'var(--bg-color)',
              border: '1px solid var(--divider)',
              borderRadius: 20,
              padding: '1.5rem',
            }}
          >
            <p style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Report Summary
            </p>
            {[
              { label: 'Type', value: status, style: { color: status === 'Lost' ? '#ef4444' : 'var(--accent-primary)' } },
              { label: 'Title', value: title },
              { label: 'Category', value: category },
              { label: 'Location', value: locationName },
              { label: 'Photos', value: `${images.length} attached` },
            ].map(({ label, value, style }) => (
              <div key={label} className="flex justify-between text-sm mb-2.5">
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
                <span className="font-bold text-[var(--text-primary)] truncate max-w-[200px]" style={style}>{value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={prevStep} className="px-6 py-4 rounded-2xl font-bold border flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5" style={{ color: 'var(--text-secondary)', borderColor: 'var(--divider)' }} id="step3-back">
              <ChevronLeft size={20} className="mr-1" /> Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex-1 py-4 text-lg font-bold rounded-2xl shadow-md"
              id="submit-report"
            >
              {submitting ? (
                <><Loader2 size={20} className="animate-spin mr-2" /> Submitting...</>
              ) : (
                <><FileText size={20} className="mr-2" /> Submit Report</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportItemPage;
