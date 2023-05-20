<script lang="ts">
	import Number from "../number/number.svelte";
	import type { HeatmapModel } from "./heatmap-model";


    export let model: HeatmapModel

    $: gradientStyle = `background: linear-gradient(to right, ${model.gradient.join(',')})`

</script>

<div>
    <h2>Mapa de calor</h2>
    <div class="bar" style={gradientStyle}></div>
    <div class="limits">
        <small><Number number={model.lowerLimit}></Number></small>
        <small><Number number={model.upperLimit}></Number></small>
    </div>
</div>

<style>

    h2 {
        font-size: 1rem;
        font-weight: bold;
    }

    .bar {
        width: 100%;
        min-height: 1rem;
    }

    .limits {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

</style>