import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
    
    const variants = {
      default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
      outline: "border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-900 dark:text-slate-100",
      secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
      ghost: "hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100",
      link: "text-indigo-600 underline-offset-4 hover:underline"
    }

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9"
    }

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`

    return (
      <button
        ref={ref}
        className={combinedClassName}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
