
import React from 'react';

// Calcoli per schermo 16:9
export const useScreenCalculations = () => {
  // Assumiamo una risoluzione base di 1920x1080 (16:9)
  const baseWidth = 1920;
  const baseHeight = 1080;
  
  // Calcoli per le zone del campo da gioco
  const calculations = {
    // Dimensioni delle carte
    cardWidth: Math.floor(baseWidth * 0.06), // 115px circa
    cardHeight: Math.floor(baseHeight * 0.13), // 140px circa
    
    // Posizioni delle zone principali
    fieldZones: {
      // Zona mostri superiore (campo avversario)
      enemyMonsters: {
        x: Math.floor(baseWidth * 0.25), // 25% da sinistra
        y: Math.floor(baseHeight * 0.15), // 15% dall'alto
        width: Math.floor(baseWidth * 0.5), // 50% della larghezza
        height: Math.floor(baseHeight * 0.15) // 15% dell'altezza
      },
      
      // Zona magie/trappole superiore
      enemySpells: {
        x: Math.floor(baseWidth * 0.25),
        y: Math.floor(baseHeight * 0.32),
        width: Math.floor(baseWidth * 0.5),
        height: Math.floor(baseHeight * 0.13)
      },
      
      // Campo magico centrale
      fieldSpells: {
        x: Math.floor(baseWidth * 0.42),
        y: Math.floor(baseHeight * 0.47),
        width: Math.floor(baseWidth * 0.16),
        height: Math.floor(baseHeight * 0.06)
      },
      
      // Zona magie/trappole inferiore
      playerSpells: {
        x: Math.floor(baseWidth * 0.25),
        y: Math.floor(baseHeight * 0.55),
        width: Math.floor(baseWidth * 0.5),
        height: Math.floor(baseHeight * 0.13)
      },
      
      // Zona mostri inferiore (campo giocatore)
      playerMonsters: {
        x: Math.floor(baseWidth * 0.25),
        y: Math.floor(baseHeight * 0.70),
        width: Math.floor(baseWidth * 0.5),
        height: Math.floor(baseHeight * 0.15)
      }
    },
    
    // Zone laterali
    sideZones: {
      // Lato sinistro
      leftSide: {
        deck: { x: Math.floor(baseWidth * 0.02), y: Math.floor(baseHeight * 0.75) },
        graveyard: { x: Math.floor(baseWidth * 0.02), y: Math.floor(baseHeight * 0.60) },
        banished: { x: Math.floor(baseWidth * 0.02), y: Math.floor(baseHeight * 0.45) },
        extraDeck: { x: Math.floor(baseWidth * 0.02), y: Math.floor(baseHeight * 0.30) }
      },
      
      // Lato destro
      rightSide: {
        enemyGraveyard: { x: Math.floor(baseWidth * 0.88), y: Math.floor(baseHeight * 0.30) },
        enemyBanished: { x: Math.floor(baseWidth * 0.88), y: Math.floor(baseHeight * 0.45) },
        playerBanishedFD: { x: Math.floor(baseWidth * 0.88), y: Math.floor(baseHeight * 0.60) },
        enemyBanishedFD: { x: Math.floor(baseWidth * 0.88), y: Math.floor(baseHeight * 0.15) }
      }
    },
    
    // Mani
    hands: {
      playerHand: {
        x: Math.floor(baseWidth * 0.1),
        y: Math.floor(baseHeight * 0.88),
        width: Math.floor(baseWidth * 0.8),
        height: Math.floor(baseHeight * 0.1)
      },
      
      enemyHand: {
        x: Math.floor(baseWidth * 0.1),
        y: Math.floor(baseHeight * 0.02),
        width: Math.floor(baseWidth * 0.8),
        height: Math.floor(baseHeight * 0.08)
      }
    }
  };
  
  return calculations;
};

export default useScreenCalculations;
