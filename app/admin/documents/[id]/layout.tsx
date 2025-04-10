// Mock data for static params
const documents = [
  { id: "DOC-001" },
  { id: "DOC-002" },
  { id: "DOC-003" },
  { id: "DOC-004" },
];

export function generateStaticParams() {
  return documents.map((document) => ({
    id: document.id,
  }));
}

export default function DocumentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 