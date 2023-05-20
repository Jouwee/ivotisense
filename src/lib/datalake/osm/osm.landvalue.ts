import { Geometry, type Geo } from '$lib/commons/geometry'
import { Log } from '../../commons/log'
import type { OsmDao } from './osm.dao'
import type { Class, NativeOsmElement, NativeOsmExtract, NaturalFeature, Place } from './osm.types'

/*
Plátano
JSON.stringify([{
    area: parseFloat($('.imovel-detalhes .text-primary .col-md-4:nth-child(1) b').text()),
    value: parseFloat($('.valor-dir').text().replace(/[^\d\,]/g, '').replace(',', '.')),
    type: 'terrain',
    geo: $('iframe.mapa')[0].getAttribute('src').replace(/.*center=([\-\.\d]+),([\-\.\d]+).*$/, '$1,$2').split(',').map(v => parseFloat(v)).reduce((acc, v, i) => Object.assign(acc, { [i == 0 ? 'lat' : 'lon']: v }), {}),
    url: location.href
}].map(obj => Object.assign(obj, {
    valuePerSqm: obj.value / obj.area
}))[0])+','
*/

const knownValues = [
    { osm_id: null, "area":403,"value":250000,"type":"terrain","geo":{lat:-28.2756214,lon:-52.4145824},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Buhler/Ivoti/RS/2776","valuePerSqm":620.3473945409429},
    {"area":368.33,"value":220000,"type":"terrain","geo":{lat:-29.616334,lon:-51.1782769},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2609","valuePerSqm":597.2904732169523},
    {"area":4847.7,"value":900000,"type":"terrain","geo":{lat:-29.6027248,lon:-51.1501879},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Do-Alto/Ivoti/RS/2602","valuePerSqm":185.6550529116901},
    {"area":360,"value":198500,"type":"terrain","geo":{lat:-29.6164779,lon:-51.1762222},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2423","valuePerSqm":551.3888888888889},
    {"area":1301.88,"value":745000,"type":"terrain","geo":{lat:-29.6024324,lon:-51.1595015},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Concordia/Ivoti/RS/2378","valuePerSqm":572.2493624604418},
    {"area":390.19,"value":250000,"type":"terrain","geo":{lat:-29.61359199999999,lon:-51.1814451},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2361","valuePerSqm":640.7134985519875},
    {"area":974.54,"value":480000,"type":"terrain","geo":{lat:-29.6180415,lon:-51.1837998},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2357","valuePerSqm":492.54007018696},
    {"area":837,"value":575000,"type":"terrain","geo":{lat:-29.6134993,lon:-51.1821707},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2360","valuePerSqm":686.9772998805257},
    {"area":679.5,"value":320000,"type":"terrain","geo":{lat:-29.6211415,lon:-51.1545986},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2332","valuePerSqm":470.93451066961},
    {"area":679.5,"value":320000,"type":"terrain","geo":{lat:-29.6211415,lon:-51.1545986},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2331","valuePerSqm":470.93451066961},
    {"area":386.64,"value":255000,"type":"terrain","geo":{lat:-29.6143106,lon:-51.1760659},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2854","valuePerSqm":659.528243327126},
    {"area":368.55,"value":245000,"type":"terrain","geo":{lat:-29.6134993,lon:-51.1821707},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2852","valuePerSqm":664.767331433998},
    {"area":232.88,"value":150000,"type":"terrain","geo":{lat:-29.5970248,lon:-51.17740620000001},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Pastor/Ivoti/RS/1199","valuePerSqm":644.108553761594},
    {"area":390,"value":263799.67,"type":"terrain","geo":{lat:-29.6208056,lon:-51.13808540000002},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/1233","valuePerSqm":676.4094102564102},
    {"area":368.5,"value":216251.28,"type":"terrain","geo":{lat:-29.5999626,lon:-51.15383529999997},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/1197","valuePerSqm":586.8420081411126},
    {"area":368.5,"value":216251.28,"type":"terrain","geo":{lat:-29.5999626,lon:-51.15383529999997},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/1196","valuePerSqm":586.8420081411126},
    {"area":360,"value":218928.28,"type":"terrain","geo":{"lat":-29.5997428,"lon":-51.158274800000015},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Do-Alto/Ivoti/RS/1148","valuePerSqm":608.1341111111111},
    {"area":660,"value":370000,"type":"terrain","geo":{"lat":-29.6024213,"lon":-51.15504720000001},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Do-Alto/Ivoti/RS/1560","valuePerSqm":560.6060606060606},
    {"area":424.58,"value":230000,"type":"terrain","geo":{"lat":-29.6039501,"lon":-51.1561281},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Concordia/Ivoti/RS/2835","valuePerSqm":541.7118093174431},
    {"area":330,"value":160000,"type":"terrain","geo":{"lat":-29.6237525,"lon":-51.1450527},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/1698","valuePerSqm":484.8484848484849},
    {"area":312,"value":190000,"type":"terrain","geo":{"lat":-29.6245474,"lon":-51.1566419},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2829","valuePerSqm":608.974358974359},
    {"area":312,"value":185000,"type":"terrain","geo":{"lat":-29.6244733,"lon":-51.1572368},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2828","valuePerSqm":592.9487179487179},
    {"area":450,"value":318000,"type":"terrain","geo":{"lat":-29.6001858,"lon":-51.1575009},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Palmares/Ivoti/RS/2827","valuePerSqm":706.6666666666666},
    {"area":506.83,"value":280000,"type":"terrain","geo":{"lat":-29.61517,"lon":-51.1724377},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2822","valuePerSqm":552.4534853895784},
    {"area":815.43,"value":500000,"type":"terrain","geo":{"lat":-29.5959282,"lon":-51.2059621},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Buhler/Ivoti/RS/2803","valuePerSqm":613.1734177059957},
    {"area":438.75,"value":280000,"type":"terrain","geo":{"lat":-29.6156005,"lon":-51.1848789},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2773","valuePerSqm":638.1766381766382},
    {"area":445.2,"value":320000,"type":"terrain","geo":{"lat":-29.5970248,"lon":-51.1774062},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Pastor/Ivoti/RS/2774","valuePerSqm":718.7780772686433},
    {"area":543.6,"value":265000,"type":"terrain","geo":{"lat":-29.6234866,"lon":-51.1606094},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2757","valuePerSqm":487.49080206033847},
    {"area":589.95,"value":230000,"type":"terrain","geo":{"lat":-29.6172029,"lon":-51.17734429999999},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2755","valuePerSqm":389.8635477582846},
    {"area":405.6,"value":255000,"type":"terrain","geo":{"lat":-29.5986876,"lon":-51.1556856},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Do-Alto/Ivoti/RS/2756","valuePerSqm":628.698224852071},
    {"area":562.04,"value":240000,"type":"terrain","geo":{"lat":-29.6033346,"lon":-51.1550179},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Do-Alto/Ivoti/RS/2752","valuePerSqm":427.0158707565298},
    {"area":360,"value":150000,"type":"terrain","geo":{"lat":-29.6106737,"lon":-51.1637876},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Morada-Do-Sol/Ivoti/RS/2754","valuePerSqm":416.6666666666667},
    {"area":624,"value":290000,"type":"terrain","geo":{"lat":-29.6106737,"lon":-51.1637876},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2726","valuePerSqm":464.7435897435897},
    {"area":360,"value":275000,"type":"terrain","geo":{"lat":-29.617821,"lon":-51.1772948},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Jardim/Ivoti/RS/2721","valuePerSqm":763.8888888888889},
    {"area":624,"value":350000,"type":"terrain","geo":{"lat":-29.6106737,"lon":-51.1637876},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2705","valuePerSqm":560.8974358974359},
    {"area":380.7,"value":320000,"type":"terrain","geo":{"lat":-29.6134063,"lon":-51.1830037},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2688","valuePerSqm":840.5568689256633},
    {"area":229.15,"value":155000,"type":"terrain","geo":{"lat":-29.5970248,"lon":-51.1774062},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Pastor/Ivoti/RS/2681","valuePerSqm":676.4128300240018},
    {"area":420,"value":275000,"type":"terrain","geo":{"lat":-29.6164238,"lon":-51.1752814},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2659","valuePerSqm":654.7619047619048},
    {"area":392.68,"value":360000,"type":"terrain","geo":{"lat":-29.6156005,"lon":-51.1848789},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2660","valuePerSqm":916.7770194560457},
    {"area":588.9,"value":300000,"type":"terrain","geo":{"lat":-29.6223508,"lon":-51.1538451},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2657","valuePerSqm":509.42435048395316},
    {"area":370,"value":265000,"type":"terrain","geo":{"lat":-29.6057088,"lon":-51.155362},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Concordia/Ivoti/RS/2642","valuePerSqm":716.2162162162163},
    // {"area":438,"value":1000000,"type":"terrain","geo":{"lat":-29.6106737,"lon":-51.1637876},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Farroupilha/Ivoti/RS/2604","valuePerSqm":2283.10502283105},
    {"area":426,"value":380000,"type":"terrain","geo":{"lat":-29.5902765,"lon":-51.1658024},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Farroupilha/Ivoti/RS/2591","valuePerSqm":892.018779342723},
    {"area":360,"value":250000,"type":"terrain","geo":{"lat":-29.6022108,"lon":-51.1791325},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Morada-Do-Sol/Ivoti/RS/2586","valuePerSqm":694.4444444444445},
    {"area":483.1,"value":255000,"type":"terrain","geo":{"lat":-29.621865,"lon":-51.1500007},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2588","valuePerSqm":527.8410267025461},
    {"area":616.08,"value":375000,"type":"terrain","geo":{"lat":-29.6223508,"lon":-51.1538451},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2575","valuePerSqm":608.6871834826645},
    {"area":745,"value":640000,"type":"terrain","geo":{"lat":-29.6075353,"lon":-51.1606236},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Sete-De-Setembro/Ivoti/RS/2515","valuePerSqm":859.0604026845638},
    {"area":405,"value":235000,"type":"terrain","geo":{"lat":-29.617821,"lon":-51.1772948},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2505","valuePerSqm":580.2469135802469},
    {"area":216,"value":164300,"type":"terrain","geo":{"lat":-29.5970248,"lon":-51.1774062},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Pastor/Ivoti/RS/2497","valuePerSqm":760.6481481481482},
    {"area":397.8,"value":230000,"type":"terrain","geo":{"lat":-29.6134993,"lon":-51.1821707},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2494","valuePerSqm":578.1799899446958},
    {"area":244.28,"value":178000,"type":"terrain","geo":{"lat":-29.5970248,"lon":-51.1774062},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Pastor/Ivoti/RS/2496","valuePerSqm":728.672015719666},
    {"area":397.8,"value":230000,"type":"terrain","geo":{"lat":-29.6134993,"lon":-51.1821707},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2493","valuePerSqm":578.1799899446958},
    {"area":520,"value":318000,"type":"terrain","geo":{"lat":-29.6113891,"lon":-51.1695941},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Jardim/Ivoti/RS/2473","valuePerSqm":611.5384615384615},
    {"area":438,"value":195000,"type":"terrain","geo":{"lat":-29.6106737,"lon":-51.1637876},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Buhler/Ivoti/RS/2489","valuePerSqm":445.2054794520548},
    {"area":623,"value":375000,"type":"terrain","geo":{"lat":-29.6147429,"lon":-51.1673583},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Jardim/Ivoti/RS/2426","valuePerSqm":601.9261637239165},
    {"area":373.88,"value":285000,"type":"terrain","geo":{"lat":-29.5969724,"lon":-51.1580728},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Palmares/Ivoti/RS/2422","valuePerSqm":762.276666310046},
    {"area":904.8,"value":583000,"type":"terrain","geo":{"lat":-29.61346,"lon":-51.1731473},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Buhler/Ivoti/RS/2419","valuePerSqm":644.3412908930151},
    {"area":582,"value":270000,"type":"terrain","geo":{"lat":-29.5969724,"lon":-51.1580728},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Palmares/Ivoti/RS/2421","valuePerSqm":463.91752577319585},
    {"area":1179,"value":636000,"type":"terrain","geo":{"lat":-29.6167274,"lon":-51.1801038},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2418","valuePerSqm":539.4402035623409},
    {"area":906,"value":255000,"type":"terrain","geo":{"lat":-29.621865,"lon":-51.1500007},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2412","valuePerSqm":281.4569536423841},
    {"area":483.1,"value":228000,"type":"terrain","geo":{"lat":-29.621865,"lon":-51.1500007},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2413","valuePerSqm":471.9519768163941},
    {"area":372,"value":212000,"type":"terrain","geo":{"lat":-29.59868759999999,"lon":-51.15568559999997},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Do-Alto/Ivoti/RS/2410","valuePerSqm":569.8924731182796},
    {"area":696,"value":465000,"type":"terrain","geo":{"lat":-29.6000796,"lon":-51.1681189},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Vinte-E-Cinco-De-Julho/Ivoti/RS/2411","valuePerSqm":668.1034482758621},
    {"area":492,"value":290000,"type":"terrain","geo":{"lat":-29.5949314,"lon":-51.1611156},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Palmares/Ivoti/RS/2407","valuePerSqm":589.430894308943},
    {"area":744,"value":530000,"type":"terrain","geo":{"lat":-29.59868759999999,"lon":-51.1556856},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Do-Alto/Ivoti/RS/2408","valuePerSqm":712.3655913978495},
    {"area":407,"value":265000,"type":"terrain","geo":{"lat":-29.6161033,"lon":-51.1666214},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Jardim/Ivoti/RS/2294","valuePerSqm":651.1056511056511},
    {"area":805,"value":265000,"type":"terrain","geo":{"lat":-29.58636349999999,"lon":-51.1600847},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Feitoria-Nova/Ivoti/RS/2296","valuePerSqm":329.1925465838509},
    {"area":588.9,"value":230000,"type":"terrain","geo":{"lat":-29.6223508,"lon":-51.1538451},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2274","valuePerSqm":390.5586687043641},
    {"area":1600,"value":900000,"type":"terrain","geo":{"lat":-29.617821,"lon":-51.1772948},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2269","valuePerSqm":562.5},
    //{"area":161.25,"value":2200000,"type":"terrain","geo":{"lat":-29.58636349999999,"lon":-51.1600847},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Feitoria-Nova/Ivoti/RS/2227","valuePerSqm":13643.410852713178},
    {"area":380.7,"value":195000,"type":"terrain","geo":{"lat":-29.7623081,"lon":-52.4276847},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2158","valuePerSqm":512.214342001576},
    // {"area":330,"value":430000,"type":"terrain","geo":{"lat":-29.6115628,"lon":-51.1649951},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Harmonia/Ivoti/RS/2189","valuePerSqm":1303.030303030303},
    {"area":467,"value":215000,"type":"terrain","geo":{"lat":-29.6134689,"lon":-51.1743318},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Buhler/Ivoti/RS/2208","valuePerSqm":460.3854389721627},
    {"area":573.88,"value":160000,"type":"terrain","geo":{"lat":-29.5873401,"lon":-51.1594828},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Feitoria-Nova/Ivoti/RS/2226","valuePerSqm":278.803931135429},
    {"area":579.14,"value":170000,"type":"terrain","geo":{"lat":-29.5873401,"lon":-51.1594828},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Feitoria-Nova/Ivoti/RS/2225","valuePerSqm":293.53869530683426},
    {"area":380.7,"value":195000,"type":"terrain","geo":{"lat":-29.7623081,"lon":-52.4276847},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2159","valuePerSqm":512.214342001576},
    {"area":null,"value":635000,"type":"terrain","geo":{"lat":-29.6106974,"lon":-51.16006840000001},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Sete-De-Setembro/Ivoti/RS/2130","valuePerSqm":null},
    {"area":420,"value":170000,"type":"terrain","geo":{"lat":-29.6127016,"lon":-51.1616695},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Sete-De-Setembro/Ivoti/RS/2136","valuePerSqm":404.76190476190476},
    {"area":344.5,"value":215000,"type":"terrain","geo":{"lat":-29.6074922,"lon":-51.1652709},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Harmonia/Ivoti/RS/2102","valuePerSqm":624.0928882438317},
    {"area":1650,"value":330000,"type":"terrain","geo":{"lat":-29.6046912,"lon":-51.1627012},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Nova-Vila/Ivoti/RS/2107","valuePerSqm":200},
    {"area":392.85,"value":220000,"type":"terrain","geo":{"lat":-29.60704194306331,"lon":-51.163425846357725},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2023","valuePerSqm":560.0101820033091},
    {"area":397.8,"value":245000,"type":"terrain","geo":{"lat":-29.6146188,"lon":-51.1790888},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2040","valuePerSqm":615.887380593263},
    {"area":480,"value":225000,"type":"terrain","geo":{"lat":-29.6146748,"lon":-51.163469},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Vista-Alegre/Ivoti/RS/2047","valuePerSqm":468.75},
    {"area":352,"value":240000,"type":"terrain","geo":{"lat":-29.6033346,"lon":-51.1550179},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Concordia/Ivoti/RS/2058","valuePerSqm":681.8181818181819},
    {"area":1758.9,"value":1060000,"type":"terrain","geo":{"lat":-29.624999,"lon":-51.1514676},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2098","valuePerSqm":602.649383137188},
    {"area":370.01,"value":196350,"type":"terrain","geo":{"lat":-29.6134993,"lon":-51.1821707},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2005","valuePerSqm":530.6613334774736},
    {"area":343.35,"value":215000,"type":"terrain","geo":{"lat":-29.6223508,"lon":-51.1538451},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2011","valuePerSqm":626.1831949905344},
    {"area":370.01,"value":190600,"type":"terrain","geo":{"lat":-29.6134993,"lon":-51.1821707},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2003","valuePerSqm":515.1212129401908},
    {"area":420.66,"value":null,"type":"terrain","geo":{"lat":-29.5969724,"lon":-51.1580728},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Palmares/Ivoti/RS/1946","valuePerSqm":null},
    {"area":378,"value":270000,"type":"terrain","geo":{"lat":-29.6032181,"lon":-51.1650909},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Vinte-E-Cinco-De-Julho/Ivoti/RS/1892","valuePerSqm":714.2857142857143},
    {"area":560,"value":215000,"type":"terrain","geo":{"lat":-29.6014572,"lon":-51.166702},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Harmonia/Ivoti/RS/1847","valuePerSqm":383.92857142857144},
    {"area":448,"value":250000,"type":"terrain","geo":{"lat":-29.6187102,"lon":-51.1756395},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/1795","valuePerSqm":558.0357142857143},
    {"area":457.24,"value":290000,"type":"terrain","geo":{"lat":-29.6039501,"lon":-51.1561281},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Concordia/Ivoti/RS/1791","valuePerSqm":634.2402239524101},
    {"area":769.76,"value":380000,"type":"terrain","geo":{"lat":-29.6109963,"lon":-51.1844069},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Buhler/Ivoti/RS/1783","valuePerSqm":493.6603616711702},
    {"area":729.89,"value":583000,"type":"terrain","geo":{"lat":-29.6109963,"lon":-51.1844069},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Buhler/Ivoti/RS/1784","valuePerSqm":798.7504966501801},
    {"area":403,"value":230000,"type":"terrain","geo":{"lat":-29.6239924,"lon":-51.14749339999999},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/1745","valuePerSqm":570.7196029776675},
    {"area":823.4,"value":500000,"type":"terrain","geo":{"lat":-29.6146188,"lon":-51.1790888},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/1742","valuePerSqm":607.2382803011902},
    {"area":432,"value":201500,"type":"terrain","geo":{"lat":-29.6232828,"lon":-51.1502303},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/1750","valuePerSqm":466.43518518518516},
    {"area":432,"value":205000,"type":"terrain","geo":{"lat":-29.6167274,"lon":-51.1801038},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/1764","valuePerSqm":474.537037037037},
    {"area":779.38,"value":510000,"type":"terrain","geo":{"lat":-29.6109963,"lon":-51.1844069},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Buhler/Ivoti/RS/1785","valuePerSqm":654.3662911545074},
    {"area":446.2,"value":260000,"type":"terrain","geo":{"lat":-29.6238025,"lon":-51.1493788},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/1748","valuePerSqm":582.698341550874},
    {"area":360,"value":150000,"type":"terrain","geo":{"lat":-29.6006117,"lon":-51.1848199},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Morada-Do-Sol/Ivoti/RS/1705","valuePerSqm":416.6666666666667},
    {"area":null,"value":null,"type":"terrain","geo":{"lat":-29.5999626,"lon":-51.1538353},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Colina-Verde/Ivoti/RS/1700","valuePerSqm":null},
    {"area":362.44,"value":250000,"type":"terrain","geo":{"lat":-29.6033346,"lon":-51.1550179},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Concordia/Ivoti/RS/1704","valuePerSqm":689.7693411323254},
    {"area":424.58,"value":220000,"type":"terrain","geo":{"lat":-29.6039501,"lon":-51.1561281},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Concordia/Ivoti/RS/1567","valuePerSqm":518.1591219558152},
    {"area":891,"value":590000,"type":"terrain","geo":{"lat":-29.6123427,"lon":-51.1816738},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/1562","valuePerSqm":662.1773288439955},
    {"area":391.87,"value":230000,"type":"terrain","geo":{"lat":-29.6146188,"lon":-51.1790888},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/1563","valuePerSqm":586.9293388113405},
    // {"area":798.31,"value":1100000,"type":"terrain","geo":{"lat":-29.60251427888393,"lon":-51.162456570291894},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Brasilia/Ivoti/RS/1549","valuePerSqm":1377.9108366424073},
    {"area":1144,"value":850000,"type":"terrain","geo":{"lat":-29.6102844,"lon":-51.1582143},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Vista-Alegre/Ivoti/RS/1264","valuePerSqm":743.006993006993},
    {"area":607.25,"value":225000,"type":"terrain","geo":{"lat":-29.6512227,"lon":-51.159819500000026},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Sete-De-Setembro/Ivoti/RS/1268","valuePerSqm":370.52284890901603},
    {"area":540,"value":207000,"type":"terrain","geo":{"lat":-29.62416079999999,"lon":-51.15673170000002},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/1235","valuePerSqm":383.3333333333333},
    {"area":1230,"value":850000,"type":"terrain","geo":{"lat":-29.5919223,"lon":-51.16579439999998},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Farroupilha/Ivoti/RS/1253","valuePerSqm":691.0569105691056},
    {"area":679.5,"value":320000,"type":"terrain","geo":{"lat":-29.621865,"lon":-51.150000699999964},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/1240","valuePerSqm":470.93451066961},
    {"area":722.4,"value":380000,"type":"terrain","geo":{"lat":-29.6179882,"lon":-51.161902999999995},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Vista-Alegre/Ivoti/RS/1263","valuePerSqm":526.0243632336656},
    {"area":787.5,"value":450000,"type":"terrain","geo":{"lat":-29.6032181,"lon":-51.165090899999996},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Vinte-E-Cinco-De-Julho/Ivoti/RS/1256","valuePerSqm":571.4285714285714},
    {"area":1196,"value":1060000,"type":"terrain","geo":{"lat":-29.624999,"lon":-51.15146759999999},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/1223","valuePerSqm":886.2876254180602},
    {"area":821.5,"value":530000,"type":"terrain","geo":{"lat":-29.6245741,"lon":-51.147574399999996},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/1225","valuePerSqm":645.1612903225806},
    {"area":377,"value":190000,"type":"terrain","geo":{"lat":-29.6238025,"lon":-51.14937880000002},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/1221","valuePerSqm":503.9787798408488},
    {"area":1760,"value":1500000,"type":"terrain","geo":{"lat":-29.5960184,"lon":-51.159910500000024},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Centro/Ivoti/RS/1217","valuePerSqm":852.2727272727273},
    {"area":930,"value":730000,"type":"terrain","geo":{"lat":-29.624999,"lon":-51.15146759999999},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/1220","valuePerSqm":784.9462365591398},
    {"area":337.5,"value":170000,"type":"terrain","geo":{"lat":-29.6130862,"lon":-51.16914700000001},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Jardim/Ivoti/RS/1207","valuePerSqm":503.7037037037037},
    {"area":364,"value":265000,"type":"terrain","geo":{"lat":-29.6115628,"lon":-51.1649951},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Jardim/Ivoti/RS/1205","valuePerSqm":728.021978021978},
    {"area":444.8,"value":265000,"type":"terrain","geo":{"lat":-29.5900536,"lon":-51.16203949999999},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Centro/Ivoti/RS/1201","valuePerSqm":595.773381294964},
    {"area":877,"value":520000,"type":"terrain","geo":{"lat":-29.5881,"lon":-51.16602839999996},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Sao-Jose/Ivoti/RS/1202","valuePerSqm":592.9304446978335},
    {"area":228.77,"value":150000,"type":"terrain","geo":{"lat":-29.5970248,"lon":-51.17740620000001},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Pastor/Ivoti/RS/1198","valuePerSqm":655.6803776718975},
    {"area":405,"value":220000,"type":"terrain","geo":{"lat":-29.60072409999999,"lon":-51.155391899999984},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Do-Alto/Ivoti/RS/1140","valuePerSqm":543.2098765432099},
    {"area":390.22,"value":310000,"type":"terrain","geo":{"lat":-29.6033346,"lon":-51.15501789999996},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Do-Alto/Ivoti/RS/1160","valuePerSqm":794.42365844908},
    {"area":372,"value":212000,"type":"terrain","geo":{"lat":-29.59868759999999,"lon":-51.15568559999997},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Do-Alto/Ivoti/RS/1155","valuePerSqm":569.8924731182796},
    {"area":429.25,"value":265000,"type":"terrain","geo":{"lat":-29.6167274,"lon":-51.18010379999998},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/1177","valuePerSqm":617.3558532323821},
    {"area":424.32,"value":265000,"type":"terrain","geo":{"lat":-29.6166497,"lon":-51.17368160000001},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/1179","valuePerSqm":624.5286576168929},
    {"area":435,"value":265000,"type":"terrain","geo":{"lat":-29.5999626,"lon":-51.15383529999997},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Buhler/Ivoti/RS/1114","valuePerSqm":609.1954022988506},
    {"area":null,"value":160000,"type":"terrain","geo":{"lat":-29.5970248,"lon":-51.1774062},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Pastor/Ivoti/RS/2824","valuePerSqm":null},
    {"area":636,"value":369000,"type":"terrain","geo":{"lat":-29.6164523,"lon":-51.1620047},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Vista-Alegre/Ivoti/RS/2711","valuePerSqm":580.188679245283},
    {"area":221.5,"value":170000,"type":"terrain","geo":{"lat":-29.5970248,"lon":-51.1774062},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Pastor/Ivoti/RS/2614","valuePerSqm":767.4943566591422},
    {"area":325,"value":170000,"type":"terrain","geo":{"lat":-29.6252927,"lon":-51.1531616},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2594","valuePerSqm":523.0769230769231},
    {"area":370.1,"value":212000,"type":"terrain","geo":{"lat":-29.6146188,"lon":-51.1790888},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2461","valuePerSqm":572.818157254796},
    {"area":363.53,"value":250000,"type":"terrain","geo":{"lat":-29.6102844,"lon":-51.1582143},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Concordia/Ivoti/RS/2471","valuePerSqm":687.7011525871318},
    {"area":222.6,"value":160000,"type":"terrain","geo":{"lat":-29.5970248,"lon":-51.1774062},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Pastor/Ivoti/RS/2775","valuePerSqm":718.7780772686433},
    {"area":391.5,"value":250000,"type":"terrain","geo":{"lat":-29.60633829999999,"lon":-51.1548227},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Concordia/Ivoti/RS/1719","valuePerSqm":638.5696040868455},
    {"area":838.96,"value":415000,"type":"terrain","geo":{"lat":-29.6113376,"lon":-51.1830215},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Buhler/Ivoti/RS/2402","valuePerSqm":494.66005530657003},
    {"area":636,"value":339000,"type":"terrain","geo":{"lat":-29.6164523,"lon":-51.1620047},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Vista-Alegre/Ivoti/RS/2530","valuePerSqm":533.0188679245283},
    {"area":331.5,"value":212000,"type":"terrain","geo":{"lat":-29.6077546,"lon":-51.1660114},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Harmonia/Ivoti/RS/2554","valuePerSqm":639.5173453996983},
    {"area":364,"value":350000,"type":"terrain","geo":{"lat":-29.6261262,"lon":-51.1441324},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2625","valuePerSqm":961.5384615384615},
    {"area":530,"value":310000,"type":"terrain","geo":{"lat":-29.6234866,"lon":-51.1606094},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2634","valuePerSqm":584.9056603773585},
    {"area":1700,"value":745000,"type":"terrain","geo":{"lat":-29.6065716,"lon":-51.1679311},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Harmonia/Ivoti/RS/2639","valuePerSqm":438.2352941176471},
    {"area":413.1,"value":198500,"type":"terrain","geo":{"lat":-12.6818712,"lon":-56.921099},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2437","valuePerSqm":480.51319293149356},
    {"area":383.56,"value":320000,"type":"terrain","geo":{"lat":-29.624999,"lon":-51.1514676},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/2297","valuePerSqm":834.289289811242},
    {"area":402,"value":225000,"type":"terrain","geo":{"lat":-29.6155533,"lon":-51.1710901},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Jardim/Ivoti/RS/2192","valuePerSqm":559.7014925373135},
    {"area":669.9,"value":350000,"type":"terrain","geo":{"lat":-29.6024213,"lon":-51.15504720000001},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Do-Alto/Ivoti/RS/2089","valuePerSqm":522.466039707419},
    {"area":669.9,"value":350000,"type":"terrain","geo":{"lat":-29.6024213,"lon":-51.15504720000001},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Do-Alto/Ivoti/RS/2088","valuePerSqm":522.466039707419},
    {"area":397.8,"value":235000,"type":"terrain","geo":{"lat":-29.6146188,"lon":-51.1790888},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2053","valuePerSqm":590.7491201608849},
    {"area":368.55,"value":190600,"type":"terrain","geo":{"lat":-29.6134993,"lon":-51.1821707},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/2004","valuePerSqm":517.1618504951838},
    {"area":361.3,"value":240000,"type":"terrain","geo":{"lat":-29.6078179,"lon":-51.1536062},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Concordia/Ivoti/RS/1944","valuePerSqm":664.2679213949626},
    {"area":438,"value":205000,"type":"terrain","geo":{"lat":-29.6167274,"lon":-51.1801038},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/1911","valuePerSqm":468.0365296803653},
    {"area":4526.4,"value":3500000,"type":"terrain","geo":{"lat":-29.5960184,"lon":-51.1599105},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Centro/Ivoti/RS/1880","valuePerSqm":773.2414280664547},
    // {"area":570,"value":750000,"type":"terrain","geo":{"lat":-29.5953627,"lon":-51.16727119999999},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Centro/Ivoti/RS/1689","valuePerSqm":1315.7894736842106},
    {"area":1232,"value":520000,"type":"terrain","geo":{"lat":-29.6223508,"lon":-51.1538451},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Cidade-Nova/Ivoti/RS/1726","valuePerSqm":422.0779220779221},
    {"area":442.68,"value":220000,"type":"terrain","geo":{"lat":-29.5970248,"lon":-51.1774062},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Bom-Pastor/Ivoti/RS/1820","valuePerSqm":496.9729827414837},
    {"area":350.92,"value":180200,"type":"terrain","geo":{"lat":-29.6166497,"lon":-51.17368159999999},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/1838","valuePerSqm":513.5073521030434},
    {"area":752.5,"value":650000,"type":"terrain","geo":{"lat":-29.5960184,"lon":-51.1599105},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Centro/Ivoti/RS/1879","valuePerSqm":863.7873754152824},
    {"area":1438,"value":370000,"type":"terrain","geo":{"lat":-29.5967064,"lon":-51.14654789999999},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Palmares/Ivoti/RS/1688","valuePerSqm":257.3018080667594},
    {"area":489.37,"value":250000,"type":"terrain","geo":{"lat":-29.60072409999999,"lon":-51.155391899999984},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Do-Alto/Ivoti/RS/1557","valuePerSqm":510.8609027933874},
    {"area":409.31,"value":195000,"type":"terrain","geo":{"lat":-29.5999626,"lon":-51.1538353},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/1552","valuePerSqm":476.4115218294202},
    {"area":360,"value":180000,"type":"terrain","geo":{"lat":-29.600204084445597,"lon":-51.168028063507116},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Vinte-E-Cinco-De-Julho/Ivoti/RS/1267","valuePerSqm":500},
    {"area":392.25,"value":145000,"type":"terrain","geo":{"lat":-29.5960184,"lon":-51.159910500000024},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Concordia/Ivoti/RS/1250","valuePerSqm":369.6622052262588},
    {"area":392.25,"value":145000,"type":"terrain","geo":{"lat":-29.5960184,"lon":-51.159910500000024},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Concordia/Ivoti/RS/1250","valuePerSqm":369.6622052262588},
    {"area":null,"value":420000,"type":"terrain","geo":{"lat":-29.5916554,"lon":-51.165064700000016},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Farroupilha/Ivoti/RS/1251","valuePerSqm":null},
    {"area":560,"value":350000,"type":"terrain","geo":{"lat":-29.5960184,"lon":-51.159910500000024},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Centro/Ivoti/RS/1215","valuePerSqm":625},
    {"area":1250,"value":440000,"type":"terrain","geo":{"lat":-29.6198819,"lon":-51.17355789999999},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/1193","valuePerSqm":352},
    {"area":1590,"value":530000,"type":"terrain","geo":{"lat":-29.617821,"lon":-51.17729480000003},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/1188","valuePerSqm":333.3333333333333},
    {"area":842.8,"value":320000,"type":"terrain","geo":{"lat":-29.617821,"lon":-51.17729480000003},"url":"https://www.platanoimoveis.com.br/Imovel/Venda/Terreno/Jardim-Panoramico/Ivoti/RS/1186","valuePerSqm":379.68675842429997}
]

const influenceRadius = 200

// TODO: Pensar numa estrutura melhor
export class OsmLandValue {

    private cityAverage: number
    private knownValues: any[]

    constructor(allBuildings: Place[]) {
        this.knownValues = knownValues.filter(v => v.valuePerSqm).sort((a, b) => (a.valuePerSqm||0) - (b.valuePerSqm||0))
        const cutoff = this.knownValues.length * 0.05
        this.knownValues = this.knownValues.slice(cutoff, this.knownValues.length - cutoff)
        this.cityAverage = this.knownValues.reduce((acc, r) => acc + r.valuePerSqm, 0) / knownValues.length
        this.knownValues.forEach(v => {
            const building = allBuildings.find(building => v.osm_id === building.id)
            if (building) {
                v.geo = (building.polygon||[])[0]
            }
            
        })
    }

    estimate(building: Place) {
        // const exactMatch = this.knownValues.find(v => v.osm_id === building.id)
        // if (exactMatch) {
        //     building.landValue = exactMatch.valuePerSqm
        //     building.estimatedLandValue = exactMatch.valuePerSqm
        //     return building
        // }
        building.totalLandValue = this.cityAverage
        let sum = 0
        let weightSum = 0
        for (const value of this.knownValues) {
            const distance = this.distance((building.polygon||[])[0], [value.geo.lon, value.geo.lat])
            //console.log((building.polygon||[])[0], value.geo, distance)
            if (distance < influenceRadius) {
                const weight = 1-(distance/influenceRadius)
                weightSum += weight
                sum += (value.valuePerSqm * weight)
            }
        }
        if (weightSum > 0) {
            if (weightSum < 1) {
                const avgWeight = 1 - weightSum
                weightSum += avgWeight
                sum += this.cityAverage * avgWeight
            }
            building.totalLandValue = sum / weightSum
        }
        return building
    }

    distance(g1: Geo, g2: Geo) {
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