import { Loader2, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface Company {
  id: string;
  name: string;
}

interface CompanySelectorProps {
  companies: Company[];
  selectedCompanyId: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function CompanySelector({
  companies,
  selectedCompanyId,
  onSelect,
  isLoading = false,
}: CompanySelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Empresa
        </Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Empresa
      </Label>
      <Select value={selectedCompanyId} onValueChange={onSelect}>
        <SelectTrigger className={cn('w-full')}>
          <SelectValue placeholder="Selecione uma empresa" />
        </SelectTrigger>
        <SelectContent>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {companies.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Nenhuma empresa disponivel
        </p>
      )}
    </div>
  );
}
