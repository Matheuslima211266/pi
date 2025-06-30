import React, { useState, useRef, useEffect } from 'react';
import ResponsiveGameBoard from '@/components/ResponsiveGameBoard';
import GameSidebar from '@/components/GameSidebar';
import CardPreview from '@/components/CardPreview';
import PlayerToolsPanel from '@/components/PlayerToolsPanel';
import PlayerHand from '@/components/PlayerHand';
import RightSidebar from '@/components/RightSidebar';
import PlacementMenu from './PlacementMenu';
import ZoneActionMenu from './ZoneActionMenu';
import ZoneExpansionModal from './ZoneExpansionModal';
import { useZoneClickHandler } from './ZoneClickHandler';
import { usePlacementMenu } from '../contexts/PlacementMenuContext';
import { SIDEBAR_WIDTH_PX, PREVIEW_OFFSET_PX, BOARD_MIN_SCALE, BOARD_SCALE_INC, FIELD_SIDEBAR_GAP_PX, applyDimensionCssVars, LAYOUT_VERTICAL_MARGIN_PX } from '@/config/dimensions';

interface GameLayoutProps {
  gameData: any;
  gameState: any;
  handlers: any;
  firebaseHook: any;
}

const GameLayout = ({ gameData, gameState, handlers, firebaseHook }: GameLayoutProps) => {
  const [sidebarPosition, setSidebarPosition] = useState<'bottom' | 'side'>('side');
  const [expandedZone, setExpandedZone] = useState(null);
  const [zoneActionMenu, setZoneActionMenu] = useState(null);
  
  const { placementMenu, closePlacementMenu } = usePlacementMenu();

  // Dynamic scale to fit the whole field (board + hand) vertically in viewport
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const [boardScale, setBoardScale] = useState(1);

  const isHost = Boolean(gameState.gameData?.isHost);

  useEffect(() => {
    const resize = () => {
      if (!fieldRef.current) return;
      const elem = fieldRef.current;
      const { offsetHeight: h, offsetWidth: w } = elem;

      const availableH = window.innerHeight - LAYOUT_VERTICAL_MARGIN_PX; // top/bottom margin
      const sidebarW = SIDEBAR_WIDTH_PX;
      const previewW = window.innerWidth >= 1280 ? PREVIEW_OFFSET_PX : 0;
      const availableW = window.innerWidth - sidebarW - previewW - LAYOUT_VERTICAL_MARGIN_PX;

      const scaleH = h > 0 ? Math.min(1, availableH / h) : 1;
      const scaleW = w > 0 ? Math.min(1, availableW / w) : 1;
      const base = Math.min(scaleH, scaleW) * BOARD_SCALE_INC;
      const scale = Math.max(BOARD_MIN_SCALE, Math.min(1, base));
      setBoardScale(scale);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  console.log('🎮 GameLayout render:', {
    playerHandSize: gameState.playerHand?.length || 0,
    playerDeckSize: gameState.playerDeck?.length || 0,
    enemyDeckSize: gameState.enemyDeck?.length || 0,
    actionLogSize: gameState.actionLog?.length || 0,
    turnOrder: gameState.turnOrder,
    bothPlayersReady: gameState.bothPlayersReady,
    playerReady: gameState.playerReady,
    isHost: gameState.gameData?.isHost,
    gameId: gameState.gameData?.gameId
  });

  const {
    zoneActionMenu: zoneActionMenuFromHandler,
    setZoneActionMenu: setZoneActionMenuFromHandler,
    expandedZone: expandedZoneFromHandler,
    setExpandedZone: setExpandedZoneFromHandler,
    handleZoneClick,
    handleZoneAction
  } = useZoneClickHandler({
    isEnemy: false,
    onDrawCard: () => handlers.handleDrawCard(true),
    onDeckMill: (count) => handlers.handleDeckMill(count, true)
  });

  // Apply CSS variables once on mount
  useEffect(() => {
    applyDimensionCssVars();
  }, []);

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-row relative">
      {/* l'overlay principale è gestito sotto; la logica per scegliere il mini-game è affidata a un effect */}

      {/* Prompt disabilitato: ordine turno risolto in lobby */}

      {/* Campo e tools centrali */}
      <div style={{paddingRight: SIDEBAR_WIDTH_PX + FIELD_SIDEBAR_GAP_PX}} className="flex-1 flex flex-col pl-4 xl:pl-96 justify-start">
        {/* Campo completo (campo + mano) con scala dinamica */}
        <div
          ref={fieldRef}
          className="w-full flex flex-col items-end"
          style={{ transform: `scale(${boardScale})`, transformOrigin: 'top right', transition: 'transform 0.2s ease' }}
        >
          {/* Campo avversario / player + tools */}
          <ResponsiveGameBoard
            playerField={gameState.playerField}
            enemyField={gameState.enemyField}
            playerHand={gameState.playerHand}
            enemyHandCount={gameState.enemyHandCount}
            enemyRevealedCard={gameState.enemyRevealedCard}
            enemyRevealedHand={gameState.enemyRevealedHand}
            onAttack={handlers.handleAttack}
            onCardPlace={handlers.handleCardPlace}
            selectedCardFromHand={gameState.selectedCardFromHand}
            onCardPreview={handlers.handleCardPreview}
            onCardMove={handlers.handleCardMove}
            onDrawCard={() => handlers.handleDrawCard(true)}
            onDeckMill={(count) => handlers.handleDeckMill(count, true)}
            setSelectedCardFromHand={handlers.handleHandCardSelect}
            enemyLifePoints={gameState.enemyLifePoints}
            playerLifePoints={gameState.playerLifePoints}
            onLifePointsChange={handlers.handleLifePointsChange}
            currentPhase={gameState.currentPhase}
            onPhaseChange={handlers.handlePhaseChange}
            onEndTurn={handlers.handleEndTurn}
            isPlayerTurn={gameState.isPlayerTurn}
            onCreateToken={handlers.handleCreateToken}
            onDealDamage={handlers.handleDealDamage}
            currentTurnPlayerId={gameState.currentTurnPlayerId}
            myPlayerId={firebaseHook.user?.uid}
          />

          {/* Mano player */}
          <div className="w-full flex flex-row justify-center mt-0">
            <PlayerHand
              cards={gameState.playerHand}
              onPlayCard={handlers.handleHandCardSelect}
              isPlayerTurn={gameState.isPlayerTurn}
              onCardPreview={handlers.handleCardPreview}
              onCardMove={handlers.handleCardMove}
              onShowCard={() => {}}
              onShowHand={() => {}}
              selectedCardFromHand={gameState.selectedCardFromHand}
            />
          </div>
        </div>
        {/* Menu di piazzamento */}
        <PlacementMenu
          placementMenu={placementMenu}
          onPlacementChoice={(choice) => {
            console.log('🎯 [DEBUG] GameLayout - Placement choice made', choice);
            if (placementMenu && gameState.selectedCardFromHand) {
              const { zoneName, slotIndex } = placementMenu;
              const card = gameState.selectedCardFromHand;
              
              if (zoneName === 'monsters') {
                if (choice === 'attack') {
                  handlers.handleCardPlace(card, zoneName, slotIndex, false, 'attack');
                } else if (choice === 'defense') {
                  handlers.handleCardPlace(card, zoneName, slotIndex, false, 'defense');
                } else if (choice === 'facedown') {
                  handlers.handleCardPlace(card, zoneName, slotIndex, true, 'defense');
                }
              } else if (zoneName === 'spellsTraps') {
                if (choice === 'activate') {
                  handlers.handleCardPlace(card, zoneName, slotIndex, false);
                } else if (choice === 'set') {
                  handlers.handleCardPlace(card, zoneName, slotIndex, true);
                }
              } else if (zoneName === 'fieldSpell') {
                if (choice === 'activate') {
                  handlers.handleCardPlace(card, zoneName, 0, false);
                } else {
                  handlers.handleCardPlace(card, zoneName, 0, false);
                }
              }
              
              // Clear selected card and placement menu
              handlers.handleHandCardSelect(null);
              closePlacementMenu();
            }
          }}
          onClose={() => {
            console.log('🎯 [DEBUG] GameLayout - Closing placement menu');
            closePlacementMenu();
          }}
        />
      </div>
      {/* Sidebar destra: chat + action history */}
      <RightSidebar
        chatMessages={gameState.chatMessages}
        actionLog={gameState.actionLog}
        onSendMessage={handlers.handleSendMessage}
        onDiceRoll={handlers.handleDiceRoll}
        onCoinFlip={handlers.handleCoinFlip}
      />
      {/* Card Preview */}
      {gameState.previewCard && (
        <CardPreview
          card={gameState.previewCard}
          onClose={() => handlers.handleCardPreview(null)}
        />
      )}
    </div>
  );
};

export default GameLayout;
