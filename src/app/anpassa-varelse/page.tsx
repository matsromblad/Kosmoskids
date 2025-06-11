"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Shirt, Sparkles, Puzzle, Wand2 } from 'lucide-react';
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
  imageUrl: string;
  imageHint: string;
  isLoadingImage?: boolean;
}

const initialClothingOptions: CustomizationOption[] = [
  { id: 'suit1', name: 'Rymddräkt Alfa', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'alien space suit' },
  { id: 'suit2', name: 'Glittrig Overall', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'sparkly alien overall' },
  { id: 'vest1', name: 'Skyddsväst Beta', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'protective alien vest' },
];
const initialHairstyleOptions: CustomizationOption[] = [
  { id: 'hair1', name: 'Antenner', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'alien character antennae' },
  { id: 'hair2', name: 'Blått Spikigt Hår', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'alien blue spiky hair' },
  { id: 'hair3', name: 'Lysande Tentakler', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'glowing alien tentacles' },
];
const initialAccessoryOptions: CustomizationOption[] = [
  { id: 'acc1', name: 'Jetpack X', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'alien jetpack toy' },
  { id: 'acc2', name: 'Rymdhjälm Pro', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'alien space helmet' },
  { id: 'acc3', name: 'Stjärn-glasögon', imageUrl: 'https://placehold.co/100x100.png', imageHint: 'alien star sunglasses' },
];

const characterStyles = [
  { value: 'Sportig', label: 'Sportig'},
  { value: 'Nördig', label: 'Nördig'},
  { value: 'Gullig', label: 'Gullig'},
  { value: 'Mystisk', label: 'Mystisk'},
  { value: 'Äventyrlig', label: 'Äventyrlig'},
];

