import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Download, Save, Copy, Wand2 } from 'lucide-react';
import { generateScript, saveScript } from '@/api/scripts';
import { useToast } from '@/hooks/useToast';

interface ScriptGeneratorProps {
  onScriptGenerated: () => void;
  usage: {
    scriptsGenerated: number;
    limit: number;
    plan: string;
  };
  onUpgradeClick: () => void;
}

export function ScriptGenerator({ onScriptGenerated, usage, onUpgradeClick }: ScriptGeneratorProps) {
  const [description, setDescription] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [scriptName, setScriptName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  console.log('=== SCRIPT GENERATOR RENDER ===');
  console.log('Usage:', usage);
  console.log('Generated script length:', generatedScript.length);

  const canGenerate = usage.plan !== 'free' || usage.scriptsGenerated < usage.limit;

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please describe what you want to automate",
        variant: "destructive"
      });
      return;
    }

    if (!canGenerate) {
      onUpgradeClick();
      return;
    }

    setIsGenerating(true);
    console.log('=== GENERATING SCRIPT ===');
    console.log('Description:', description);

    try {
      const result = await generateScript({ description }) as { script: string };
      console.log('Script generated successfully:', result.script.substring(0, 100) + '...');
      
      setGeneratedScript(result.script);
      setScriptName(`Script ${new Date().toLocaleString()}`);
      onScriptGenerated();

      toast({
        title: "Script generated!",
        description: "Your AutoHotkey script is ready to use.",
      });
    } catch (error) {
      console.error('Error generating script:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate script",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      console.log('=== END GENERATING SCRIPT ===');
    }
  };

  const handleSave = async () => {
    if (!generatedScript || !scriptName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for your script",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    console.log('=== SAVING SCRIPT ===');
    console.log('Script name:', scriptName);

    try {
      await saveScript({
        name: scriptName,
        description: description,
        script: generatedScript
      });

      console.log('Script saved successfully');
      toast({
        title: "Script saved!",
        description: "Your script has been saved to your history.",
      });
    } catch (error) {
      console.error('Error saving script:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save script",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      console.log('=== END SAVING SCRIPT ===');
    }
  };

  const handleDownload = () => {
    if (!generatedScript) return;

    console.log('=== DOWNLOADING SCRIPT ===');
    const blob = new Blob([generatedScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scriptName || 'script'}.ahk`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Your .ahk file is being downloaded.",
    });
    console.log('=== END DOWNLOADING SCRIPT ===');
  };

  const handleCopy = async () => {
    if (!generatedScript) return;

    try {
      await navigator.clipboard.writeText(generatedScript);
      toast({
        title: "Copied!",
        description: "Script copied to clipboard.",
      });
    } catch (error) {
      console.error('Failed to copy script:', error);
      toast({
        title: "Error",
        description: "Failed to copy script to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Wand2 className="h-5 w-5 text-blue-600" />
            Describe Your Automation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe what you want to automate. For example: 'Create a hotkey Ctrl+Shift+T that opens Notepad and types Hello World'"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {description.length}/1000 characters
            </div>
            
            {canGenerate ? (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !description.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Script
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={onUpgradeClick}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Upgrade to Continue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Output Section */}
      {generatedScript && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-800">Generated AutoHotkey Script</CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Ready to Use
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                {generatedScript}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter script name..."
                  value={scriptName}
                  onChange={(e) => setScriptName(e.target.value)}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !scriptName.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Script
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}