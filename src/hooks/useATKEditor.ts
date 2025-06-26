
import { useState } from 'react';

export const useATKEditor = (card: any, onFieldCardAction: any, zoneName: string, slotIndex: number) => {
  const [showEditATK, setShowEditATK] = useState(false);
  const [newATK, setNewATK] = useState(card?.atk || 0);

  const openATKEditor = () => {
    setNewATK(card?.atk || 0);
    setShowEditATK(true);
  };

  const handleEditATK = () => {
    if (newATK !== card.atk) {
      const updatedCard = { ...card, atk: newATK };
      onFieldCardAction('updateATK', updatedCard, zoneName, slotIndex);
    }
    setShowEditATK(false);
  };

  const closeATKEditor = () => {
    setShowEditATK(false);
  };

  return {
    showEditATK,
    newATK,
    setNewATK,
    openATKEditor,
    handleEditATK,
    closeATKEditor
  };
};
