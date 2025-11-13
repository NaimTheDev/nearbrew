import { render } from '@testing-library/react';

import NearBrewButton from './NearBrewButton';

describe('NearBrewButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NearBrewButton />);
    expect(baseElement).toBeTruthy();
  });
});
