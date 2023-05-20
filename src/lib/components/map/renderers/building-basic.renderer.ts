import type { Geo } from '$lib/commons/geometry';
import type { Place } from '$lib/datalake/osm/osm.types'
import { GenericRenderer } from './generic.renderer'

export class BuildingBasicRenderer extends GenericRenderer<Place> {

    
    render(
        building: Place,
        ctx: CanvasRenderingContext2D,
        mapContext: { offset: Geo, zoom: number }
    ) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#cccccc'
        ctx.fillStyle = '#eeeeee'
        if (building.polygon) {
            ctx.beginPath();
            ctx.moveTo(...this.project(building.polygon[0], mapContext))
            for (let i = 1; i < building.polygon.length; i++) {
                ctx.lineTo(...this.project(building.polygon[i], mapContext));
            }
            ctx.stroke()
            ctx.fill()
        }

        const c = this.project(building.centroid, mapContext)
        ctx.fillRect(c[0], c[1], 1, 1)

    }

}