import { readFileSync, writeFileSync } from 'node:fs';

// Input: Natural Earth ne_110m_land.geojson (public domain).
// Usage: node scripts/generate-globe-land.mjs path/to/ne_110m_land.geojson
const land = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const polygons = land.features
  .flatMap(({ geometry }) => (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates))
  .map((rings) => {
    const points = rings.flat();
    return {
      rings,
      minX: Math.min(...points.map(([x]) => x)),
      maxX: Math.max(...points.map(([x]) => x)),
      minY: Math.min(...points.map(([, y]) => y)),
      maxY: Math.max(...points.map(([, y]) => y)),
    };
  });

function insideRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i],
      [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const coordinates = [];
for (let lat = -172; lat <= 172; lat += 3) {
  for (let lon = -360; lon < 360; lon += 3) {
    const x = lon / 2,
      y = lat / 2;
    if (
      polygons.some(
        ({ rings, minX, maxX, minY, maxY }) =>
          x >= minX &&
          x <= maxX &&
          y >= minY &&
          y <= maxY &&
          insideRing(x, y, rings[0]) &&
          !rings.slice(1).some((ring) => insideRing(x, y, ring))
      )
    )
      coordinates.push(lon, lat);
  }
}
writeFileSync(
  new URL('../src/data/globe-land.json', import.meta.url),
  JSON.stringify({
    source: 'Natural Earth 1:110m land, public domain',
    sourceUrl: 'https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson',
    coordinateScale: 2,
    coordinates,
  }) + '\n'
);
console.log(`Saved ${coordinates.length / 2} land points.`);
