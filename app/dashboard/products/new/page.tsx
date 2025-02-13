import dynamic from "next/dynamic";

const NewProductPageClient = dynamic(() => import("./page.client"), {
  ssr: false,
});

export default function NewProductPage() {
  return <NewProductPageClient />;
}
