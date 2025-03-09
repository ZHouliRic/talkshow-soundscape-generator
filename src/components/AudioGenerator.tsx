
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SoundEffect, ProcessedScript, GeneratedAudio } from "@/types";
import { generateSpeechFromText, combineAudioWithEffects, downloadAudio } from "@/utils/audioUtils";
import { getUniqueEffectsFromScript } from "@/utils/scriptParser";
import { Check, Download, AlertCircle, Play, Loader2, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioGeneratorProps {
  script: ProcessedScript;
  effects: SoundEffect[];
  onReset: () => void;
}

const AudioGenerator = ({ script, effects, onReset }: AudioGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  
  // Get unique effect markers from the script
  const uniqueEffects = getUniqueEffectsFromScript(script.originalText);
  
  // Check which effects are missing
  const missingEffects = uniqueEffects.filter(
    marker => !effects.some(effect => effect.marker.toLowerCase() === marker.toLowerCase())
  );
  
  const handleGenerate = async () => {
    // No longer blocking generation if effects are missing
    // as we'll use a fallback approach
    setIsGenerating(true);
    setCurrentStep(1);
    
    try {
      // Step 1: Generate voice audio
      const voiceAudioUrl = await generateSpeechFromText(script.cleanedText);
      setCurrentStep(2);
      
      // Step 2: Combine with sound effects
      const result = await combineAudioWithEffects(voiceAudioUrl, script, effects);
      setGeneratedAudio(result);
      setIsGenerated(true);
      
      // Show a different toast message if fallbacks were used
      if (missingEffects.length > 0 && effects.length > 0) {
        toast({
          title: "Audio generation complete",
          description: `Your talkshow audio is ready! ${missingEffects.length} missing effects were replaced with the default sound.`,
        });
      } else {
        toast({
          title: "Audio generation complete",
          description: "Your talkshow audio is ready to download!",
        });
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      toast({
        title: "Generation failed",
        description: "There was an error generating your audio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handlePlayPreview = () => {
    if (!generatedAudio) return;
    
    const audio = new Audio(generatedAudio.url);
    setIsPlaying(true);
    
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
    });
    
    audio.play();
  };
  
  const handleDownload = () => {
    if (!generatedAudio) return;
    downloadAudio(generatedAudio.url, "talkshow.mp3");
  };
  
  const renderWaveform = () => (
    <div className="waveform justify-center py-2">
      <div className="waveform-bar h-2 animate-waveform-1" />
      <div className="waveform-bar h-3 animate-waveform-2" />
      <div className="waveform-bar h-4 animate-waveform-3" />
      <div className="waveform-bar h-3 animate-waveform-4" />
      <div className="waveform-bar h-2 animate-waveform-5" />
    </div>
  );
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Generate Talkshow Audio</CardTitle>
        <CardDescription>
          Generate your talkshow with sound effects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Script Summary</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Word Count:</div>
            <div>{script.cleanedText.split(/\s+/).filter(Boolean).length}</div>
            <div>Sound Effects:</div>
            <div>{uniqueEffects.length}</div>
          </div>
        </div>
        
        {/* Status and warnings - changed from error to warning */}
        {missingEffects.length > 0 && effects.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex">
            <AlertCircle className="text-amber-500 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Missing sound effects (will use fallback)</p>
              <p className="text-sm text-amber-700">
                The following effects don't have corresponding sound files and will use the first uploaded effect:
              </p>
              <ul className="list-disc list-inside text-sm text-amber-700 mt-1">
                {missingEffects.map(effect => (
                  <li key={effect}>[{effect}]</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* Complete error when no effects at all */}
        {missingEffects.length > 0 && effects.length === 0 && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex">
            <AlertCircle className="text-destructive h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">No sound effects uploaded</p>
              <p className="text-sm text-destructive/80">
                Please upload at least one sound effect to continue.
              </p>
            </div>
          </div>
        )}
        
        {/* Generation progress */}
        {isGenerating && (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mr-3 flex-shrink-0">
                {currentStep >= 1 ? (
                  currentStep > 1 ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  )
                ) : (
                  <span className="text-sm font-medium text-primary">1</span>
                )}
              </div>
              <div>
                <p className="font-medium">Generating voice audio</p>
                <p className="text-sm text-muted-foreground">Using Play.ai to generate speech</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mr-3 flex-shrink-0">
                {currentStep >= 2 ? (
                  currentStep > 2 ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  )
                ) : (
                  <span className="text-sm font-medium text-primary">2</span>
                )}
              </div>
              <div>
                <p className="font-medium">Adding sound effects</p>
                <p className="text-sm text-muted-foreground">Combining voice with your sound effects</p>
              </div>
            </div>
            
            {renderWaveform()}
          </div>
        )}
        
        {/* Generated audio player */}
        {isGenerated && generatedAudio && (
          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Music className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <p className="font-medium">Talkshow Audio</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.floor(generatedAudio.duration / 60)}:{(generatedAudio.duration % 60).toString().padStart(2, '0')} minutes
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                  onClick={handlePlayPreview}
                  disabled={isPlaying}
                >
                  <Play className="h-4 w-4 mr-1" />
                  {isPlaying ? 'Playing...' : 'Preview'}
                </Button>
                
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex items-center"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            
            {isPlaying && renderWaveform()}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onReset}>
            Start Over
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || (effects.length === 0)}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : isGenerated ? (
              "Regenerate Audio"
            ) : (
              "Generate Audio"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioGenerator;
