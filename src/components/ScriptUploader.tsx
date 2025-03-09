
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUp, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { parseScript } from "@/utils/scriptParser";
import { ProcessedScript } from "@/types";

interface ScriptUploaderProps {
  onScriptProcessed: (script: ProcessedScript) => void;
}

const ScriptUploader = ({ onScriptProcessed }: ScriptUploaderProps) => {
  const [scriptText, setScriptText] = useState<string>("");
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setScriptText(content);
      setIsUploaded(true);
    };
    reader.readAsText(file);
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setScriptText(e.target.value);
    if (e.target.value) {
      setIsUploaded(true);
    } else {
      setIsUploaded(false);
    }
  };

  const handleClearScript = () => {
    setScriptText("");
    setIsUploaded(false);
    setFileName("");
  };

  const handleProcessScript = () => {
    if (!scriptText.trim()) return;
    
    const processed = parseScript(scriptText);
    onScriptProcessed(processed);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Upload Your Script</CardTitle>
        <CardDescription>
          Upload a text file or paste your script with sound effect markers like [Audience laughs]
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" className="relative" onClick={() => document.getElementById("file-upload")?.click()}>
            <FileUp className="mr-2 h-4 w-4" />
            <span>Upload Script</span>
            <input
              id="file-upload"
              type="file"
              accept=".txt"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
            />
          </Button>
          {fileName && (
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="mr-2">{fileName}</span>
              <Button variant="ghost" size="icon" onClick={handleClearScript} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <Textarea
          placeholder="Or paste your script here... Include sound effects in square brackets like [Audience laughs]"
          className="min-h-[200px] font-mono"
          value={scriptText}
          onChange={handleManualInput}
        />
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm">
            {isUploaded ? (
              <span className="flex items-center text-green-600">
                <Check className="mr-1 h-4 w-4" /> Script ready
              </span>
            ) : (
              <span className="text-muted-foreground">No script uploaded</span>
            )}
          </div>
          <Button 
            onClick={handleProcessScript}
            disabled={!isUploaded}
          >
            Continue with Script
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScriptUploader;
