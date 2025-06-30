/**
 * Mappatura delle colonne Excel ai campi delle carte.
 * Ogni chiave rappresenta un campo della carta, e il valore è un array di possibili nomi di colonna.
 */
export const EXCEL_COLUMN_MAPPING: Record<string, string[]> = {
  name: ['Name', 'name', 'Nome'],
  attribute: ['Attribute', 'attribute', 'Attributo'],
  star: ['Star', 'star', 'Stelle', 'Level'],
  spell_trap: ['Spell/Trap', 'spell/trap', 'Magia/Trappola'],
  icon: ['Icon', 'icon', 'Icona'],
  art_link: ['Art Link', 'art_link', 'Link Arte', 'Image'],
  type_ability: ['Type Ability', 'type_ability', 'Type', 'Tipo Abilità'],
  effect: ['Effect', 'effect', 'Effetto'],
  atk: ['ATK', 'atk', 'Attack'],
  def: ['DEF', 'def', 'Defense'],
  final_card_art: ['Final Card Art', 'final_card_art', 'Final Art', 'final_art_link', 'Final Card'],
  id: ['ID', 'id', 'Id', 'Card ID']
};

/**
 * Parole chiave per identificare le carte dell'Extra Deck.
 */
export const EXTRA_DECK_KEYWORDS = ['equilibrium', 'chaos', 'synchro', 'xyz']; 