import { Document } from '@/lib/types/document';

export function validateAndMapDocuments(documents: Record<string, any[]> = {}): Record<string, Document[]> {
  return Object.entries(documents).reduce((acc, [key, docs]) => {
    if (Array.isArray(docs)) {
      // Include all documents that have at least name and url
      // AI-generated documents might have different type structures
      const filteredDocs = docs.filter(doc => doc.name && doc.url);
      
      if (filteredDocs.length > 0) {
        acc[key] = filteredDocs.map(doc => ({
          ...doc,
          type: doc.type || key, // Use the key as type if doc.type is missing
          id: doc.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: doc.status || "pending",
          uploadedAt: doc.uploadedAt || new Date().toISOString(),
          fileSize: doc.fileSize || "N/A",
          version: doc.version || "1.0"
        })) as Document[];
      }
    } else if (docs && typeof docs === 'object' && !Array.isArray(docs)) {
      // Handle case where docs might be a single document object
      const doc = docs as any;
      if (doc.name && doc.url) {
        acc[key] = [{
          ...doc,
          type: doc.type || key,
          id: doc.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: doc.status || "pending",
          uploadedAt: doc.uploadedAt || new Date().toISOString(),
          fileSize: doc.fileSize || "N/A",
          version: doc.version || "1.0"
        }] as Document[];
      }
    }
    return acc;
  }, {} as Record<string, Document[]>);
}