import React from 'react';
import ReactDOM from 'react-dom';
import { Shuffle, ArrowUp, Eye, Skull } from 'lucide-react';

const ZoneActionMenu = ({ zoneName, onAction, onClose, position }) => {
  const getMenuOptions = () => {
    switch (zoneName) {
      case 'deck':
        return [
          { key: 'draw', label: 'Pesca 1', icon: <ArrowUp size={16} /> },
          { key: 'mill', label: 'Mill 1', icon: <Skull size={16} /> },
          { key: 'mill3', label: 'Mill 3', icon: <Skull size={16} /> },
          { key: 'mill5', label: 'Mill 5', icon: <Skull size={16} /> },
          { key: 'shuffle', label: 'Mescola', icon: <Shuffle size={16} /> },
          { key: 'search', label: 'Cerca', icon: <Eye size={16} /> },
          { key: 'view', label: 'Visualizza', icon: <Eye size={16} /> }
        ];
      case 'extraDeck':
        return [
          { key: 'view', label: 'Visualizza', icon: <Eye size={16} /> },
          { key: 'search', label: 'Cerca', icon: <Eye size={16} /> }
        ];
      case 'deadZone':
        return [
          { key: 'view', label: 'Visualizza', icon: <Eye size={16} /> },
          { key: 'shuffle', label: 'Mescola nel Deck', icon: <Shuffle size={16} /> }
        ];
      case 'banished':
      case 'banishedFaceDown':
        return [
          { key: 'view', label: 'Visualizza', icon: <Eye size={16} /> }
        ];
      case 'fieldSpell':
        return [
          { key: 'view', label: 'Visualizza', icon: <Eye size={16} /> }
        ];
      default:
        return [
          { key: 'view', label: 'Visualizza', icon: <Eye size={16} /> }
        ];
    }
  };

  const options = getMenuOptions();
  if (options.length === 0) return null;

  const menu = (
    <>
      {/* Overlay to close menu on click outside */}
      <div
        className="fixed inset-0 z-[90]"
        onClick={onClose}
      />

      <div
        className="fixed z-[100] w-48 bg-gray-800 border border-gray-600 shadow-lg rounded-md p-2"
        style={{ left: position?.x, top: position?.y, transform: 'translate(-50%, -10px)' }}
      >
        <div className="text-sm font-semibold mb-2 text-white capitalize px-1">
          {zoneName} Actions
        </div>
        {options.map((opt) => (
          <div
            key={opt.key}
            onClick={() => onAction(opt.key)}
            className="flex items-center gap-2 px-2 py-1.5 text-sm text-white rounded hover:bg-gray-700 cursor-pointer"
          >
            <span>{opt.icon}</span>
            {opt.label}
          </div>
        ))}
        <div
          onClick={onClose}
          className="text-center mt-2 px-2 py-1.5 text-sm text-gray-300 rounded hover:bg-gray-700 cursor-pointer"
        >
          Cancel
        </div>
      </div>
    </>
  );

  return typeof document !== 'undefined' ? ReactDOM.createPortal(menu, document.body) : null;
};

export default ZoneActionMenu;
