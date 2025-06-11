import { GameHeader } from '@/components/layout/GameHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Rocket } from 'lucide-react';

interface PlanetMissionPageProps {
  params: {
    planetId: string;
  };
}

// Helper to format planetId to a more readable name
function getPlanetDisplayName(planetId: string): string {
  switch (planetId) {
    case 'lavaplaneten': return 'Lavaplaneten Volcanis';
    case 'isjatten': return 'Isjätten Glacius';
    case 'kristallasteroiderna': return 'Kristallasteroiderna';
    case 'rymdstation-alpha': return 'Rymdstation Alpha';
    default: return planetId.charAt(0).toUpperCase() + planetId.slice(1);
  }
}


export default function PlanetMissionPage({ params }: PlanetMissionPageProps) {
  const { planetId } = params;
  const planetName = getPlanetDisplayName(planetId);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-indigo-900/50">
      <GameHeader title={`Uppdrag på ${planetName}`} backHref="/rymdkarta" />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <Card className="w-full max-w-lg text-center shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary flex items-center justify-center gap-2">
              <Rocket className="h-8 w-8" /> Välkommen till {planetName}!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-foreground">
              Här kommer du snart att kunna spela roliga minispel och slutföra spännande uppdrag!
            </p>
            <p className="text-md text-muted-foreground">
              Detta område är under utveckling. Kom tillbaka snart för att se vad som händer!
            </p>
            <Button asChild size="lg" variant="secondary" className="font-semibold">
              <Link href="/rymdkarta">Tillbaka till Rymdkartan</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// This function can be used if you need to generate static paths for these pages
// export async function generateStaticParams() {
//   const planets = ['lavaplaneten', 'isjatten', 'kristallasteroiderna', 'rymdstation-alpha'];
//   return planets.map((planetId) => ({
//     planetId,
//   }));
// }
