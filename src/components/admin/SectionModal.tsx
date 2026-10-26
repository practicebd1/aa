import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Section } from '../../types';

interface SectionModalProps {
  isOpen: boolean;
  initialSection?: Section | null;
  defaultOrder?: number;
  onClose: () => void;
  onSave: (data: Partial<Section>) => Promise<void>;
}

export const SectionModal: React.FC<SectionModalProps> = ({
  isOpen,
  initialSection,
  defaultOrder = 1,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(defaultOrder);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSection) {
      setTitle(initialSection.title || '');
      setDescription(initialSection.description || '');
      setOrder(initialSection.order || defaultOrder);
    } else {
      setTitle('');
      setDescription('');
      setOrder(defaultOrder);
    }
    setError(null);
  }, [initialSection, isOpen, defaultOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Section title is required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave({
        title,
        description,
        order: Number(order) || 1
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save section.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <h3 className="font-heading font-bold text-base text-white">
            {initialSection ? 'Edit Curriculum Section' : 'Add New Section'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="px-6 py-2.5 bg-red-50 text-red-700 text-xs font-medium border-b border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 uppercase text-xs">
              Section Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Module 1: Core Fundamentals & Strategy"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 uppercase text-xs">
              Section Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief topic summary for students"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 uppercase text-xs">
              Display Position / Order
            </label>
            <input
              type="number"
              min="1"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white font-mono"
            />
          </div>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-xs tracking-wider shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialSection ? 'Update Section' : 'Create Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
