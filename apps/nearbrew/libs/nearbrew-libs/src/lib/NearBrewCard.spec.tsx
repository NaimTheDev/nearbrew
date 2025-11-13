import { render } from '@testing-library/react';

import NearBrewCard from './NearBrewCard';

describe('NearBrewCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NearBrewCard />);
    expect(baseElement).toBeTruthy();
  });
});
