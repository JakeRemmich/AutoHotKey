import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Download, Edit, RefreshCw, Trash2, Copy, Check, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface Script {
  _id: string;
  name: string;
  description: string;
  script: string;
  originalDescription: string;
  createdAt: string;
}

interface ScriptDetailModalProps {
  script: Script | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, name: string, description: string) => void;
  onDelete: (id: string) => void;
  onRegenerate: (script: Script) => void;
  onDownload: (script: Script) => void;
}

export function ScriptDetailModal({
  script,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onRegenerate,
  onDownload
}: ScriptDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (script) {
      setEditName(script.name);
      setEditDescription(script.description);
    }
  }, [script]);

  if (!script) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Success",
        description: "Script copied to clipboard!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy script",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Script name is required",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(script._id, editName, editDescription);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Script updated successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update script",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this script?')) {
      try {
        await onDelete(script._id);
        onClose();
        toast({
          title: "Success",
          description: "Script deleted successfully!"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete script",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-xl font-semibold"
                    placeholder="Script name"
                  />
                </div>
              ) : (
                <DialogTitle className="text-xl font-semibold text-gray-800">
                  {script.name}
                </DialogTitle>
              )}
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    size="sm"
                    variant="outline"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="mt-2">
              <Label htmlFor="editDesc">Description</Label>
              <Textarea
                id="editDesc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Script description"
                className="mt-1"
              />
            </div>
          ) : (
            <DialogDescription className="text-gray-600">
              {script.description || 'No description provided'}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              AutoHotkey Script
            </Label>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto max-h-[300px] font-mono">
                {script.script}
              </pre>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              onClick={() => onDownload(script)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download .ahk File
            </Button>

            <Button
              onClick={() => onRegenerate(script)}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-generate
            </Button>

            <Button
              onClick={handleDelete}
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Script
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}