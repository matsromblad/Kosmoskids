
"use client";

import { useState, useEffect } from 'react';
import { GameHeader } from '@/components/layout/GameHeader';
import { PlanetCard } from '@/components/game/PlanetCard';
import { Flame, Snowflake, Gem, Factory } from 'lucide-react';
import { generateImage, type GenerateImageInput } from '@/ai/flows/generate-image-flow';

interface PlanetInfo {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  icon: React.ElementType; 
  themeColor: string;
  isLoadingImage?: boolean;
}

const initialPlanetsData: Omit<PlanetInfo, 'isLoadingImage' | 'imageUrl'>[] = [
  {
    id: 'lavaplaneten',
    name: 'Lavaplaneten Volcanis',
    description: 'En glödhet planet täckt av vulkaner och lavafloder. Här bor de eldiga Flammisarna!',
    imageHint: 'lava planet cartoon vibrant',
    icon: Flame,
    themeColor: 'bg-red-700/30 border-red-600 hover:shadow-red-500/50',
  },
  {
    id: 'isjatten',
    name: 'Isjätten Glacius',
    description: 'En iskall värld med snötäckta berg och frusna sjöar. Islingarna trivs i kylan.',
    imageHint: 'ice planet cartoon detailed',
    icon: Snowflake,
    themeColor: 'bg-blue-500/30 border-blue-400 hover:shadow-blue-400/50',
  },
  {
    id: 'kristallasteroiderna',
    name: 'Kristallasteroiderna',
    description: 'Ett skimrande asteroidfält fyllt med glittrande kristaller och mystiska grottor.',
    imageHint: 'crystal asteroid field cartoon',
    icon: Gem,
    themeColor: 'bg-purple-600/30 border-purple-500 hover:shadow-purple-500/50',
  },
  {
    id: 'rymdstation-alpha',
    name: 'Rymdstation Alpha',
    description: 'En högteknologisk rymdstation där varelser från hela galaxen möts och handlar.',
    imageHint: 'space station cartoon futuristic',
    icon: Factory,
    themeColor: 'bg-gray-600/30 border-gray-500 hover:shadow-gray-400/50',
  },
];

export default function RymdkartaPage() {
  const [planets, setPlanets] = useState<PlanetInfo[]>(() => 
    initialPlanetsData.map(p => ({
      ...p,
      imageUrl: `https://placehold.co/300x200.png?text=${encodeURIComponent(p.name)}`, // Initial placeholder
      isLoadingImage: true, // Set to true to trigger generation
    }))
  );

  useEffect(() => {
    const fetchImagesSequentially = async () => {
      // Create a mutable copy of planets to update state      
      for (const planetData of initialPlanetsData) {
        // Find the current state of the planet to check if image already loaded or not needed
        const currentPlanetState = planets.find(p => p.id === planetData.id);
        
        // Only generate if it's still the placeholder and isLoading is true
        if (currentPlanetState && currentPlanetState.imageUrl.startsWith('https://placehold.co') && currentPlanetState.isLoadingImage) {
          try {
            // Ensure isLoadingImage is true for the specific planet before fetching
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
                p.id === planetData.id ? { ...p, isLoadingImage: false } : p // Stop loading on error
              )
            );
          }
        } else if (currentPlanetState && currentPlanetState.isLoadingImage) {
           // If it's not a placeholder but was loading, just turn off loading
           setPlanets(prevPlanets =>
            prevPlanets.map(p => (p.id === planetData.id ? { ...p, isLoadingImage: false } : p))
          );
        }
      }
    };
    
    // Check if any planet actually needs loading to avoid running if all images are already somehow loaded (e.g. from cache or future implementation)
    if (planets.some(p => p.isLoadingImage && p.imageUrl.startsWith('https://placehold.co'))) {
      fetchImagesSequentially();
    } else {
      // If no images need loading, ensure all isLoadingImage flags are false
      setPlanets(prevPlanets => prevPlanets.map(p => ({...p, isLoadingImage: false})));
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-indigo-900/50">
      <GameHeader title="Utforska Rymden" />
      <main className="flex-grow container mx-auto px-4 py-8">
        <p className="text-center text-lg text-foreground mb-8">
          Klicka på en planet eller rymdstation för att starta ditt nästa äventyr!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
          {planets.map((planet) => (
            <PlanetCard
              key={planet.id}
              planetId={planet.id}
              name={planet.name}
              description={planet.description}
              imageUrl={planet.imageUrl}
              imageHint={planet.imageHint} // imageHint is still needed for data-ai-hint on PlanetCard if we re-enable generation there
              icon={planet.icon}
              themeColor={planet.themeColor}
              isLoadingImage={planet.isLoadingImage}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
