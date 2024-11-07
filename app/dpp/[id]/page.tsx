import { notFound } from "next/navigation";
import { sampleDPPs } from "@/lib/data/sample-dpps";
import { DPPDetails } from "@/components/dpp/dpp-details";

export function generateStaticParams() {
  return sampleDPPs.map((dpp) => ({
    id: dpp.id,
  }));
}

export default function DPPDetailPage({ params }: { params: { id: string } }) {
  const dpp = sampleDPPs.find(d => d.id === params.id);

  if (!dpp) {
    notFound();
  }

  return (
    <div className="container py-10">
      <DPPDetails dpp={dpp} />
    </div>
  );
}