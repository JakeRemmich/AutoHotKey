import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Eye,
  Trash2,
  Download,
  Calendar,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

interface Script {
  _id: string;
  name: string;
  description: string;
  script: string;
  originalDescription: string;
  createdAt: string;
}

interface ScriptHistoryCardProps {
  script: Script;
  onView: (script: Script) => void;
  onDelete: (id: string) => void;
  onDownload: (script: Script) => void;
}

export function ScriptHistoryCard({
  script,
  onView,
  onDelete,
  onDownload
}: ScriptHistoryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this script?')) {
      setIsDeleting(true);
      try {
        await onDelete(script._id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDownload = () => {
    onDownload(script);
  };

  return (
    <Card className="bg-card hover:bg-accent/50 border border-border shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-card-foreground mb-2">
              {script.name}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(script.createdAt), 'MMM dd, yyyy')}
            </div>
          </div>
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            <FileText className="h-3 w-3 mr-1" />
            .ahk
          </Badge>
        </div>

        {script.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {script.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="bg-slate-900 dark:bg-slate-800 rounded-lg p-3 mb-4">
          <pre className="text-green-400 text-xs font-mono overflow-hidden line-clamp-3">
            {script.script}
          </pre>
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            onClick={() => onView(script)}
            size="sm"
            variant="outline"
            className="w-24 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 dark:text-blue-400"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>

          <Button
            onClick={handleDownload}
            size="sm"
            variant="outline"
            className="w-24 border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 dark:text-purple-400"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>

          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            size="sm"
            variant="outline"
            className="w-24 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 dark:text-red-400"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}