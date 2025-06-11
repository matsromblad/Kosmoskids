
"use client";

import { useState, useEffect, use } from 'react'; // Added 'use'
import Image from 'next/image';
import Link from 'next/link';
import { GameHeader } from '@/components/layout/GameHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, ImageIcon } from 'lucide-react';
import { LoadingSpinner } from '@/components/game/LoadingSpinner';
import { useToast } from "@/hooks/use-toast";
import { 
  generatePlanetActivity, 
  type GeneratePlanetActivityInput,
  // type GeneratePlanetActivityOutput // Not used directly
} from '@/ai/flows/generate-planet-activity';
import { generateImage } from '@/ai/flows/generate-image-flow';

interface StoredCharacter {
  name: string;
  imageUrl: string;
  backstory: string;
  style: string;
  clothing: string | null;
  hairstyle: string | null;
  accessory: string | null;
}

interface StoredSpaceship {
  name: string | null;
  imageUrl: string;
  backstory: string | null;
  style: string | null;
  parts: {
    wing: string | null;
    engine: string | null;
    decoration: string | null;
  };
   partNames: {
    wingName: string;
    engineName: string;
    decorationName: string;
  }
}

const CHARACTER_STORAGE_KEY = "kosmoskids_character";
const SPACESHIP_STORAGE_KEY = "kosmoskids_spaceship";
const VISITED_PLANETS_STORAGE_KEY = "kosmoskids_visited_planets";

// Håll en lista med planetdata här, eller hämta från en central plats om det blir mer komplext
// Detta är förenklat för nu. I en större app kan detta komma från en databas eller API.
const planetDetails: Record<string, { name: string; description: string }> = {
  'lavaplaneten-volcanis': { name: 'Lavaplaneten Volcanis', description: 'En glödhet planet täckt av vulkaner och lavafloder.' },
  'isjatten-glacius': { name: 'Isjätten Glacius', description: 'En iskall värld med snötäckta berg och frusna sjöar.' },
  'kristallgrottorna-på-xylar': { name: 'Kristallgrottorna på Xylar', description: 'Ett skimrande nätverk av grottor fyllda med glittrande kristaller.' },
  'robotstaden-gearwerk': { name: 'Robotstaden Gearwerk', description: 'En högteknologisk stad bebodd av avancerade robotar.' },
};


interface PlanetMissionPageProps {
  params: Promise<{ // params is a Promise
    planetId: string;
  }>;
}

export default function PlanetMissionPage({ params }: PlanetMissionPageProps) {
  const { planetId } = use(params); // Use React.use() to unwrap params
  const currentPlanetInfo = planetDetails[planetId] || { name: planetId, description: "En okänd plats i rymden..." };

  const [character, setCharacter] = useState<StoredCharacter | null>(null);
  const [spaceship, setSpaceship] = useState<StoredSpaceship | null>(null);
  
  const [activityText, setActivityText] = useState<string | null>(null);
  const [activityImageUrl, setActivityImageUrl] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    const storedCharacterRaw = localStorage.getItem(CHARACTER_STORAGE_KEY);
    if (storedCharacterRaw) {
      setCharacter(JSON.parse(storedCharacterRaw));
    } else {
      setErrorState("Ingen rymdvarelse hittades. Gå tillbaka och skapa en först!");
      setIsLoadingContent(false);
      return;
    }

    const storedSpaceshipRaw = localStorage.getItem(SPACESHIP_STORAGE_KEY);
     if (storedSpaceshipRaw) {
      setSpaceship(JSON.parse(storedSpaceshipRaw));
    } else {
      setErrorState("Inget rymdskepp hittades. Gå tillbaka och skapa ett först!");
      setIsLoadingContent(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (!character || !spaceship || !planetId) return;

    const fetchActivity = async () => {
      setIsLoadingContent(true);
      setErrorState(null);
      try {
        const activityInput: GeneratePlanetActivityInput = {
          planetName: currentPlanetInfo.name,
          planetDescription: currentPlanetInfo.description,
          characterName: character.name,
          characterStyle: character.style,
          characterBackstory: character.backstory,
          spaceshipName: spaceship.name || undefined,
        };

        const activityResult = await generatePlanetActivity(activityInput);
        setActivityText(activityResult.activityText);

        if (activityResult.imagePrompt) {
          const imageResult = await generateImage({ prompt: activityResult.imagePrompt });
          setActivityImageUrl(imageResult.imageDataUri);
        } else {
          setActivityImageUrl(null); // No prompt, no image
        }
        
        // Mark planet as visited
        const visitedPlanets: string[] = JSON.parse(localStorage.getItem(VISITED_PLANETS_STORAGE_KEY) || '[]');
        if (!visitedPlanets.includes(planetId)) {
          visitedPlanets.push(planetId);
          localStorage.setItem(VISITED_PLANETS_STORAGE_KEY, JSON.stringify(visitedPlanets));
        }
        toast({ title: "Uppdrag Utfört!", description: `Du har nu utforskat ${currentPlanetInfo.name}.` });

      } catch (err) {
        console.error("Failed to generate planet activity or image:", err);
        setErrorState("Kunde inte ladda äventyret. Försök gå tillbaka och komma hit igen.");
        toast({
          title: "Ett fel uppstod",
          description: "Kunde inte generera innehåll för planeten.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchActivity();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, spaceship, planetId]); // currentPlanetInfo is derived from planetId


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-indigo-900/60">
      <GameHeader title={`Äventyr på ${currentPlanetInfo.name}`} backHref="/rymdkarta" />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        {isLoadingContent && (
          <div className="flex flex-col items-center justify-center h-full">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-xl text-foreground">Förbereder ditt äventyr på {currentPlanetInfo.name}...</p>
          </div>
        )}

        {!isLoadingContent && errorState && (
          <Card className="w-full max-w-lg text-center shadow-xl bg-card/80 backdrop-blur-sm p-6">
            <CardHeader>
              <CardTitle className="text-2xl text-destructive">Oj då!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-foreground">{errorState}</p>
              <Button asChild size="lg" variant="secondary" className="mt-6 font-semibold">
                <Link href="/rymdkarta">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Tillbaka till Rymdkartan
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoadingContent && !errorState && activityText && (
          <Card className="w-full max-w-2xl shadow-2xl bg-card/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-3xl font-headline text-primary text-center">
                {character?.name} på {currentPlanetInfo.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-4 md:p-8">
              {activityImageUrl ? (
                <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden shadow-lg border-2 border-accent bg-muted">
                  <Image src={activityImageUrl} alt={`Äventyr på ${currentPlanetInfo.name}`} layout="fill" objectFit="cover" />
                </div>
              ) : (
                <div className="w-full aspect-[4/3] flex items-center justify-center bg-muted rounded-lg">
                  <ImageIcon className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              <div className="bg-muted/50 p-4 rounded-md shadow">
                <p className="text-lg md:text-xl text-foreground leading-relaxed whitespace-pre-line">
                  {activityText}
                </p>
              </div>
              <Button asChild size="lg" className="w-full font-semibold mt-4">
                <Link href="/rymdkarta">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Tillbaka till Rymdkartan
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

