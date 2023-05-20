export type Geo = [number, number]

export type GeoPolygon = Geo[]

export class Geometry {

    static centroid(polygon: GeoPolygon): Geo {
        let x = 0, y = 0
        for (let i = 0; i < polygon.length; i++) {
            x += polygon[i][0]
            y += polygon[i][1]
        }
        return [x / polygon.length, y / polygon.length]
    }

    static polyContainsPoly(polygon1: GeoPolygon, polygon2: GeoPolygon): boolean {
        // TODO: This algorithm only works with convex shapes
        // All points in inner Polygon should be contained in polygon
        const xpoints: number[] = polygon2.map(p => p[0])
        const ypoints: number[] = polygon2.map(p => p[1])
        let result = true
        for (let i = 0; i < polygon2.length; i++) {
            result = Geometry.polyContainsPoint(polygon1, [xpoints[i], ypoints[i]]);
            if (!result) break
        }
        return result
    }

    static polyContainsPoint(polygon: GeoPolygon, point: Geo): boolean {
        // ray-casting algorithm based on
        // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
        const x = point[0], y = point[1];

        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];

            const intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }

    static distance(g1: Geo, g2: Geo) {
        const R = 6371e3; // metres
        const φ1 = g1[1] * Math.PI/180; // φ, λ in radians
        const φ2 = g2[1] * Math.PI/180;
        const Δφ = (g2[1]-g1[1]) * Math.PI/180;
        const Δλ = (g2[0]-g1[0]) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // in metres
    }

}