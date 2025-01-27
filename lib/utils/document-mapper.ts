import { Document } from '@/lib/types/document';

export function validateAndMapDocuments(documents: Record<string, any[]> = {}): Record<string, Document[]> {
  return Object.entries(documents).reduce((acc, [key, docs]) => {
    if (Array.isArray(docs)) {
      // Only include documents with required fields
      acc[key] = docs.filter(doc => 
        doc.name && 
        doc.url && 
        doc.type
      ) as Document[];
    }
    return acc;
  }, {} as Record<string, Document[]>);
}