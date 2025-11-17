import { getVisitStatusBadgeAction } from './getVisitStatusBadgeAction';

describe('getVisitStatusBadgeAction', () => {
  describe('English status values', () => {
    it('should return warning for pending', () => {
      expect(getVisitStatusBadgeAction('pending')).toBe('warning');
    });

    it('should return success for completed', () => {
      expect(getVisitStatusBadgeAction('completed')).toBe('success');
    });

    it('should return error for cancelled', () => {
      expect(getVisitStatusBadgeAction('cancelled')).toBe('error');
    });
  });

  describe('Spanish status values', () => {
    it('should return warning for programada', () => {
      expect(getVisitStatusBadgeAction('programada')).toBe('warning');
    });

    it('should return success for completada', () => {
      expect(getVisitStatusBadgeAction('completada')).toBe('success');
    });

    it('should return error for cancelada', () => {
      expect(getVisitStatusBadgeAction('cancelada')).toBe('error');
    });
  });

  describe('Case insensitivity', () => {
    it('should handle uppercase pending', () => {
      expect(getVisitStatusBadgeAction('PENDING')).toBe('warning');
    });

    it('should handle mixed case COMPLETED', () => {
      expect(getVisitStatusBadgeAction('Completed')).toBe('success');
    });

    it('should handle uppercase CANCELADA', () => {
      expect(getVisitStatusBadgeAction('CANCELADA')).toBe('error');
    });
  });

  describe('Unknown status', () => {
    it('should return muted for unknown status', () => {
      expect(getVisitStatusBadgeAction('unknown')).toBe('muted');
    });

    it('should return muted for empty string', () => {
      expect(getVisitStatusBadgeAction('')).toBe('muted');
    });

    it('should return muted for undefined', () => {
      expect(getVisitStatusBadgeAction(undefined as any)).toBe('muted');
    });

    it('should return muted for null', () => {
      expect(getVisitStatusBadgeAction(null as any)).toBe('muted');
    });
  });
});
