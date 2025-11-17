import { render } from '@testing-library/react';

import NearBrewDetails from './NearBrewDetails';

describe('NearBrewDetails', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NearBrewDetails />);
    expect(baseElement).toBeTruthy();
  });
});
