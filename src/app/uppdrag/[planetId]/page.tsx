
"use client";

import { useState, useEffect, use } from 'react';
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
} from '@/ai/flows/generate-planet-activity';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { Flame, Snowflake, Gem, Bot, Sun, Leaf, Telescope, Sprout, Cloud, Mountain } from 'lucide-react'; // Import all icons

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

interface PlanetDefinition {
  id: string;
  name: string;
  description: string;
  imageHint: string;
  icon: React.ElementType; // Not used here directly, but part of the full definition
  themeColor: string; // Not used here directly
}

const CHARACTER_STORAGE_KEY = "kosmoskids_character";
const SPACESHIP_STORAGE_KEY = "kosmoskids_spaceship";
const VISITED_PLANETS_STORAGE_KEY = "kosmoskids_visited_planets";

// This should mirror the definitions in rymdkarta/page.tsx to ensure data consistency
// In a larger app, this data would come from a shared service or context.
const allPlanetDefinitionsForLookup: PlanetDefinition[] = [
   {
    id: 'lavaplaneten-volcanis',
    name: 'Lavaplaneten Volcanis',
    description: 'En glödhet planet täckt av vulkaner och lavafloder. Här bor de eldiga Flammisarna!',
    imageHint: 'cartoon lava planet vibrant fire alien landscape orange red',
    icon: Flame,
    themeColor: 'bg-red-700/30 border-red-600 hover:shadow-red-500/50',
  },
  {
    id: 'isjatten-glacius',
    name: 'Isjätten Glacius',
    description: 'En iskall värld med snötäckta berg och frusna sjöar. Islingarna trivs i kylan.',
    imageHint: 'cartoon ice planet detailed snow creatures mountains light blue white',
    icon: Snowflake,
    themeColor: 'bg-blue-500/30 border-blue-400 hover:shadow-blue-400/50',
  },
  {
    id: 'kristallgrottorna-xylar',
    name: 'Kristallgrottorna på Xylar',
    description: 'Ett skimrande nätverk av grottor fyllda med glittrande kristaller och mystiska väsen.',
    imageHint: 'cartoon crystal cave planet glowing gems fantasy creatures purple amethyst',
    icon: Gem,
    themeColor: 'bg-purple-600/30 border-purple-500 hover:shadow-purple-500/50',
  },
  {
    id: 'robotstaden-gearwerk',
    name: 'Robotstaden Gearwerk',
    description: 'En högteknologisk stad bebodd av avancerade robotar och flygande farkoster.',
    imageHint: 'cartoon robot city futuristic flying vehicles shiny metal grey silver',
    icon: Bot,
    themeColor: 'bg-gray-600/30 border-gray-500 hover:shadow-gray-400/50',
  },
  {
    id: 'solvindsoasen-helios',
    name: 'Solvindsoasen Helios',
    description: 'En planet badande i ljuset från tre solar, där växter samlar solenergi.',
    imageHint: 'cartoon desert oasis planet three suns exotic plants solar panels yellow gold',
    icon: Sun,
    themeColor: 'bg-yellow-500/30 border-yellow-400 hover:shadow-yellow-400/50',
  },
  {
    id: 'djungelvarlden-viridia',
    name: 'Djungelvärlden Viridia',
    description: 'En frodig planet täckt av enorma träd och exotiska djur. Luften är fuktig och full av liv.',
    imageHint: 'cartoon jungle planet giant trees exotic creatures vibrant green bioluminescent',
    icon: Leaf,
    themeColor: 'bg-green-600/30 border-green-500 hover:shadow-green-500/50',
  },
  {
    id: 'observatorieklippan-celestia',
    name: 'Observatorieklippan Celestia',
    description: 'En hög bergsplanet med klara nätter, perfekt för att studera stjärnor och galaxer.',
    imageHint: 'cartoon mountain observatory planet clear night sky stars telescope purple darkblue',
    icon: Telescope,
    themeColor: 'bg-indigo-600/30 border-indigo-500 hover:shadow-indigo-500/50',
  },
  {
    id: 'svampskogen-mycelia',
    name: 'Svampskogen Mycelia',
    description: 'En dunkel planet där jättelika, självlysande svampar bildar en hel skog.',
    imageHint: 'cartoon giant mushroom forest glowing fungi bioluminescent dark eerie purple blue',
    icon: Sprout,
    themeColor: 'bg-teal-600/30 border-teal-500 hover:shadow-teal-500/50',
  },
   {
    id: 'gasjatten-nimbus',
    name: 'Gasjätten Nimbus',
    description: 'En enorm gasplanet med virvlande molnband i olika färger och flytande öar.',
    imageHint: 'cartoon gas giant planet swirling clouds floating islands pastel colors pink blue',
    icon: Cloud,
    themeColor: 'bg-sky-600/30 border-sky-500 hover:shadow-sky-500/50',
  },
  {
    id: 'bergskedjan-apex',
    name: 'Bergskedjan Apex',
    description: 'En planet definierad av skyhöga, snöklädda bergstoppar och djupa, dolda dalar.',
    imageHint: 'cartoon massive mountain range snowy peaks hidden valleys eagles flying majestic brown grey white',
    icon: Mountain,
    themeColor: 'bg-stone-600/30 border-stone-500 hover:shadow-stone-500/50',
  }
];


