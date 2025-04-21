import { Globe, History, Leaf, QrCode, ShieldCheck, Zap } from "lucide-react";

export const featureItems = [
  {
    icon: QrCode,
    titleKey: "features.traceability.title",
    descriptionKey: "features.traceability.description",
    gradient: "from-blue-500 to-blue-700",
    backgroundIcon: Globe
  },
  {
    icon: History,
    titleKey: "features.supplyChain.title",
    descriptionKey: "features.supplyChain.description",
    gradient: "from-green-500 to-green-700",
    backgroundIcon: Leaf
  },
  {
    icon: ShieldCheck,
    titleKey: "features.certifications.title",
    descriptionKey: "features.certifications.description",
    gradient: "from-purple-500 to-purple-700",
    backgroundIcon: Zap
  }
]; 