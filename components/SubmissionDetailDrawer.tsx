import { X, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { StatusChip } from "./StatusChip";
import { LiquidGlass } from "./LiquidGlass";

interface SubmissionDetailDrawerProps {
  submission: {
    id: string;
    title: string;
    topic: string;
    magazine: string;
    issue: string;
    status: "SUBMITTED" | "IN_REVIEW" | "ACCEPTED" | "REJECTED" | "WAITLIST" | "INCLUDED" | "PUBLISHED" | "PAID";
    submittedAt: string;
    lastUpdated: string;
    content: string;
    description: string;
    format: string;
    fileSize?: string;
    fileType?: string;
    cid?: string;
  };
  onClose: () => void;
}

export function SubmissionDetailDrawer({ submission, onClose }: SubmissionDetailDrawerProps) {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-end z-50">
      <div className="bg-card/95 backdrop-blur-xl w-full sm:w-[600px] h-[90vh] sm:h-[80vh] overflow-y-auto rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none">
        {/* Header */}
        <div className="sticky top-0 bg-card/80 backdrop-blur-xl border-b border-border/20 p-6 flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <h2 className="font-mono text-2xl tracking-tight">{submission.title}</h2>
            <p className="text-sm text-muted-foreground">
              {submission.magazine} › {submission.issue} › {submission.topic}
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:text-accent transition-colors ml-4"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Status & Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusChip status={submission.status} />
              <span className="text-xs text-muted-foreground">
                Last updated {submission.lastUpdated}
              </span>
            </div>

            {/* Timeline */}
            <div className="space-y-3 pl-4 border-l-2 border-border/20">
              <div className="relative">
                <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gradient-to-br from-accent/40 to-accent/20 backdrop-blur-sm" 
                     style={{ boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.1)' }} />
                <div className="text-xs text-muted-foreground">Submitted {submission.submittedAt}</div>
              </div>
              
              {["IN_REVIEW", "ACCEPTED", "INCLUDED", "PUBLISHED", "PAID"].includes(submission.status) && (
                <div className="relative">
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gradient-to-br from-accent/40 to-accent/20 backdrop-blur-sm" 
                       style={{ boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.1)' }} />
                  <div className="text-xs">In review</div>
                </div>
              )}
              
              {["ACCEPTED", "INCLUDED", "PUBLISHED", "PAID"].includes(submission.status) && (
                <div className="relative">
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gradient-to-br from-green-500/40 to-green-500/20 backdrop-blur-sm" 
                       style={{ boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.1)' }} />
                  <div className="text-xs">Accepted</div>
                </div>
              )}
              
              {["PUBLISHED", "PAID"].includes(submission.status) && (
                <div className="relative">
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gradient-to-br from-green-500/40 to-green-500/20 backdrop-blur-sm" 
                       style={{ boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.1)' }} />
                  <div className="text-xs">Published</div>
                </div>
              )}
              
              {submission.status === "PAID" && (
                <div className="relative">
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gradient-to-br from-green-500/40 to-green-500/20 backdrop-blur-sm" 
                       style={{ boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.1)' }} />
                  <div className="text-xs">Payment confirmed</div>
                </div>
              )}
              
              {submission.status === "REJECTED" && (
                <div className="relative">
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gradient-to-br from-muted/40 to-muted/20 backdrop-blur-sm" 
                       style={{ boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.1)' }} />
                  <div className="text-xs text-muted-foreground">Not selected</div>
                </div>
              )}
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
              Description
            </h3>
            <p className="text-sm leading-relaxed">{submission.description}</p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
              Content Preview
            </h3>
            
            {submission.format === "picture" && (
              <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center rounded-lg overflow-hidden">
                <LiquidGlass size={100} tint="rgba(236, 236, 240, 0.25)">
                  <span className="text-xs">Image</span>
                </LiquidGlass>
              </div>
            )}
            
            {(submission.format === "shorttext" || submission.format === "longtext") && (
              <div className="p-4 bg-muted/20 backdrop-blur-sm rounded-lg">
                <p className="text-sm leading-relaxed font-mono">{submission.content}</p>
              </div>
            )}
            
            {submission.format === "video" && (
              <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center rounded-lg overflow-hidden">
                <LiquidGlass size={100} tint="rgba(236, 236, 240, 0.25)">
                  <span className="text-xs">Video</span>
                </LiquidGlass>
              </div>
            )}
            
            {submission.format === "audio" && (
              <div className="h-32 bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center rounded-lg overflow-hidden">
                <LiquidGlass size={100} tint="rgba(236, 236, 240, 0.25)">
                  <span className="text-xs">Audio</span>
                </LiquidGlass>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
              Metadata
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Format</div>
                <div>{submission.format}</div>
              </div>
              
              {submission.fileSize && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">File Size</div>
                  <div>{submission.fileSize}</div>
                </div>
              )}
              
              {submission.fileType && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">File Type</div>
                  <div>{submission.fileType}</div>
                </div>
              )}
            </div>

            {submission.cid && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">IPFS CID</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted/30 backdrop-blur-sm px-2 py-1 flex-1 truncate rounded">
                    {submission.cid}
                  </code>
                  <button
                    onClick={() => handleCopy(submission.cid!)}
                    className="px-2 py-1 bg-muted/30 backdrop-blur-sm hover:bg-muted transition-colors rounded"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* License */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
              License
            </h3>
            <p className="text-sm text-muted-foreground">
              Non-exclusive digital rights. AI training prohibited.{" "}
              <button className="text-accent hover:underline">Read full terms</button>
            </p>
          </div>

          {/* Non-cancellable Notice */}
          <div className="border-l-2 border-accent/50 pl-4 py-2 bg-accent/5 rounded-r-lg">
            <p className="text-sm text-muted-foreground">
              This submission is final and cannot be edited or cancelled.
            </p>
          </div>

          {/* Actions for Published Submissions */}
          {submission.status === "PUBLISHED" && (
            <div className="space-y-3 pt-4 border-t border-border/20">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                Share Your Work
              </h3>
              <button
                onClick={() => handleCopy(`https://example.com/submissions/${submission.id}`)}
                className="w-full px-4 py-3 bg-accent/10 hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-center gap-2 rounded-full"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">Copy Public Link</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
