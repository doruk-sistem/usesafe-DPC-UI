import { useTranslations } from "next-intl";

interface ErrorProps {
  title?: string;
  message?: string;
  error?: Error | unknown;
  className?: string;
}

export function Error({
  title,
  message,
  error,
  className = "",
}: ErrorProps) {
  const t = useTranslations();

  const errorTitle = title || t("common.error.title");
  
  let errorMessage = message || t("common.error.unexpectedError");
  
  if (error && typeof error === 'object' && 'message' in error) {
    const errorObj = error as { message: string };
    errorMessage = errorObj.message;
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] space-y-4 ${className}`}>
      <h2 className="text-2xl font-semibold text-destructive">
        {errorTitle}
      </h2>
      <p className="text-muted-foreground">
        {errorMessage}
      </p>
    </div>
  );
} 