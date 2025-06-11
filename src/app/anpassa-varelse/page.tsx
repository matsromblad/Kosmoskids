
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Shirt, Sparkles, Puzzle, Wand2, RocketIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GameHeader } from '@/components/layout/GameHeader';
import { OptionCard } from '@/components/game/OptionCard';
import { generateCharacterBackstory, type GenerateCharacterBackstoryInput } from '@/ai/flows/generate-backstory';
import { generateImage, type GenerateImageInput } from '@/ai/flows/generate-image-flow';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/game/LoadingSpinner';
import { getRandomUniqueElements } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { generateSpacifiedCharacterName, type GenerateSpacifiedCharacterNameInput } from '@/ai/flows/generate-spacified-name';

interface CustomizationOption {
  id: string;
  name: string;
}

interface StoredCharacter {
  name: string;
  imageUrl: string;
  backstory: string;
  style: string;
  clothing: string | null;
  hairstyle: string | null;
  accessory: string | null;
}

const CHARACTER_STORAGE_KEY = "kosmoskids_character";
const LOGO_STORAGE_KEY = "kosmoskids_logo";
const PLANET_IMAGES_KEY = "kosmoskids_planet_images";
const CHARACTER_CUSTOMIZATION_OPTIONS_KEY_V1 = "KOSMOSKIDS_CHARACTER_CUSTOMIZATION_OPTIONS_V1";

// Global pools of all possible options
const allClothingOptionsGlobal: CustomizationOption[] = [
  { id: 'suit1', name: 'Rymddräkt Alfa' },
  { id: 'suit2', name: 'Glittrig Overall' },
  { id: 'vest1', name: 'Skyddsväst Beta' },
  { id: 'robe1', name: 'Stjärnmantel' },
  { id: 'armor1', name: 'Lätt Exo-Skelett' },
  { id: 'jumpsuit1', name: 'Pilotoverall GX' },
  { id: 'cloak1', name: 'Mystisk Kåpa' },
];
const allHairstyleOptionsGlobal: CustomizationOption[] = [
  { id: 'hair1', name: 'Antenner' },
  { id: 'hair2', name: 'Blått Spikigt Hår' },
  { id: 'hair3', name: 'Lysande Tentakler' },
  { id: 'hair4', name: 'Kristallkam' },
  { id: 'hair5', name: 'Plasmaflätor' },
  { id: 'hair6', name: 'Metallisk Irokés' },
  { id: 'hair7', name: 'Virvlande Gasnimbus' },
];
const allAccessoryOptionsGlobal: CustomizationOption[] = [
  { id: 'acc1', name: 'Jetpack X' },
  { id: 'acc2', name: 'Rymdhjälm Pro' },
  { id: 'acc3', name: 'Stjärn-glasögon' },
  { id: 'acc4', name: 'Energisköld Mini' },
  { id: 'acc5', name: 'Universalöversättare' },
  { id: 'acc6', name: 'Sensorvisir' },
  { id: 'acc7', name: 'Hovrande Drönare' },
];

const characterStyles = [
  { value: 'Sportig', label: 'Sportig'},
  { value: 'Nördig', label: 'Nördig'},
  { value: 'Gullig', label: 'Gullig'},
  { value: 'Mystisk', label: 'Mystisk'},
  { value: 'Äventyrlig', label: 'Äventyrlig'},
];

