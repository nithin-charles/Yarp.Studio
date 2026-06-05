import * as React from "react"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'info'
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-slate-50 text-slate-900 border-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800",
      destructive: "bg-red-50 text-red-900 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
      info: "bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30"
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current ${variants[variant]} ${className}`}
        {...props}
      />
    )
  }
)
Alert.displayName = "Alert"

export const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", ...props }, ref) => (
    <h5
      ref={ref}
      className={`mb-1 font-medium leading-none tracking-tight ${className}`}
      {...props}
    />
  )
)
AlertTitle.displayName = "AlertTitle"

export const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`text-sm opacity-90 [&_p]:leading-relaxed ${className}`}
      {...props}
    />
  )
)
AlertDescription.displayName = "AlertDescription"
