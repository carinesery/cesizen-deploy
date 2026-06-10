import { describe, it, expect } from 'vitest';
import { generateSlug } from '../utils/generatedSlug.js';

describe('generateSlug', () => {
  it('génère un slug correct à partir d\'un titre complexe', () => {
    const titre = "C'est l'été ! Un test -- spécial @2026";
    const slug = generateSlug(titre);
    expect(slug).toBe('cest-lete-un-test-special-2026');
  });
});
