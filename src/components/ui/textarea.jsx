import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, enableTab, ...props }, ref) => {
  return (
    (<textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      onKeyDown={(e) => {
        if (enableTab && e.key === "Tab") {
          e.preventDefault()
          const { selectionStart, selectionEnd } = e.target
          const value = e.target.value
          e.target.value = value.substring(0, selectionStart) + "\t" + value.substring(selectionEnd)
          e.target.selectionStart = e.target.selectionEnd = selectionStart + 1
          // onChangeEvent
          if (props.onChange) {
            props.onChange(e)
          }
        }
      }}
      ref={ref}
      {...props} />)
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