export default function AnpassaVarelsePage() {
  const [selectedClothing, setSelectedClothing] = useState<string | null>(null);
  const [selectedHairstyle, setSelectedHairstyle] = useState<string | null>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<string | null>(null);
  
  const [selectedCharacterStyle, setSelectedCharacterStyle] = useState<string>(characterStyles[0].value);
  const [backstory, setBackstory] = useState<string | null>(null);
  const [isLoadingBackstory, setIsLoadingBackstory] = useState(false);
  const { toast } = useToast();

  const [characterImageUrl, setCharacterImageUrl] = useState<string | null>(null);
  const [isLoadingMainCharacterImage, setIsLoadingMainCharacterImage] = useState(false);
  const [isLoadingName, setIsLoadingName] = useState(false);
  const [characterName, setCharacterName] = useState<string | null>(null);
  const [userInputName, setUserInputName] = useState<string>("");
  
  const [clothingOptions, setClothingOptions] = useState<CustomizationOption[]>([]);
  const [hairstyleOptions, setHairstyleOptions] = useState<CustomizationOption[]>([]);
  const [accessoryOptions, setAccessoryOptions] = useState<CustomizationOption[]>([]);
  const [activeTab, setActiveTab] = useState<string>("clothes");

  const randomizeAndStoreCharacterOptions = () => {
    const newClothing = getRandomUniqueElements(allClothingOptionsGlobal, 3);
    const newHairstyle = getRandomUniqueElements(allHairstyleOptionsGlobal, 3);
    const newAccessories = getRandomUniqueElements(allAccessoryOptionsGlobal, 3);

    const optionsToStore = {
      clothing: newClothing,
      hairstyle: newHairstyle,
      accessories: newAccessories,
    };
    localStorage.setItem(CHARACTER_CUSTOMIZATION_OPTIONS_KEY_V1, JSON.stringify(optionsToStore));
    return optionsToStore;
  };

  useEffect(() => {
    let currentClothingOpts: CustomizationOption[];
    let currentHairstyleOpts: CustomizationOption[];
    let currentAccessoryOpts: CustomizationOption[];

    const storedOptionsRaw = localStorage.getItem(CHARACTER_CUSTOMIZATION_OPTIONS_KEY_V1);
    if (storedOptionsRaw) {
      try {
        const stored = JSON.parse(storedOptionsRaw);
        currentClothingOpts = stored.clothing || getRandomUniqueElements(allClothingOptionsGlobal, 3);
        currentHairstyleOpts = stored.hairstyle || getRandomUniqueElements(allHairstyleOptionsGlobal, 3);
        currentAccessoryOpts = stored.accessories || getRandomUniqueElements(allAccessoryOptionsGlobal, 3);
        if (!currentClothingOpts.length) currentClothingOpts = getRandomUniqueElements(allClothingOptionsGlobal, 3);
        if (!currentHairstyleOpts.length) currentHairstyleOpts = getRandomUniqueElements(allHairstyleOptionsGlobal, 3);
        if (!currentAccessoryOpts.length) currentAccessoryOpts = getRandomUniqueElements(allAccessoryOptionsGlobal, 3);

      } catch (e) {
        console.error("Failed to parse stored character options, randomizing.", e);
        const randomOpts = randomizeAndStoreCharacterOptions();
        currentClothingOpts = randomOpts.clothing;
        currentHairstyleOpts = randomOpts.hairstyle;
        currentAccessoryOpts = randomOpts.accessories;
      }
    } else {
      const randomOpts = randomizeAndStoreCharacterOptions();
      currentClothingOpts = randomOpts.clothing;
      currentHairstyleOpts = randomOpts.hairstyle;
      currentAccessoryOpts = randomOpts.accessories;
    }

    setClothingOptions(currentClothingOpts);
    setHairstyleOptions(currentHairstyleOpts);
    setAccessoryOptions(currentAccessoryOpts);

    const storedCharacterRaw = localStorage.getItem(CHARACTER_STORAGE_KEY);
    if (storedCharacterRaw) {
      try {
        const storedCharacter: StoredCharacter = JSON.parse(storedCharacterRaw);
        setCharacterName(storedCharacter.name);
        // setUserInputName(storedCharacter.name); // Optional: prefill input if loading existing character. For now, let's keep it for new names.
        setCharacterImageUrl(storedCharacter.imageUrl);
        setBackstory(storedCharacter.backstory);
        setSelectedCharacterStyle(storedCharacter.style);
        setSelectedClothing(storedCharacter.clothing);
        setSelectedHairstyle(storedCharacter.hairstyle);
        setSelectedAccessory(storedCharacter.accessory);
      } catch (e) {
        console.error("Failed to parse stored character", e);
        localStorage.removeItem(CHARACTER_STORAGE_KEY);
        if (currentClothingOpts.length > 0) setSelectedClothing(currentClothingOpts[0].id);
        if (currentHairstyleOpts.length > 0) setSelectedHairstyle(currentHairstyleOpts[0].id);
        setSelectedAccessory(null);
      }
    } else {
      if (currentClothingOpts.length > 0) setSelectedClothing(currentClothingOpts[0].id);
      if (currentHairstyleOpts.length > 0) setSelectedHairstyle(currentHairstyleOpts[0].id);
      setSelectedAccessory(null); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateCharacter = async () => {
    if (!selectedClothing || !selectedHairstyle) {
      toast({
        title: "Val Saknas",
        description: "Välj åtminstone kläder och frisyr för din varelse.",
        variant: "destructive",
      });
      return;
    }
     if (!userInputName.trim()) {
      toast({
        title: "Namn Saknas",
        description: "Vänligen ange ett namn för din varelse i textfältet.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoadingMainCharacterImage(true);
    setIsLoadingBackstory(true);
    setIsLoadingName(true);
    setCharacterImageUrl(null);
    setBackstory(null);
    setCharacterName(null);

    let currentName = "";
    try {
      const nameInput: GenerateSpacifiedCharacterNameInput = { originalName: userInputName.trim() };
      const nameResult = await generateSpacifiedCharacterName(nameInput);
      currentName = nameResult.spacifiedName;
      setCharacterName(currentName);
    } catch (error: any) {
      console.error("Error generating spacified name:", error);
      let desc = "Kunde inte rymdifiera namnet. Använder det angivna namnet direkt.";
      if (error.message && (error.message.includes("503") || error.message.toLowerCase().includes("overloaded"))) {
        desc = "AI-tjänsten för att skapa namn är upptagen. Använder det angivna namnet direkt.";
      }
      toast({ title: "Fel vid Namngenerering", description: desc, variant: "default" });
      currentName = userInputName.trim(); 
      setCharacterName(currentName);
    } finally {
      setIsLoadingName(false);
    }

    let generatedBackstory = "";
    try {
      const backstoryInput: GenerateCharacterBackstoryInput = { 
        characterName: currentName, 
        characterStyle: selectedCharacterStyle 
      };
      const backstoryResult = await generateCharacterBackstory(backstoryInput);
      generatedBackstory = backstoryResult.backstory;
      setBackstory(generatedBackstory);
    } catch (error: any) {
      console.error("Error generating backstory:", error);
      let desc = "Kunde inte generera bakgrundshistoria. Skapar varelse utan.";
       if (error.message && (error.message.includes("503") || error.message.toLowerCase().includes("overloaded"))) {
        desc = "AI-tjänsten för att skapa historier är upptagen. Skapar varelse utan historia.";
      }
      toast({ title: "Fel vid Historiegenerering", description: desc, variant: "default" });
    } finally {
      setIsLoadingBackstory(false);
    }

    const clothingNameStr = clothingOptions.find(opt => opt.id === selectedClothing)?.name || allClothingOptionsGlobal.find(opt => opt.id === selectedClothing)?.name || "standardklädsel";
    const hairstyleNameStr = hairstyleOptions.find(opt => opt.id === selectedHairstyle)?.name || allHairstyleOptionsGlobal.find(opt => opt.id === selectedHairstyle)?.name || "standardfrisyr";
    const accessoryNameStr = accessoryOptions.find(opt => opt.id === selectedAccessory)?.name || allAccessoryOptionsGlobal.find(opt => opt.id === selectedAccessory)?.name || "inga tillbehör";

    let prompt = `En rymdvarelse vid namn ${currentName}. Varelsen är ${selectedCharacterStyle.toLowerCase()}. `;
    prompt += `Klädsel: ${clothingNameStr}. `;
    prompt += `Frisyr: ${hairstyleNameStr}. `;
    prompt += `Tillbehör: ${accessoryNameStr}. `;
    if (generatedBackstory) {
      prompt += `Bakgrundshistoria: ${generatedBackstory}. `;
    }
    // Global style will be appended by generateImageFlow

    try {
      const imageResult = await generateImage({ prompt }); 
      setCharacterImageUrl(imageResult.imageDataUri);
            
      const characterToStore: StoredCharacter = {
        name: currentName,
        imageUrl: imageResult.imageDataUri,
        backstory: generatedBackstory,
        style: selectedCharacterStyle,
        clothing: selectedClothing,
        hairstyle: selectedHairstyle,
        accessory: selectedAccessory,
      };
      const characterDataString = JSON.stringify(characterToStore);

      try {
        localStorage.setItem(CHARACTER_STORAGE_KEY, characterDataString);
        toast({
          title: "Varelse Skapad & Sparad!",
          description: `Här är ${currentName}! Hen är sparad lokalt.`,
        });
      } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          toast({
            title: "Lagringsutrymme Nästan Fullt",
            description: "Försöker frigöra utrymme och spara igen...",
            variant: "default",
            duration: 3000,
          });
          try {
            localStorage.removeItem(LOGO_STORAGE_KEY);
            localStorage.removeItem(PLANET_IMAGES_KEY);
            
            localStorage.setItem(CHARACTER_STORAGE_KEY, characterDataString); 
            toast({
              title: "Varelse Sparad!",
              description: `${currentName} är sparad. Lite gammal data rensades för att göra plats.`,
            });
          } catch (e2: any) {
            if (e2.name === 'QuotaExceededError' || e2.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
              console.error("Quota exceeded even after clearing cache:", e2);
              toast({
                title: "Lagringsutrymme Fullt",
                description: `Kunde inte spara ${currentName}. Rensa webbläsardata eller starta om spelet.`,
                variant: "destructive",
                duration: 7000,
              });
            } else {
              console.error("Error saving character after clearing cache:", e2);
              toast({
                title: "Fel vid Sparning",
                description: "Ett oväntat fel uppstod när varelsen skulle sparas efter rensning.",
                variant: "destructive",
              });
            }
          }
        } else {
          console.error("Failed to save character to localStorage:", e);
          toast({
            title: "Fel vid Sparning",
            description: "Ett oväntat fel uppstod när varelsen skulle sparas.",
            variant: "destructive",
          });
        }
      }

    } catch (error: any) {
      console.error("Failed to generate main character image:", error);
      let desc = "Kunde inte skapa bild för varelsen. Försök igen om en liten stund.";
      if (error.message && (error.message.includes("503") || error.message.toLowerCase().includes("overloaded"))) {
        desc = "AI-tjänsten för att skapa bilder verkar vara upptagen just nu. Prova igen om en liten stund!";
      } else if (error.message && error.message.toLowerCase().includes("quota")) {
        desc = "AI-tjänsten har nått sin kvot för idag. Prova igen imorgon!";
      }
      toast({
        title: "Fel vid bildgenerering",
        description: desc,
        variant: "destructive",
      });
    } finally {
      setIsLoadingMainCharacterImage(false);
    }
  };

  const renderOptionGrid = (options: CustomizationOption[], selected: string | null, setSelected: (id: string) => void, currentActiveTab: string, tabName: string) => {
     if (currentActiveTab !== tabName && !options.some(opt => selected === opt.id) && options.length === 0) return null;

    return (
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
 };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-indigo-900/30">
      <GameHeader title="Anpassa din Rymdvarelse" />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col items-center">
            <Card className="w-full max-w-sm shadow-xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-headline text-primary flex items-center justify-center">
                  {isLoadingName ? <LoadingSpinner size="sm"/> : (characterName || "Din Varelse")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center p-6 min-h-[300px]">
                {isLoadingMainCharacterImage ? (
                   <LoadingSpinner size="lg"/>
                ) : characterImageUrl ? (
                  <Image src={characterImageUrl} alt={characterName || "Rymdvarelse"} width={300} height={400} className="rounded-lg object-cover shadow-lg border-2 border-primary" />
                ) : (
                  <div className="text-center text-muted-foreground p-4">
                    <RocketIcon className="h-16 w-16 mx-auto mb-4 text-primary/50" />
                    <p>Gör dina val och klicka sedan på "Skapa Rymdvarelse"!</p>
                  </div>
                )}
              </CardContent>
            </Card>
            { (backstory || isLoadingBackstory) &&
              <Card className="w-full max-w-sm shadow-xl bg-card/80 backdrop-blur-sm mt-6">
                <CardHeader>
                  <CardTitle className="text-xl font-headline text-accent flex items-center gap-2"><Wand2 /> Bakgrundshistoria</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingBackstory ? <LoadingSpinner size="md"/> : (
                    <ScrollArea className="h-32 p-3 border rounded-md bg-muted/50 text-sm text-foreground">
                      <p>{backstory}</p>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            }
          </div>

          <div className="lg:col-span-2">
            <Card className="w-full shadow-xl bg-card/80 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-headline text-accent flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Namnge din Varelse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  id="characterBaseName"
                  placeholder="Skriv ett grundnamn här (t.ex. 'Lisa')"
                  value={userInputName}
                  onChange={(e) => setUserInputName(e.target.value)}
                  className="bg-input/50 border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">AI:n kommer att 'rymdifiera' detta namn!</p>
              </CardContent>
            </Card>

             <Card className="w-full shadow-xl bg-card/80 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-headline text-accent flex items-center gap-2"><Wand2 /> Stil för Historia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="characterStyle" className="block text-sm font-medium text-muted-foreground mb-1">Välj stil för din varelse:</label>
                  <Select value={selectedCharacterStyle} onValueChange={setSelectedCharacterStyle}>
                    <SelectTrigger id="characterStyle" className="w-full bg-input/50 border-border text-foreground">
                      <SelectValue placeholder="Välj en stil" />
                    </SelectTrigger>
                    <SelectContent>
                      {characterStyles.map(style => (
                        <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Detta påverkar varelsens historia.</p>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="clothes" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-primary/20">
                <TabsTrigger value="clothes" className="text-xs sm:text-sm data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Shirt className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Kläder</TabsTrigger>
                <TabsTrigger value="hairstyles" className="text-xs sm:text-sm data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Sparkles className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Frisyrer</TabsTrigger>
                <TabsTrigger value="accessories" className="text-xs sm:text-sm data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Puzzle className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Tillbehör</TabsTrigger>
              </TabsList>
              <ScrollArea className="h-auto max-h-[calc(100vh-25rem)] lg:max-h-[50vh] mt-2 p-0.5">
                <TabsContent value="clothes" forceMount={activeTab === "clothes"}>
                  <Card className="bg-card/70 backdrop-blur-sm border-0 shadow-none">
                    <CardHeader><CardTitle className="text-lg text-primary">Välj Kläder</CardTitle></CardHeader>
                    <CardContent>{clothingOptions.length > 0 ? renderOptionGrid(clothingOptions, selectedClothing, setSelectedClothing, activeTab, "clothes") : <LoadingSpinner/> }</CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="hairstyles" forceMount={activeTab === "hairstyles"}>
                   <Card className="bg-card/70 backdrop-blur-sm border-0 shadow-none">
                    <CardHeader><CardTitle className="text-lg text-primary">Välj Frisyr</CardTitle></CardHeader>
                    <CardContent>{hairstyleOptions.length > 0 ? renderOptionGrid(hairstyleOptions, selectedHairstyle, setSelectedHairstyle, activeTab, "hairstyles") : <LoadingSpinner/> }</CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="accessories" forceMount={activeTab === "accessories"}>
                   <Card className="bg-card/70 backdrop-blur-sm border-0 shadow-none">
                    <CardHeader><CardTitle className="text-lg text-primary">Välj Tillbehör</CardTitle></CardHeader>
                    <CardContent>{accessoryOptions.length > 0 ? renderOptionGrid(accessoryOptions, selectedAccessory, setSelectedAccessory, activeTab, "accessories") : <LoadingSpinner/> }</CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button 
                onClick={handleCreateCharacter} 
                disabled={isLoadingMainCharacterImage || isLoadingBackstory || isLoadingName || !selectedClothing || !selectedHairstyle} 
                className="w-full font-semibold" 
                size="lg"
              >
                {(isLoadingMainCharacterImage || isLoadingBackstory || isLoadingName) ? <LoadingSpinner size="sm" /> : 'Skapa Rymdvarelse'}
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
