import type { Geo } from '$lib/commons/geometry'
import type { Place } from '$lib/datalake/osm/osm.types'
import type { MapProjection } from '../map-projection';

export abstract class GenericRenderer<T extends Place> {

    abstract render(
        place: T,
        ctx: CanvasRenderingContext2D,
        projection: MapProjection
    ): void

    public init(
        _ctx: CanvasRenderingContext2D,
        _places: Place[]
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ): void {}

    /**
     * A linear interpolator for hexadecimal colors
     * @param {String} a
     * @param {String} b
     * @param {Number} amount
     * @example
     * // returns #7F7F7F
     * lerpColor('#000000', '#ffffff', 0.5)
     * @returns {String}
     */
    lerpColor(a: string, b: string, amount: number): string { 

        const ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

        return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
    }


}