
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Orbit, Flame, Palette, RocketIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GameHeader } from '@/components/layout/GameHeader';
import { OptionCard } from '@/components/game/OptionCard';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { LoadingSpinner } from '@/components/game/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

interface SpaceshipPartOption {
  id: string;
  name: string;
}

interface StoredSpaceship {
  imageUrl: string;
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

const SPACESHIP_STORAGE_KEY = "kosmoskids_spaceship";

const initialWingOptions: SpaceshipPartOption[] = [
  { id: 'wing1', name: 'Snabba Vingar' },
  { id: 'wing2', name: 'Solpanels-Vingar' },
  { id: 'wing3', name: 'Mini-vingar' },
];
const initialEngineOptions: SpaceshipPartOption[] = [
  { id: 'engine1', name: 'Plasma Motor' },
  { id: 'engine2', name: 'Hyperdrive X' },
  { id: 'engine3', name: 'Tyst Motor' },
];
const initialDecorationOptions: SpaceshipPartOption[] = [
  { id: 'deco1', name: 'Stjärn-klistermärken' },
  { id: 'deco2', name: 'Rymd-flammor' },
  { id: 'deco3', name: 'Kosmiska Blommor' },
];

export default function AnpassaSkeppPage() {
  const [selectedWings, setSelectedWings] = useState<string | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);
  const [selectedDecoration, setSelectedDecoration] = useState<string | null>(null);

  const [wingOptions] = useState<SpaceshipPartOption[]>(initialWingOptions);
  const [engineOptions] = useState<SpaceshipPartOption[]>(initialEngineOptions);
  const [decorationOptions] = useState<SpaceshipPartOption[]>(initialDecorationOptions);

  const [spaceshipImageUrl, setSpaceshipImageUrl] = useState<string | null>(null);
  const [isLoadingMainSpaceshipImage, setIsLoadingMainSpaceshipImage] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("wings");

  useEffect(() => {
    const storedSpaceshipRaw = localStorage.getItem(SPACESHIP_STORAGE_KEY);
    if (storedSpaceshipRaw) {
      try {
        const storedSpaceship: StoredSpaceship = JSON.parse(storedSpaceshipRaw);
        setSpaceshipImageUrl(storedSpaceship.imageUrl);
        setSelectedWings(storedSpaceship.parts.wing);
        setSelectedEngine(storedSpaceship.parts.engine);
        setSelectedDecoration(storedSpaceship.parts.decoration);
      } catch (e) {
        console.error("Failed to parse stored spaceship", e);
        localStorage.removeItem(SPACESHIP_STORAGE_KEY);
      }
    } else {
      // Set defaults if nothing is stored
      setSelectedWings(initialWingOptions[0].id);
      setSelectedEngine(initialEngineOptions[0].id);
    }
  }, []);


  const handleCreateSpaceshipImage = async () => {
    if (!selectedWings || !selectedEngine) {
      toast({
        title: "Val Saknas",
        description: "Välj åtminstone vingar och motor för ditt skepp.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingMainSpaceshipImage(true);
    setSpaceshipImageUrl(null);

    const wingName = wingOptions.find(opt => opt.id === selectedWings)?.name || "standardvingar";
    const engineName = engineOptions.find(opt => opt.id === selectedEngine)?.name || "standardmotor";
    const decorationName = decorationOptions.find(opt => opt.id === selectedDecoration)?.name || "inga dekorationer";
    
    const prompt = `Skapa en bild av ett rymdskepp. 
    Vingar: ${wingName}. 
    Motor: ${engineName}. 
    Dekoration: ${decorationName}. 
    Stil: Enkel, cool tecknad stil, barnvänlig, rymdtema.`;

    try {
      const result = await generateImage({ prompt });
      setSpaceshipImageUrl(result.imageDataUri);
      toast({
        title: "Skepp Skapat!",
        description: "Ditt unika rymdskepp är redo! Glöm inte att spara.",
      });

      // Save to localStorage
      const spaceshipToStore: StoredSpaceship = {
        imageUrl: result.imageDataUri,
        parts: {
          wing: selectedWings,
          engine: selectedEngine,
          decoration: selectedDecoration,
        },
        partNames: { wingName, engineName, decorationName}
      };
      localStorage.setItem(SPACESHIP_STORAGE_KEY, JSON.stringify(spaceshipToStore));

    } catch (error) {
      console.error("Failed to generate main spaceship image:", error);
      toast({
        title: "Fel vid bildgenerering",
        description: "Kunde inte skapa bild för skeppet.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMainSpaceshipImage(false);
    }
  };

  const renderOptionGrid = (options: SpaceshipPartOption[], selected: string | null, setSelected: (id: string) => void) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
      {options.map(opt => (
        <OptionCard
          key={opt.id}
          name={opt.name}
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
          <div className="lg:col-span-1 flex justify-center">
            <Card className="w-full max-w-md shadow-xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-headline text-primary">Ditt Skepp</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center p-6 min-h-[300px]">
                {isLoadingMainSpaceshipImage ? (
                  <LoadingSpinner size="lg"/>
                ) : spaceshipImageUrl ? (
                  <Image src={spaceshipImageUrl} alt="Rymdskepp" width={400} height={300} className="rounded-lg object-contain shadow-lg border-2 border-primary" />
                ) : (
                  <div className="text-center text-muted-foreground p-4">
                    <RocketIcon className="h-16 w-16 mx-auto mb-4 text-primary/50" />
                    <p>Gör dina val nedan och klicka sedan på "Skapa Skepp & Spara Lokalt"!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="wings" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-primary/20">
                <TabsTrigger value="wings" className="text-xs sm:text-sm data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Orbit className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Vingar</TabsTrigger>
                <TabsTrigger value="engines" className="text-xs sm:text-sm data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Flame className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Motorer</TabsTrigger>
                <TabsTrigger value="decorations" className="text-xs sm:text-sm data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Palette className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Dekor</TabsTrigger>
              </TabsList>
              <ScrollArea className="h-auto max-h-[calc(100vh-20rem)] lg:max-h-[60vh] mt-2 p-0.5">
                <TabsContent value="wings" forceMount={activeTab === "wings"}>
                  <Card className="bg-card/70 backdrop-blur-sm border-0 shadow-none">
                    <CardHeader><CardTitle className="text-lg text-primary">Välj Vingar</CardTitle></CardHeader>
                    <CardContent>{renderOptionGrid(wingOptions, selectedWings, setSelectedWings)}</CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="engines" forceMount={activeTab === "engines"}>
                  <Card className="bg-card/70 backdrop-blur-sm border-0 shadow-none">
                    <CardHeader><CardTitle className="text-lg text-primary">Välj Motor</CardTitle></CardHeader>
                    <CardContent>{renderOptionGrid(engineOptions, selectedEngine, setSelectedEngine)}</CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="decorations" forceMount={activeTab === "decorations"}>
                  <Card className="bg-card/70 backdrop-blur-sm border-0 shadow-none">
                    <CardHeader><CardTitle className="text-lg text-primary">Välj Dekoration</CardTitle></CardHeader>
                    <CardContent>{renderOptionGrid(decorationOptions, selectedDecoration, setSelectedDecoration)}</CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>
            <Button 
              onClick={handleCreateSpaceshipImage} 
              disabled={isLoadingMainSpaceshipImage || !selectedWings || !selectedEngine} 
              className="w-full font-semibold mt-6" 
              size="lg"
            >
              {isLoadingMainSpaceshipImage ? <LoadingSpinner size="sm" /> : 'Skapa Skepp & Spara Lokalt'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
