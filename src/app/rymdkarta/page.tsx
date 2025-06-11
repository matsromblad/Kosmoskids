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

const initialPlanets: PlanetInfo[] = [
  {
    id: 'lavaplaneten',
    name: 'Lavaplaneten Volcanis',
    description: 'En glödhet planet täckt av vulkaner och lavafloder. Här bor de eldiga Flammisarna!',
    imageUrl: 'https://placehold.co/300x200.png',
    imageHint: 'lava planet cartoon vibrant',
    icon: Flame,
    themeColor: 'bg-red-700/30 border-red-600 hover:shadow-red-500/50',
  },
  {
    id: 'isjatten',
    name: 'Isjätten Glacius',
    description: 'En iskall värld med snötäckta berg och frusna sjöar. Islingarna trivs i kylan.',
    imageUrl: 'https://placehold.co/300x200.png',
    imageHint: 'ice planet cartoon detailed',
    icon: Snowflake,
    themeColor: 'bg-blue-500/30 border-blue-400 hover:shadow-blue-400/50',
  },
  {
    id: 'kristallasteroiderna',
    name: 'Kristallasteroiderna',
    description: 'Ett skimrande asteroidfält fyllt med glittrande kristaller och mystiska grottor.',
    imageUrl: 'https://placehold.co/300x200.png',
    imageHint: 'crystal asteroid field cartoon',
    icon: Gem,
    themeColor: 'bg-purple-600/30 border-purple-500 hover:shadow-purple-500/50',
  },
  {
    id: 'rymdstation-alpha',
    name: 'Rymdstation Alpha',
    description: 'En högteknologisk rymdstation där varelser från hela galaxen möts och handlar.',
    imageUrl: 'https://placehold.co/300x200.png',
    imageHint: 'space station cartoon futuristic',
    icon: Factory,
    themeColor: 'bg-gray-600/30 border-gray-500 hover:shadow-gray-400/50',
  },
];

export default function RymdkartaPage() {
  const [planets, setPlanets] = useState<PlanetInfo[]>(initialPlanets.map(p => ({...p, isLoadingImage: p.imageUrl.startsWith('https://placehold.co')})));

  useEffect(() => {
    const fetchImagesForPlanets = (
        planetList: PlanetInfo[],
        setter: React.Dispatch<React.SetStateAction<PlanetInfo[]>>
    ) => {
        planetList.forEach(planet => {
            if (planet.imageUrl.startsWith('https://placehold.co') && planet.isLoadingImage) {
                generateImage({ prompt: planet.imageHint })
                    .then(result => {
                        setter(prev =>
                            prev.map(p =>
                                p.id === planet.id
                                    ? { ...p, imageUrl: result.imageDataUri, isLoadingImage: false }
                                    : p
                            )
                        );
                    })
                    .catch(error => {
                        console.error(`Failed to generate image for ${planet.name}:`, error);
                        setter(prev =>
                            prev.map(p =>
                                p.id === planet.id ? { ...p, isLoadingImage: false } : p
                            )
                        );
                    });
            } else if (!planet.imageUrl.startsWith('https://placehold.co') && planet.isLoadingImage) {
                 setter(prev =>
                    prev.map(p => (p.id === planet.id ? { ...p, isLoadingImage: false } : p))
                );
            }
        });
    };

    fetchImagesForPlanets(planets, setPlanets);
  }, []);

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
              imageHint={planet.imageHint}
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
