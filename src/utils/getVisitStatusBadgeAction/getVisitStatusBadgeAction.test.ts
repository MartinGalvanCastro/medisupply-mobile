import { getVisitStatusBadgeAction } from './getVisitStatusBadgeAction';

describe('getVisitStatusBadgeAction', () => {
  describe('English status values', () => {
    it('returns warning for pending', () => {
      expect(getVisitStatusBadgeAction('pending')).toBe('warning');
    });

    it('returns success for completed', () => {
      expect(getVisitStatusBadgeAction('completed')).toBe('success');
    });

    it('returns error for cancelled', () => {
      expect(getVisitStatusBadgeAction('cancelled')).toBe('error');
    });
  });

  describe('Spanish status values', () => {
    it('returns warning for programada', () => {
      expect(getVisitStatusBadgeAction('programada')).toBe('warning');
    });

    it('returns success for completada', () => {
      expect(getVisitStatusBadgeAction('completada')).toBe('success');
    });

    it('returns error for cancelada', () => {
      expect(getVisitStatusBadgeAction('cancelada')).toBe('error');
    });
  });

  describe('edge cases', () => {
    it('returns muted for unknown status', () => {
      expect(getVisitStatusBadgeAction('unknown')).toBe('muted');
      expect(getVisitStatusBadgeAction('')).toBe('muted');
    });

    it('is case insensitive', () => {
      expect(getVisitStatusBadgeAction('PENDING')).toBe('warning');
      expect(getVisitStatusBadgeAction('Completed')).toBe('success');
      expect(getVisitStatusBadgeAction('CANCELLED')).toBe('error');
    });
  });
});
