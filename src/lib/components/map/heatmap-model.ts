import { Geometry, type Geo } from "$lib/commons/geometry";

export type HeatmapPoint = { absoluteValue: number, percentageValue: number }

export class HeatmapModel {

    constructor(
        public points: Array<{ geo: Geo, value: number}>,
        public lowerLimit: number,
        public upperLimit: number,
        public gradient: [string, string]
    ) {}

    getValueAt(point: Geo): HeatmapPoint {
        let distance = Infinity
        let value = 0
        for (let i = 0; i < this.points.length; i++) {
            const d = Geometry.distance(point, this.points[i].geo)
            // console.log(d)
            if (d < distance) {
                distance = d
                value = this.points[i].value
            }
        }
        // TODO: Lerping
        //console.log(value, this.minValue, this.maxValue )
        const pct = (value - this.lowerLimit) / (this.upperLimit - this.lowerLimit)
        return {
            absoluteValue: value,
            percentageValue: pct
        }
    }

}

export class HeatmapModelFactory {

    static fromPoints(arrayOfPoints: Array<{ geo: Geo, value: number}>, fixedLimits: { min: number, max: number } | undefined = undefined): HeatmapModel {
        let lowerLimit = Infinity
        let upperLimit = -Infinity
        if (fixedLimits) {
            lowerLimit = fixedLimits.min
            upperLimit = fixedLimits.max
        } else {
            for (let i = 0; i < arrayOfPoints.length; i++) {
                const value = arrayOfPoints[i].value
                if (value < lowerLimit) {
                    lowerLimit = value
                }
                if (value > upperLimit) {
                    upperLimit = value
                }
            }
        }

        return new HeatmapModel(arrayOfPoints, lowerLimit, upperLimit, ['#e24c33', '#39a8f0'])
    }

}