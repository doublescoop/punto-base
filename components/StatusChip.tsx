interface StatusChipProps {
  status: "SUBMITTED" | "IN_REVIEW" | "ACCEPTED" | "REJECTED" | "WAITLIST" | "INCLUDED" | "PUBLISHED" | "PAID";
}

export function StatusChip({ status }: StatusChipProps) {
  const styles: Record<typeof status, string> = {
    SUBMITTED: "bg-muted text-muted-foreground border-border",
    IN_REVIEW: "bg-blue-500/10 text-blue-600 border-blue-600/20",
    ACCEPTED: "bg-green-500/10 text-green-600 border-green-600/20",
    REJECTED: "bg-red-500/10 text-red-600 border-red-600/20",
    WAITLIST: "bg-yellow-500/10 text-yellow-600 border-yellow-600/20",
    INCLUDED: "bg-accent/10 text-accent border-accent/20",
    PUBLISHED: "bg-green-500/10 text-green-600 border-green-600/20",
    PAID: "bg-green-700/10 text-green-700 border-green-700/20",
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 border text-xs uppercase tracking-wider ${styles[status]}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
