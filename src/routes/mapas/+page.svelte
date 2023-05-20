<script lang="ts">
    import type { PageData } from './$types'
    import MapComponent from '$lib/components/map/map.svelte'

    export let data: PageData;

</script>

<MapComponent 
    places={data.places}>
</MapComponent>