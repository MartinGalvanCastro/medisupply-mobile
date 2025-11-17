/**
 * Returns the badge color action for a visit status
 * Handles both English and Spanish status values
 */
export const getVisitStatusBadgeAction = (
  status: string
): 'info' | 'success' | 'warning' | 'error' | 'muted' => {
  const statusMap: Record<string, 'info' | 'success' | 'warning' | 'error' | 'muted'> = {
    pending: 'warning',
    programada: 'warning',
    completed: 'success',
    completada: 'success',
    cancelled: 'error',
    cancelada: 'error',
  };
  return statusMap[status?.toLowerCase()] || 'muted';
};
