import React, { useState, useEffect, createContext, useContext } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const themes = ['neon', 'bianco', 'fantasy', 'industrial'];
const themeDisplayNames = {
  neon: 'Neon',
  bianco: 'Bianco',
  fantasy: 'Fantasy',
  industrial: 'Industrial',
};

const themeIcons = {
  neon: { monster: '🐉', spell: '⚡', trap: '🪤' },
  bianco: { monster: '🤖', spell: '💡', trap: '🛡️' },
  fantasy: { monster: '📜', spell: '✨', trap: '🗝️' },
  industrial: { monster: '⚙️', spell: '🔋', trap: '🚧' },
};

const themeVariables = {
  neon: {
    '--background': '231 15% 11%',
    '--foreground': '0 0% 90%',
    '--card': '240 2% 18%',
    '--card-foreground': '0 0% 90%',
    '--popover': '240 2% 18%',
    '--popover-foreground': '0 0% 90%',
    '--primary': '195 100% 50%',
    '--primary-foreground': '231 15% 11%',
    '--secondary': '291 100% 50%',
    '--secondary-foreground': '0 0% 100%',
    '--muted': '240 2% 29%',
    '--muted-foreground': '0 0% 63%',
    '--accent': '80 100% 59%',
    '--accent-foreground': '231 15% 11%',
    '--destructive': '0 100% 64%',
    '--destructive-foreground': '0 0% 100%',
    '--border': '195 100% 50% / 0.3',
    '--input': '240 2% 29%',
    '--ring': '195 100% 50%',
  },
  bianco: {
    '--background': '210 17% 98%',
    '--foreground': '210 10% 23%',
    '--card': '0 0% 100%',
    '--card-foreground': '210 10% 23%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '210 10% 23%',
    '--primary': '211 100% 50%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '210 20% 94%',
    '--secondary-foreground': '210 10% 23%',
    '--muted': '210 17% 98%',
    '--muted-foreground': '214 9% 48%',
    '--accent': '211 100% 50%',
    '--accent-foreground': '0 0% 100%',
    '--destructive': '354 70% 54%',
    '--destructive-foreground': '0 0% 100%',
    '--border': '210 20% 94%',
    '--input': '0 0% 100%',
    '--ring': '211 100% 50%',
  },
  fantasy: {
    '--background': '40 67% 95%',
    '--foreground': '28 23% 25%',
    '--card': '40 29% 78% / 0.2',
    '--card-foreground': '28 23% 25%',
    '--popover': '40 67% 95%',
    '--popover-foreground': '28 23% 25%',
    '--primary': '43 45% 70%',
    '--primary-foreground': '28 23% 25%',
    '--secondary': '43 40% 50%',
    '--secondary-foreground': '0 0% 100%',
    '--muted': '40 29% 78% / 0.5',
    '--muted-foreground': '28 23% 25%',
    '--accent': '43 74% 78%',
    '--accent-foreground': '28 23% 25%',
    '--destructive': '0 100% 27%',
    '--destructive-foreground': '0 0% 100%',
    '--border': '28 23% 25% / 0.4',
    '--input': '40 29% 78% / 0.3',
    '--ring': '43 45% 70%',
  },
  industrial: {
    '--background': '0 0% 18%',
    '--foreground': '0 0% 74%',
    '--card': '0 0% 4% / 0.5',
    '--card-foreground': '0 0% 74%',
    '--popover': '0 0% 18%',
    '--popover-foreground': '0 0% 74%',
    '--primary': '43 100% 50%',
    '--primary-foreground': '0 0% 18%',
    '--secondary': '43 100% 43%',
    '--secondary-foreground': '0 0% 18%',
    '--muted': '24 49% 32%',
    '--muted-foreground': '0 0% 74%',
    '--accent': '43 100% 50%',
    '--accent-foreground': '0 0% 18%',
    '--destructive': '0 69% 42%',
    '--destructive-foreground': '0 0% 100%',
    '--border': '43 100% 50% / 0.3',
    '--input': '0 0% 4% / 0.5',
    '--ring': '43 100% 50%',
  },
};

const ThemeContext = createContext({
  theme: 'neon',
  setTheme: (theme: string) => {},
  icons: themeIcons.neon,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('neon');

  useEffect(() => {
    const body = document.body;
    body.className = ''; // Reset classes
    Object.entries(themeVariables[theme]).forEach(([key, value]) => {
      body.style.setProperty(key, value as string);
    });
  }, [theme]);

  const value = {
    theme,
    setTheme,
    icons: themeIcons[theme],
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full">
          Switch Theme ({themeDisplayNames[theme]})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {themes.map((t) => (
            <DropdownMenuRadioItem key={t} value={t}>
              {themeDisplayNames[t]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 