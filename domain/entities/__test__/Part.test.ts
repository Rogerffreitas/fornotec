import { generatePartReference } from '../Part';

describe('generatePartReference', () => {
  it('builds the reference as location + 00 + id', () => {
    expect(generatePartReference('CC', 5)).toBe('CC005');
  });

  it('does not pad the id beyond the fixed two zeros', () => {
    expect(generatePartReference('GV', 123)).toBe('GV00123');
  });

  it('works for every location prefix', () => {
    expect(generatePartReference('PCU', 1)).toBe('PCU001');
    expect(generatePartReference('PCE', 1)).toBe('PCE001');
    expect(generatePartReference('EE', 1)).toBe('EE001');
  });
});
