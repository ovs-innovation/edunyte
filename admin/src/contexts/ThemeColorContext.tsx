import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeColor = 'sky' | 'violet' | 'emerald' | 'rose' | 'amber' | 'orange' | 'teal' | 'pink' | 'indigo' | 'cyan' | 'lime' | 'red';

interface ThemeColorContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined);

const colorValues: Record<ThemeColor, { light: string; dark: string }> = {
  sky: { light: '199 89% 48%', dark: '187 85% 53%' },
  violet: { light: '262 83% 58%', dark: '270 76% 66%' },
  emerald: { light: '158 64% 42%', dark: '160 84% 45%' },
  rose: { light: '346 77% 50%', dark: '349 89% 65%' },
  amber: { light: '38 92% 50%', dark: '43 96% 56%' },
  orange: { light: '24 95% 53%', dark: '27 96% 61%' },
  teal: { light: '168 76% 42%', dark: '170 80% 50%' },
  pink: { light: '330 81% 60%', dark: '330 85% 68%' },
  indigo: { light: '239 84% 67%', dark: '239 90% 74%' },
  cyan: { light: '188 94% 43%', dark: '187 92% 52%' },
  lime: { light: '84 81% 44%', dark: '82 85% 52%' },
  red: { light: '0 72% 51%', dark: '0 84% 60%' },
};

export const ThemeColorProvider = ({ children }: { children: ReactNode }) => {
  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    const stored = localStorage.getItem('theme-color');
    return (stored as ThemeColor) || 'sky';
  });

  const applyColors = (color: ThemeColor) => {
    const isDark = document.documentElement.classList.contains('dark');
    const colorValue = isDark ? colorValues[color].dark : colorValues[color].light;
    
    document.documentElement.style.setProperty('--primary', colorValue);
    document.documentElement.style.setProperty('--ring', colorValue);
    document.documentElement.style.setProperty('--sidebar-primary', colorValue);
    document.documentElement.style.setProperty('--sidebar-ring', colorValue);
    document.documentElement.style.setProperty('--button-primary', colorValue);
    
    const colorHsl = colorValue.split(' ');
    const h = colorHsl[0];
    const s = colorHsl[1];
    const l = colorHsl[2];
    
    const lightness = parseFloat(l.replace('%', ''));
    const lighterL = Math.min(100, lightness + 5);
    
    const gradientValue = `linear-gradient(135deg, hsl(${h} ${s} ${l}), hsl(${h} ${s} ${lighterL}%))`;
    
    document.documentElement.style.setProperty('--gradient-primary', gradientValue);
  };

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem('theme-color', color);
    localStorage.setItem('button-color', color);
    applyColors(color);
  };

  useEffect(() => {
    applyColors(themeColor);
    
    const observer = new MutationObserver(() => {
      applyColors(themeColor);
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [themeColor]);

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeColorContext.Provider>
  );
};

export const useThemeColor = () => {
  const context = useContext(ThemeColorContext);
  if (!context) {
    throw new Error('useThemeColor must be used within ThemeColorProvider');
  }
  return context;
};
