import type { Geo } from '$lib/commons/geometry';
import type { Place } from '$lib/datalake/osm/osm.types'
import { GenericRenderer } from './generic.renderer'

export class NaturalFeatureBasicRenderer extends GenericRenderer<Place> {

    render(
        naturalFeature: Place,
        ctx: CanvasRenderingContext2D,
        mapContext: { offset: Geo, zoom: number }
    ) {
        if (!naturalFeature.polygon) {
            return
        }
        ctx.fillStyle = '#d7efc0';
        if (naturalFeature.subclass === 'grassland') {
            ctx.fillStyle = '#d7efc0';
        } else if (naturalFeature.subclass === 'woods') {
            ctx.fillStyle = '#add19e';
        } else if (naturalFeature.subclass === 'water') {
            ctx.fillStyle = '#aad3df';
        }
        ctx.beginPath();
        const start = naturalFeature.polygon[0]
        ctx.moveTo(...this.project(start, mapContext))
        for (let i = 1; i < naturalFeature.polygon.length; i++) {
            ctx.lineTo(...this.project(naturalFeature.polygon[i], mapContext))
        }
        ctx.closePath()
        ctx.fill()
    }

}