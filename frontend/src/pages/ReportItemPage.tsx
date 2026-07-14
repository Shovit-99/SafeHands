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

const STATUSES: { value: ItemStatus; label: string; color: string }[] = [
  { value: 'Lost', label: '🔴 Lost', color: 'border-red-500/50 bg-red-500/10 text-red-300' },
  { value: 'Found', label: '🟢 Found', color: 'border-green-500/50 bg-green-500/10 text-green-300' },
];

// ─── Map click handler sub-component ─────────────────────────────────────────
interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// ─── Step indicators ──────────────────────────────────────────────────────────
const STEPS = ['Details', 'Location', 'Photos'];

const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {STEPS.map((label, i) => (
      <React.Fragment key={label}>
        <div className="flex flex-col items-center">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
              i < current
                ? 'bg-gradient-to-br from-blue-500 to-violet-600 border-transparent text-white'
                : i === current
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-white/10 text-slate-600 bg-white/3'
            }`}
          >
            {i < current ? <CheckCircle2 size={16} /> : i + 1}
          </div>
          <span
            className={`text-xs mt-1.5 font-medium ${
              i <= current ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div
            className={`w-16 h-px mb-5 mx-1 transition-all duration-500 ${
              i < current ? 'bg-blue-500' : 'bg-white/10'
            }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ReportItemPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 — Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory | ''>('');
  const [status, setStatus] = useState<ItemStatus>('Lost');

  // Step 2 — Location
  const [locationName, setLocationName] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Step 3 — Images
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // ─── Step 1 Validation ──────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    if (!title.trim() || title.trim().length < 3) {
      toast.error('Title must be at least 3 characters.');
      return false;
    }
    if (!description.trim() || description.trim().length < 10) {
      toast.error('Description must be at least 10 characters.');
      return false;
    }
    if (!category) {
      toast.error('Please select a category.');
      return false;
    }
    return true;
  };

  // ─── Step 2 Validation ──────────────────────────────────────────────────
  const validateStep2 = (): boolean => {
    if (!locationName.trim()) {
      toast.error('Please enter a location name.');
      return false;
    }
    if (!coords) {
      toast.error('Please click on the map to pin the location.');
      return false;
    }
    return true;
  };

  // ─── Navigation ─────────────────────────────────────────────────────────
  const nextStep = () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  // ─── Image Handling ──────────────────────────────────────────────────────
  const handleImageAdd = useCallback((files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - images.length;
    if (remaining <= 0) {
      toast.error('Maximum 5 images allowed.');
      return;
    }
    const newFiles = Array.from(files).slice(0, remaining).filter(
      (f) => f.type.startsWith('image/')
    );
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

  // ─── Submit ──────────────────────────────────────────────────────────────
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
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to submit report.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 page-container py-10 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">Report an Item</h1>
        <p className="text-slate-400 text-sm">
          Help reunite lost items with their owners.
        </p>
      </div>

      <StepIndicator current={step} />

      {/* ─── Step 0: Details ─────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="glass-card p-8 space-y-6 animate-fadeIn">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Tag size={16} />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Item Details
            </span>
          </div>

          {/* Status selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Item Type
            </label>
            <div className="flex gap-3">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    status === s.value
                      ? s.color
                      : 'border-white/10 bg-white/3 text-slate-500 hover:border-white/20'
                  }`}
                  id={`status-${s.value}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title <span className="text-red-400">*</span>
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
            <div className="text-right text-xs text-slate-600 mt-1">{title.length}/120</div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    category === c
                      ? 'border-blue-500/60 bg-blue-500/15 text-blue-300'
                      : 'border-white/8 bg-white/3 text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                  id={`cat-${c}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description <span className="text-red-400">*</span>
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
            <div className="text-right text-xs text-slate-600 mt-1">{description.length}/1000</div>
          </div>

          <button
            type="button"
            onClick={nextStep}
            className="btn-primary w-full py-3"
            id="step1-next"
          >
            Next: Location <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ─── Step 1: Location ────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="glass-card p-8 space-y-6 animate-fadeIn">
          <div className="flex items-center gap-2 text-violet-400 mb-2">
            <Navigation size={16} />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Location
            </span>
          </div>

          {/* Location name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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

          {/* Map */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Pin on Map <span className="text-red-400">*</span>
              <span className="ml-2 text-xs text-slate-500 font-normal">
                (click anywhere to place marker)
              </span>
            </label>
            <div className="rounded-xl overflow-hidden border border-white/10" style={{ height: '320px' }}>
              <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler
                  onMapClick={(lat, lng) => setCoords({ lat, lng })}
                />
                {coords && <Marker position={[coords.lat, coords.lng]} />}
              </MapContainer>
            </div>
            {coords ? (
              <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                <CheckCircle2 size={12} />
                Pinned at {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-2">No location pinned yet.</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={prevStep}
              className="btn-secondary flex-1 py-3"
              id="step2-back"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary flex-1 py-3"
              id="step2-next"
            >
              Next: Photos <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Photos ──────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="glass-card p-8 space-y-6 animate-fadeIn">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <ImagePlus size={16} />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Photos
            </span>
            <span className="ml-auto text-xs text-slate-500">{images.length}/5</span>
          </div>

          {/* Upload zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              images.length >= 5
                ? 'border-white/5 opacity-40 cursor-not-allowed'
                : 'border-white/15 hover:border-blue-500/40 hover:bg-blue-500/5'
            }`}
            onClick={() => images.length < 5 && fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            id="image-dropzone"
          >
            <Upload size={32} className="mx-auto mb-3 text-slate-500" />
            <p className="text-sm text-slate-400 font-medium">
              {images.length >= 5
                ? 'Maximum images reached'
                : 'Drop images here or click to browse'}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              JPEG, PNG, WebP — max 5MB each — up to 5 images
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

          {/* Preview grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group"
                >
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                    id={`remove-img-${i}`}
                  >
                    <X size={12} />
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-2 left-2 text-xs bg-blue-500/80 text-white px-2 py-0.5 rounded-full">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Summary card */}
          <div className="glass-card p-4 space-y-2 text-sm">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Report Summary
            </p>
            <div className="flex justify-between">
              <span className="text-slate-500">Type</span>
              <span className={`font-medium ${status === 'Lost' ? 'text-red-300' : 'text-green-300'}`}>
                {status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Title</span>
              <span className="text-white font-medium truncate max-w-[200px]">{title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category</span>
              <span className="text-white">{category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Location</span>
              <span className="text-white truncate max-w-[200px]">{locationName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Photos</span>
              <span className="text-white">{images.length} attached</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={prevStep}
              className="btn-secondary flex-1 py-3"
              id="step3-back"
            >
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
