
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
  characterName?: string | null; // For "Min Varelse" button
}

export function MainMenuButton({ 
  href, 
  icon: Icon, 
  title, 
  description, 
  className, 
  imageUrl,
  characterName
}: MainMenuButtonProps) {
  const displayTitle = characterName || title;

  return (
    <Link
      href={href}
      className={cn(
        "block transform transition-transform hover:scale-105 focus:scale-105 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-lg",
        className
      )}
    >
      <Card className={cn("w-full h-full text-center shadow-xl hover:shadow-2xl transition-shadow bg-card/80 backdrop-blur-sm", className)}>
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
          <Button variant="secondary" size="lg" className="mt-2 font-semibold">
            {imageUrl ? `Visa ${displayTitle}` : `Gå till ${title}`}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
