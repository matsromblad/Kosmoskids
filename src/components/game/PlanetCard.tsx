
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/game/LoadingSpinner';
import { Badge } from '@/components/ui/badge'; // Importera Badge
import { CheckCircle2 } from 'lucide-react'; // Importera ikon för "Besökt"

interface PlanetCardProps {
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  icon: LucideIcon;
  planetId: string;
  themeColor?: string; 
  isLoadingImage?: boolean;
  isVisited?: boolean;
}

export function PlanetCard({ name, description, imageUrl, imageHint, icon: Icon, planetId, themeColor = 'bg-card/80 border-border', isLoadingImage, isVisited }: PlanetCardProps) {
  return (
    <Card className={`w-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 ${themeColor} backdrop-blur-sm overflow-hidden`}>
      <CardHeader className="flex flex-row items-center gap-3 pb-2 relative">
        <div className="p-2 bg-primary/20 rounded-full">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-headline text-primary-foreground">{name}</CardTitle>
        {isVisited && (
          <Badge variant="secondary" className="absolute top-2 right-2 bg-green-500/80 text-white border-green-600 text-xs py-1 px-2">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Besökt
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="w-full h-48 relative rounded-lg overflow-hidden shadow-md bg-muted flex items-center justify-center">
          {isLoadingImage ? (
            <LoadingSpinner />
          ) : (
            <Image src={imageUrl} alt={name} layout="fill" objectFit="cover" data-ai-hint={imageHint} />
          )}
        </div>
        <CardDescription className="text-sm text-muted-foreground text-center h-16 overflow-hidden px-2">
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
