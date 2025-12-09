import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { TaskStatus, TaskType, TaskPriority } from "@/features/tasks/types"
import { 
  CheckCircle, 
  Clock, 
  Eye, 
  Circle, 
  ListTodo, 
  Flag, 
  FileText, 
  Star,
  AlertCircle,
  CircleDashed
} from "lucide-react"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        
        [TaskStatus.TODO]:
          "border-transparent bg-red-50 text-red-700 border-red-200 hover:bg-red-100/80",
        [TaskStatus.IN_PROGRESS]:
          "border-transparent bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100/80",
        [TaskStatus.IN_REVIEW]:
          "border-transparent bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/80",
        [TaskStatus.DONE]:
          "border-transparent bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80",
        [TaskStatus.BACKLOG]:
          "border-transparent bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100/80",
        
        [TaskType.TASK]:
          "border-transparent bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50/80",
        [TaskType.FEATURE]:
          "border-transparent bg-green-50 text-green-700 border-green-200 hover:bg-green-50/80",
        [TaskType.DOCUMENTATION]:
          "border-transparent bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50/80",
        
        [TaskPriority.LOW]:
          "border-transparent bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50/80",
        [TaskPriority.MEDIUM]:
          "border-transparent bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50/80",
        [TaskPriority.HIGH]:
          "border-transparent bg-red-50 text-red-700 border-red-200 hover:bg-red-50/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  showIcon?: boolean
}

function Badge({ className, variant, icon, showIcon = true, children, ...props }: BadgeProps) {
  
  const getDefaultIcon = () => {
    if (!showIcon) return null;
    
    switch(variant) {
      case TaskStatus.DONE:
        return <CheckCircle className="size-3" />
      case TaskStatus.IN_PROGRESS:
        return <Clock className="size-3" />
      case TaskStatus.IN_REVIEW:
        return <Eye className="size-3" />
      case TaskStatus.TODO:
        return <CircleDashed className="size-3" />
      case TaskStatus.BACKLOG:
        return <ListTodo className="size-3" />
      case TaskPriority.HIGH:
        return <Flag className="size-3" />
      case TaskPriority.MEDIUM:
        return <Star className="size-3" />
      case TaskType.FEATURE:
        return <Star className="size-3" />
      case TaskType.DOCUMENTATION:
        return <FileText className="size-3" />
      default:
        return null;
    }
  }

  const displayIcon = icon || getDefaultIcon();

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {displayIcon && displayIcon}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }