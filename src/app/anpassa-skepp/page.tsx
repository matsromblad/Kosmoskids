"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Orbit, Flame, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GameHeader } from '@/components/layout/GameHeader';
import { OptionCard } from '@/components/game/OptionCard';

interface SpaceshipPartOption {
  id: string;
  name: string;
  imageUrl: string;
  imageHint: string;
}

const wingOptions: SpaceshipPartOption[] = [
  { id: 'wing1', name: 'Snabba Vingar', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'fast wings' },
  { id: 'wing2', name: 'Solpanels-Vingar', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'solar panel wings' },
  { id: 'wing3', name: 'Mini-vingar', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'mini wings spaceship' },
];
const engineOptions: SpaceshipPartOption[] = [
  { id: 'engine1', name: 'Plasma Motor', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'plasma engine' },
  { id: 'engine2', name: 'Hyperdrive X', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'hyperdrive engine' },
  { id: 'engine3', name: 'Tyst Motor', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'silent engine' },
];
const decorationOptions: SpaceshipPartOption[] = [
  { id: 'deco1', name: 'Stjärn-klistermärken', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'star stickers' },
  { id: 'deco2', name: 'Rymd-flammor', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'space flames decal' },
  { id: 'deco3', name: 'Kosmiska Blommor', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'cosmic flowers' },
];

export default function AnpassaSkeppPage() {
  const [selectedWings, setSelectedWings] = useState<string | null>(wingOptions[0].id);
  const [selectedEngine, setSelectedEngine] = useState<string | null>(engineOptions[0].id);
  const [selectedDecoration, setSelectedDecoration] = useState<string | null>(null);

  const [spaceshipImageUrl, setSpaceshipImageUrl] = useState('https://placehold.co/400x300.png');
  useEffect(() => {
    const seed = (selectedWings?.length || 0) + (selectedEngine?.length || 0) + (selectedDecoration?.length || 0);
    setSpaceshipImageUrl(`https://placehold.co/400x300.png?seed=${seed}`);
  }, [selectedWings, selectedEngine, selectedDecoration]);


  const renderOptionGrid = (options: SpaceshipPartOption[], selected: string | null, setSelected: (id: string) => void) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
      {options.map(opt => (
        <OptionCard
          key={opt.id}
          name={opt.name}
          imageUrl={opt.imageUrl}
          imageHint={opt.imageHint}
          isSelected={selected === opt.id}
          onSelect={() => setSelected(opt.id)}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-indigo-900/30">
      <GameHeader title="Bygg ditt Rymdskepp" />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Spaceship Display */}
          <div className="lg:col-span-1 flex justify-center">
            <Card className="w-full max-w-md shadow-xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-headline text-primary">Ditt Skepp</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-6">
                <Image src={spaceshipImageUrl} alt="Rymdskepp" width={400} height={300} className="rounded-lg object-contain shadow-lg border-2 border-primary" data-ai-hint="spaceship cartoon" />
              </CardContent>
            </Card>
          </div>

          {/* Customization Options */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="wings" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-primary/20">
                <TabsTrigger value="wings" className="text-xs sm:text-sm data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Orbit className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Vingar</TabsTrigger>
                <TabsTrigger value="engines" className="text-xs sm:text-sm data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Flame className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Motorer</TabsTrigger>
                <TabsTrigger value="decorations" className="text-xs sm:text-sm data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Palette className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Dekor</TabsTrigger>
              </TabsList>
              <ScrollArea className="h-[calc(100vh-12rem)] sm:h-[calc(100vh-10rem)] lg:h-auto lg:max-h-[70vh] mt-2 p-0.5">
                <TabsContent value="wings">
                  <Card className="bg-card/70 backdrop-blur-sm border-0 shadow-none">
                    <CardHeader><CardTitle className="text-lg text-primary">Välj Vingar</CardTitle></CardHeader>
                    <CardContent>{renderOptionGrid(wingOptions, selectedWings, setSelectedWings)}</CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="engines">
                  <Card className="bg-card/70 backdrop-blur-sm border-0 shadow-none">
                    <CardHeader><CardTitle className="text-lg text-primary">Välj Motor</CardTitle></CardHeader>
                    <CardContent>{renderOptionGrid(engineOptions, selectedEngine, setSelectedEngine)}</CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="decorations">
                  <Card className="bg-card/70 backdrop-blur-sm border-0 shadow-none">
                    <CardHeader><CardTitle className="text-lg text-primary">Välj Dekoration</CardTitle></CardHeader>
                    <CardContent>{renderOptionGrid(decorationOptions, selectedDecoration, setSelectedDecoration)}</CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
