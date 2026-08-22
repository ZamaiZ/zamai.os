import { cn } from "@/lib/utils"

export function LifeScenePoster({ className }: { className?: string }) {
  return (
    <div
      data-testid="life-scene-poster"
      aria-hidden="true"
      className={cn(
        "relative isolate h-full min-h-64 w-full overflow-hidden bg-[var(--life-space)]",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,color-mix(in_oklch,var(--life-flow)_13%,transparent),transparent_32%),radial-gradient(circle_at_50%_110%,color-mix(in_oklch,var(--life-mist)_8%,transparent),transparent_42%)]" />
      <svg
        viewBox="0 0 720 860"
        className="absolute inset-0 h-full w-full text-[var(--life-mist)]"
        fill="none"
      >
        <g opacity="0.28" stroke="var(--life-flow)" strokeWidth="1.25">
          <ellipse cx="360" cy="430" rx="225" ry="82" />
          <ellipse
            cx="360"
            cy="430"
            rx="225"
            ry="82"
            transform="rotate(58 360 430)"
          />
          <ellipse
            cx="360"
            cy="430"
            rx="225"
            ry="82"
            transform="rotate(-58 360 430)"
          />
        </g>
        <g fill="currentColor" opacity="0.82">
          <ellipse cx="360" cy="228" rx="48" ry="56" />
          <rect x="341" y="278" width="38" height="48" rx="19" />
          <rect x="288" y="314" width="144" height="220" rx="68" />
          <ellipse cx="360" cy="526" rx="70" ry="54" />
          <rect
            x="255"
            y="332"
            width="45"
            height="245"
            rx="23"
            transform="rotate(7 255 332)"
          />
          <rect
            x="420"
            y="332"
            width="45"
            height="245"
            rx="23"
            transform="rotate(-7 420 332)"
          />
          <rect
            x="302"
            y="552"
            width="50"
            height="260"
            rx="25"
            transform="rotate(2 302 552)"
          />
          <rect
            x="368"
            y="552"
            width="50"
            height="260"
            rx="25"
            transform="rotate(-2 368 552)"
          />
        </g>
        <g fill="var(--life-flow)">
          <circle cx="177" cy="401" r="5" />
          <circle cx="505" cy="319" r="4" />
          <circle cx="432" cy="610" r="4" />
        </g>
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--life-space)] to-transparent" />
    </div>
  )
}
