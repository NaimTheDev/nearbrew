// import { render, screen } from '@testing-library/react';
// import { MemoryRouter, Route, Routes } from 'react-router-dom';
// import type { VenueLiveResponse } from '@nearbrew/shared-types';

// import NearBrewSearchResults from './NearBrewSearchResults';

// const mockResponse: VenueLiveResponse = {
//   status: 'OK',
//   analysis: {
//     venue_forecasted_busyness: 45,
//     venue_forecast_busyness_available: true,
//     venue_live_busyness: 35,
//     venue_live_busyness_available: true,
//     venue_live_forecasted_delta: -10,
//     hour_start: 20,
//     hour_start_12: '8PM',
//     hour_end: 21,
//     hour_end_12: '9PM',
//   },
//   venue_info: {
//     venue_id: 'ven_123',
//     venue_name: 'Qamaria Yemeni Coffee Co.',
//     venue_address: '8911 S Old State Rd Lewis Center, OH 43035 United States',
//     venue_dwell_time_min: 10,
//     venue_dwell_time_max: 90,
//     venue_dwell_time_avg: 50,
//     venue_lat: 40.15,
//     venue_lon: -82.99,
//     rating: 4.6,
//     reviews: 729,
//     price_level: 0,
//     venue_open: 'Open',
//     venue_open_close_v2: {
//       '24h': [],
//       '12h': ['7am–12am'],
//     },
//   },
// };

// describe('NearBrewSearchResults', () => {
//   it('should render success results when data is provided', () => {
//     render(
//       <MemoryRouter
//         initialEntries={[
//           {
//             pathname: '/search',
//             state: { searchResult: mockResponse },
//           },
//         ]}
//       >
//         <Routes>
//           <Route path="/search" element={<NearBrewSearchResults />} />
//         </Routes>
//       </MemoryRouter>
//     );

//     expect(
//       screen.getByText('Qamaria Yemeni Coffee Co.')
//     ).toBeInTheDocument();
//     expect(screen.getByText(/Live Business/i)).toBeInTheDocument();
//   });
// });
