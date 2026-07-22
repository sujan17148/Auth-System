import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { extractError } from "@/utility/extractError";

interface ErrorStateProps {
  error: unknown;
  title?: string;
}

export const ErrorState = ({ error, title }: ErrorStateProps) => (
  <div className="min-h-screen max-w-5xl mx-auto py-10 px-4">
    <Alert variant="destructive">
      <AlertTitle>{title ?? 'Something went wrong'}</AlertTitle>
      <AlertDescription>{extractError(error)}</AlertDescription>
    </Alert>
  </div>
);
