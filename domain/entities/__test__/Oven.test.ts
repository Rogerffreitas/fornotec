import { computeNextMaintenance } from '../Oven';

describe('computeNextMaintenance', () => {
  it('adds the frequency in days to the last maintenance date', () => {
    const result = computeNextMaintenance('2026-07-20T00:00:00.000Z', 30);

    expect(result).toBe('2026-08-19T00:00:00.000Z');
  });

  it('rolls over correctly across month/year boundaries', () => {
    const result = computeNextMaintenance('2026-12-20T00:00:00.000Z', 15);

    expect(result).toBe('2027-01-04T00:00:00.000Z');
  });

  it('returns the same date when frequency is 0', () => {
    const result = computeNextMaintenance('2026-07-20T00:00:00.000Z', 0);

    expect(result).toBe('2026-07-20T00:00:00.000Z');
  });
});
