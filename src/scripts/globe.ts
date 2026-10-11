import {
  Group,
  Mesh,
  SphereGeometry,
  MeshBasicMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  Points,
  LineSegments,
  LineBasicMaterial,
} from 'three';
import land from '~/data/globe-land.json';

// Longitude zero faces the camera. Africa and Europe start at the front.
function onSphere(lon: number, lat: number, radius = 1) {
  const longitude = (lon * Math.PI) / 180,
    latitude = (lat * Math.PI) / 180;
  return [
    radius * Math.cos(latitude) * Math.sin(longitude),
    radius * Math.sin(latitude),
    radius * Math.cos(latitude) * Math.cos(longitude),
  ];
}

/** An engraved globe light: geographic land points and fine latitude/longitude lines. */
export function createGlobe() {
  const group = new Group();
  group.rotation.set(0.14, -0.28, -0.12);
  const sphereGeometry = new SphereGeometry(0.996, 64, 40);
  const sphereMaterial = new MeshBasicMaterial({ color: 0x050607 });
  const sphere = new Mesh(sphereGeometry, sphereMaterial);
  sphere.renderOrder = 1;
  group.add(sphere);

  const landPositions: number[] = [];
  for (let i = 0; i < land.coordinates.length; i += 2) {
    landPositions.push(
      ...onSphere(land.coordinates[i] / land.coordinateScale, land.coordinates[i + 1] / land.coordinateScale, 1.003)
    );
  }
  const pointGeometry = new BufferGeometry();
  pointGeometry.setAttribute('position', new Float32BufferAttribute(landPositions, 3));
  const pointMaterial = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uLight: { value: 1 }, uSize: { value: 2 }, uHalo: { value: 0 } },
    vertexShader: `
      uniform float uSize;
      varying float vFront;
      void main() {
        vFront = max(0.0,normalize(mat3(modelMatrix)*normalize(position)).z);
        gl_PointSize = uSize;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }`,
    fragmentShader: `
      uniform float uLight;
      uniform float uHalo;
      varying float vFront;
      void main() {
        vec2 p = abs(gl_PointCoord-.5);
        float square = 1.0-smoothstep(.32,.5,max(p.x,p.y));
        float glow = (.40+.60*pow(vFront,.45))*uLight;
        vec2 offset = gl_PointCoord-.5;
        float halo = exp(-dot(offset,offset)*18.0)*.16;
        gl_FragColor = vec4(vec3(1.0,.88,.58)*glow,mix(square*.92,halo,uHalo));
      }`,
  });
  const points = new Points(pointGeometry, pointMaterial);
  points.renderOrder = 2;
  const glowMaterial = pointMaterial.clone();
  glowMaterial.uniforms.uHalo.value = 1;
  const glowPoints = new Points(pointGeometry, glowMaterial);
  glowPoints.renderOrder = 2;
  group.add(glowPoints, points);

  const gridPositions: number[] = [];
  function segment(lonA: number, latA: number, lonB: number, latB: number) {
    gridPositions.push(...onSphere(lonA, latA, 1.001), ...onSphere(lonB, latB, 1.001));
  }
  for (let lon = -180; lon < 180; lon += 20) {
    for (let lat = -90; lat < 90; lat += 2) segment(lon, lat, lon, lat + 2);
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    for (let lon = -180; lon < 180; lon += 2) segment(lon, lat, lon + 2, lat);
  }
  const gridGeometry = new BufferGeometry();
  gridGeometry.setAttribute('position', new Float32BufferAttribute(gridPositions, 3));
  const gridMaterial = new LineBasicMaterial({ color: 0xffce80, transparent: true, opacity: 0.4, depthWrite: false });
  const grid = new LineSegments(gridGeometry, gridMaterial);
  grid.renderOrder = 2;
  group.add(grid);
  return {
    group,
    update(time: number, pixelRatio: number) {
      group.rotation.y = -0.28 + time * 0.014;
      pointMaterial.uniforms.uLight.value = 1.1;
      pointMaterial.uniforms.uSize.value = 1.2 * pixelRatio;
      glowMaterial.uniforms.uLight.value = 1.1;
      glowMaterial.uniforms.uSize.value = pointMaterial.uniforms.uSize.value * 3.5;
      gridMaterial.opacity = 0.44;
    },
    dispose() {
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      pointGeometry.dispose();
      pointMaterial.dispose();
      glowMaterial.dispose();
      gridGeometry.dispose();
      gridMaterial.dispose();
    },
  };
}
