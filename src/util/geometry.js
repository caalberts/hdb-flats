import proj4 from 'proj4'

const SVY21 = '+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs'
const SVY21proj = proj4('WGS84', SVY21)

export function toSVY (lat, lng) {
  return SVY21proj.forward([lng, lat])
}

export function eucliDist2 ([x1, y1], [x2, y2]) {
  return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)
}
