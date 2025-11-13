import { render } from '@testing-library/react';

import StickyBanner from './StickyBanner';

describe('StickyBanner', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StickyBanner />);
    expect(baseElement).toBeTruthy();
  });
});
