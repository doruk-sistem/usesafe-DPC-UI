import { Document } from '@/lib/types/document';

export async function getDocuments(productId?: string): Promise<Document[]> {
  try {
    // Use absolute path with window.location.origin
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = productId 
      ? `${baseUrl}/api/documents?productId=${productId}`
      : `${baseUrl}/api/documents`;
      
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch documents: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}

export async function getDocumentById(id: string): Promise<Document> {
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/api/documents/${id}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch document: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
} 