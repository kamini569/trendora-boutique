import { cn } from "@/lib/utils";
import { useState } from "react";

export function ProductImage({
  src,
  alt,
  className,
  imgClassName,
  eager = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#f3e6da_0%,#f6e2df_55%,#ecd9cd_100%)]",
          className,
        )}
        aria-label={alt}
        role="img"
      >
        <span className="font-display text-3xl font-semibold tracking-tight text-primary/35">
          T
        </span>
      </div>
    );
  }

  return (
    <div className={cn("h-full w-full overflow-hidden", className)}>
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}
