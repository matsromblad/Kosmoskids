
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


const initialClothingOptions: CustomizationOption[] = [
  { id: 'suit1', name: 'Rymddräkt Alfa' },
  { id: 'suit2', name: 'Glittrig Overall' },
  { id: 'vest1', name: 'Skyddsväst Beta' },
];
const initialHairstyleOptions: CustomizationOption[] = [
  { id: 'hair1', name: 'Antenner' },
  { id: 'hair2', name: 'Blått Spikigt Hår' },
  { id: 'hair3', name: 'Lysande Tentakler' },
];
const initialAccessoryOptions: CustomizationOption[] = [
  { id: 'acc1', name: 'Jetpack X' },
  { id: 'acc2', name: 'Rymdhjälm Pro' },
  { id: 'acc3', name: 'Stjärn-glasögon' },
];

const characterStyles = [
  { value: 'Sportig', label: 'Sportig'},
  { value: 'Nördig', label: 'Nördig'},
  { value: 'Gullig', label: 'Gullig'},
  { value: 'Mystisk', label: 'Mystisk'},
  { value: 'Äventyrlig', label: 'Äventyrlig'},
];

const daughterNames = ["Saquina", "Zoe", "Indy"];
const spacePrefixes = ["Rymd-", "Stjärn-", "Galax-", "Kosmo-", "Nebula-"];

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
  const [characterName, setCharacterName] = useState<string | null>(null);
  
  const [clothingOptions] = useState<CustomizationOption[]>(initialClothingOptions);
  const [hairstyleOptions] = useState<CustomizationOption[]>(initialHairstyleOptions);
  const [accessoryOptions] = useState<CustomizationOption[]>(initialAccessoryOptions);
  const [activeTab, setActiveTab] = useState<string>("clothes");

  useEffect(() => {
    const storedCharacterRaw = localStorage.getItem(CHARACTER_STORAGE_KEY);
    if (storedCharacterRaw) {
      try {
        const storedCharacter: StoredCharacter = JSON.parse(storedCharacterRaw);
        setCharacterName(storedCharacter.name);
        setCharacterImageUrl(storedCharacter.imageUrl);
        setBackstory(storedCharacter.backstory);
        setSelectedCharacterStyle(storedCharacter.style);
        setSelectedClothing(storedCharacter.clothing);
        setSelectedHairstyle(storedCharacter.hairstyle);
        setSelectedAccessory(storedCharacter.accessory);
      } catch (e) {
        console.error("Failed to parse stored character", e);
        localStorage.removeItem(CHARACTER_STORAGE_KEY);
      }
    } else {
      // Set defaults if nothing is stored
      setSelectedClothing(initialClothingOptions[0].id);
      setSelectedHairstyle(initialHairstyleOptions[0].id);
    }
  }, []);


  const generateAndSetCharacterName = (): string => {
    if (characterName) return characterName; // Don't generate if already exists

    const randomPrefix = spacePrefixes[Math.floor(Math.random() * spacePrefixes.length)];
    const randomDaughterName = daughterNames[Math.floor(Math.random() * daughterNames.length)];
    const newName = `${randomPrefix}${randomDaughterName}`;
    setCharacterName(newName);
    return newName;
  };

  const handleGenerateBackstory = async () => {
    setIsLoadingBackstory(true);
    setBackstory(null);
    
    const currentName = generateAndSetCharacterName(); 

    try {
      const input: GenerateCharacterBackstoryInput = { 
        characterName: currentName, 
        characterStyle: selectedCharacterStyle 
      };
      const result = await generateCharacterBackstory(input);
      setBackstory(result.backstory);
      toast({
        title: "Bakgrundshistoria Skapad!",
        description: `${currentName}s unika historia är klar.`,
      });
    } catch (error) {
      console.error("Error generating backstory:", error);
      setBackstory("Ett fel uppstod när bakgrundshistoria skulle skapas. Försök igen senare!");
      toast({
        title: "Fel",
        description: "Kunde inte generera bakgrundshistoria.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBackstory(false);
    }
  };

  const handleCreateCharacterImage = async () => {
    if (!selectedClothing || !selectedHairstyle) {
      toast({
        title: "Val Saknas",
        description: "Välj åtminstone kläder och frisyr för din varelse.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoadingMainCharacterImage(true);
    setCharacterImageUrl(null);

    const currentName = characterName || generateAndSetCharacterName(); 
    if (!currentName) { 
        toast({ title: "Namn saknas", description: "Kunde inte skapa ett namn.", variant: "destructive" });
        setIsLoadingMainCharacterImage(false);
        return;
    }


    const clothingNameStr = clothingOptions.find(opt => opt.id === selectedClothing)?.name || "standardklädsel";
    const hairstyleNameStr = hairstyleOptions.find(opt => opt.id === selectedHairstyle)?.name || "standardfrisyr";
    const accessoryNameStr = accessoryOptions.find(opt => opt.id === selectedAccessory)?.name || "inga tillbehör";

    let prompt = `Skapa en bild av en rymdvarelse vid namn ${currentName}. Varelsen är ${selectedCharacterStyle.toLowerCase()}. `;
    prompt += `Klädsel: ${clothingNameStr}. `;
    prompt += `Frisyr: ${hairstyleNameStr}. `;
    prompt += `Tillbehör: ${accessoryNameStr}. `;
    if (backstory) {
      prompt += `Bakgrundshistoria: ${backstory}. `;
    }
    prompt += `Stil: Enkel, söt tecknad stil, glad och barnvänlig, rymdtema.`;

    try {
      const result = await generateImage({ prompt }); 
      setCharacterImageUrl(result.imageDataUri);
            
      const characterToStore: StoredCharacter = {
        name: currentName,
        imageUrl: result.imageDataUri,
        backstory: backstory || "",
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
          description: `Här är ${currentName}! Den är sparad lokalt.`,
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
            
            localStorage.setItem(CHARACTER_STORAGE_KEY, characterDataString); // Retry
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

    } catch (error) {
      console.error("Failed to generate main character image:", error);
      toast({
        title: "Fel vid bildgenerering",
        description: "Kunde inte skapa bild för varelsen.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMainCharacterImage(false);
    }
  };

  const renderOptionGrid = (options: CustomizationOption[], selected: string | null, setSelected: (id: string) => void, currentActiveTab: string, tabName: string) => {
     if (currentActiveTab !== tabName && !options.some(opt => selected === opt.id)) return null;

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
                <CardTitle className="text-center text-2xl font-headline text-primary">
                  {characterName ? characterName : 'Din Varelse'}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center p-6 min-h-[400px]">
                {isLoadingMainCharacterImage ? (
                   <LoadingSpinner size="lg"/>
                ) : characterImageUrl ? (
                  <Image src={characterImageUrl} alt={characterName || "Rymdvarelse"} width={300} height={400} className="rounded-lg object-cover shadow-lg border-2 border-primary" />
                ) : (
                  <div className="text-center text-muted-foreground p-4">
                    <RocketIcon className="h-16 w-16 mx-auto mb-4 text-primary/50" />
                    <p>Gör dina val, skapa en historia och klicka sedan på "Skapa Varelse"!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
             <Card className="w-full shadow-xl bg-card/80 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-headline text-accent flex items-center gap-2"><Wand2 /> Bakgrundshistoria &amp; Namn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="characterStyle" className="block text-sm font-medium text-muted-foreground mb-1">Välj stil för historia:</label>
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
                </div>
                <Button onClick={handleGenerateBackstory} disabled={isLoadingBackstory} className="w-full font-semibold" variant="secondary">
                  {isLoadingBackstory ? <LoadingSpinner size="sm" /> : (characterName ? 'Skapa Ny Historia' : 'Ge Namn &amp; Skapa Historia')}
                </Button>
                {backstory && (
                  <ScrollArea className="h-32 mt-2 p-3 border rounded-md bg-muted/50 text-sm text-foreground">
                    <p>{backstory}</p>
                  </ScrollArea>
                )}
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
                    <CardContent>{renderOptionGrid(clothingOptions, selectedClothing, setSelectedClothing, activeTab, "clothes")}</CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="hairstyles" forceMount={activeTab === "hairstyles"}>
                   <Card className="bg-card/70 backdrop-blur-sm border-0 shadow-none">
                    <CardHeader><CardTitle className="text-lg text-primary">Välj Frisyr</CardTitle></CardHeader>
                    <CardContent>{renderOptionGrid(hairstyleOptions, selectedHairstyle, setSelectedHairstyle, activeTab, "hairstyles")}</CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="accessories" forceMount={activeTab === "accessories"}>
                   <Card className="bg-card/70 backdrop-blur-sm border-0 shadow-none">
                    <CardHeader><CardTitle className="text-lg text-primary">Välj Tillbehör</CardTitle></CardHeader>
                    <CardContent>{renderOptionGrid(accessoryOptions, selectedAccessory, setSelectedAccessory, activeTab, "accessories")}</CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button 
                onClick={handleCreateCharacterImage} 
                disabled={isLoadingMainCharacterImage || isLoadingBackstory || !selectedClothing || !selectedHairstyle} 
                className="w-full font-semibold" 
                size="lg"
              >
                {isLoadingMainCharacterImage ? <LoadingSpinner size="sm" /> : 'Skapa Rymdvarelse'}
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