export default function AnpassaVarelsePage() {
  const [selectedClothing, setSelectedClothing] = useState<string | null>(initialClothingOptions[0].id);
  const [selectedHairstyle, setSelectedHairstyle] = useState<string | null>(initialHairstyleOptions[0].id);
  const [selectedAccessory, setSelectedAccessory] = useState<string | null>(null);
  
  const [selectedCharacterStyle, setSelectedCharacterStyle] = useState<string>(characterStyles[0].value);
  const [backstory, setBackstory] = useState<string | null>(null);
  const [isLoadingBackstory, setIsLoadingBackstory] = useState(false);
  const { toast } = useToast();

  const [clothingOptions, setClothingOptions] = useState<CustomizationOption[]>(initialClothingOptions.map(opt => ({...opt, isLoadingImage: opt.imageUrl.startsWith('https://placehold.co')})));
  const [hairstyleOptions, setHairstyleOptions] = useState<CustomizationOption[]>(initialHairstyleOptions.map(opt => ({...opt, isLoadingImage: opt.imageUrl.startsWith('https://placehold.co')})));
  const [accessoryOptions, setAccessoryOptions] = useState<CustomizationOption[]>(initialAccessoryOptions.map(opt => ({...opt, isLoadingImage: opt.imageUrl.startsWith('https://placehold.co')})));
  
  const [characterImageUrl, setCharacterImageUrl] = useState('https://placehold.co/300x400.png');
  const [isLoadingMainCharacterImage, setIsLoadingMainCharacterImage] = useState(characterImageUrl.startsWith('https://placehold.co'));

  useEffect(() => {
    const fetchImagesForList = (
        list: CustomizationOption[],
        setter: React.Dispatch<React.SetStateAction<CustomizationOption[]>>
    ) => {
        list.forEach(opt => {
            if (opt.imageUrl.startsWith('https://placehold.co') && opt.isLoadingImage) {
                generateImage({ prompt: opt.imageHint })
                    .then(result => {
                        setter(prev =>
                            prev.map(o =>
                                o.id === opt.id
                                    ? { ...o, imageUrl: result.imageDataUri, isLoadingImage: false }
                                    : o
                            )
                        );
                    })
                    .catch(error => {
                        console.error(`Failed to generate image for ${opt.name}:`, error);
                        setter(prev =>
                            prev.map(o =>
                                o.id === opt.id ? { ...o, isLoadingImage: false } : o
                            )
                        );
                    });
            } else if (!opt.imageUrl.startsWith('https://placehold.co') && opt.isLoadingImage) {
                 setter(prev =>
                    prev.map(o => (o.id === opt.id ? { ...o, isLoadingImage: false } : o))
                );
            }
        });
    };

    fetchImagesForList(clothingOptions, setClothingOptions);
    fetchImagesForList(hairstyleOptions, setHairstyleOptions);
    fetchImagesForList(accessoryOptions, setAccessoryOptions);

    const generateMainCharacterImage = async () => {
      if (characterImageUrl.startsWith('https://placehold.co') && isLoadingMainCharacterImage) {
        try {
          const result = await generateImage({ prompt: "cute alien character simple" }); 
          setCharacterImageUrl(result.imageDataUri);
        } catch (error) {
          console.error("Failed to generate main character image:", error);
        } finally {
          setIsLoadingMainCharacterImage(false);
        }
      } else if (!characterImageUrl.startsWith('https://placehold.co') && isLoadingMainCharacterImage) {
        setIsLoadingMainCharacterImage(false);
      }
    };

    if (isLoadingMainCharacterImage) {
        generateMainCharacterImage();
    }
  }, []);


  const handleGenerateBackstory = async () => {
    setIsLoadingBackstory(true);
    setBackstory(null);
    try {
      const input: GenerateCharacterBackstoryInput = { characterStyle: selectedCharacterStyle };
      const result = await generateCharacterBackstory(input);
      setBackstory(result.backstory);
      toast({
        title: "Bakgrundshistoria Skapad!",
        description: "Din rymdvarelses unika historia är klar.",
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

  const renderOptionGrid = (options: CustomizationOption[], selected: string | null, setSelected: (id: string) => void) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
      {options.map(opt => (
        <OptionCard
          key={opt.id}
          name={opt.name}
          imageUrl={opt.imageUrl}
          imageHint={opt.imageHint}
          isLoadingImage={opt.isLoadingImage}
          isSelected={selected === opt.id}
          onSelect={() => setSelected(opt.id)}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-indigo-900/30">
      <GameHeader title="Anpassa din Rymdvarelse" />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col items-center">
            <Card className="w-full max-w-sm shadow-xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-headline text-primary">Din Varelse</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center p-6 min-h-[400px]">
                {isLoadingMainCharacterImage ? (
                   <LoadingSpinner size="lg"/>
                ) : (
                  <Image src={characterImageUrl} alt="Rymdvarelse" width={300} height={400} className="rounded-lg object-cover shadow-lg border-2 border-primary" data-ai-hint="cute alien character simple" />
                )}
              </CardContent>
            </Card>
            
            <Card className="w-full max-w-sm mt-6 shadow-xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-headline text-accent flex items-center gap-2"><Wand2 /> Bakgrundshistoria</CardTitle>
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
                  {isLoadingBackstory ? <LoadingSpinner size="sm" /> : 'Skapa Historia'}
                </Button>
                {backstory && (
                  <ScrollArea className="h-32 mt-2 p-3 border rounded-md bg-muted/50 text-sm text-foreground">
                    <p>{backstory}</p>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="clothes" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-primary/20">
                <TabsTrigger value="clothes" className="text-xs sm:text-sm data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Shirt className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Kläder</TabsTrigger>
                <TabsTrigger value="hairstyles" className="text-xs sm:text-sm data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Sparkles className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Frisyrer</TabsTrigger>
                <TabsTrigger value="accessories" className="text-xs sm:text-sm data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"><Puzzle className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />Tillbehör</TabsTrigger>
              </TabsList>
              <ScrollArea className="h-[calc(100vh-12rem)] sm:h-[calc(100vh-10rem)] lg:h-auto lg:max-h-[70vh] mt-2 p-0.5">
                <TabsContent value="clothes">
                  <Card className="bg-card/70 backdrop-blur-sm border-0 shadow-none">
                    <CardHeader><CardTitle className="text-lg text-primary">Välj Kläder</CardTitle></CardHeader>
                    <CardContent>{renderOptionGrid(clothingOptions, selectedClothing, setSelectedClothing)}</CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="hairstyles">
                   <Card className="bg-card/70 backdrop-blur-sm border-0 shadow-none">
                    <CardHeader><CardTitle className="text-lg text-primary">Välj Frisyr</CardTitle></CardHeader>
                    <CardContent>{renderOptionGrid(hairstyleOptions, selectedHairstyle, setSelectedHairstyle)}</CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="accessories">
                   <Card className="bg-card/70 backdrop-blur-sm border-0 shadow-none">
                    <CardHeader><CardTitle className="text-lg text-primary">Välj Tillbehör</CardTitle></CardHeader>
                    <CardContent>{renderOptionGrid(accessoryOptions, selectedAccessory, setSelectedAccessory)}</CardContent>
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
