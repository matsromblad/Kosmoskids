
"use client";

import { useState, useEffect } from 'react';
import { GameHeader } from '@/components/layout/GameHeader';
import { PlanetCard } from '@/components/game/PlanetCard';
import { Flame, Snowflake, Gem, Bot, Sun, Leaf, Telescope, Sprout, Cloud, Mountain } from 'lucide-react';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { LoadingSpinner } from '@/components/game/LoadingSpinner';

interface PlanetDefinition {
  id: string;
  name: string;
  description: string;
  imageUrl?: string; // Optional initially, will be filled
  imageHint: string;
  icon: React.ElementType;
  themeColor: string;
  isLoadingImage?: boolean;
  isVisited?: boolean;
}

// Expanded pool of planet definitions
const allPlanetDefinitions: PlanetDefinition[] = [
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

const ACTIVE_PLANET_IDS_KEY = "kosmoskids_active_planet_ids";
const PLANET_IMAGES_KEY = "kosmoskids_planet_images";
const VISITED_PLANETS_KEY = "kosmoskids_visited_planets";
const NUMBER_OF_ACTIVE_PLANETS = 4;

// Helper function to get random unique elements from an array
function getRandomUniqueElements<T>(arr: T[], numElements: number): T[] {
  if (numElements > arr.length) {
    throw new Error("Cannot select more unique elements than available in the array.");
  }
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numElements);
}

