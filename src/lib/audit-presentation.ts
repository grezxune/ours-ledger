/**
 * Converts dotted audit action codes into readable labels.
 */
export function toAuditActionLabel(action: string): string {
  return action
    .split(".")
    .map((segment) =>
      segment
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    )
    .join(" / ");
}

/**
 * Formats an ISO timestamp in a compact local format.
 */
export function formatAuditTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

/**
 * Converts audit metadata keys into title-style labels.
 */
export function toAuditMetadataLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split("_")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
}
