
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileAudio, Plus, Trash2, Volume2 } from "lucide-react";
import { SoundEffect } from "@/types";
import { fileToBase64 } from "@/utils/audioUtils";
import { hasEffectInScript } from "@/utils/scriptParser";

interface SoundEffectsManagerProps {
  scriptText: string;
  onEffectsReady: (effects: SoundEffect[]) => void;
}

const SoundEffectsManager = ({ scriptText, onEffectsReady }: SoundEffectsManagerProps) => {
  const [effects, setEffects] = useState<SoundEffect[]>([]);
  const [currentMarker, setCurrentMarker] = useState("");
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  const handleAddEffect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fileInput = document.getElementById("effect-file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    
    if (!file || !currentMarker.trim()) return;
    
    const newEffect: SoundEffect = {
      id: `effect-${Date.now()}`,
      name: file.name,
      file,
      marker: currentMarker.trim()
    };
    
    // Create a preview URL for the audio file
    try {
      const base64 = await fileToBase64(file);
      setPreviewUrls(prev => ({ ...prev, [newEffect.id]: base64 }));
    } catch (error) {
      console.error("Error creating preview URL:", error);
    }
    
    setEffects(prev => [...prev, newEffect]);
    setCurrentMarker("");
    fileInput.value = "";
  };

  const handleRemoveEffect = (id: string) => {
    setEffects(prev => prev.filter(effect => effect.id !== id));
    
    // Also remove the preview URL
    const newPreviewUrls = { ...previewUrls };
    delete newPreviewUrls[id];
    setPreviewUrls(newPreviewUrls);
  };

  const handlePlayPreview = (id: string) => {
    const audio = new Audio(previewUrls[id]);
    audio.play();
  };

  const handleContinue = () => {
    onEffectsReady(effects);
  };

  const isEffectInScript = (marker: string) => {
    return hasEffectInScript(scriptText, marker);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Sound Effects</CardTitle>
        <CardDescription>
          Add sound effects that match the markers in your script
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleAddEffect} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="effect-marker">Effect Marker</Label>
            <Input
              id="effect-marker"
              placeholder="e.g. Audience laughs"
              value={currentMarker}
              onChange={(e) => setCurrentMarker(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="effect-file">Sound File</Label>
            <Input
              id="effect-file"
              type="file"
              accept="audio/*"
              required
              className="cursor-pointer"
            />
          </div>
          <Button type="submit" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Effect
          </Button>
        </form>

        <div>
          {effects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marker</TableHead>
                  <TableHead>Sound File</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {effects.map((effect) => (
                  <TableRow key={effect.id}>
                    <TableCell className="font-medium">[{effect.marker}]</TableCell>
                    <TableCell className="flex items-center">
                      <FileAudio className="mr-2 h-4 w-4" />
                      {effect.name}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePlayPreview(effect.id)}
                        disabled={!previewUrls[effect.id]}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      {isEffectInScript(effect.marker) ? (
                        <span className="text-green-600 text-sm flex items-center">
                          <Check className="mr-1 h-4 w-4" /> Found in script
                        </span>
                      ) : (
                        <span className="text-amber-600 text-sm">Not found in script</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEffect(effect.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <FileAudio className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium">No sound effects added</h3>
              <p className="text-sm max-w-md">
                Add sound effects that match the markers in your script like [Audience laughs]
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleContinue} disabled={effects.length === 0}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SoundEffectsManager;
