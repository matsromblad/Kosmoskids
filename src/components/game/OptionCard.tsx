import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface OptionCardProps {
  name: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function OptionCard({ name, isSelected, onSelect }: OptionCardProps) {
  return (
    <Button
      variant={isSelected ? "secondary" : "outline"}
      className={cn(
        "w-full h-auto py-3 px-2 text-sm font-medium justify-center text-center",
        isSelected ? "ring-2 ring-accent shadow-accent/50" : "hover:shadow-lg",
        "bg-card/70 backdrop-blur-sm border-border hover:border-accent"
      )}
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={`Välj ${name}`}
    >
      {name}
    </Button>
  );
}
