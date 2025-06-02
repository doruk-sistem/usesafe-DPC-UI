"use client";

import { useTranslations } from "next-intl";

interface CertificationDocumentsProps {
  certificationId: string;
}

export function CertificationDocuments({ certificationId }: CertificationDocumentsProps) {
  const t = useTranslations("admin.dpc");

  return null;
}