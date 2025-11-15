import { act, renderHook } from '@testing-library/react';
import * as React from 'react';

import UseVenues from './useVenues';

describe('UseVenues', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => UseVenues());

    expect(result.current.count).toBe(0);

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
