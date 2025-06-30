import React, { useState } from 'react';
import { isDebug, startLogCapture, stopLogCapture, downloadCapturedLogs } from '@/lib/debug';

const DebugCaptureButton: React.FC = () => {
  const [capturing, setCapturing] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  if (!isDebug()) return null;

  const toggleCapture = () => {
    if (capturing) {
      stopLogCapture();
      setFilter(null);
    } else {
      const input = prompt('Filter string to capture (leave empty for all logs):', filter || '');
      const newFilter = input ? input.trim() : null;
      setFilter(newFilter);
      startLogCapture(newFilter);
    }
    setCapturing(prev => !prev);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-3 select-none">
      <button
        onClick={toggleCapture}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl font-bold transition-colors ${capturing ? 'bg-red-600 hover:bg-red-500' : 'bg-yellow-600 hover:bg-yellow-500'} text-white`}
        title={capturing ? 'Stop capture' : 'Start capture'}
      >
        {capturing ? '⏹' : '◉'}
      </button>
      {capturing && (
        <button
          onClick={downloadCapturedLogs}
          className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl font-bold bg-green-600 hover:bg-green-500 text-white"
          title="Download logs"
        >
          ⬇
        </button>
      )}
      {capturing && (
        <div className="text-xs text-white text-center mt-1 max-w-[8rem] break-all opacity-80">
          {filter ? `filter: ${filter}` : 'ALL'}
        </div>
      )}
    </div>
  );
};

export default DebugCaptureButton; 