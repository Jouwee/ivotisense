import type { Place } from '$lib/datalake/osm/osm.types'
import type { MapProjection } from '../map-projection';
import { GenericRenderer } from './generic.renderer'

export class NaturalFeatureBasicRenderer extends GenericRenderer<Place> {

    render(
        naturalFeature: Place,
        ctx: CanvasRenderingContext2D,
        projection: MapProjection
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
        ctx.moveTo(...projection.project(start))
        for (let i = 1; i < naturalFeature.polygon.length; i++) {
            ctx.lineTo(...projection.project(naturalFeature.polygon[i]))
        }
        ctx.closePath()
        ctx.fill()
    }

}