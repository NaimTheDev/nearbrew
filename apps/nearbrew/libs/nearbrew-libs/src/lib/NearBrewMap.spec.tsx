import { render } from '@testing-library/react';

import NearBrewMap from './NearBrewMap';

describe('NearBrewMap', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NearBrewMap />);
    expect(baseElement).toBeTruthy();
  });
});
