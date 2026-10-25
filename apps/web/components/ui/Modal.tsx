import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-txt-primary/30 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div
        className={`relative w-full ${maxWidth} bg-bg-surface border border-border rounded-card p-6 z-10 max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-txt-primary">{title}</h3>
            {description && <p className="text-sm text-txt-muted mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-txt-muted hover:text-txt-primary hover:bg-bg-accentSoft rounded-element min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
