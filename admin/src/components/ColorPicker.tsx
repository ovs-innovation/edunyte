import { cn } from '@/lib/utils';
import { useThemeColor, ThemeColor } from '@/contexts/ThemeColorContext';
import { Check } from 'lucide-react';

const colors: { name: ThemeColor; label: string; class: string }[] = [
  { name: 'sky', label: 'Sky Blue', class: 'bg-sky-500' },
  { name: 'violet', label: 'Violet', class: 'bg-violet-500' },
  { name: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
  { name: 'rose', label: 'Rose', class: 'bg-rose-500' },
  { name: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { name: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { name: 'teal', label: 'Teal', class: 'bg-teal-500' },
  { name: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { name: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { name: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
  { name: 'lime', label: 'Lime', class: 'bg-lime-500' },
  { name: 'red', label: 'Red', class: 'bg-red-500' },
];

export const ColorPicker = () => {
  const { themeColor, setThemeColor } = useThemeColor();

  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => (
        <button
          key={color.name}
          onClick={() => setThemeColor(color.name)}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200',
            'hover:scale-110 hover:shadow-lg',
            'ring-2 ring-offset-2 ring-offset-background',
            color.class,
            themeColor === color.name 
              ? 'ring-foreground' 
              : 'ring-transparent hover:ring-muted-foreground/50'
          )}
          title={color.label}
        >
          {themeColor === color.name && (
            <Check className="h-5 w-5 text-white drop-shadow-md" />
          )}
        </button>
      ))}
    </div>
  );
};
