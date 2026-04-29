import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FooterDisclaimer from './FooterDisclaimer';

describe('FooterDisclaimer', () => {
  it('renders medical disclaimer text', () => {
    render(<FooterDisclaimer />);
    expect(screen.getByText(/Medical disclaimer/i)).toBeDefined();
    expect(screen.getByText(/not a medical device/i)).toBeDefined();
  });
});
