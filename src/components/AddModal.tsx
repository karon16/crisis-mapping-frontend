import React, { useState, useRef, useCallback, Children } from 'react';
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
      className="fixed inset-0 z-50 flex items-center justify-center  bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalContentRef}
        className="border border-neutral-800 relative flex flex-col w-full max-w-2xl max-h-[90vh] p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl"
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Report a Disaster</h2>
          <XMarkIcon
            className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
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
