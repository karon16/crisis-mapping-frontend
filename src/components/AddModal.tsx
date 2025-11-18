import React from 'react';
import {XMarkIcon} from '@heroicons/react/24/solid';

interface AddModalProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose: () => void; 
}

const AddModal: React.FC<AddModalProps> = ({ onClose, ...rest }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ">
      <div
        className={`relative flex flex-col w-full max-w-lg h-auto p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl `}
        {...rest}
      >
        <XMarkIcon
          className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 absolute top-4 right-4 cursor-pointer"
          onClick={onClose}
        />
        <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Report a Disaster</h2>

        <div className="grow text-gray-600 dark:text-gray-300 mb-6">
          <p>Form to add event</p>
        </div>
      </div>
    </div>
  );
};

export default AddModal;
