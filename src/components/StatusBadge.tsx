import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles = {
  'In Transit': 'bg-status-in-transit text-white',
  'Delivered': 'bg-status-delivered text-white',
  'Pending': 'bg-status-pending text-white',
  'Delayed': 'bg-status-delayed text-white',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const defaultStyle = 'bg-muted text-muted-foreground';
  const statusStyle = statusStyles[status as keyof typeof statusStyles] || defaultStyle;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        statusStyle,
        className
      )}
    >
      {status}
    </span>
  );
}