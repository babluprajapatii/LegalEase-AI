'use client';

interface StatusBadgeProps {
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  uploading: 'Uploading',
  validating: 'Validating',
  extracting: 'Extracting',
  analysis: 'Analyzing',
  complete: 'Analyzed',
  failed: 'Failed',
};

/**
 * Status badge component for document processing states.
 * Uses color + dot indicator — never color alone (design.md §4).
 */
export default function StatusBadge({ status }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] || status;
  const className = `status-badge status-${status}`;

  return (
    <span className={className} role="status" aria-label={`Status: ${label}`}>
      {label}
    </span>
  );
}