interface PlanetMissionPageProps {
  params: Promise<{ 
    planetId: string;
  }>;
}

export default function PlanetMissionPage({ params }: PlanetMissionPageProps) {
  const { planetId } = use(params); 
  const currentPlanetDetails = allPlanetDefinitionsForLookup.find(p => p.id === planetId) || 
                               { id: planetId, name: planetId, description: "En okänd plats i rymden...", imageHint: "mysterious space placeholder", icon: Leaf, themeColor: 'bg-gray-500/30' };


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
    if (!character || !spaceship || !planetId || !currentPlanetDetails) return;

    const fetchActivity = async () => {
      setIsLoadingContent(true);
      setErrorState(null);
      setActivityText(null);
      setActivityImageUrl(null);
      try {
        const activityInput: GeneratePlanetActivityInput = {
          planetName: currentPlanetDetails.name,
          planetDescription: currentPlanetDetails.description,
          characterName: character.name,
          characterStyle: character.style,
          characterBackstory: character.backstory,
          spaceshipName: spaceship.name || undefined,
        };

        const activityResult = await generatePlanetActivity(activityInput);
        setActivityText(activityResult.activityText);

        if (activityResult.imagePrompt && activityResult.imagePrompt.trim() !== "") {
          const imageResult = await generateImage({ prompt: activityResult.imagePrompt });
          setActivityImageUrl(imageResult.imageDataUri);
        } else {
           console.warn(`Image prompt was empty for planet ${currentPlanetDetails.name}. Using placeholder.`);
           setActivityImageUrl(`https://placehold.co/600x400/2E3192/FFFFFF.png?text=Bild+kunde+inte+skapas`);
           toast({
            title: "Bildinformation Saknas",
            description: `Kunde inte skapa en bild för äventyret på ${currentPlanetDetails.name} eftersom bildbeskrivningen saknades.`,
            variant: "default"
          });
        }
        
        const visitedPlanets: string[] = JSON.parse(localStorage.getItem(VISITED_PLANETS_STORAGE_KEY) || '[]');
        if (!visitedPlanets.includes(planetId)) {
          visitedPlanets.push(planetId);
          localStorage.setItem(VISITED_PLANETS_STORAGE_KEY, JSON.stringify(visitedPlanets));
        }
        toast({ title: "Uppdrag Utfört!", description: `Du har nu utforskat ${currentPlanetDetails.name}.` });

      } catch (err) {
        console.error("Failed to generate planet activity or image:", err);
        setErrorState("Kunde inte ladda äventyret. Försök gå tillbaka och komma hit igen.");
        toast({
          title: "Ett fel uppstod",
          description: "Kunde inte generera innehåll för planeten. Det kan bero på ett tillfälligt problem med AI-tjänsten.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchActivity();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, spaceship, planetId, currentPlanetDetails.name, currentPlanetDetails.description]);

  const pageTitle = currentPlanetDetails ? `Äventyr på ${currentPlanetDetails.name}` : "Laddar Äventyr...";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-indigo-900/60">
      <GameHeader title={pageTitle} backHref="/rymdkarta" />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        {isLoadingContent && (
          <div className="flex flex-col items-center justify-center h-full">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-xl text-foreground">Förbereder ditt äventyr på {currentPlanetDetails.name}...</p>
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
                {character?.name} på {currentPlanetDetails.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-4 md:p-8">
              {activityImageUrl ? (
                <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden shadow-lg border-2 border-accent bg-muted">
                  <Image src={activityImageUrl} alt={`Äventyr på ${currentPlanetDetails.name}`} layout="fill" objectFit="cover" />
                </div>
              ) : (
                <div className="w-full aspect-[4/3] flex items-center justify-center bg-muted rounded-lg border-2 border-dashed border-muted-foreground">
                  <ImageIcon className="h-24 w-24 text-muted-foreground" />
                   <p className="text-muted-foreground ml-2">Laddar bild...</p>
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
