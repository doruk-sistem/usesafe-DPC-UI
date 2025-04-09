"use client";

import { FileSpreadsheet, Download, CheckCircle, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Mock data - In a real app, this would come from an API
const testsData = {
  "DPC-001": [
    {
      id: "TEST-001",
      name: "Chemical Safety Analysis",
      status: "passed",
      completedAt: "2024-03-15T10:30:00",
      lab: "SafetyLab International",
      results: [
        { parameter: "Lead Content", value: "< 0.1 ppm", limit: "0.5 ppm", passed: true },
        { parameter: "Formaldehyde", value: "12 ppm", limit: "75 ppm", passed: true },
        { parameter: "pH Value", value: "7.2", limit: "6.0-8.0", passed: true },
      ],
    },
    {
      id: "TEST-002",
      name: "Color Fastness Test",
      status: "passed",
      completedAt: "2024-03-15T11:45:00",
      lab: "TextileLab Corp",
      results: [
        { parameter: "Washing", value: "Grade 4", limit: "Min. Grade 3", passed: true },
        { parameter: "Rubbing", value: "Grade 3-4", limit: "Min. Grade 3", passed: true },
        { parameter: "Light", value: "Grade 5", limit: "Min. Grade 4", passed: true },
      ],
    },
    {
      id: "TEST-003",
      name: "Durability Testing",
      status: "in_progress",
      completedAt: null,
      lab: "QualityTest Labs",
      progress: 65,
      results: [],
    },
  ],
};

interface CertificationTestsProps {
  certificationId: string;
}

export function CertificationTests({ certificationId }: CertificationTestsProps) {
  const t = useTranslations("admin.dpc");
  const tests = testsData[certificationId] || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("tabs.testReports")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {tests.length === 0 ? (
            <p className="text-muted-foreground">{t("tests.noTests")}</p>
          ) : (
            tests.map((test) => (
              <div
                key={test.id}
                className="rounded-lg border"
              >
                <div className="flex items-center justify-between border-b p-4">
                  <div className="flex items-start gap-4">
                    <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{test.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{test.lab}</span>
                        {test.completedAt && (
                          <>
                            <span>·</span>
                            <span>
                              {t("tests.completed")} {new Date(test.completedAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        test.status === "passed"
                          ? "success"
                          : test.status === "failed"
                          ? "destructive"
                          : "warning"
                      }
                    >
                      {t(`details.status.${test.status}`)}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {test.status === "in_progress" ? (
                  <div className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t("tests.progress")}</span>
                        <span>{test.progress}%</span>
                      </div>
                      <Progress value={test.progress} className="h-2" />
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="text-sm text-muted-foreground">
                          <th className="text-left font-medium">{t("tests.table.parameter")}</th>
                          <th className="text-left font-medium">{t("tests.table.result")}</th>
                          <th className="text-left font-medium">{t("tests.table.limit")}</th>
                          <th className="text-left font-medium">{t("tests.table.status")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {test.results.map((result, index) => (
                          <tr key={index} className="text-sm">
                            <td className="py-2">{result.parameter}</td>
                            <td className="py-2">{result.value}</td>
                            <td className="py-2">{result.limit}</td>
                            <td className="py-2">
                              {result.passed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}