"use client";

import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type ValidationStatus = "verified" | "valid" | "failed" | "warning" | "pending";

interface ValidationCheck {
  status: ValidationStatus;
  details: string;
  timestamp: string;
}

interface DocumentValidation {
  authenticity: ValidationCheck;
  completeness: ValidationCheck;
  format: ValidationCheck;
  expiration: ValidationCheck;
  issuerVerification: ValidationCheck;
}

// Mock data - In a real app, this would come from an API
const validationData: Record<string, DocumentValidation> = {
  "DOC-001": {
    authenticity: {
      status: "verified",
      details: "Digital signature verified successfully",
      timestamp: "2024-03-15T10:31:00",
    },
    completeness: {
      status: "verified",
      details: "All required fields are present",
      timestamp: "2024-03-15T10:32:00",
    },
    format: {
      status: "verified",
      details: "Document format meets requirements",
      timestamp: "2024-03-15T10:33:00",
    },
    expiration: {
      status: "valid",
      details: "Document is within validity period",
      timestamp: "2024-03-15T10:34:00",
    },
    issuerVerification: {
      status: "pending",
      details: "Issuer verification in progress",
      timestamp: "2024-03-15T10:35:00",
    },
  },
};

interface DocumentValidationProps {
  documentId: string;
}

export function DocumentValidation({ documentId }: DocumentValidationProps) {
  const validation = validationData[documentId];

  if (!validation) {
    return <div>Validation data not found</div>;
  }

  const getStatusIcon = (status: ValidationStatus) => {
    switch (status) {
      case "verified":
      case "valid":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: ValidationStatus) => {
    switch (status) {
      case "verified":
      case "valid":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-blue-500";
    }
  };

  const calculateProgress = () => {
    const total = Object.keys(validation).length;
    const completed = Object.values(validation).filter(
      (check) => check.status === "verified" || check.status === "valid"
    ).length;
    return (completed / total) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Validation Checks</span>
          <Progress value={calculateProgress()} className="w-[100px]" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(validation).map(([key, check]) => (
          <div key={key} className="flex items-start gap-4">
            {getStatusIcon(check.status)}
            <div className="flex-1 space-y-1">
              <p className="font-medium capitalize">{key}</p>
              <p className="text-sm text-muted-foreground">{check.details}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(check.timestamp).toLocaleString()}
              </p>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(check.status)} capitalize`}>
              {check.status}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}