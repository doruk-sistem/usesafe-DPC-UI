import { FileText } from 'lucide-react';
import React, { useState } from 'react';

import { Card, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/card';

const DocumentCard = ({ document }) => {
  const [isRejecting, setIsRejecting] = useState(false);

  const truncatedFileName = document.filename.length > 25 
    ? `${document.filename.slice(0, 25)}...` 
    : document.filename;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1 max-w-[200px]">
          <div 
            className="flex items-center gap-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium truncate">{truncatedFileName}</span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start">
                  <p className="max-w-[300px] break-words text-xs">{document.filename}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <span className="whitespace-nowrap">Type: {document.type}</span>
            <span>•</span>
            <span className="whitespace-nowrap">Ver: {document.version}</span>
            <span>•</span>
            <span className="whitespace-nowrap">{formatDate(document.upload_date)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DocumentCard; 