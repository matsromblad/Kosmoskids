
"use client";

import { useState, useEffect } from 'react';
import { GameHeader } from '@/components/layout/GameHeader';
import { PlanetCard } from '@/components/game/PlanetCard';
import { Flame, Snowflake, Gem, Factory, Sun, Bot, Leaf, Telescope } from 'lucide-react';
import { generateImage, type GenerateImageInput } from '@/ai/flows/generate-image-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

interface PlanetInfo {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  icon: React.ElementType; 
  themeColor: string;
  isLoadingImage?: boolean;
  isVisited?: boolean;
}

const initialPlanetsData: Omit<PlanetInfo, 'isLoadingImage' | 'imageUrl' | 'isVisited'>[] = [
  {
    id: 'lavaplaneten-volcanis',
    name: 'Lavaplaneten Volcanis',
    description: 'En glödhet planet täckt av vulkaner och lavafloder. Här bor de eldiga Flammisarna!',
    imageHint: 'cartoon lava planet vibrant fire alien landscape',
    icon: Flame,
    themeColor: 'bg-red-700/30 border-red-600 hover:shadow-red-500/50',
  },
  {
    id: 'isjatten-glacius',
    name: 'Isjätten Glacius',
    description: 'En iskall värld med snötäckta berg och frusna sjöar. Islingarna trivs i kylan.',
    imageHint: 'cartoon ice planet detailed snow creatures mountains',
    icon: Snowflake,
    themeColor: 'bg-blue-500/30 border-blue-400 hover:shadow-blue-400/50',
  },
  {
    id: 'kristallgrottorna-på-xylar',
    name: 'Kristallgrottorna på Xylar',
    description: 'Ett skimrande nätverk av grottor fyllda med glittrande kristaller och mystiska väsen.',
    imageHint: 'cartoon crystal cave planet glowing gems fantasy creatures',
    icon: Gem,
    themeColor: 'bg-purple-600/30 border-purple-500 hover:shadow-purple-500/50',
  },
  {
    id: 'robotstaden-gearwerk',
    name: 'Robotstaden Gearwerk',
    description: 'En högteknologisk stad bebodd av avancerade robotar och flygande farkoster.',
    imageHint: 'cartoon robot city futuristic flying vehicles shiny metal',
    icon: Bot,
    themeColor: 'bg-gray-600/30 border-gray-500 hover:shadow-gray-400/50',
  },
];

const VISITED_PLANETS_STORAGE_KEY = "kosmoskids_visited_planets";

export default function RymdkartaPage() {
  const [planets, setPlanets] = useState<PlanetInfo[]>(() => {
    const storedVisitedPlanets: string[] = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(VISITED_PLANETS_STORAGE_KEY) || '[]') : [];
    return initialPlanetsData.map(p => ({
      ...p,
      imageUrl: `https://placehold.co/300x200/2E3192/FFFFFF.png?text=${encodeURIComponent(p.name)}`, 
      isLoadingImage: true, 
      isVisited: storedVisitedPlanets.includes(p.id),
    }));
  });

  const [allPlanetsVisited, setAllPlanetsVisited] = useState(false);

  useEffect(() => {
    const storedVisitedPlanets: string[] = JSON.parse(localStorage.getItem(VISITED_PLANETS_STORAGE_KEY) || '[]');
    const updatedPlanets = planets.map(p => ({
      ...p,
      isVisited: storedVisitedPlanets.includes(p.id),
    }));
    setPlanets(updatedPlanets);

    if (storedVisitedPlanets.length === initialPlanetsData.length && initialPlanetsData.length > 0) {
      setAllPlanetsVisited(true);
    } else {
      setAllPlanetsVisited(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs once on mount to load visited status

  useEffect(() => {
    // Recalculate visited status if planets array changes (e.g., after visiting a new planet)
    const storedVisitedPlanets: string[] = JSON.parse(localStorage.getItem(VISITED_PLANETS_STORAGE_KEY) || '[]') ;
     if (storedVisitedPlanets.length === initialPlanetsData.length && initialPlanetsData.length > 0) {
      setAllPlanetsVisited(true);
    } else {
      setAllPlanetsVisited(false);
    }
  }, [planets]);


  useEffect(() => {
    const fetchImagesSequentially = async () => {
      for (const planetData of initialPlanetsData) {
        const currentPlanetState = planets.find(p => p.id === planetData.id);
        
        if (currentPlanetState && currentPlanetState.imageUrl.startsWith('https://placehold.co') && currentPlanetState.isLoadingImage) {
          try {
            setPlanets(prevPlanets =>
              prevPlanets.map(p =>
                p.id === planetData.id ? { ...p, isLoadingImage: true } : p
              )
            );

            const result = await generateImage({ prompt: planetData.imageHint });
            
            setPlanets(prevPlanets =>
              prevPlanets.map(p =>
                p.id === planetData.id
                  ? { ...p, imageUrl: result.imageDataUri, isLoadingImage: false }
                  : p
              )
            );
          } catch (error) {
            console.error(`Failed to generate image for ${planetData.name}:`, error);
            setPlanets(prevPlanets =>
              prevPlanets.map(p =>
                p.id === planetData.id ? { ...p, isLoadingImage: false } : p 
              )
            );
          }
        } else if (currentPlanetState && currentPlanetState.isLoadingImage) {
           setPlanets(prevPlanets =>
            prevPlanets.map(p => (p.id === planetData.id ? { ...p, isLoadingImage: false } : p))
          );
        }
      }
    };
    
    if (planets.some(p => p.isLoadingImage && p.imageUrl.startsWith('https://placehold.co'))) {
      fetchImagesSequentially();
    } else {
      setPlanets(prevPlanets => prevPlanets.map(p => ({...p, isLoadingImage: false})));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleResetExploration = () => {
    localStorage.removeItem(VISITED_PLANETS_STORAGE_KEY);
    setPlanets(prevPlanets => prevPlanets.map(p => ({ ...p, isVisited: false })));
    setAllPlanetsVisited(false);
  };

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
                Börja Om Utforskningen
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
          Klicka på en planet eller rymdstation för att starta ditt nästa äventyr!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {planets.map((planet) => (
            <PlanetCard
              key={planet.id}
              planetId={planet.id}
              name={planet.name}
              description={planet.description}
              imageUrl={planet.imageUrl}
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
