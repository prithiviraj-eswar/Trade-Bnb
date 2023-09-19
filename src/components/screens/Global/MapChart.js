import React from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'

const geoUrl = 'https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json'

const markers = [
  { markerOffset: -10, name: 'CAD-Canada', coordinates: [-79.347015, 43.65107] },
  { markerOffset: -10, name: 'MXN-Mexico', coordinates: [-99.133209, 19.432608] },
  { markerOffset: -10, name: 'FTSE-100 - UK', coordinates: [-0.118092, 51.509865] },
  { markerOffset: -10, name: 'Spain', coordinates: [-3.70379, 40.416775] },
  { markerOffset: -10, name: 'CAC-France', coordinates: [2.349014, 48.864716] },
  { markerOffset: -10, name: 'DAX-Germany', coordinates: [13.404954, 52.520008] },
  { markerOffset: -10, name: 'Italy', coordinates: [12.496366, 41.902782] },
  { markerOffset: -10, name: 'SHE-Shanghai', coordinates: [121.46917, 31.224361] },
  { markerOffset: -10, name: 'SGX-Singapore', coordinates: [103.851959, 1.29027] },
  { markerOffset: -10, name: 'Honkong', coordinates: [114.177216, 22.302711] },
  { markerOffset: -10, name: 'NIKKEI-Japan', coordinates: [139.839478, 35.652832] },
  { markerOffset: -10, name: 'ACU-Australia', coordinates: [151.2099, -33.865143] },
  { markerOffset: -10, name: 'New-Zealand', coordinates: [174.763336, -36.848461] },
  { markerOffset: -10, name: 'DOW - USA', coordinates: [-77.007507, 38.900497] },
  { markerOffset: -10, name: 'SPY - USA', coordinates: [-119.417931, 36.778259] },
  { markerOffset: -10, name: 'IXIC - NASDAQ - USA', coordinates: [-73.971321, 40.776676] },
  { markerOffset: -10, name: 'NSE-India', coordinates: [72.854118, 19.228825] },
]

const MapChart = () => {
  return (
    <ComposableMap
      projection='geoEquirectangular'
      projectionConfig={{
        rotate: [0, 0, 0],
        scale: 120,
      }}
    >
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies
            // .filter((d) => d.properties.REGION_UN === "world")
            .map((geo) => <Geography key={geo.rsmKey} geography={geo} fill='#EAEAEC' stroke='#D6D6DA' />)
        }
      </Geographies>
      {markers.map(({ name, coordinates, markerOffset }) => (
        <Marker key={name} coordinates={coordinates}>
          <circle r={5} fill='#F00' stroke='#fff' strokeWidth={2} />
          <text textAnchor='middle' y={markerOffset} style={{ fontFamily: 'ariel', fill: '#5D5A6D', fontSize: '9px' }}>
            {name}
          </text>
        </Marker>
      ))}
    </ComposableMap>
  )
}

export default MapChart
