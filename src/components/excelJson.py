#!/usr/bin/env python3
"""
Convertitore Excel to JSON per Carte
Converte tutti i file Excel in una cartella e sottocartelle nel formato JSON richiesto
"""

# ============================================================================
# CONFIGURAZIONE PATH E IMPOSTAZIONI
# ============================================================================

# Directory di default
DEFAULT_INPUT_DIR = None  # Directory corrente
DEFAULT_OUTPUT_DIR = None  # Stessa directory del file di input (se None)

# Estensioni file Excel supportate
EXCEL_EXTENSIONS = {'.xlsx', '.xls', '.xlsm'}

# Mapping colonne Excel -> Campi JSON
COLUMN_MAPPING = {
    'name': ['Name', 'name', 'Nome'],
    'attribute': ['Attribute', 'attribute', 'Attributo'],
    'star': ['Star', 'star', 'Stelle', 'Level'],
    'spell_trap': ['Spell/Trap', 'spell/trap', 'Magia/Trappola'],
    'icon': ['Icon', 'icon', 'Icona'],
    'art_link': ['Art Link', 'art_link', 'Link Arte', 'Image'],
    'type_ability': ['Type Ability', 'type_ability', 'Type', 'Tipo Abilità'],
    'effect': ['Effect', 'effect', 'Effetto'],
    'atk': ['ATK', 'atk', 'Attack'],
    'def': ['DEF', 'def', 'Defense'],
    'final_card_art': ['Final Card Art', 'final_card_art', 'Final Art', 'final_art_link', 'Final Card'],
    'id': ['ID', 'id', 'Id', 'Card ID']
}

# Parole chiave per identificare carte da Extra Deck
EXTRA_DECK_KEYWORDS = ['equilibrium', 'chaos', 'synchro', 'xyz']

# Valori di default
DEFAULT_ICON = 'NO ICON'

# Impostazioni di output JSON
JSON_INDENT = 2
JSON_ENSURE_ASCII = False

# ============================================================================
# FINE CONFIGURAZIONE
# ============================================================================

import pandas as pd
import json
import os
import sys
from pathlib import Path
import argparse
from typing import Dict, List, Any, cast

def determine_card_type(spell_trap_value: Any) -> str:
    """Determina il tipo di carta basandosi sul valore Spell/Trap"""
    if pd.isna(spell_trap_value):
        return "monster"
    
    spell_trap_str = str(spell_trap_value).lower()
    if "spell" in spell_trap_str or "magia" in spell_trap_str:
        return "spell"
    elif "trap" in spell_trap_str or "trappola" in spell_trap_str:
        return "trap"
    else:
        return "monster"

def determine_extra_deck(type_ability: Any) -> int:
    """Determina se la carta è da Extra Deck basandosi su Type Ability"""
    if pd.isna(type_ability):
        return 0
    
    type_ability_str = str(type_ability).lower()
    
    for keyword in EXTRA_DECK_KEYWORDS:
        if keyword in type_ability_str:
            return 1
    
    return 0

def normalize_stat(stat_value: Any) -> int:
    """Normalizza ATK/DEF: se >= 100 divide per 100, altrimenti restituisce il valore intero originale oppure 0."""
    if pd.isna(stat_value):
        return 0
    try:
        val = int(stat_value)
        if val >= 100:
            val //= 100
        return val
    except (ValueError, TypeError):
        return 0

def convert_excel_to_json(excel_path: Path, output_path: Path = None) -> bool:
    """
    Converte un file Excel nel formato JSON richiesto
    
    Args:
        excel_path: Percorso del file Excel
        output_path: Percorso di output (opzionale, default: stesso nome con .json)
        
    Returns:
        bool: True se la conversione è riuscita, False altrimenti
    """
    try:
        print(f"📖 Elaborando: {excel_path}")
        
        # Leggi il file Excel
        df = pd.read_excel(excel_path)
        
        if df.empty:
            print(f"⚠️  File vuoto: {excel_path}")
            return False
        
        # Trova le colonne corrispondenti
        mapped_columns = {}
        for key, possible_names in COLUMN_MAPPING.items():
            for name in possible_names:
                if name in df.columns:
                    mapped_columns[key] = name
                    break
        
        # Converti i dati
        cards = []
        for index, row in df.iterrows():
            # Usa l'ID presente in Excel se disponibile o indice+1 come fallback
            excel_id = row.get(mapped_columns.get('id', ''), None)

            # Estrai i valori usando le colonne mappate
            name = row.get(mapped_columns.get('name', ''), '')
            attribute = row.get(mapped_columns.get('attribute', ''), '')
            star = row.get(mapped_columns.get('star', ''), 0)
            spell_trap = row.get(mapped_columns.get('spell_trap', ''), '')
            icon = row.get(mapped_columns.get('icon', ''), DEFAULT_ICON)
            art_link = row.get(mapped_columns.get('art_link', ''), '')
            final_card_art = row.get(mapped_columns.get('final_card_art', ''), '')
            type_ability = row.get(mapped_columns.get('type_ability', ''), '')
            effect = row.get(mapped_columns.get('effect', ''), '')
            raw_atk = row.get(mapped_columns.get('atk', ''), 0)
            raw_def = row.get(mapped_columns.get('def', ''), 0)
            
            atk = normalize_stat(raw_atk)
            def_value = normalize_stat(raw_def)
            
            # Determina il tipo di carta
            card_type = determine_card_type(spell_trap)
            
            # Determina se è da Extra Deck
            extra_deck = determine_extra_deck(type_ability)
            
            # Pulisci i valori NaN
            def clean_value(value, default=''):
                if pd.isna(value):
                    return default
                return value
            
            # Crea l'oggetto carta
            card = {
                "id": int(excel_id) if not pd.isna(excel_id) else index + 1,
                "name": clean_value(name),
                "attribute": clean_value(attribute),
                "star": int(star) if not pd.isna(star) else 0,
                "type": clean_value(type_ability),
                "effect": clean_value(effect),
                "atk": atk,
                "def": def_value,
                "icon": clean_value(icon, DEFAULT_ICON),
                "art_link": clean_value(art_link),
                "final_card_art": clean_value(final_card_art),
                "card_type": card_type,
                "extra_deck": extra_deck
            }
            
            # Aggiungi campi opzionali se presenti
            if spell_trap and not pd.isna(spell_trap):
                card["spell_trap_type"] = clean_value(spell_trap)
            
            cards.append(card)
        
        # Crea la struttura JSON finale
        json_data = {"cards": cards}
        
        # Determina il percorso di output
        if output_path is None:
            if DEFAULT_OUTPUT_DIR:
                output_dir = Path(DEFAULT_OUTPUT_DIR)
                output_dir.mkdir(parents=True, exist_ok=True)
                output_path = output_dir / (excel_path.stem + '.json')
            else:
                output_path = excel_path.with_suffix('.json')
        
        # Scrivi il file JSON
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=JSON_INDENT, ensure_ascii=JSON_ENSURE_ASCII)
        
        print(f"✅ Convertito: {len(cards)} carte → {output_path}")
        return True
        
    except Exception as e:
        print(f"❌ Errore durante la conversione di {excel_path}: {e}")
        return False

