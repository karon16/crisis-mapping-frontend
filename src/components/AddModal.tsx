import React, { useRef, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface AddModalProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose: () => void;
}

const AddModal: React.FC<AddModalProps> = props => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
        props.onClose();
      }
    },
    [props.onClose]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'var(--t-overlay-light)' }}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalContentRef}
        className="border border-[var(--t-border)] relative flex flex-col w-full max-w-2xl max-h-[90vh] p-6 bg-[var(--t-bg-primary)] rounded-xl shadow-2xl theme-transition"
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-[var(--t-text-primary)]">Report a Disaster</h2>
          <XMarkIcon
            className="w-6 h-6 text-[var(--t-text-muted)] hover:text-[var(--t-text-primary)] cursor-pointer transition-colors"
            onClick={props.onClose}
          />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default AddModal;
