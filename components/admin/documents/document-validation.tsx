import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Mock data - In a real app, this would come from an API
const validationData = {
  "DOC-001": {
    status: "in_progress",
    progress: 65,
    checks: [
      {
        name: "Digital Signature",
        status: "passed",
        details: "Valid digital signature detected",
      },
      {
        name: "Document Format",
        status: "passed",
        details: "PDF format verified",
      },
      {
        name: "Required Fields",
        status: "warning",
        details: "Optional metadata missing",
      },
      {
        name: "Issuer Verification",
        status: "pending",
        details: "Awaiting issuer confirmation",
      },
      {
        name: "Expiration Check",
        status: "passed",
        details: "Document is within valid period",
      },
    ],
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return <Badge variant="success">Passed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "warning":
        return <Badge variant="warning">Warning</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Validation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Validation Progress</span>
            <span>{validation.progress}%</span>
          </div>
          <Progress value={validation.progress} className="h-2" />
        </div>

        <div className="space-y-4">
          {validation.checks.map((check, index) => (
            <div
              key={index}
              className="flex items-start justify-between space-x-4 rounded-lg border p-4"
            >
              <div className="flex items-start space-x-4">
                {getStatusIcon(check.status)}
                <div>
                  <p className="font-medium">{check.name}</p>
                  <p className="text-sm text-muted-foreground">{check.details}</p>
                </div>
              </div>
              {getStatusBadge(check.status)}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancel Validation</Button>
          <Button>Complete Validation</Button>
        </div>
      </CardContent>
    </Card>
  );
}