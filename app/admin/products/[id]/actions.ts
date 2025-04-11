// app/admin/products/[id]/actions.ts
"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getProductDetails(id: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      manufacturer:manufacturer_id (
        id,
        name
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !product) {
    console.error("Error fetching product:", error);
    return null;
  }

  return product;
}