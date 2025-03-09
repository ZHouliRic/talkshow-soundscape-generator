
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScriptUploader from "@/components/ScriptUploader";
import SoundEffectsManager from "@/components/SoundEffectsManager";
import AudioGenerator from "@/components/AudioGenerator";
import { ProcessedScript, SoundEffect } from "@/types";

enum Step {
  SCRIPT,
  EFFECTS,
  GENERATE
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.SCRIPT);
  const [script, setScript] = useState<ProcessedScript | null>(null);
  const [effects, setEffects] = useState<SoundEffect[]>([]);

  const handleScriptProcessed = (processedScript: ProcessedScript) => {
    setScript(processedScript);
    setCurrentStep(Step.EFFECTS);
  };

  const handleEffectsReady = (soundEffects: SoundEffect[]) => {
    setEffects(soundEffects);
    setCurrentStep(Step.GENERATE);
  };

  const handleReset = () => {
    setScript(null);
    setEffects([]);
    setCurrentStep(Step.SCRIPT);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 border-b">
        <div className="container">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 text-transparent bg-clip-text">
              Talkshow Soundscape Generator
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Generate professional talkshow audio by combining your script with sound effects
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 md:py-12">
        <Tabs
          value={currentStep.toString()}
          className="max-w-4xl mx-auto"
        >
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger 
              value="0" 
              onClick={() => script && setCurrentStep(Step.SCRIPT)}
              disabled={!script && currentStep !== Step.SCRIPT}
            >
              1. Script
            </TabsTrigger>
            <TabsTrigger 
              value="1" 
              onClick={() => script && setCurrentStep(Step.EFFECTS)}
              disabled={!script || (currentStep !== Step.EFFECTS && effects.length === 0)}
            >
              2. Sound Effects
            </TabsTrigger>
            <TabsTrigger 
              value="2"
              disabled={!script || !effects.length || currentStep !== Step.GENERATE}
            >
              3. Generate
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="0" className="mt-0">
              <ScriptUploader onScriptProcessed={handleScriptProcessed} />
            </TabsContent>
            
            <TabsContent value="1" className="mt-0">
              {script && (
                <SoundEffectsManager 
                  scriptText={script.originalText}
                  onEffectsReady={handleEffectsReady}
                />
              )}
            </TabsContent>
            
            <TabsContent value="2" className="mt-0">
              {script && effects.length > 0 && (
                <AudioGenerator
                  script={script}
                  effects={effects}
                  onReset={handleReset}
                />
              )}
            </TabsContent>
          </div>
        </Tabs>

        <div className="max-w-4xl mx-auto mt-12 p-4 md:p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">1. Upload Your Script</h3>
                <p className="text-sm text-muted-foreground">
                  Prepare your script with sound effect markers in square brackets like [Audience laughs].
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">2. Add Sound Effects</h3>
                <p className="text-sm text-muted-foreground">
                  Upload sound effect files to match the markers in your script.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">3. Generate & Download</h3>
                <p className="text-sm text-muted-foreground">
                  Generate your talkshow audio with perfectly timed sound effects and download the result.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t">
        <div className="container text-center text-muted-foreground text-sm">
          <p>Talkshow Soundscape Generator - Create professional talkshow audio with sound effects</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
