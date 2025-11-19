import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import NearBrewAutoComplete from './NearBrewAutoComplete';

describe('NearBrewAutoComplete', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <NearBrewAutoComplete />
      </MemoryRouter>
    );
    expect(baseElement).toBeTruthy();
  });
});
