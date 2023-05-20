<script lang="ts">
    import type { PageData } from './$types'
    import MapComponent from '$lib/components/map/map.svelte'
	import { HeatmapRenderer } from '$lib/components/map/renderers/heatmap.renderer';

    export let data: PageData;

    const customRenderers = {
        'parcel': new HeatmapRenderer(data.georeferencedScores, { min: 1, max: 10 }),
        'building': undefined,
    }

</script>

<MapComponent 
    places={data.places}
    renderers={customRenderers}>
</MapComponent>