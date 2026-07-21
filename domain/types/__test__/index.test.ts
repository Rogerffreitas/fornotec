import { findLocation, LOCATIONS } from '../index';

describe('findLocation', () => {
  it('returns the matching location for a known ref', () => {
    expect(findLocation('GV')).toEqual({ description: 'Gerador de Vapor', ref: 'GV' });
  });

  it('covers every entry in LOCATIONS', () => {
    LOCATIONS.forEach((location) => {
      expect(findLocation(location.ref)).toEqual(location);
    });
  });

  it('throws for an unknown ref', () => {
    // @ts-expect-error - testing runtime guard against an invalid ref
    expect(() => findLocation('XX')).toThrow(/XX/);
  });
});
