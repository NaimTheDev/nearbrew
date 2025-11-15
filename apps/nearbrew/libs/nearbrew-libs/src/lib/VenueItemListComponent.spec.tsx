import { render } from '@testing-library/react';

import VenueItemListComponent from './VenueItemListComponent';

describe('VenueItemListComponent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<VenueItemListComponent />);
    expect(baseElement).toBeTruthy();
  });
});
