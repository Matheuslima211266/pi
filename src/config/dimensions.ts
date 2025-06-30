// File created
// Centralised dimension constants for easy tweaking.
// Modify values here to affect sizing across the app.

/*
  SIDEBAR_WIDTH_PX  → larghezza sidebar destra (chat + action history).
  PREVIEW_OFFSET_PX → spazio riservato alla Card Preview in layout XL.
  BOARD_MIN_SCALE   → fattore minimo di scala del campo quando lo spazio è ridotto.
  BOARD_SCALE_INC   → moltiplicatore per aumentare la scala di default (es. 1.1 = +10%).
*/

// === LAYOUT GLOBALI ===

/** Larghezza (in pixel) della sidebar destra che contiene Chat, Action History e Tool buttons.  
 *  Riduci per dare più spazio al campo oppure aumenta per un pannello più largo. */
export const SIDEBAR_WIDTH_PX = 224;

/** Spazio (in pixel) tenuto libero a sinistra per il pannello di CardPreview.  
 *  Viene applicato solo su viewport ≥ 1280 px.   
 *  Porta a 0 se non vuoi lasciare margine per la preview. */
export const PREVIEW_OFFSET_PX = 384;

/** Fattore di scala minimo del board quando lo spazio verticale/orizzontale è poco.  
 *  Il campo non verrà mai ridotto oltre questo valore. */
export const BOARD_MIN_SCALE   = 0.6;

/** Moltiplicatore di scala rispetto al valore calcolato in base allo spazio disponibile.  
 *  1   = nessun incremento, 1.1 = +10 %, 0.9 = −10 %. */
export const BOARD_SCALE_INC   = 1.1;

// === SPAZIATURE ===

/** Gap orizzontale/verticale fra gli slot del campo (px).  
 *  Usato per `.player-zone` e `.opponent-zone`. */
export const SLOT_GAP_PX       = 12;

/** Padding verticale del contenitore `.board-column` (px).  */
export const BOARD_PADDING_Y   = 12;

// === TOOLBAR ===

/** Larghezza massima (px) della barra centrale di turni / life-points. */
export const TOOLBAR_MAX_W_PX  = 740;

// === SLOT ===

/** Aspect ratio degli slot (es. '5/7' = 5 : 7).  
 *  Non cambia direttamente il layout, ma può essere usato in CSS. */
export const SLOT_ASPECT_RATIO = '6/9';

/** Larghezza (in px) di uno slot vuoto nel campo. */
export const EMPTY_SLOT_WIDTH_PX = 64; // w-16 = 4rem = 64px

/** Dimensione (in px) delle icone negli slot vuoti (es. Deck, Dead). */
export const EMPTY_SLOT_ICON_SIZE_PX = 12;

/** Margine verticale (in px) per il calcolo della scala del campo in GameLayout. */
export const LAYOUT_VERTICAL_MARGIN_PX = 20;

/** Gap (in px) tra le zone del campo (es. tra Mostri e Magie/Trappole). */
export const FIELD_ZONE_GAP_PX = 2;

// === REGOLE DI GIOCO ===

/** Numero minimo di carte nel Main Deck. */
export const MIN_MAIN_DECK_SIZE = 40;

/** Numero massimo di carte nel Main Deck. */
export const MAX_MAIN_DECK_SIZE = 60;

/** Numero massimo di carte nell'Extra Deck. */
export const MAX_EXTRA_DECK_SIZE = 15;

/** Numero massimo di copie della stessa carta in un deck. */
export const MAX_CARD_COPIES = 3;

/** Life points iniziali. */
export const INITIAL_LIFE_POINTS = 8000;

/** Numero di carte iniziali in mano. */
export const INITIAL_HAND_SIZE = 5;

/** Limite di evocazioni per turno. */
export const SUMMON_LIMIT_PER_TURN = 5;

/** Tempo (in secondi) per ogni turno. */
export const TURN_TIMER_SECONDS = 60;

/** Valori per i pulsanti di regolazione dei Life Points. */
export const LP_ADJUSTMENT_VALUES = [-1000, -500, -100, -50, 50, 100, 500, 1000];

/** Numero di slot disponibili per salvare i deck. */
export const DECK_SLOT_COUNT = 10;

/** Numero massimo di slot per i mostri. */
export const MAX_MONSTER_SLOTS = 5;

/** Numero massimo di slot per le magie/trappole. */
export const MAX_SPELL_TRAP_SLOTS = 5;

// === CARD ===

/** Larghezza carta in mano (px). */
export const CARD_HAND_WIDTH_PX = 80; // w-20

