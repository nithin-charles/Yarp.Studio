import * as React from "react"

const TabsContext = React.createContext<{
  value: string
  onValueChange: (val: string) => void
} | null>(null)

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
}

export function Tabs({ defaultValue, value, onValueChange, children, className = "", ...props }: TabsProps) {
  const [localVal, setLocalVal] = React.useState(defaultValue)
  const activeVal = value !== undefined ? value : localVal
  const handleValChange = React.useCallback((val: string) => {
    if (value === undefined) setLocalVal(val)
    if (onValueChange) onValueChange(val)
  }, [value, onValueChange])

  return (
    <TabsContext.Provider value={{ value: activeVal, onValueChange: handleValChange }}>
      <div className={`${className}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 p-1 text-slate-500 dark:text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function TabsTrigger({ value, className = "", children, ...props }: TabsTriggerProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")
  
  const isActive = context.value === value
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => context.onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${
        isActive
          ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-sm font-semibold"
          : "hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function TabsContent({ value, className = "", children, ...props }: TabsContentProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")
  
  if (context.value !== value) return null
  
  return (
    <div
      role="tabpanel"
      className={`mt-2 focus-visible:outline-none ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
