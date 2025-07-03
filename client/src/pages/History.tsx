import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScriptHistoryCard } from '@/components/ScriptHistoryCard';
import { ScriptDetailModal } from '@/components/ScriptDetailModal';
import { Search, FileText, Plus } from 'lucide-react';
import { getScriptHistory, deleteScript, updateScript, generateScript } from '@/api/scripts';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';

interface Script {
  _id: string;
  name: string;
  description: string;
  script: string;
  originalDescription: string;
  createdAt: string;
}

export function History() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<Script[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadScripts();
  }, []);

  useEffect(() => {
    const filtered = scripts.filter(script =>
      script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredScripts(filtered);
  }, [scripts, searchTerm]);

  const loadScripts = async () => {
    try {
      const result = await getScriptHistory() as { scripts: Script[] };
      setScripts(result.scripts);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load scripts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (script: Script) => {
    setSelectedScript(script);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteScript(id);
      setScripts(prev => prev.filter(script => script._id !== id));
      toast({
        title: "Success",
        description: "Script deleted successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete script",
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async (id: string, name: string, description: string) => {
    try {
      await updateScript({ id, name, description });
      setScripts(prev => prev.map(script =>
        script._id === id ? { ...script, name, description } : script
      ));
      toast({
        title: "Success",
        description: "Script updated successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update script",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleRegenerate = async (script: Script) => {
    try {
      const result = await generateScript({ description: script.originalDescription }) as { script: string; success: boolean };
      const updatedScript = { ...script, script: result.script };
      setScripts(prev => prev.map(s => s._id === script._id ? updatedScript : s));
      setSelectedScript(updatedScript);
      toast({
        title: "Success",
        description: "Script regenerated successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to regenerate script",
        variant: "destructive"
      });
    }
  };

  const handleDownload = (script: Script) => {
    const blob = new Blob([script.script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.name}.ahk`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Success",
      description: "Script downloaded successfully!"
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your scripts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My AutoHotkey Scripts</h1>
          <p className="text-muted-foreground mt-1">
            Manage and download your saved automation scripts
          </p>
        </div>
        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Script
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scripts by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-border focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredScripts.length} script{filteredScripts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {filteredScripts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
            {searchTerm ? 'No scripts found' : 'No scripts yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Create your first AutoHotkey script to get started'
            }
          </p>
          {!searchTerm && (
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Script
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScripts.map((script) => (
            <ScriptHistoryCard
              key={script._id}
              script={script}
              onView={handleView}
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      <ScriptDetailModal
        script={selectedScript}
        isOpen={!!selectedScript}
        onClose={() => setSelectedScript(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onRegenerate={handleRegenerate}
        onDownload={handleDownload}
      />
    </div>
  );
}