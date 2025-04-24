import { Globe, History, Leaf, QrCode, ShieldCheck, Zap } from "lucide-react";

export const featureItems = [
  {
    icon: QrCode,
    titleKey: "features.sections.traceability.title",
    descriptionKey: "features.sections.traceability.description",
    gradient: "from-blue-500 to-blue-700",
    backgroundIcon: Globe
  },
  {
    icon: History,
    titleKey: "features.sections.supplyChain.title",
    descriptionKey: "features.sections.supplyChain.description",
    gradient: "from-green-500 to-green-700",
    backgroundIcon: Leaf
  },
  {
    icon: ShieldCheck,
    titleKey: "features.sections.certifications.title",
    descriptionKey: "features.sections.certifications.description",
    gradient: "from-purple-500 to-purple-700",
    backgroundIcon: Zap
  }
]; 