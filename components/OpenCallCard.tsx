import { ArrowRight } from "lucide-react";

interface OpenCallCardProps {
  id: string;
  title: string;
  magazine: string;
  dueDate: string;
  bounty: string;
  category: string;
  onClick: () => void;
}

export function OpenCallCard({
  title,
  magazine,
  dueDate,
  bounty,
  category,
  onClick,
}: OpenCallCardProps) {
  return (
    <div
      className="bg-card/50 backdrop-blur-sm p-6 cursor-pointer transition-all hover:bg-card/80 group rounded-lg"
      onClick={onClick}
    >
      <div className="space-y-4">
        <h2 className="font-mono text-3xl tracking-tight leading-tight">
          {title}
        </h2>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Magazine
            </div>
            <div className="text-sm">{magazine}</div>
          </div>
          
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Due Date
            </div>
            <div className="text-sm">{dueDate}</div>
          </div>
          
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Bounty
            </div>
            <div className="text-sm text-accent">{bounty}</div>
          </div>
          
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Format
            </div>
            <div className="text-sm">{category}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          className="px-4 py-2 flex items-center gap-2 transition-all bg-accent/10 hover:bg-accent hover:text-accent-foreground rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <span className="text-sm">View</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
