import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // TRAFIQ.AI Risk Variants
        riskLow: "border-success/30 bg-success/20 text-success",
        riskMedium: "border-warning/30 bg-warning/20 text-warning",
        riskHigh: "border-destructive/30 bg-destructive/20 text-destructive",
        riskCritical: "border-destructive/50 bg-destructive/30 text-destructive animate-pulse",
        // Status Variants
        online: "border-success/30 bg-success/20 text-success",
        offline: "border-muted-foreground/30 bg-muted text-muted-foreground",
        processing: "border-primary/30 bg-primary/20 text-primary animate-pulse",
        // Alert Variants
        alertWarning: "border-warning/30 bg-warning/20 text-warning",
        alertDanger: "border-destructive/30 bg-destructive/20 text-destructive",
        alertInfo: "border-primary/30 bg-primary/20 text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
