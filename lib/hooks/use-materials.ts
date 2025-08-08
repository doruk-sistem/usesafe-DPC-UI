import { useState, useEffect } from "react";
import { materialsService, Material, CreateMaterialData, UpdateMaterialData } from "@/lib/services/materials";

export const useMaterials = (productId: string) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch materials
  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await materialsService.getMaterials(productId);
      setMaterials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch materials");
      console.error("Error fetching materials:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch materials with sustainability metrics
  const fetchMaterialsWithSustainability = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await materialsService.getMaterialsWithSustainability(productId);
      setMaterials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch materials");
      console.error("Error fetching materials with sustainability:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add material
  const addMaterial = async (materialData: CreateMaterialData) => {
    try {
      setError(null);
      const newMaterial = await materialsService.addMaterial(materialData);
      setMaterials(prev => [...prev, newMaterial]);
      return newMaterial;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add material");
      console.error("Error adding material:", err);
      throw err;
    }
  };

  // Remove material
  const removeMaterial = async (materialId: string) => {
    try {
      setError(null);
      await materialsService.removeMaterial(materialId);
      setMaterials(prev => prev.filter(mat => mat.id !== materialId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove material");
      console.error("Error removing material:", err);
      throw err;
    }
  };

  // Update materials sustainability
  const updateMaterialsSustainability = async (sustainabilityData: UpdateMaterialData) => {
    try {
      setError(null);
      await materialsService.updateMaterialsSustainability(materials, sustainabilityData);
      // Refresh materials to get updated sustainability data
      await fetchMaterialsWithSustainability();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update materials sustainability");
      console.error("Error updating materials sustainability:", err);
      throw err;
    }
  };

  // Calculate total percentage
  const totalPercentage = materials.reduce((sum, mat) => sum + mat.percentage, 0);

  // Check if total percentage is valid
  const isPercentageValid = totalPercentage <= 100;

  // Get percentage status
  const getPercentageStatus = () => {
    if (totalPercentage === 100) return "complete";
    if (totalPercentage > 100) return "exceeded";
    return "incomplete";
  };

  useEffect(() => {
    if (productId) {
      fetchMaterials();
    }
  }, [productId]);

  return {
    materials,
    isLoading,
    error,
    totalPercentage,
    isPercentageValid,
    getPercentageStatus,
    fetchMaterials,
    fetchMaterialsWithSustainability,
    addMaterial,
    removeMaterial,
    updateMaterialsSustainability,
  };
};
