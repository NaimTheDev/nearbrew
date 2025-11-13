import { render } from '@testing-library/react';

import NearbrewNearbrewLibs from './nearbrew-libs';

describe('NearbrewNearbrewLibs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NearbrewNearbrewLibs />);
    expect(baseElement).toBeTruthy();
  });
});
