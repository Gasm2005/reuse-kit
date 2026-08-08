import { useState } from "react";

// A single missing/broken image must never degrade to browser alt-text.
// This renders the image and, on error OR when no src is provided, swaps to a
// deliberate branded placeholder that looks intentional rather than broken.
// Used for product images (Task 7) and service cards (Task 0B).

type ImageWithFallbackProps = {
  src?: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  /** Small label shown on the placeholder, e.g. "Example" or the piece name. */
  fallbackLabel?: string;
};

export function ImageWithFallback({
  src,
  alt,
  className,
  width,
  height,
  loading = "lazy",
  fetchPriority,
  fallbackLabel,
}: ImageWithFallbackProps) {
  const [errored, setErrored] = useState(false);
  const showFallback = !src || errored;

  if (showFallback) {
    return (
      <div
        className={className}
        role="img"
        aria-label={alt}
        data-image-fallback="true"
        style={{
          // Designed to fill a positioned image frame (.imgwrap / .frame),
          // which is how every usage on the site wraps it.
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #efe9db 0%, #e3dccb 100%)",
          color: "#8a7f68",
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 600,
            textAlign: "center",
            padding: "0 12px",
          }}
        >
          ◆ {fallbackLabel ?? "The Artspire"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      onError={() => setErrored(true)}
    />
  );
}