/** Altezza carta in mano (px). */
export const CARD_HAND_HEIGHT_PX = 112; // h-28

/** Altezza immagine carta in mano (px). */
export const CARD_HAND_IMAGE_HEIGHT_PX = 64; // h-16

/** Larghezza carta piccola (es. nel campo) (px). */
export const CARD_SMALL_WIDTH_PX = 96; // w-24

/** Altezza carta piccola (es. nel campo) (px). */
export const CARD_SMALL_HEIGHT_PX = 144; // h-36

/** Altezza immagine carta piccola (px). */
export const CARD_SMALL_IMAGE_HEIGHT_PX = 80; // h-20

/** Altezza immagine carta sul campo (in percentuale). */
export const CARD_FIELD_IMAGE_HEIGHT_PERC = '60%';

/** Angolo di rotazione per carte in posizione di difesa (gradi). */
export const CARD_DEFENSE_ROTATION_DEG = 90;

/** Angolo di rotazione per le carte dell'avversario (gradi). */
export const CARD_ENEMY_ROTATION_DEG = 180;

/** Spessore del bordo delle carte (px). */
export const CARD_BORDER_WIDTH_PX = 3;

/** Font size per il livello delle stelle (in mano). */
export const CARD_STARS_FONT_SIZE_HAND_PX = 8;

/** Font size per il livello delle stelle (piccola). */
export const CARD_STARS_FONT_SIZE_SMALL_PX = 10;

/** Font size per il livello delle stelle (normale). */
export const CARD_STARS_FONT_SIZE_NORMAL_PX = 14;

// === CARD PREVIEW ===

/** Larghezza del pannello di anteprima della carta (px). */
export const PREVIEW_WIDTH_PX = 384; // w-96

/** Altezza dell'immagine della carta nell'anteprima (px). */
export const PREVIEW_IMAGE_HEIGHT_PX = 288; // h-72

/** Altezza massima del box dell'effetto nell'anteprima (px). */
export const PREVIEW_EFFECT_MAX_HEIGHT_PX = 192; // max-h-48

// === MODAL / ZONE MANAGER ===

/** Altezza combinata di header e footer del modal (px), per calcolare lo spazio del contenuto. */
export const MODAL_HEADER_FOOTER_HEIGHT_PX = 140;

/** Numero di colonne della griglia carte nella finestra Deck/Dead/Banish. */
export const MODAL_CARD_COLS = 4;

/** Moltiplicatore di scala per le miniature nel modal (1 = 72 px predefiniti). */
export const MODAL_CARD_SCALE = 1.5; // cambia a 1.25, 1.5 ... per ingrandire le miniature

/** Larghezza minima (px) di ogni mini-carta nella griglia modal. */
export const MODAL_CARD_SIZE_PX = 100;

/** Mostra solo immagine + nome nella griglia modal (nessun ATK/DEF). */
export const MODAL_IMAGE_ONLY = true;

/** Gap (px) tra le miniature nella griglia del modal. */
export const MODAL_CARD_GAP_PX = 8;

/** Percentuale larghezza (vw) del modal espanso (ZoneManager) rispetto allo schermo. */
export const MODAL_EXPANDED_WIDTH_PERC = 50; // 100 = full width, 80 = 80% etc.

/** Percentuale altezza (vh) del modal espanso (ZoneManager) rispetto allo schermo. */
export const MODAL_EXPANDED_HEIGHT_PERC = 90;

/** Posizione orizzontale dei modal ("center" | "left" | "right"). */
export const MODAL_POSITION: 'center' | 'left' | 'right' = 'center';

/** Spazio extra (px) tra il bordo destro del campo e la sidebar. */
export const FIELD_SIDEBAR_GAP_PX = 16;

// Utilità: applica le variabili CSS globali basate su questi valori
export const applyDimensionCssVars = () => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--slot-gap', `${SLOT_GAP_PX}px`);
  root.style.setProperty('--board-padding-y', `${BOARD_PADDING_Y}px`);
  root.style.setProperty('--sidebar-width', `${SIDEBAR_WIDTH_PX}px`);
  root.style.setProperty('--toolbar-max-w', `${TOOLBAR_MAX_W_PX}px`);
  root.style.setProperty('--slot-aspect', SLOT_ASPECT_RATIO);
  root.style.setProperty('--modal-card-gap', `${MODAL_CARD_GAP_PX}px`);
  root.style.setProperty('--field-zone-gap', `${FIELD_ZONE_GAP_PX}px`);
}; 