def process_directory(directory: Path, recursive: bool = True) -> tuple[int, int]:
    """
    Processa tutti i file Excel in una directory
    
    Args:
        directory: Directory da processare
        recursive: Se True, processa anche le sottodirectory
        
    Returns:
        tuple: (file_processati_con_successo, file_totali)
    """
    success_count = 0
    total_count = 0
    
    # Trova tutti i file Excel
    if recursive:
        excel_files = []
        for ext in EXCEL_EXTENSIONS:
            excel_files.extend(directory.rglob(f'*{ext}'))
    else:
        excel_files = []
        for ext in EXCEL_EXTENSIONS:
            excel_files.extend(directory.glob(f'*{ext}'))
    
    print(f"🔍 Trovati {len(excel_files)} file Excel in {directory}")
    
    for excel_file in excel_files:
        total_count += 1
        if convert_excel_to_json(excel_file):
            success_count += 1
    
    return success_count, total_count

def main():
    parser = argparse.ArgumentParser(
        description="Converte file Excel in formato JSON per carte",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Esempi di utilizzo:
  python excel_to_json.py                    # Processa la directory corrente
  python excel_to_json.py ./carte           # Processa la cartella 'carte'
  python excel_to_json.py ./carte --no-recursive  # Solo la cartella specificata
  python excel_to_json.py file.xlsx         # Converte un singolo file
        """
    )
    
    parser.add_argument(
        'path',
        nargs='?',
        default=DEFAULT_INPUT_DIR,
        help=f'Percorso del file Excel o della directory (default: {DEFAULT_INPUT_DIR})'
    )
    
    parser.add_argument(
        '--no-recursive',
        action='store_true',
        help='Non processare le sottodirectory'
    )
    
    parser.add_argument(
        '--output',
        '-o',
        default=DEFAULT_OUTPUT_DIR,
        help='Directory di output per i file JSON (default: stessa directory del file Excel)'
    )
    
    args = parser.parse_args()
    
    # Se non è stato fornito alcun percorso (o DEFAULT_INPUT_DIR è None), usa la directory corrente
    path_arg: str = args.path if args.path is not None else '.'
    path = Path(cast(str, path_arg))
    
    # Controlla se il percorso esiste
    if not path.exists():
        print(f"❌ Percorso non trovato: {path}")
        sys.exit(1)
    
    print("🚀 Avvio conversione Excel → JSON")
    print("=" * 50)
    
    if path.is_file():
        # Singolo file
        if path.suffix.lower() in EXCEL_EXTENSIONS:
            output_path = None
            if args.output:
                output_dir = Path(args.output)
                output_dir.mkdir(parents=True, exist_ok=True)
                output_path = output_dir / (path.stem + '.json')
            
            success = convert_excel_to_json(path, output_path)
            if success:
                print("🎉 Conversione completata con successo!")
            else:
                print("💥 Conversione fallita!")
                sys.exit(1)
        else:
            print(f"❌ Il file {path} non è un file Excel valido")
            sys.exit(1)
    
    elif path.is_dir():
        # Directory
        recursive = not args.no_recursive
        success_count, total_count = process_directory(path, recursive)
        
        print("=" * 50)
        print(f"📊 Riepilogo:")
        print(f"   File processati con successo: {success_count}")
        print(f"   File totali: {total_count}")
        
        if success_count == total_count:
            print("🎉 Tutti i file sono stati convertiti con successo!")
        elif success_count > 0:
            print(f"⚠️  {total_count - success_count} file non sono stati convertiti")
        else:
            print("💥 Nessun file è stato convertito!")
            sys.exit(1)
    
    else:
        print(f"❌ {path} non è né un file né una directory")
        sys.exit(1)

if __name__ == "__main__":
    main()