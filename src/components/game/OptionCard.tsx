import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface OptionCardProps {
  name: string;
  imageUrl: string;
  imageHint: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function OptionCard({ name, imageUrl, imageHint, isSelected, onSelect }: OptionCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105",
        isSelected ? "ring-2 ring-accent shadow-accent/50" : "hover:shadow-lg",
        "bg-card/70 backdrop-blur-sm border-border hover:border-accent"
      )}
      onClick={onSelect}
      onKeyPress={(e) => e.key === 'Enter' && onSelect()}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Välj ${name}`}
    >
      <CardContent className="p-3 flex flex-col items-center gap-2">
        <div className="w-20 h-20 relative rounded-md overflow-hidden bg-muted">
          <Image src={imageUrl} alt={name} layout="fill" objectFit="contain" data-ai-hint={imageHint} />
        </div>
        <p className={cn("text-xs text-center font-medium", isSelected ? "text-accent" : "text-foreground")}>
          {name}
        </p>
      </CardContent>
    </Card>
  );
}
