
"use client";

import { useState, useEffect, useRef } from 'react';
import { GameHeader } from '@/components/layout/GameHeader';
import { PlanetCard } from '@/components/game/PlanetCard';
import { Flame, Snowflake, Gem, Bot, Sun, Leaf, Telescope, Sprout, Cloud, Mountain } from 'lucide-react';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { LoadingSpinner } from '@/components/game/LoadingSpinner';
import { useToast } from "@/hooks/use-toast"; 
import { getRandomUniqueElements } from '@/lib/utils';

interface PlanetDefinition {
  id: string;
  name: string;
  description: string;
  imageUrl?: string; 
  imageHint: string;
  icon: React.ElementType;
  themeColor: string;
  isLoadingImage?: boolean;
  isVisited?: boolean;
}

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


export default function RymdkartaPage() {
  const [activePlanetDefinitions, setActivePlanetDefinitions] = useState<PlanetDefinition[]>([]);
  const [isLoadingDefinitions, setIsLoadingDefinitions] = useState(true);
  const [allPlanetsVisited, setAllPlanetsVisited] = useState(false);
  const { toast } = useToast();
  const currentlyFetchingRef = useRef<Set<string>>(new Set());

  // Effect for initial setup: determining active planets and loading from localStorage
  useEffect(() => {
    const storedActivePlanetIdsRaw = localStorage.getItem(ACTIVE_PLANET_IDS_KEY);
    let currentActivePlanetIds: string[] = [];
    let newPlanetsSelected = false;

    if (storedActivePlanetIdsRaw) {
      try {
        currentActivePlanetIds = JSON.parse(storedActivePlanetIdsRaw);
        if (!Array.isArray(currentActivePlanetIds) || 
            currentActivePlanetIds.length !== NUMBER_OF_ACTIVE_PLANETS || 
            !currentActivePlanetIds.every(id => typeof id === 'string' && allPlanetDefinitions.some(pDef => pDef.id === id))) {
          console.warn("Invalid or outdated stored active planet IDs, selecting new ones.");
          currentActivePlanetIds = []; 
        }
      } catch (e) {
        console.error("Failed to parse stored active planet IDs, selecting new ones.", e);
        currentActivePlanetIds = []; 
        localStorage.removeItem(ACTIVE_PLANET_IDS_KEY); 
      }
    }

    if (currentActivePlanetIds.length !== NUMBER_OF_ACTIVE_PLANETS) {
      const selectedPlanetDefinitions = getRandomUniqueElements(allPlanetDefinitions, NUMBER_OF_ACTIVE_PLANETS);
      currentActivePlanetIds = selectedPlanetDefinitions.map(p => p.id);
      try {
        localStorage.setItem(ACTIVE_PLANET_IDS_KEY, JSON.stringify(currentActivePlanetIds));
        // Crucial: Reset images and visited status if the set of active planets changes
        localStorage.removeItem(PLANET_IMAGES_KEY); 
        localStorage.removeItem(VISITED_PLANETS_KEY);
        newPlanetsSelected = true; // Flag that we've selected new planets
      } catch (e) {
        console.error("Error setting new active planet IDs in localStorage", e);
         toast({
          title: "Lagringsfel",
          description: "Kunde inte spara de nya planetvalen. Försök ladda om sidan.",
          variant: "destructive",
        });
      }
    }
    
    const resolvedDefinitions = currentActivePlanetIds
      .map(id => allPlanetDefinitions.find(p => p.id === id))
      .filter(p => p !== undefined) as PlanetDefinition[];

    let storedPlanetImages: Record<string, string> = {};
    // If new planets were selected, we should not try to load old images.
    // The PLANET_IMAGES_KEY was already removed.
    if (!newPlanetsSelected) {
        const storedPlanetImagesRaw = localStorage.getItem(PLANET_IMAGES_KEY);
        if (storedPlanetImagesRaw) {
          try {
            storedPlanetImages = JSON.parse(storedPlanetImagesRaw);
          } catch (e) {
            console.error("Failed to parse stored planet images, will attempt to regenerate.", e);
            localStorage.removeItem(PLANET_IMAGES_KEY); 
          }
        }
    }
    
    let storedVisitedPlanets: string[] = [];
    // If new planets were selected, visited status is also reset.
    // The VISITED_PLANETS_KEY was already removed.
    if (!newPlanetsSelected) {
        const storedVisitedPlanetsRaw = localStorage.getItem(VISITED_PLANETS_KEY);
        if (storedVisitedPlanetsRaw) {
          try {
            storedVisitedPlanets = JSON.parse(storedVisitedPlanetsRaw);
          } catch (e) {
            console.error("Failed to parse stored visited planets.", e);
            localStorage.removeItem(VISITED_PLANETS_KEY); 
          }
        }
    }

    const initialPlanetStates = resolvedDefinitions.map(pDef => {
        const existingImageUrl = storedPlanetImages[pDef.id];
        return {
            ...pDef,
            imageUrl: existingImageUrl || `https://placehold.co/300x200/2E3192/FFFFFF.png?text=${encodeURIComponent(pDef.name)}`,
            isLoadingImage: !existingImageUrl, // isLoadingImage is true ONLY if no image was found in storage.
            isVisited: storedVisitedPlanets.includes(pDef.id),
        };
    });
    
    setActivePlanetDefinitions(initialPlanetStates);
    setIsLoadingDefinitions(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // This effect should run once on mount to set up the initial state.

  // Effect for fetching images if they are marked as isLoadingImage: true
  useEffect(() => {
    if (isLoadingDefinitions || activePlanetDefinitions.length === 0) return;

    const fetchImagesSequentially = async () => {
      let currentStoredImagesMap: Record<string, string> = {};
      const mapRaw = localStorage.getItem(PLANET_IMAGES_KEY); // Get the most current map from localStorage
       if (mapRaw) {
        try {
          currentStoredImagesMap = JSON.parse(mapRaw);
        } catch (e) {
          console.error("Failed to parse currentStoredImagesMap in fetchImagesSequentially, resetting.", e);
          currentStoredImagesMap = {}; 
        }
      }
      
      for (const planetData of activePlanetDefinitions) {
        // Only fetch if isLoadingImage is true AND it's not already being fetched
        if (planetData.isLoadingImage && !currentlyFetchingRef.current.has(planetData.id)) {
          // As an extra safeguard, if an image for this planet somehow exists in currentStoredImagesMap
          // (e.g. fetched by a previous incomplete run), update state and skip fetching.
          if (currentStoredImagesMap[planetData.id]) {
            setActivePlanetDefinitions(prevs =>
              prevs.map(p =>
                p.id === planetData.id
                  ? { ...p, imageUrl: currentStoredImagesMap[planetData.id], isLoadingImage: false }
                  : p
              )
            );
            continue; // Already in localStorage, skip.
          }

          try {
            currentlyFetchingRef.current.add(planetData.id);
            const result = await generateImage({ prompt: planetData.imageHint });
            
            currentStoredImagesMap[planetData.id] = result.imageDataUri; // Add new image to our map
            
            try {
              localStorage.setItem(PLANET_IMAGES_KEY, JSON.stringify(currentStoredImagesMap));
            } catch (e: any) {
              if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                console.warn(`Quota exceeded for PLANET_IMAGES_KEY. Image for ${planetData.name} might not be persisted.`, e.message);
                toast({
                  title: "Lagringsutrymme Nästan Fullt",
                  description: `Bilden för ${planetData.name} kunde inte sparas permanent. Den kan behöva laddas om vid nästa besök.`,
                  variant: "default",
                  duration: 7000,
                });
              } else {
                console.error(`Error saving planet images to localStorage for ${planetData.name}:`, e);
                toast({
                  title: "Fel vid Sparning av Bild",
                  description: `Ett oväntat fel uppstod när bilden för ${planetData.name} skulle sparas lokalt.`,
                  variant: "destructive",
                });
              }
            }

            setActivePlanetDefinitions(prevs =>
              prevs.map(p =>
                p.id === planetData.id
                  ? { ...p, imageUrl: result.imageDataUri, isLoadingImage: false }
                  : p
              )
            );
          } catch (error: any) {
            console.error(`Failed to generate image for ${planetData.name}:`, error);
             let desc = `Kunde inte generera bild för ${planetData.name}. Använder platshållare.`;
            if (error.message && (error.message.includes("503") || error.message.toLowerCase().includes("overloaded"))) {
                desc = `AI-tjänsten för att skapa bilder för ${planetData.name} verkar vara upptagen. Använder platshållare.`;
            } else if (error.message && error.message.toLowerCase().includes("quota")) {
                desc = `AI-tjänsten har nått sin kvot för idag för bilder till ${planetData.name}. Använder platshållare.`;
            }
            toast({
                title: "Bildgenereringsfel",
                description: desc,
                variant: "destructive",
            });
            setActivePlanetDefinitions(prevs =>
              prevs.map(p =>
                p.id === planetData.id ? { ...p, isLoadingImage: false } : p 
              )
            );
          } finally {
            currentlyFetchingRef.current.delete(planetData.id);
          }
        }
      }
    };
    
    if (activePlanetDefinitions.some(p => p.isLoadingImage)) {
      fetchImagesSequentially();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlanetDefinitions, isLoadingDefinitions, toast]); 

  useEffect(() => {
    if (activePlanetDefinitions.length > 0 && activePlanetDefinitions.every(p => p.isVisited)) {
      setAllPlanetsVisited(true);
    } else {
      setAllPlanetsVisited(false);
    }
  }, [activePlanetDefinitions]);


  const handleResetExploration = () => {
    try {
      localStorage.removeItem(VISITED_PLANETS_KEY);
      setActivePlanetDefinitions(prevPlanets => prevPlanets.map(p => ({ ...p, isVisited: false })));
      setAllPlanetsVisited(false);
      toast({
        title: "Utforskning Återställd!",
        description: "Du kan nu besöka de nuvarande planeterna igen.",
      });
    } catch (e) {
        console.error("Error resetting exploration (visited planets)", e);
        toast({
            title: "Fel vid Återställning",
            description: "Kunde inte återställa besökta planeter.",
            variant: "destructive"
        });
    }
  };

  if (isLoadingDefinitions && activePlanetDefinitions.length === 0) { 
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
                Vilket fantastiskt äventyr det har varit. Du är en sann upptäckare! Kom tillbaka efter att ha tryckt "Börja Om Spelet" i huvudmenyn för att upptäcka nya planeter.
              </p>
              <Button onClick={handleResetExploration} size="lg" className="font-semibold">
                Besök Samma Planeter Igen
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
    

    

    