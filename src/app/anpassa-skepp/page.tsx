
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Orbit, Flame, Palette, RocketIcon, Wand2, ArrowLeft, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GameHeader } from '@/components/layout/GameHeader';
import { OptionCard } from '@/components/game/OptionCard';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { generateSpaceshipBackstory, type GenerateSpaceshipBackstoryInput } from '@/ai/flows/generate-spaceship-backstory';
import { generateSpaceshipName, type GenerateSpaceshipNameInput } from '@/ai/flows/generate-spaceship-name';
import { LoadingSpinner } from '@/components/game/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getRandomUniqueElements } from '@/lib/utils';

interface SpaceshipPartOption {
  id: string;
  name: string;
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
  partNames: { // This might be redundant if we always fetch names from current options or global options
    wingName: string;
    engineName: string;
    decorationName: string;
  }
}

const SPACESHIP_STORAGE_KEY = "kosmoskids_spaceship";
const LOGO_STORAGE_KEY = "kosmoskids_logo";
const PLANET_IMAGES_KEY = "kosmoskids_planet_images";
const SPACESHIP_CUSTOMIZATION_OPTIONS_KEY_V1 = "KOSMOSKIDS_SPACESHIP_CUSTOMIZATION_OPTIONS_V1";


// Global pools of all possible options
const allWingOptionsGlobal: SpaceshipPartOption[] = [
  { id: 'wing1', name: 'Snabba Vingar' },
  { id: 'wing2', name: 'Solpanels-Vingar' },
  { id: 'wing3', name: 'Mini-vingar' },
  { id: 'wing4', name: 'Delta-vingar' },
  { id: 'wing5', name: 'Organiska Vingar' },
  { id: 'wing6', name: 'Fjäderlätta Vingar' },
  { id: 'wing7', name: 'Pansarvingar' },
];
const allEngineOptionsGlobal: SpaceshipPartOption[] = [
  { id: 'engine1', name: 'Plasma Motor' },
  { id: 'engine2', name: 'Hyperdrive X' },
  { id: 'engine3', name: 'Tyst Motor' },
  { id: 'engine4', name: 'Jonmotor MKII' },
  { id: 'engine5', name: 'Svart Hål-Drive (mini)' },
  { id: 'engine6', name: 'Antimateria-reaktor' },
  { id: 'engine7', name: 'Solsegel-Boost' },
];
const allDecorationOptionsGlobal: SpaceshipPartOption[] = [
  { id: 'deco1', name: 'Stjärn-klistermärken' },
  { id: 'deco2', name: 'Rymd-flammor' },
  { id: 'deco3', name: 'Kosmiska Blommor' },
  { id: 'deco4', name: 'Graffiti-taggar' },
  { id: 'deco5', name: 'Holografisk Projektor' },
  { id: 'deco6', name: 'Lysande Runor' },
  { id: 'deco7', name: 'Kameleont-färg' },
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

  const [wingOptions, setWingOptions] = useState<SpaceshipPartOption[]>([]);
  const [engineOptions, setEngineOptions] = useState<SpaceshipPartOption[]>([]);
  const [decorationOptions, setDecorationOptions] = useState<SpaceshipPartOption[]>([]);

  const [spaceshipName, setSpaceshipName] = useState<string | null>(null);
  const [spaceshipImageUrl, setSpaceshipImageUrl] = useState<string | null>(null);
  const [isLoadingMainSpaceshipImage, setIsLoadingMainSpaceshipImage] = useState(false);
  const [selectedSpaceshipStyle, setSelectedSpaceshipStyle] = useState<string>(spaceshipStyles[0].value);
  const [spaceshipBackstory, setSpaceshipBackstory] = useState<string | null>(null);
  const [isLoadingSpaceshipBackstory, setIsLoadingSpaceshipBackstory] = useState(false);
  const [isLoadingSpaceshipName, setIsLoadingSpaceshipName] = useState(false);

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("wings");

  const randomizeAndStoreSpaceshipOptions = () => {
    const newWings = getRandomUniqueElements(allWingOptionsGlobal, 3);
    const newEngines = getRandomUniqueElements(allEngineOptionsGlobal, 3);
    const newDecorations = getRandomUniqueElements(allDecorationOptionsGlobal, 3);

    const optionsToStore = {
      wings: newWings,
      engines: newEngines,
      decorations: newDecorations,
    };
    localStorage.setItem(SPACESHIP_CUSTOMIZATION_OPTIONS_KEY_V1, JSON.stringify(optionsToStore));
    return optionsToStore;
  };

  useEffect(() => {
    let currentWingOpts: SpaceshipPartOption[];
    let currentEngineOpts: SpaceshipPartOption[];
    let currentDecorationOpts: SpaceshipPartOption[];

    const storedOptionsRaw = localStorage.getItem(SPACESHIP_CUSTOMIZATION_OPTIONS_KEY_V1);
    if (storedOptionsRaw) {
      try {
        const stored = JSON.parse(storedOptionsRaw);
        currentWingOpts = stored.wings || getRandomUniqueElements(allWingOptionsGlobal, 3);
        currentEngineOpts = stored.engines || getRandomUniqueElements(allEngineOptionsGlobal, 3);
        currentDecorationOpts = stored.decorations || getRandomUniqueElements(allDecorationOptionsGlobal, 3);
        if (!currentWingOpts.length) currentWingOpts = getRandomUniqueElements(allWingOptionsGlobal, 3);
        if (!currentEngineOpts.length) currentEngineOpts = getRandomUniqueElements(allEngineOptionsGlobal, 3);
        if (!currentDecorationOpts.length) currentDecorationOpts = getRandomUniqueElements(allDecorationOptionsGlobal, 3);

      } catch (e) {
        console.error("Failed to parse stored spaceship options, randomizing.", e);
        const randomOpts = randomizeAndStoreSpaceshipOptions();
        currentWingOpts = randomOpts.wings;
        currentEngineOpts = randomOpts.engines;
        currentDecorationOpts = randomOpts.decorations;
      }
    } else {
      const randomOpts = randomizeAndStoreSpaceshipOptions();
      currentWingOpts = randomOpts.wings;
      currentEngineOpts = randomOpts.engines;
      currentDecorationOpts = randomOpts.decorations;
    }
    
    setWingOptions(currentWingOpts);
    setEngineOptions(currentEngineOpts);
    setDecorationOptions(currentDecorationOpts);

    const storedSpaceshipRaw = localStorage.getItem(SPACESHIP_STORAGE_KEY);
    if (storedSpaceshipRaw) {
      try {
        const storedSpaceship: StoredSpaceship = JSON.parse(storedSpaceshipRaw);
        setSpaceshipName(storedSpaceship.name)
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
        if (currentWingOpts.length > 0) setSelectedWings(currentWingOpts[0].id);
        if (currentEngineOpts.length > 0) setSelectedEngine(currentEngineOpts[0].id);
        setSelectedDecoration(null);
      }
    } else {
        if (currentWingOpts.length > 0) setSelectedWings(currentWingOpts[0].id);
        if (currentEngineOpts.length > 0) setSelectedEngine(currentEngineOpts[0].id);
        setSelectedDecoration(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateSpaceship = async () => {
    if (!selectedWings || !selectedEngine) {
      toast({
        title: "Val Saknas",
        description: "Välj åtminstone vingar och motor för ditt skepp.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingMainSpaceshipImage(true);
    setIsLoadingSpaceshipName(true); 
    setIsLoadingSpaceshipBackstory(true);
    setSpaceshipImageUrl(null);
    setSpaceshipName(null);
    setSpaceshipBackstory(null);
    
    const wingNameStr = wingOptions.find(opt => opt.id === selectedWings)?.name || allWingOptionsGlobal.find(opt => opt.id === selectedWings)?.name || "standardvingar";
    const engineNameStr = engineOptions.find(opt => opt.id === selectedEngine)?.name || allEngineOptionsGlobal.find(opt => opt.id === selectedEngine)?.name || "standardmotor";
    const decorationNameStr = decorationOptions.find(opt => opt.id === selectedDecoration)?.name || allDecorationOptionsGlobal.find(opt => opt.id === selectedDecoration)?.name || "inga dekorationer";
        
    let currentSpaceshipName = "";
    let generatedBackstory = "";

    try {
      const nameInput: GenerateSpaceshipNameInput = {
        spaceshipStyle: selectedSpaceshipStyle,
        wingName: wingNameStr,
        engineName: engineNameStr,
        decorationName: decorationNameStr !== "inga dekorationer" ? decorationNameStr : undefined,
      };
      const nameResult = await generateSpaceshipName(nameInput);
      currentSpaceshipName = nameResult.spaceshipName;
      setSpaceshipName(currentSpaceshipName);
    } catch (error: any) {
      console.error("Error generating spaceship name:", error);
      let desc = "Kunde inte generera skeppsnamn. Försöker skapa skepp med ett standardnamn.";
       if (error.message && (error.message.includes("503") || error.message.toLowerCase().includes("overloaded"))) {
        desc = "AI-tjänsten för att skapa namn är upptagen. Försöker skapa skepp med ett standardnamn.";
      }
      toast({ title: "Fel vid Namngenerering", description: desc, variant: "default" });
      currentSpaceshipName = "Rymdraketen"; 
      setSpaceshipName(currentSpaceshipName);
    } finally {
      setIsLoadingSpaceshipName(false);
    }

    try {
      const backstoryInput: GenerateSpaceshipBackstoryInput = {
        spaceshipStyle: selectedSpaceshipStyle,
        wingName: wingNameStr,
        engineName: engineNameStr,
        decorationName: decorationNameStr !== "inga dekorationer" ? decorationNameStr : undefined,
      };
      const backstoryResult = await generateSpaceshipBackstory(backstoryInput);
      generatedBackstory = backstoryResult.backstory;
      setSpaceshipBackstory(generatedBackstory);
    } catch (error: any) {
      console.error("Error generating spaceship backstory:", error);
      let desc = "Kunde inte generera skeppshistoria. Skapar skepp utan historia.";
       if (error.message && (error.message.includes("503") || error.message.toLowerCase().includes("overloaded"))) {
        desc = "AI-tjänsten för att skapa historier är upptagen. Skapar skepp utan historia.";
      }
      toast({ title: "Fel vid Historiegenerering", description: desc, variant: "default" });
    } finally {
      setIsLoadingSpaceshipBackstory(false);
    }
      
    let prompt = `Skapa en bild av ett rymdskepp vid namn "${currentSpaceshipName}".
    Vingar: ${wingNameStr}.
    Motor: ${engineNameStr}.
    Dekoration: ${decorationNameStr}.
    Skeppets stil: ${selectedSpaceshipStyle}. `;
    if (generatedBackstory) {
      prompt += `Bakgrundshistoria: ${generatedBackstory}. `;
    }
    prompt += `Visuell stil: Enkel, cool tecknad stil, barnvänlig, rymdtema.`;

    try {
      const imageResult = await generateImage({ prompt });
      setSpaceshipImageUrl(imageResult.imageDataUri);
      
      const spaceshipToStore: StoredSpaceship = {
        name: currentSpaceshipName,
        imageUrl: imageResult.imageDataUri,
        backstory: generatedBackstory,
        style: selectedSpaceshipStyle,
        parts: {
          wing: selectedWings,
          engine: selectedEngine,
          decoration: selectedDecoration,
        },
        partNames: { wingName: wingNameStr, engineName: engineNameStr, decorationName: decorationNameStr }
      };
      const spaceshipDataString = JSON.stringify(spaceshipToStore);

      try {
        localStorage.setItem(SPACESHIP_STORAGE_KEY, spaceshipDataString);
        toast({
          title: "Skepp Skapat & Sparat!",
          description: `Ditt unika rymdskepp "${currentSpaceshipName}" är redo! Det är sparat lokalt.`,
        });
      } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          toast({
            title: "Lagringsutrymme Nästan Fullt",
            description: "Försöker frigöra utrymme och spara skeppet igen...",
            variant: "default",
            duration: 3000,
          });
          try {
            localStorage.removeItem(LOGO_STORAGE_KEY);
            localStorage.removeItem(PLANET_IMAGES_KEY);
            
            localStorage.setItem(SPACESHIP_STORAGE_KEY, spaceshipDataString); 
            toast({
              title: "Skepp Sparat!",
              description: `Ditt skepp "${currentSpaceshipName}" är sparat. Lite gammal data rensades.`,
            });
          } catch (e2: any) {
            if (e2.name === 'QuotaExceededError' || e2.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
              console.error("Quota exceeded for spaceship even after clearing cache:", e2);
              toast({
                title: "Lagringsutrymme Fullt",
                description: `Kunde inte spara "${currentSpaceshipName}". Rensa webbläsardata eller starta om spelet.`,
                variant: "destructive",
                duration: 7000,
              });
            } else {
              console.error("Error saving spaceship after clearing cache:", e2);
              toast({
                title: "Fel vid Sparning",
                description: "Ett oväntat fel uppstod när skeppet skulle sparas efter rensning.",
                variant: "destructive",
              });
            }
          }
        } else {
          console.error("Failed to save spaceship to localStorage:", e);
          toast({
            title: "Fel vid Sparning",
            description: "Ett oväntat fel uppstod när skeppet skulle sparas.",
            variant: "destructive",
          });
        }
      }


    } catch (error: any) {
      console.error("Failed to generate spaceship image:", error);
      let desc = "Kunde inte skapa bild för skeppet. Försök igen om en liten stund.";
      if (error.message && (error.message.includes("503") || error.message.toLowerCase().includes("overloaded"))) {
        desc = "AI-tjänsten för att skapa skeppsbilder verkar vara upptagen just nu. Prova igen om en liten stund!";
      } else if (error.message && error.message.toLowerCase().includes("quota")) {
        desc = "AI-tjänsten har nått sin kvot för idag. Prova igen imorgon!";
      }
      toast({
        title: "Fel vid Bildgenerering",
        description: desc,
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
          <div className="lg:col-span-1 flex flex-col items-center">
            <Card className="w-full max-w-md shadow-xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-headline text-primary flex items-center justify-center">
                  {isLoadingSpaceshipName ? <LoadingSpinner size="sm" /> : (spaceshipName || "Ditt Skepp")}
                   {!isLoadingSpaceshipName && !spaceshipName && <Edit3 className="ml-2 h-5 w-5 text-primary/70" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center p-6 min-h-[300px]">
                {isLoadingMainSpaceshipImage ? (
                  <LoadingSpinner size="lg"/>
                ) : spaceshipImageUrl ? (
                  <Image src={spaceshipImageUrl} alt={spaceshipName || "Rymdskepp"} width={400} height={300} className="rounded-lg object-contain shadow-lg border-2 border-primary" />
                ) : (
                  <div className="text-center text-muted-foreground p-4">
                    <RocketIcon className="h-16 w-16 mx-auto mb-4 text-primary/50" />
                    <p>Gör dina val och klicka sedan på "Skapa Skepp"!</p>
                  </div>
                )}
              </CardContent>
            </Card>
            { (spaceshipBackstory || isLoadingSpaceshipBackstory) && 
              <Card className="w-full max-w-md shadow-xl bg-card/80 backdrop-blur-sm mt-6">
                <CardHeader>
                  <CardTitle className="text-xl font-headline text-accent flex items-center gap-2"><Wand2 /> Skeppets Historia</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingSpaceshipBackstory ? <LoadingSpinner size="md"/> : (
                    <ScrollArea className="h-24 p-3 border rounded-md bg-muted/50 text-sm text-foreground">
                      <p>{spaceshipBackstory}</p>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            }
          </div>

          <div className="lg:col-span-2">
            <Card className="w-full shadow-xl bg-card/80 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-headline text-accent flex items-center gap-2"><Wand2 /> Skeppets Stil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="spaceshipStyle" className="block text-sm font-medium text-muted-foreground mb-1">Välj stil för skeppets namn & historia:</label>
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
                   <p className="text-xs text-muted-foreground mt-1">Detta påverkar skeppets namn och historia.</p>
                </div>
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
                    <CardContent>{wingOptions.length > 0 ? renderOptionGrid(wingOptions, selectedWings, setSelectedWings) : <LoadingSpinner/>}</CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="engines" forceMount={activeTab === "engines"}>
                  <Card className="bg-card/70 backdrop-blur-sm border-0 shadow-none">
                    <CardHeader><CardTitle className="text-lg text-primary">Välj Motor</CardTitle></CardHeader>
                    <CardContent>{engineOptions.length > 0 ? renderOptionGrid(engineOptions, selectedEngine, setSelectedEngine) : <LoadingSpinner/>}</CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="decorations" forceMount={activeTab === "decorations"}>
                  <Card className="bg-card/70 backdrop-blur-sm border-0 shadow-none">
                    <CardHeader><CardTitle className="text-lg text-primary">Välj Dekoration (Valfritt)</CardTitle></CardHeader>
                    <CardContent>{decorationOptions.length > 0 ? renderOptionGrid(decorationOptions, selectedDecoration, setSelectedDecoration) : <LoadingSpinner/>}</CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button 
                onClick={handleCreateSpaceship} 
                disabled={isLoadingMainSpaceshipImage || isLoadingSpaceshipBackstory || isLoadingSpaceshipName || !selectedWings || !selectedEngine} 
                className="w-full font-semibold" 
                size="lg"
              >
                {(isLoadingMainSpaceshipImage || isLoadingSpaceshipName || isLoadingSpaceshipBackstory) ? <LoadingSpinner size="sm" /> : 'Skapa Skepp'}
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
