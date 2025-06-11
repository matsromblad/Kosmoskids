
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Orbit, Flame, Palette, RocketIcon, Wand2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GameHeader } from '@/components/layout/GameHeader';
import { OptionCard } from '@/components/game/OptionCard';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { generateSpaceshipBackstory, type GenerateSpaceshipBackstoryInput } from '@/ai/flows/generate-spaceship-backstory';
import { LoadingSpinner } from '@/components/game/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SpaceshipPartOption {
  id: string;
  name: string;
}

interface StoredSpaceship {
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

const spaceshipStyles = [
  { value: 'Snabb kurir', label: 'Snabb kurir'},
  { value: 'Tungt lastfartyg', label: 'Tungt lastfartyg'},
  { value: 'Utforskarskepp', label: 'Utforskarskepp'},
  { value: 'Lyxkryssare', label: 'Lyxkryssare'},
  { value: 'Stridsfarkost', label: 'Stridsfarkost'},
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
  const [selectedSpaceshipStyle, setSelectedSpaceshipStyle] = useState<string>(spaceshipStyles[0].value);
  const [spaceshipBackstory, setSpaceshipBackstory] = useState<string | null>(null);
  const [isLoadingSpaceshipBackstory, setIsLoadingSpaceshipBackstory] = useState(false);

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
        setSpaceshipBackstory(storedSpaceship.backstory);
        if (storedSpaceship.style) {
          setSelectedSpaceshipStyle(storedSpaceship.style);
        }
      } catch (e) {
        console.error("Failed to parse stored spaceship", e);
        localStorage.removeItem(SPACESHIP_STORAGE_KEY);
      }
    } else {
      setSelectedWings(initialWingOptions[0].id);
      setSelectedEngine(initialEngineOptions[0].id);
    }
  }, []);

  const handleGenerateSpaceshipBackstory = async () => {
    if (!selectedWings || !selectedEngine) {
      toast({
        title: "Val Saknas",
        description: "Välj åtminstone vingar och motor innan du skapar en historia.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingSpaceshipBackstory(true);
    setSpaceshipBackstory(null);

    const wingName = wingOptions.find(opt => opt.id === selectedWings)?.name || "standardvingar";
    const engineName = engineOptions.find(opt => opt.id === selectedEngine)?.name || "standardmotor";
    const decorationName = decorationOptions.find(opt => opt.id === selectedDecoration)?.name;

    try {
      const input: GenerateSpaceshipBackstoryInput = {
        spaceshipStyle: selectedSpaceshipStyle,
        wingName,
        engineName,
        decorationName: decorationName,
      };
      const result = await generateSpaceshipBackstory(input);
      setSpaceshipBackstory(result.backstory);
      toast({
        title: "Skeppshistoria Skapad!",
        description: "En unik historia för ditt skepp är klar.",
      });
    } catch (error) {
      console.error("Error generating spaceship backstory:", error);
      setSpaceshipBackstory("Ett fel uppstod när skeppets historia skulle skapas. Försök igen senare!");
      toast({
        title: "Fel",
        description: "Kunde inte generera skeppshistoria.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSpaceshipBackstory(false);
    }
  };

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
    
    let prompt = `Skapa en bild av ett rymdskepp. 
    Vingar: ${wingName}. 
    Motor: ${engineName}. 
    Dekoration: ${decorationName}. 
    Skeppets stil: ${selectedSpaceshipStyle}. `;
    if (spaceshipBackstory) {
      prompt += `Bakgrundshistoria: ${spaceshipBackstory}. `;
    }
    prompt += `Visuell stil: Enkel, cool tecknad stil, barnvänlig, rymdtema.`;

    try {
      const result = await generateImage({ prompt });
      setSpaceshipImageUrl(result.imageDataUri);
      toast({
        title: "Skepp Skapat!",
        description: "Ditt unika rymdskepp är redo! Det är sparat lokalt.",
      });

      const spaceshipToStore: StoredSpaceship = {
        imageUrl: result.imageDataUri,
        backstory: spaceshipBackstory,
        style: selectedSpaceshipStyle,
        parts: {
          wing: selectedWings,
          engine: selectedEngine,
          decoration: selectedDecoration,
        },
        partNames: { wingName, engineName, decorationName }
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
                    <p>Gör dina val, skapa en historia och klicka sedan på "Skapa Skepp"!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="w-full shadow-xl bg-card/80 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-headline text-accent flex items-center gap-2"><Wand2 /> Skeppets Historia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="spaceshipStyle" className="block text-sm font-medium text-muted-foreground mb-1">Välj stil för skeppets historia:</label>
                  <Select value={selectedSpaceshipStyle} onValueChange={setSelectedSpaceshipStyle}>
                    <SelectTrigger id="spaceshipStyle" className="w-full bg-input/50 border-border text-foreground">
                      <SelectValue placeholder="Välj en stil" />
                    </SelectTrigger>
                    <SelectContent>
                      {spaceshipStyles.map(style => (
                        <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleGenerateSpaceshipBackstory} 
                  disabled={isLoadingSpaceshipBackstory || !selectedWings || !selectedEngine} 
                  className="w-full font-semibold" 
                  variant="secondary"
                >
                  {isLoadingSpaceshipBackstory ? <LoadingSpinner size="sm" /> : 'Skapa Historia för Skeppet'}
                </Button>
                {spaceshipBackstory && (
                  <ScrollArea className="h-24 mt-2 p-3 border rounded-md bg-muted/50 text-sm text-foreground">
                    <p>{spaceshipBackstory}</p>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="wings" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-primary/20">
                <TabsTrigger value="wings" className="text-xs sm:text-sm data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Orbit className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Vingar</TabsTrigger>
                <TabsTrigger value="engines" className="text-xs sm:text-sm data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Flame className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Motorer</TabsTrigger>
                <TabsTrigger value="decorations" className="text-xs sm:text-sm data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Palette className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Dekor</TabsTrigger>
              </TabsList>
              <ScrollArea className="h-auto max-h-[calc(100vh-20rem)] lg:max-h-[40vh] mt-2 p-0.5">
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
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button 
                onClick={handleCreateSpaceshipImage} 
                disabled={isLoadingMainSpaceshipImage || isLoadingSpaceshipBackstory || !selectedWings || !selectedEngine} 
                className="w-full font-semibold" 
                size="lg"
              >
                {isLoadingMainSpaceshipImage ? <LoadingSpinner size="sm" /> : 'Skapa Skepp'}
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full font-semibold">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Tillbaka
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
