import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'indigo'
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  
  const variants = {
    default: "border-transparent bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900 shadow",
    secondary: "border-transparent bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
    destructive: "border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50",
    outline: "text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800",
    success: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30",
    indigo: "border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30"
  }

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
