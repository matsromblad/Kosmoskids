"use client";

import { GameHeader } from '@/components/layout/GameHeader';
import { PlanetCard } from '@/components/game/PlanetCard';
import { Flame, Snowflake, Gem, Factory } from 'lucide-react'; // Using Factory for Rymdstation

interface PlanetInfo {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  icon: React.ElementType; // LucideIcon
  themeColor: string;
}

const planets: PlanetInfo[] = [
  {
    id: 'lavaplaneten',
    name: 'Lavaplaneten Volcanis',
    description: 'En glödhet planet täckt av vulkaner och lavafloder. Här bor de eldiga Flammisarna!',
    imageUrl: 'https://placehold.co/300x200.png',
    imageHint: 'lava planet cartoon',
    icon: Flame,
    themeColor: 'bg-red-700/30 border-red-600 hover:shadow-red-500/50',
  },
  {
    id: 'isjatten',
    name: 'Isjätten Glacius',
    description: 'En iskall värld med snötäckta berg och frusna sjöar. Islingarna trivs i kylan.',
    imageUrl: 'https://placehold.co/300x200.png',
    imageHint: 'ice planet cartoon',
    icon: Snowflake,
    themeColor: 'bg-blue-500/30 border-blue-400 hover:shadow-blue-400/50',
  },
  {
    id: 'kristallasteroiderna',
    name: 'Kristallasteroiderna',
    description: 'Ett skimrande asteroidfält fyllt med glittrande kristaller och mystiska grottor.',
    imageUrl: 'https://placehold.co/300x200.png',
    imageHint: 'crystal asteroid cartoon',
    icon: Gem,
    themeColor: 'bg-purple-600/30 border-purple-500 hover:shadow-purple-500/50',
  },
  {
    id: 'rymdstation-alpha',
    name: 'Rymdstation Alpha',
    description: 'En högteknologisk rymdstation där varelser från hela galaxen möts och handlar.',
    imageUrl: 'https://placehold.co/300x200.png',
    imageHint: 'space station cartoon',
    icon: Factory,
    themeColor: 'bg-gray-600/30 border-gray-500 hover:shadow-gray-400/50',
  },
];

export default function RymdkartaPage() {
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
            />
          ))}
        </div>
      </main>
    </div>
  );
}
