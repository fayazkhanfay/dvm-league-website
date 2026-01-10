import { cn } from "@/lib/utils"

interface TabCountBadgeProps {
    count: number
    variant?: "gold" | "neutral" | "blue"
    className?: string
}

export function TabCountBadge({ count, variant = "gold", className }: TabCountBadgeProps) {
    if (count === 0) return null

    const displayCount = count > 99 ? "99+" : count

    const variants = {
        gold: "bg-brand-gold text-brand-navy",
        neutral: "bg-slate-100 text-slate-700",
        blue: "bg-blue-100 text-blue-700",
    }

    return (
        <span
            className={cn(
                "ml-2 inline-flex h-5 w-fit min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[0.65rem] font-bold ring-1 ring-inset ring-black/5",
                variants[variant],
                className,
            )}
        >
            {displayCount}
        </span>
    )
}
