import { render } from '@testing-library/react';

import VenueItemComponent from './VenueItemComponent';

describe('VenueItemComponent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<VenueItemComponent />);
    expect(baseElement).toBeTruthy();
  });
});
