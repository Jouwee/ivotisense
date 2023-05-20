import type { Place } from '$lib/datalake/osm/osm.types'
import type { MapProjection } from '../map-projection';
import { GenericRenderer } from './generic.renderer'

export class BuildingBasicRenderer extends GenericRenderer<Place> {

    
    render(
        building: Place,
        ctx: CanvasRenderingContext2D,
        projection: MapProjection
    ) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#cccccc'
        ctx.fillStyle = '#eeeeee'
        if (building.polygon) {
            ctx.beginPath();
            ctx.moveTo(...projection.project(building.polygon[0]))
            for (let i = 1; i < building.polygon.length; i++) {
                ctx.lineTo(...projection.project(building.polygon[i]));
            }
            ctx.stroke()
            ctx.fill()
        }
        if (building.centroid) {
            const c = projection.project(building.centroid)
            ctx.fillRect(c[0], c[1], 1, 1)
        }

    }

}