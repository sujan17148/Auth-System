import { type ReactNode, useMemo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface RowAction {
  key: string;
  label: string;
  onSelect: () => void | Promise<void>;
  disabled?: boolean;
  icon?: ReactNode;
  tone?: 'default' | 'danger';
}

interface RowActionsMenuProps {
  actions: RowAction[];
  triggerAriaLabel: string;
}

export const RowActionsMenu = ({ actions, triggerAriaLabel }: RowActionsMenuProps) => {
  const actionableItems = useMemo(() => actions.filter((a) => !a.disabled), [actions]);

  const hasAction = actionableItems.length > 0;

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full border border-transparent hover:border-slate-200"
            aria-label={triggerAriaLabel}
            disabled={!hasAction}
          >
            <MoreHorizontal className="h-5 w-5 text-slate-600" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side="bottom"
          sideOffset={8}
          collisionPadding={12}
          className="w-56 rounded-xl border border-slate-200 p-1 shadow-xl"
        >
          {actions.map((action) => {
            const intentClass =
              action.tone === 'danger'
                ? 'text-rose-600 focus:bg-rose-50 focus:text-rose-700'
                : 'text-slate-700 focus:bg-slate-50 focus:text-slate-900';

            return (
              <DropdownMenuItem
                key={action.key}
                disabled={action.disabled}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${intentClass}`}
                onSelect={(e) => {
                  if (action.disabled) {
                    e.preventDefault();
                    return;
                  }

                  Promise.resolve(action.onSelect()).catch(() => {
                    /* error handled upstream */
                  });
                }}
              >
                {action.icon ? action.icon : <span className="h-4 w-4" />}
                <span>{action.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
