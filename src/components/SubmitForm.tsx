import {useEffect, useState, useRef} from 'react'

interface SubmitFormProps {
  onClose: () => void;
}

const SubmitForm = ({ onClose }: SubmitFormProps) => {
      const [reportText, setReportText] = useState('');
      const [locationString, setLocationString] = useState('');
      const [imageFiles, setImageFiles] = useState<FileList | null>(null);
      const [reportDate, setReportDate] = useState(new Date().toISOString().substring(0, 10));
    
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    
        onClose();
      };
  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-4">
        <div className="flex-grow space-y-6 pr-2 overflow-y-auto">
          <div className="flex gap-4">
            <div className="flex-1">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Location (Address/City):
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g., Houston, TX or Pohang University"
                value={locationString}
                onChange={e => setLocationString(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg bg-white dark:bg-neutral-800 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
            <div className="w-1/3">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Date of Event:
              </label>
              <input
                id="date"
                type="date"
                value={reportDate}
                onChange={e => setReportDate(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg bg-white dark:bg-neutral-800 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Location on Map:
            </label>
            <div className="h-48 bg-gray-200 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
              [Mapbox Component to drop pin goes here]
            </div>
          </div>
          <div>
            <label
              htmlFor="reportText"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description / Report Text:
            </label>
            <textarea
              id="reportText"
              rows={4}
              placeholder="Describe the disaster and needs (e.g., 'Flooding in my street, need help evacuating.')"
              value={reportText}
              onChange={e => setReportText(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg bg-white dark:bg-neutral-800 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 resize-none"
            />
          </div>
          <div>
            <label
              htmlFor="imageFiles"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Image Upload (Visual Evidence - Multiple Allowed):
            </label>
            <input
              id="imageFiles"
              type="file"
              accept="image/*"
              multiple
              onChange={e => setImageFiles(e.target.files)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg bg-white dark:bg-neutral-800 dark:border-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            className="w-full px-4 py-3 bg-fuchsia-600 text-white rounded-lg font-bold hover:bg-fuchsia-700 transition-colors shadow-md"
          >
            Submit Report for AI Classification
          </button>
        </div>
      </form>
    </>
  );
}

export default SubmitForm