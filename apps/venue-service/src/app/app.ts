import * as path from 'path';
import { FastifyInstance } from 'fastify';
import AutoLoad from '@fastify/autoload';
import fastifyCors from '@fastify/cors';
import {
  Venue,
  VenueFilterRequest,
  VenueFilterResponse,
  VenueLiveRequest,
  VenueLiveResponse,
  HealthResponse
} from '@nearbrew/shared-types';

/* eslint-disable-next-line */
export interface AppOptions {}

// Fake venue data for development - using real JSON structure
const FAKE_VENUES: Venue[] = [
  {
    "venue_id": "ven_41426759346d2d5734664152676b64454d4e42423157304a496843",
    "day_int": 5,
    "day_raw": [10],
    "day_raw_whole": [0, 0, 0, 25, 40, 60, 65, 70, 60, 50, 50, 60, 60, 60, 65, 80, 100, 100, 80, 55, 45, 30, 10, 10],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 0,
      "venue_closed": 0,
      "day_rank_mean": 1,
      "day_rank_max": 1,
      "day_mean": 49,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [],
        "12h": []
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 4.3,
    "reviews": 3377,
    "price_level": 2,
    "venue_name": "Balans Soho, No.60",
    "venue_address": "60-62 Old Compton St London W1D 4UG United Kingdom",
    "venue_lat": 51.5128115,
    "venue_lng": -0.1325821,
    "venue_type": "CAFE",
    "venue_dwell_time_min": 60,
    "venue_dwell_time_max": 120
  },
  {
    "venue_id": "ven_6b3030736572475a74504b52676b6446593647564d384b4a496843",
    "day_int": 5,
    "day_raw": [55],
    "day_raw_whole": [0, 20, 40, 55, 55, 70, 85, 100, 85, 80, 80, 90, 95, 95, 85, 75, 65, 60, 0, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 7,
      "venue_closed": 0,
      "day_rank_mean": 1,
      "day_rank_max": 1,
      "day_mean": 73,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [
          {
            "opens": 7,
            "closes": 0,
            "opens_minutes": 30,
            "closes_minutes": 0
          }
        ],
        "12h": ["7:30am–12am"],
        "special_day": null,
        "open_24h": false,
        "crosses_midnight": true,
        "day_text": "Saturday"
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 4,
    "reviews": 3089,
    "price_level": 3,
    "venue_name": "EL&N London Park Lane",
    "venue_address": "48 Park Ln London W1K 1PR United Kingdom",
    "venue_lat": 51.5068489,
    "venue_lng": -0.1518459,
    "venue_type": "CAFE",
    "venue_dwell_time_min": 20,
    "venue_dwell_time_max": 60
  },
  {
    "venue_id": "ven_306938727330423730583152676b644677735a334932764a496843",
    "day_int": 5,
    "day_raw": [0],
    "day_raw_whole": [0, 0, 0, 0, 45, 55, 70, 95, 100, 100, 90, 90, 85, 70, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 10,
      "venue_closed": 21,
      "day_rank_mean": 1,
      "day_rank_max": 1,
      "day_mean": 78,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [
          {
            "opens": 10,
            "closes": 21
          }
        ],
        "12h": ["10am–9pm"]
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 4.6,
    "reviews": 2658,
    "price_level": 2,
    "venue_name": "EL&N London",
    "venue_address": "Selfridges 400 Oxford St London W1A 1AB United Kingdom",
    "venue_lat": 51.5143628,
    "venue_lng": -0.1518606,
    "venue_type": "CAFE",
    "venue_dwell_time_min": 0,
    "venue_dwell_time_max": 0
  },
  {
    "venue_id": "ven_6b464a322d69473532374152676b6461304d756e4b536a4a496843",
    "day_int": 5,
    "day_raw": [70],
    "day_raw_whole": [0, 0, 20, 35, 50, 65, 75, 75, 90, 100, 100, 90, 70, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 8,
      "venue_closed": 20,
      "day_rank_mean": 1,
      "day_rank_max": 1,
      "day_mean": 69,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [
          {
            "opens": 8,
            "closes": 20,
            "opens_minutes": 0,
            "closes_minutes": 0
          }
        ],
        "12h": ["8am–8pm"],
        "special_day": null,
        "open_24h": false,
        "crosses_midnight": false,
        "day_text": "Saturday"
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 4.4,
    "reviews": 2074,
    "price_level": 2,
    "venue_name": "The Monocle Café",
    "venue_address": "18 Chiltern St London W1U 7QA United Kingdom",
    "venue_lat": 51.5187865,
    "venue_lng": -0.1546211,
    "venue_type": "CAFE",
    "venue_dwell_time_min": 20,
    "venue_dwell_time_max": 90
  },
  {
    "venue_id": "ven_775370777837526b32755752676b64615574504e56304f4a496843",
    "day_int": 5,
    "day_raw": [25],
    "day_raw_whole": [20, 20, 20, 30, 45, 55, 55, 65, 75, 90, 100, 100, 90, 75, 50, 35, 0, 0, 0, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 6,
      "venue_closed": 22,
      "day_rank_mean": 2,
      "day_rank_max": 1,
      "day_mean": 58,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [
          {
            "opens": 6,
            "closes": 22
          }
        ],
        "12h": ["6:30am–10pm"]
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 4,
    "reviews": 1817,
    "price_level": 2,
    "venue_name": "Caffè Nero",
    "venue_address": "273 Regent St. London W1B 2EZ United Kingdom",
    "venue_lat": 51.5159802,
    "venue_lng": -0.1424963,
    "venue_type": "COFFEE",
    "venue_dwell_time_min": 0,
    "venue_dwell_time_max": 0
  },
  {
    "venue_id": "ven_38767972437546566b2d6152676b644649484b387656374a496843",
    "day_int": 5,
    "day_raw": [10],
    "day_raw_whole": [0, 0, 20, 25, 35, 45, 70, 70, 80, 70, 80, 85, 95, 100, 95, 75, 65, 0, 0, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 8,
      "venue_closed": 23,
      "day_rank_mean": 1,
      "day_rank_max": 1,
      "day_mean": 68,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [
          {
            "opens": 8,
            "closes": 23
          }
        ],
        "12h": ["8am–11pm"]
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 4.6,
    "reviews": 1580,
    "price_level": 0,
    "venue_name": "Half Million Café",
    "venue_address": "407 Oxford St London W1C 2PE United Kingdom",
    "venue_lat": 51.5141132,
    "venue_lng": -0.1507395,
    "venue_type": "COFFEE",
    "venue_dwell_time_min": 0,
    "venue_dwell_time_max": 0
  },
  {
    "venue_id": "ven_6f4c6a766a4a724472505a52676b6445596471764378754a496843",
    "day_int": 5,
    "day_raw": [100],
    "day_raw_whole": [0, 0, 0, 0, 30, 40, 70, 60, 60, 55, 65, 70, 100, 95, 85, 65, 0, 0, 0, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 10,
      "venue_closed": 21,
      "day_rank_mean": 2,
      "day_rank_max": 1,
      "day_mean": 66,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [
          {
            "opens": 10,
            "closes": 21
          }
        ],
        "12h": ["10am–9:30pm"]
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 4.6,
    "reviews": 1440,
    "price_level": 2,
    "venue_name": "carpo glasshouse piccadilly",
    "venue_address": "10 Glasshouse St London W1B 5AR United Kingdom",
    "venue_lat": 51.5104594,
    "venue_lng": -0.1354278,
    "venue_type": "CAFE",
    "venue_dwell_time_min": 0,
    "venue_dwell_time_max": 0
  },
  {
    "venue_id": "ven_776b70746956546968456852676b644545726f6d347a4d4a496843",
    "day_int": 5,
    "day_raw": [85],
    "day_raw_whole": [0, 30, 35, 55, 80, 100, 70, 50, 40, 45, 35, 30, 25, 25, 25, 30, 30, 0, 0, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 7,
      "venue_closed": 22,
      "day_rank_mean": 4,
      "day_rank_max": 1,
      "day_mean": 45,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [
          {
            "opens": 7,
            "closes": 22
          }
        ],
        "12h": ["7am–10:30pm"]
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 4.1,
    "reviews": 1326,
    "price_level": 2,
    "venue_name": "Caffè Nero",
    "venue_address": "Unit G4/G9 Oxo Tower Wharf, Barge House St London SE1 9PH United Kingdom",
    "venue_lat": 51.508413,
    "venue_lng": -0.1084642,
    "venue_type": "COFFEE",
    "venue_dwell_time_min": 0,
    "venue_dwell_time_max": 45
  },
  {
    "venue_id": "ven_51477257424a573656766d52676b64456b72496c3730674a496843",
    "day_int": 5,
    "day_raw": [15],
    "day_raw_whole": [0, 0, 0, 30, 45, 65, 80, 85, 85, 85, 90, 100, 100, 95, 85, 80, 75, 55, 35, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 9,
      "venue_closed": 0,
      "day_rank_mean": 1,
      "day_rank_max": 1,
      "day_mean": 76,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [
          {
            "opens": 9,
            "closes": 0,
            "opens_minutes": 0,
            "closes_minutes": 30
          }
        ],
        "12h": ["9am–12:30am"],
        "special_day": null,
        "open_24h": false,
        "crosses_midnight": true,
        "day_text": "Saturday"
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 4.5,
    "reviews": 1074,
    "price_level": 2,
    "venue_name": "Scootercaffe",
    "venue_address": "132 Lower Marsh London SE1 7AE United Kingdom",
    "venue_lat": 51.500369,
    "venue_lng": -0.1139059,
    "venue_type": "CAFE",
    "venue_dwell_time_min": 45,
    "venue_dwell_time_max": 120
  },
  {
    "venue_id": "ven_4142616147476f3132523352676b64454574664c2d59684a496843",
    "day_int": 5,
    "day_raw": [20],
    "day_raw_whole": [5, 10, 15, 20, 30, 45, 65, 85, 85, 90, 95, 100, 80, 55, 35, 25, 0, 0, 0, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 6,
      "venue_closed": 22,
      "day_rank_mean": 1,
      "day_rank_max": 1,
      "day_mean": 53,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [
          {
            "opens": 6,
            "closes": 22
          }
        ],
        "12h": ["6:30am–10pm"]
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 3.8,
    "reviews": 1071,
    "price_level": 2,
    "venue_name": "Caffè Nero",
    "venue_address": "27 Haymarket London SW1Y 4EN United Kingdom",
    "venue_lat": 51.5094598,
    "venue_lng": -0.1324036,
    "venue_type": "COFFEE",
    "venue_dwell_time_min": 0,
    "venue_dwell_time_max": 150
  },
  {
    "venue_id": "ven_3875595737634a4431345552676b6445496435397a31374a496843",
    "day_int": 5,
    "day_raw": [20],
    "day_raw_whole": [0, 10, 20, 20, 30, 50, 70, 85, 100, 95, 80, 70, 70, 70, 75, 85, 100, 100, 65, 35, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 7,
      "venue_closed": 2,
      "day_rank_mean": 1,
      "day_rank_max": 1,
      "day_mean": 64,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [
          {
            "opens": 7,
            "closes": 2,
            "opens_minutes": 30,
            "closes_minutes": 0
          }
        ],
        "12h": ["7:30am–2am"],
        "special_day": null,
        "open_24h": false,
        "crosses_midnight": true,
        "day_text": "Saturday"
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 4,
    "reviews": 1066,
    "price_level": 2,
    "venue_name": "Caffè Nero",
    "venue_address": "43 Frith St London W1D 4SA United Kingdom",
    "venue_lat": 51.5132612,
    "venue_lng": -0.1314207,
    "venue_type": "COFFEE",
    "venue_dwell_time_min": 30,
    "venue_dwell_time_max": 120
  },
  {
    "venue_id": "ven_557a4f33546d4d6a6a6f6f52676b6445553971717655474a496843",
    "day_int": 5,
    "day_raw": [5],
    "day_raw_whole": [0, 0, 0, 90, 95, 100, 75, 50, 45, 35, 40, 40, 35, 40, 35, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 9,
      "venue_closed": 21,
      "day_rank_mean": 3,
      "day_rank_max": 1,
      "day_mean": 57,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [
          {
            "opens": 9,
            "closes": 21
          }
        ],
        "12h": ["9am–9pm"]
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 4.4,
    "reviews": 1028,
    "price_level": 2,
    "venue_name": "Grind",
    "venue_address": "19 Beak St Carnaby, London W1F 9RP United Kingdom",
    "venue_lat": 51.5121149,
    "venue_lng": -0.1382947,
    "venue_type": "COFFEE",
    "venue_dwell_time_min": 0,
    "venue_dwell_time_max": 0
  },
  {
    "venue_id": "ven_596c536f494871746c373252676b64456b4c785948394a4a496843",
    "day_int": 5,
    "day_raw": [35],
    "day_raw_whole": [0, 25, 20, 35, 60, 85, 95, 100, 85, 70, 85, 95, 100, 85, 65, 50, 0, 0, 0, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 7,
      "venue_closed": 22,
      "day_rank_mean": 1,
      "day_rank_max": 1,
      "day_mean": 70,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [
          {
            "opens": 7,
            "closes": 22
          }
        ],
        "12h": ["7:30am–10pm"]
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 3.8,
    "reviews": 968,
    "price_level": 2,
    "venue_name": "Starbucks Coffee",
    "venue_address": "10 Russell St London WC2B 5HZ United Kingdom",
    "venue_lat": 51.51235,
    "venue_lng": -0.12164,
    "venue_type": "COFFEE",
    "venue_dwell_time_min": 0,
    "venue_dwell_time_max": 60
  },
  {
    "venue_id": "ven_41506b6b336d2d4b676d3452676b6445774d45324c35314a496843",
    "day_int": 5,
    "day_raw": [70],
    "day_raw_whole": [0, 10, 20, 20, 35, 50, 75, 95, 100, 100, 95, 85, 70, 55, 35, 20, 0, 0, 0, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 0,
      "venue_closed": 0,
      "day_rank_mean": 1,
      "day_rank_max": 1,
      "day_mean": 36,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [],
        "12h": []
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 4,
    "reviews": 939,
    "price_level": 2,
    "venue_name": "Caffè Nero",
    "venue_address": "10 Bedford St London WC2E 7HE United Kingdom",
    "venue_lat": 51.5104192,
    "venue_lng": -0.1242473,
    "venue_type": "COFFEE",
    "venue_dwell_time_min": 30,
    "venue_dwell_time_max": 90
  },
  {
    "venue_id": "ven_73784165506b344851315752676b64456b724c776678424a496843",
    "day_int": 5,
    "day_raw": [50],
    "day_raw_whole": [0, 5, 20, 35, 55, 70, 95, 100, 90, 60, 40, 30, 35, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 7,
      "venue_closed": 20,
      "day_rank_mean": 2,
      "day_rank_max": 1,
      "day_mean": 51,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [
          {
            "opens": 7,
            "closes": 20
          }
        ],
        "12h": ["7am–8pm"]
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 4,
    "reviews": 883,
    "price_level": 2,
    "venue_name": "Costa Coffee",
    "venue_address": "118 Westminster Bridge Rd London SE1 7RW United Kingdom",
    "venue_lat": 51.499076,
    "venue_lng": -0.11244,
    "venue_type": "COFFEE",
    "venue_dwell_time_min": 0,
    "venue_dwell_time_max": 0
  },
  {
    "venue_id": "ven_634c566447535f5272714952676b6445346379773862634a496843",
    "day_int": 5,
    "day_raw": [5],
    "day_raw_whole": [20, 25, 35, 60, 85, 100, 90, 70, 70, 75, 75, 75, 70, 60, 50, 45, 0, 0, 0, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 0,
      "venue_closed": 0,
      "day_rank_mean": 1,
      "day_rank_max": 1,
      "day_mean": 42,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [],
        "12h": []
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 3.9,
    "reviews": 878,
    "price_level": 2,
    "venue_name": "Starbucks Coffee",
    "venue_address": "1-3 Villiers St London WC2N 6NN United Kingdom",
    "venue_lat": 51.50741,
    "venue_lng": -0.12291,
    "venue_type": "COFFEE",
    "venue_dwell_time_min": 0,
    "venue_dwell_time_max": 0
  },
  {
    "venue_id": "ven_41555662704c725170386252676b644559396f745161464a496843",
    "day_int": 5,
    "day_raw": [0],
    "day_raw_whole": [0, 15, 20, 35, 50, 65, 85, 90, 100, 90, 85, 75, 60, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 7,
      "venue_closed": 20,
      "day_rank_mean": 1,
      "day_rank_max": 1,
      "day_mean": 62,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [
          {
            "opens": 7,
            "closes": 20
          }
        ],
        "12h": ["7am–8pm"]
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 4,
    "reviews": 789,
    "price_level": 2,
    "venue_name": "Costa Coffee",
    "venue_address": "15 Regent St. London SW1Y 4LR United Kingdom",
    "venue_lat": 51.508735,
    "venue_lng": -0.134101,
    "venue_type": "COFFEE",
    "venue_dwell_time_min": 0,
    "venue_dwell_time_max": 90
  },
  {
    "venue_id": "ven_736433364a6b647661354f52676b6462386d697835535a4a496843",
    "day_int": 5,
    "day_raw": [20],
    "day_raw_whole": [0, 0, 15, 20, 35, 50, 70, 90, 100, 100, 90, 80, 75, 70, 60, 50, 35, 0, 0, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 8,
      "venue_closed": 23,
      "day_rank_mean": 1,
      "day_rank_max": 1,
      "day_mean": 62,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [
          {
            "opens": 8,
            "closes": 23
          }
        ],
        "12h": ["8am–11pm"]
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 3.9,
    "reviews": 427,
    "price_level": 2,
    "venue_name": "Elan cafe",
    "venue_address": "9 Market Pl Oxford St London W1W 8AQ United Kingdom",
    "venue_lat": 51.5164528,
    "venue_lng": -0.140275,
    "venue_type": "CAFE",
    "venue_dwell_time_min": 40,
    "venue_dwell_time_max": 90
  },
  {
    "venue_id": "ven_6b345f734b4a413031596952676b64616f39737172316e4a496843",
    "day_int": 5,
    "day_raw": [15],
    "day_raw_whole": [0, 20, 30, 45, 65, 65, 75, 80, 90, 90, 100, 100, 85, 60, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 0,
      "venue_closed": 0,
      "day_rank_mean": 1,
      "day_rank_max": 1,
      "day_mean": 40,
      "day_max": 100,
      "venue_open_close_v2": {
        "24h": [],
        "12h": []
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 4.4,
    "reviews": 407,
    "price_level": 0,
    "venue_name": "Park Sports The Regent's Park",
    "venue_address": "The Regent's Park, Park Sports, York Bridge Inner Cir London NW1 4NU United Kingdom",
    "venue_lat": 51.5256386,
    "venue_lng": -0.1538005,
    "venue_type": "CAFE",
    "venue_dwell_time_min": 0,
    "venue_dwell_time_max": 0
  },
  {
    "venue_id": "ven_59315478675a44495f436b52676b6445494e36554b62424a496843",
    "day_int": 5,
    "day_raw": [65],
    "day_raw_whole": [0, 15, 15, 20, 30, 45, 65, 70, 70, 65, 60, 50, 55, 55, 65, 75, 80, 90, 65, 55, 40, 30, 0, 0],
    "day_info": {
      "day_int": 5,
      "day_text": "Saturday",
      "venue_open": 0,
      "venue_closed": 0,
      "day_rank_mean": 1,
      "day_rank_max": 2,
      "day_mean": 47,
      "day_max": 91,
      "venue_open_close_v2": {
        "24h": [],
        "12h": []
      },
      "note": "Update: venue_open_close_v2 replaces venue_open and venue_closed and supports multiple opening times per day."
    },
    "rating": 4.2,
    "reviews": 2036,
    "price_level": 2,
    "venue_name": "Bar Italia",
    "venue_address": "22 Frith St London W1D 4RF United Kingdom",
    "venue_lat": 51.5134134,
    "venue_lng": -0.1312402,
    "venue_type": "COFFEE",
    "venue_dwell_time_min": 0,
    "venue_dwell_time_max": 90
  }
];

const FAKE_RESPONSE_DATA = {
  "status": "OK",
  "venues": FAKE_VENUES,
  "venues_n": 20,
  "window": {
    "time_window_start": 19,
    "time_window_start_ix": 13,
    "time_window_start_12h": "7PM",
    "day_window_start_int": 5,
    "day_window_start_txt": "Saturday",
    "day_window_end_int": 5,
    "day_window_end_txt": "Saturday",
    "time_window_end": 20,
    "time_window_end_ix": 14,
    "time_window_end_12h": "8PM",
    "day_window": "Saturday 7PM until Saturday 8PM",
    "time_local": 19,
    "time_local_12": "7PM",
    "time_local_index": 13
  }
};

export async function app(fastify: FastifyInstance, opts: AppOptions) {
  
   // CORS
  fastify.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001']
  });

   fastify.get<{ Reply: HealthResponse }>('/health', async (request, reply) => {
    return { status: 'ok' };
  });


  fastify.get<{ 
    Querystring: VenueFilterRequest;
    Reply: VenueFilterResponse;
  }>('/venues/filter', async (request, reply) => {
    const { lat, lng, radius } = request.query;

    try {
      // Build BestTime API URL
      const apiKey = process.env.BEST_TIME_APP_API_KEY;
      if (!apiKey) {
        throw new Error('BEST_TIME_APP_API_KEY environment variable is not set');
      }

      const bestTimeUrl = new URL('https://besttime.app/api/v1/venues/filter');
      bestTimeUrl.searchParams.append('api_key_private', apiKey);
      bestTimeUrl.searchParams.append('busy_min', '50');
      bestTimeUrl.searchParams.append('busy_max', '100');
      bestTimeUrl.searchParams.append('live', 'true');
      bestTimeUrl.searchParams.append('types', 'CAFE,COFFEE');
      bestTimeUrl.searchParams.append('lat', lat!.toString());
      bestTimeUrl.searchParams.append('lng', lng!.toString());
      bestTimeUrl.searchParams.append('radius', radius!.toString());
      bestTimeUrl.searchParams.append('order_by', 'day_rank_max,reviews');
      bestTimeUrl.searchParams.append('order', 'asc,desc');
      bestTimeUrl.searchParams.append('foot_traffic', 'both');
      bestTimeUrl.searchParams.append('limit', '20');
      bestTimeUrl.searchParams.append('page', '0');

      console.log(`Calling BestTime API for venues at lat: ${lat}, lng: ${lng}, radius: ${radius}`);
      
      const response = await fetch(bestTimeUrl.toString());
      
      if (!response.ok) {
        throw new Error(`BestTime API returned ${response.status}: ${response.statusText}`);
      }

      const bestTimeData = await response.json() as VenueFilterResponse;
      
      // Return the BestTime API response directly as it should match our VenueFilterResponse type
      return bestTimeData;
      
    } catch (error) {
      console.error('Error calling BestTime API:', error);
      
      // Fallback to fake data in case of API errors
      console.log('Falling back to fake venue data');
      return FAKE_RESPONSE_DATA;
    }
  });

  fastify.post<{
    Querystring: VenueLiveRequest;
    Reply: VenueLiveResponse;
  }>('/venues/live-forecast', async (request, reply) => {
    const { venue_name, venue_address } = request.query;

    if (!venue_name?.trim() || !venue_address?.trim()) {
      reply.status(400);
      return {
        status: 'Error',
        message: 'venue_name and venue_address are required'
      };
    }

    try {
      const apiKey = process.env.BEST_TIME_APP_API_KEY;
      if (!apiKey) {
        throw new Error('BEST_TIME_APP_API_KEY environment variable is not set');
      }
      
      // Build URLSearchParams for the BestTime API
      const params = new URLSearchParams({
        api_key_private: apiKey,
        venue_name,
        venue_address
      });

      const response = await fetch(`https://besttime.app/api/v1/forecasts/live?${params}`, {
        method: 'POST'
      });

      const payload = (await response.json()) as VenueLiveResponse;

      if (!response.ok) {
        reply.status(response.status);
        return payload;
      }

      return payload;
    } catch (error) {
      fastify.log.error('Error fetching live forecast');
      reply.status(500);
      return {
        status: 'Error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to fetch live data for this venue.'
      };
    }
  });
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts },
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: { ...opts },
  });
}
