import { cn } from "./cn";
import { OrbitalLoader } from "./OrbitalLoader";
import { Spinner } from "./Spinner";

export type LoadingStateSize = "sm" | "md" | "lg";
export type LoadingStateLoader = "spinner" | "orbital";

type LoadingStateProps = {
  title?: string;
  description?: string;
  size?: LoadingStateSize;
  loader?: LoadingStateLoader;
  className?: string;
};

const sizeClasses: Record<LoadingStateSize, { wrapper: string; title: string; description: string }> = {
  sm: { wrapper: "py-6 px-4", title: "text-sm font-medium", description: "text-xs" },
  md: { wrapper: "py-10 px-6", title: "font-serif text-heading-sm font-medium", description: "text-sm" },
  lg: { wrapper: "py-16 px-8", title: "font-serif text-heading-md font-medium", description: "text-sm" },
};

const loaderSizeMap: Record<LoadingStateSize, { spinner: "xs" | "sm" | "md"; orbital: "sm" | "md" | "lg" }> = {
  sm: { spinner: "sm", orbital: "sm" },
  md: { spinner: "md", orbital: "md" },
  lg: { spinner: "md", orbital: "lg" },
};

export function LoadingState({ title, description, size = "md", loader = "spinner", className }: LoadingStateProps) {
  const s = sizeClasses[size];
  const loaderSize = loaderSizeMap[size];

  return (
    <div role="status" className={cn("flex flex-col items-center justify-center text-center animate-fade-in-up", s.wrapper, className)}>
      <div className="mb-4">
        {loader === "orbital" ? (
          <OrbitalLoader size={loaderSize.orbital} />
        ) : (
          <Spinner size={loaderSize.spinner} variant="primary" />
        )}
      </div>
      {title ? <p className={s.title}>{title}</p> : null}
      {description ? <p className={cn("mx-auto mt-1.5 max-w-xs text-muted-foreground", s.description)}>{description}</p> : null}
    </div>
  );
}
