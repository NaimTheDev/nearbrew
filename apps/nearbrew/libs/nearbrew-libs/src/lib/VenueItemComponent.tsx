
import { Venue } from '@nearbrew/shared-types';
import { useNavigate } from 'react-router-dom';
import { NearBrewCard } from './NearBrewCard';
import { Rating } from '@smastrom/react-rating'

import '@smastrom/react-rating/style.css'

const StarDrawing = (
  <g>
    <path d="M737.673,328.231C738.494,328.056 739.334,328.427 739.757,329.152C739.955,329.463 740.106,329.722 740.106,329.722C740.106,329.722 745.206,338.581 739.429,352.782C737.079,358.559 736.492,366.083 738.435,371.679C738.697,372.426 738.482,373.258 737.89,373.784C737.298,374.31 736.447,374.426 735.735,374.077C730.192,371.375 722.028,365.058 722.021,352C722.015,340.226 728.812,330.279 737.673,328.231Z"/>
    <path d="M737.609,328.246C738.465,328.06 739.344,328.446 739.785,329.203C739.97,329.49 740.106,329.722 740.106,329.722C740.106,329.722 745.206,338.581 739.429,352.782C737.1,358.507 736.503,365.948 738.383,371.527C738.646,372.304 738.415,373.164 737.796,373.703C737.177,374.243 736.294,374.356 735.56,373.989C730.02,371.241 722.028,364.92 722.021,352C722.016,340.255 728.779,330.328 737.609,328.246Z" transform="matrix(-1,0,0,-1,1483.03,703.293)"/>
  </g>
);
const customStyles = {
  itemShapes: StarDrawing,
  activeFillColor:  '#6F4827',
  inactiveFillColor: '#E8DDD5',
};

// Helper function to determine busy level and color
function getBusyLevelInfo(busyValue: number) {
  if (busyValue <= 33) {
    return {
      level: 'Not busy at all',
      color: '#22C55E', // Green
      bgColor: 'rgba(34, 197, 94, 0.1)' // Light green background
    };
  } else if (busyValue <= 66) {
    return {
      level: 'A little busy',
      color: '#EAB308', // Mustard yellow
      bgColor: 'rgba(234, 179, 8, 0.1)' // Light yellow background
    };
  } else {
    return {
      level: 'Poppin!',
      color: '#EF4444', // Soft red
      bgColor: 'rgba(239, 68, 68, 0.1)' // Light red background
    };
  }
}

export function VenueItemComponent({ venue }: { venue: Venue }) {
  const navigate = useNavigate();
  const busyInfo = getBusyLevelInfo(venue.day_raw[0]);

  const handleClick = () => {
    navigate('/details', { state: { venue } });
  };

  // CSS for pulsing animation
  const pulsingDotStyle = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#EF4444',
    marginRight: '4px',
    animation: 'pulse 2s infinite'
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
      <NearBrewCard 
        onClick={handleClick}
        style={{ 
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12)';
        }}
      >
        <div 
          style={{ 
            minHeight: '120px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ flex: 1, paddingRight: '8px' }}>
              <h2 style={{ 
                margin: '0 0 4px 0', 
                fontSize: '15px', 
                fontWeight: '600',
                lineHeight: '1.25',
                whiteSpace: 'normal',
                wordBreak: 'break-word'
              }}>
                {venue.venue_name}
              </h2>
              <p style={{ 
                margin: '0', 
                fontSize: '12px', 
                color: '#666',
                lineHeight: '1.4',
                whiteSpace: 'normal'
              }}>
                {venue.venue_address}
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #EF4444',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: '#EF4444'
                }}
              >
                <div style={pulsingDotStyle} />
                LIVE
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                borderRadius: '14px',
                backgroundColor: busyInfo.bgColor,
                border: `1px solid ${busyInfo.color}`,
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              <div 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: busyInfo.color,
                  marginRight: '6px'
                }}
              />
              <span style={{ color: busyInfo.color }}>
                {busyInfo.level}
              </span>
            </div>

            <Rating
              style={{ maxWidth: 65, flexShrink: 0 }}
              value={venue.rating}
              itemStyles={customStyles}
              readOnly
            />
          </div>
        </div>
      </NearBrewCard>
    </>
  );
}

export default VenueItemComponent;
