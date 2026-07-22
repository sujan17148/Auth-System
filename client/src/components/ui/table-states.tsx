import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { extractError } from '@/utility/extractError';

export const TableHeader = ({ headers }: { headers: string[] }) => {
  return (
    <thead>
      <tr>
        {headers.map((header, index) => (
          <th
            key={index}
            className={`${header.toLowerCase() == 'actions' ? ' text-right flex justify-end' : ''}`}
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export const TableLoading = ({ label = 'Loading...' }) => (
  <tr>
    <td colSpan={10} className="text-center py-8 text-muted-foreground">
      {label}
    </td>
  </tr>
);

export function TableError({
  error,
  label = 'Unable to load data',
}: {
  error: unknown;
  label?: string;
}) {
  return (
    <tr>
      <td colSpan={10}>
        <Alert variant="destructive">
          <AlertTitle>{label}</AlertTitle>
          <AlertDescription>{extractError(error)}</AlertDescription>
        </Alert>
      </td>
    </tr>
  );
}

export const TableEmptyState = ({ label = 'No data found' }) => (
  <tr>
    <td colSpan={10} className="text-center py-8 text-muted-foreground">
      {label}
    </td>
  </tr>
);
