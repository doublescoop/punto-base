import { X } from "lucide-react";
import { useState } from "react";

interface AuthModalProps {
  onClose: () => void;
  onAuthenticated: (paymentMethod: "usdc" | "usd") => void;
  context: "voting" | "submission";
  magazineName?: string;
}

export function AuthModal({ onClose, onAuthenticated, context, magazineName }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [paymentMethod, setPaymentMethod] = useState<"usdc" | "usd">("usdc");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would integrate with external auth library
    onAuthenticated(paymentMethod);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-card border border-border max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 hover:text-accent transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          {context === "voting" && magazineName && (
            <>
              <h2 className="font-mono text-2xl tracking-tight">
                Be part of {magazineName} editorial team for collective publishing!
              </h2>
              <p className="text-xs text-muted-foreground">
                continue voting and/or submit your own content to be featured
              </p>
            </>
          )}
          
          {context === "submission" && (
            <>
              <h2 className="font-mono text-2xl tracking-tight">
                {mode === "signup" ? "Join the collective" : "Welcome back"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {mode === "signup" 
                  ? "Create your account to submit and get paid for published work"
                  : "Sign in to continue your submission"
                }
              </p>
            </>
          )}

          <div className="flex border border-border">
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 px-4 py-2 transition-colors ${
                mode === "signup"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 px-4 py-2 transition-colors ${
                mode === "signin"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              required
              className="w-full border border-border px-4 py-3 bg-background focus:outline-none focus:border-accent transition-colors"
            />

            <input
              type="password"
              placeholder="Password"
              required
              className="w-full border border-border px-4 py-3 bg-background focus:outline-none focus:border-accent transition-colors"
            />

            {mode === "signup" && (
              <div className="space-y-3 pt-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground block">
                  Payment Method (if published)
                </label>
                
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("usdc")}
                    className={`w-full border px-4 py-3 text-left transition-all ${
                      paymentMethod === "usdc"
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm">USDC (Crypto)</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          No fees, instant payment
                        </div>
                      </div>
                      {paymentMethod === "usdc" && (
                        <div className="w-2 h-2 bg-accent rounded-full mt-1" />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("usd")}
                    className={`w-full border px-4 py-3 text-left transition-all ${
                      paymentMethod === "usd"
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm">USD (Bank Transfer)</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          10% processing fee
                        </div>
                      </div>
                      {paymentMethod === "usd" && (
                        <div className="w-2 h-2 bg-accent rounded-full mt-1" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full border border-border px-4 py-3 bg-primary text-primary-foreground hover:bg-accent hover:border-accent transition-colors"
            >
              {mode === "signup" ? "Create Account" : "Sign In"}
            </button>
          </form>

          <button
            onClick={onClose}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Continue without {mode === "signup" ? "signing up" : "signing in"}
          </button>
        </div>
      </div>
    </div>
  );
}