export default function RymdkartaPage() {
  const [activePlanetDefinitions, setActivePlanetDefinitions] = useState<PlanetDefinition[]>([]);
  const [isLoadingDefinitions, setIsLoadingDefinitions] = useState(true);
  const [allPlanetsVisited, setAllPlanetsVisited] = useState(false);

  // Load active planet IDs, or select new ones if none are stored / game is reset
  useEffect(() => {
    const storedActivePlanetIdsRaw = localStorage.getItem(ACTIVE_PLANET_IDS_KEY);
    let currentActivePlanetIds: string[] = [];

    if (storedActivePlanetIdsRaw) {
      currentActivePlanetIds = JSON.parse(storedActivePlanetIdsRaw);
    }

    if (currentActivePlanetIds.length !== NUMBER_OF_ACTIVE_PLANETS) {
      // Select new random planets
      const selectedPlanetDefinitions = getRandomUniqueElements(allPlanetDefinitions, NUMBER_OF_ACTIVE_PLANETS);
      currentActivePlanetIds = selectedPlanetDefinitions.map(p => p.id);
      localStorage.setItem(ACTIVE_PLANET_IDS_KEY, JSON.stringify(currentActivePlanetIds));
      // When new planets are chosen, old images and visited status for potentially different planets should be cleared
      localStorage.removeItem(PLANET_IMAGES_KEY);
      localStorage.removeItem(VISITED_PLANETS_KEY);
    }
    
    const resolvedDefinitions = currentActivePlanetIds
      .map(id => allPlanetDefinitions.find(p => p.id === id))
      .filter(p => p !== undefined) as PlanetDefinition[];

    // Initialize with placeholder images and loading state
    const initialPlanetStates = resolvedDefinitions.map(pDef => ({
        ...pDef,
        imageUrl: `https://placehold.co/300x200/2E3192/FFFFFF.png?text=${encodeURIComponent(pDef.name)}`,
        isLoadingImage: true,
        isVisited: false, // Will be updated by another useEffect
    }));
    
    setActivePlanetDefinitions(initialPlanetStates);
    setIsLoadingDefinitions(false);
  }, []);

  // Effect to load images and visited status once definitions are set
  useEffect(() => {
    if (isLoadingDefinitions || activePlanetDefinitions.length === 0) return;

    const storedPlanetImages: Record<string, string> = JSON.parse(localStorage.getItem(PLANET_IMAGES_KEY) || '{}');
    const storedVisitedPlanets: string[] = JSON.parse(localStorage.getItem(VISITED_PLANETS_KEY) || '[]');

    setActivePlanetDefinitions(prevDefs => {
      return prevDefs.map(pDef => {
        const isVisited = storedVisitedPlanets.includes(pDef.id);
        const existingImageUrl = storedPlanetImages[pDef.id];
        return {
          ...pDef,
          imageUrl: existingImageUrl || pDef.imageUrl, // Use stored image if available
          isLoadingImage: !existingImageUrl, // Only load if not already stored
          isVisited: isVisited,
        };
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingDefinitions]); // Removed activePlanetDefinitions from deps to avoid re-triggering image load logic unnecessarily

  // Effect for sequential image generation
  useEffect(() => {
    if (isLoadingDefinitions || activePlanetDefinitions.length === 0) return;

    const fetchImagesSequentially = async () => {
      const storedPlanetImagesMap: Record<string, string> = JSON.parse(localStorage.getItem(PLANET_IMAGES_KEY) || '{}');
      
      for (const planetData of activePlanetDefinitions) {
        if (planetData.isLoadingImage && !storedPlanetImagesMap[planetData.id]) {
          try {
             // Update specific planet to show it's loading NOW
            setActivePlanetDefinitions(prevs => prevs.map(p => p.id === planetData.id ? {...p, isLoadingImage: true} : p));

            const result = await generateImage({ prompt: planetData.imageHint });
            
            storedPlanetImagesMap[planetData.id] = result.imageDataUri;
            localStorage.setItem(PLANET_IMAGES_KEY, JSON.stringify(storedPlanetImagesMap));

            setActivePlanetDefinitions(prevs =>
              prevs.map(p =>
                p.id === planetData.id
                  ? { ...p, imageUrl: result.imageDataUri, isLoadingImage: false }
                  : p
              )
            );
          } catch (error) {
            console.error(`Failed to generate image for ${planetData.name}:`, error);
            setActivePlanetDefinitions(prevs =>
              prevs.map(p =>
                p.id === planetData.id ? { ...p, isLoadingImage: false } : p // Stop loading on error, keep placeholder
              )
            );
          }
        } else if (planetData.isLoadingImage && storedPlanetImagesMap[planetData.id]) {
          // Image was already in localStorage, just update the state
           setActivePlanetDefinitions(prevs =>
              prevs.map(p =>
                p.id === planetData.id ? { ...p, imageUrl: storedPlanetImagesMap[planetData.id], isLoadingImage: false } : p
              )
            );
        }
      }
    };
    
    if (activePlanetDefinitions.some(p => p.isLoadingImage)) {
      fetchImagesSequentially();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlanetDefinitions, isLoadingDefinitions]); // Dependency on activePlanetDefinitions is important here

  // Check if all planets are visited
  useEffect(() => {
    if (activePlanetDefinitions.length > 0 && activePlanetDefinitions.every(p => p.isVisited)) {
      setAllPlanetsVisited(true);
    } else {
      setAllPlanetsVisited(false);
    }
  }, [activePlanetDefinitions]);


  const handleResetExploration = () => {
    localStorage.removeItem(VISITED_PLANETS_KEY);
    setActivePlanetDefinitions(prevPlanets => prevPlanets.map(p => ({ ...p, isVisited: false })));
    setAllPlanetsVisited(false);
  };

  if (isLoadingDefinitions) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-indigo-900/50">
        <GameHeader title="Laddar Rymdkarta..." />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </main>
      </div>
    );
  }

  if (allPlanetsVisited) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-indigo-900/50">
        <GameHeader title="Galaxen Utforskad!" />
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
          <Card className="w-full max-w-md shadow-xl bg-card/80 backdrop-blur-sm p-8">
            <CardHeader>
              <CardTitle className="text-3xl font-headline text-primary flex items-center justify-center gap-3">
                <Award className="h-10 w-10 text-yellow-400" />
                Grattis, Rymdutforskare!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-xl text-foreground">
                Du har besökt alla kända platser i denna sektor av Kosmoskids-galaxen!
              </p>
              <p className="text-md text-muted-foreground">
                Vilket fantastiskt äventyr det har varit. Du är en sann upptäckare!
              </p>
              <Button onClick={handleResetExploration} size="lg" className="font-semibold">
                Utforska Samma Planeter Igen
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-indigo-900/50">
      <GameHeader title="Utforska Rymden" />
      <main className="flex-grow container mx-auto px-4 py-8">
        <p className="text-center text-lg text-foreground mb-8">
          Klicka på en planet för att starta ditt nästa äventyr! ({activePlanetDefinitions.filter(p=>p.isVisited).length}/{NUMBER_OF_ACTIVE_PLANETS} besökta)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {activePlanetDefinitions.map((planet) => (
            <PlanetCard
              key={planet.id}
              planetId={planet.id}
              name={planet.name}
              description={planet.description}
              imageUrl={planet.imageUrl || `https://placehold.co/300x200/2E3192/FFFFFF.png?text=${encodeURIComponent(planet.name)}`}
              imageHint={planet.imageHint}
              icon={planet.icon}
              themeColor={planet.themeColor}
              isLoadingImage={planet.isLoadingImage}
              isVisited={planet.isVisited}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

    