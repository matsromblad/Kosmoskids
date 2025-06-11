
import Link from 'next/link';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MainMenuButtonProps {
  href: string;
  icon?: LucideIcon; // Optional if imageUrl is provided
  title: string;
  description: string;
  className?: string;
  imageUrl?: string | null;
  characterName?: string | null;
  spaceshipName?: string | null; 
  disabled?: boolean;
}

export function MainMenuButton({ 
  href, 
  icon: Icon, 
  title, 
  description, 
  className, 
  imageUrl,
  characterName,
  spaceshipName,
  disabled = false,
}: MainMenuButtonProps) {
  const displayTitle = characterName || spaceshipName || title;
  const buttonText = imageUrl ? (characterName || spaceshipName ? `Visa ${displayTitle}` : `Visa ${title}`) : `Gå till ${title}`;

  const effectiveClassName = cn(
    "block transform transition-transform hover:scale-105 focus:scale-105 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-lg",
    className,
    disabled && "opacity-60 cursor-not-allowed pointer-events-none grayscale-[50%]"
  );
  
  const cardInnerClassName = cn(
      "w-full h-full text-center shadow-xl transition-shadow bg-card/80 backdrop-blur-sm",
      className,
       disabled ? "" : "hover:shadow-2xl" // Don't apply hover shadow if disabled
  );


  const content = (
    <Card className={cardInnerClassName}>
      <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
        {imageUrl ? (
          <div className="w-24 h-24 relative rounded-full overflow-hidden bg-muted/50 border-2 border-primary shadow-lg">
            <Image src={imageUrl} alt={displayTitle} layout="fill" objectFit="cover" />
          </div>
        ) : Icon ? (
          <div className="p-4 bg-primary/20 rounded-full">
            <Icon className="h-12 w-12 text-primary" />
          </div>
        ) : null}
        <h2 className="text-2xl font-headline font-semibold text-primary-foreground">{displayTitle}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button variant="secondary" size="lg" className="mt-2 font-semibold" tabIndex={disabled ? -1 : 0}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );

  if (disabled) {
    return (
      <div className={effectiveClassName} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={effectiveClassName}
      onClick={(e) => { if (disabled) e.preventDefault(); }}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
    >
      {content}
    </Link>
  );
}
