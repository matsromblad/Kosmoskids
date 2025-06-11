import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/game/LoadingSpinner';

interface PlanetCardProps {
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  icon: LucideIcon;
  planetId: string;
  themeColor?: string; // e.g., 'bg-red-500/30 border-red-400'
  isLoadingImage?: boolean;
}

export function PlanetCard({ name, description, imageUrl, imageHint, icon: Icon, planetId, themeColor = 'bg-card/80 border-border', isLoadingImage }: PlanetCardProps) {
  return (
    <Card className={`w-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 ${themeColor} backdrop-blur-sm`}>
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <div className="p-2 bg-primary/20 rounded-full">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-headline text-primary-foreground">{name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="w-full h-40 relative rounded-lg overflow-hidden shadow-md bg-muted flex items-center justify-center">
          {isLoadingImage ? (
            <LoadingSpinner />
          ) : (
            <Image src={imageUrl} alt={name} layout="fill" objectFit="cover" data-ai-hint={imageHint} />
          )}
        </div>
        <CardDescription className="text-sm text-muted-foreground text-center h-16 overflow-hidden">
          {description}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild variant="secondary" className="w-full font-semibold">
          <Link href={`/uppdrag/${planetId}`}>Utforska {name}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
