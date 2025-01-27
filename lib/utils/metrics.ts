import { Product } from "@/lib/types/product";

export function calculateProductGrowth(products: Product[]): number {
  if (!products?.length) return 0;

  // Get products from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentProducts = products.filter(
    product => new Date(product.created_at) >= thirtyDaysAgo
  );

  // Get products from previous 30 days
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  
  const previousProducts = products.filter(
    product => {
      const createdAt = new Date(product.created_at);
      return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
    }
  );

  // Calculate growth rate
  if (previousProducts.length === 0) return recentProducts.length > 0 ? 100 : 0;
  
  const growthRate = ((recentProducts.length - previousProducts.length) / previousProducts.length) * 100;
  return Number(growthRate.toFixed(1));
}

export function getRecentActivities(products: Product[]) {
  if (!products?.length) return [];

  // Get activities from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentProducts = products
    .filter(product => new Date(product.created_at) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3) // Get only the 3 most recent
    .map(product => ({
      id: product.id,
      type: "Product",
      name: product.name,
      status: product.status,
      timestamp: product.created_at
    }));

  return recentProducts;
}