import type { MapData, MapMetadata } from '../types/MapData';

async function getMapData(tokenAddress: string, chain: string) {
    const response = await fetch(`https://api-legacy.bubblemaps.io/map-data?token=${tokenAddress}&chain=${chain}`);
    const data = await response.json();
    return data as MapData;
}

async function getMapMetadata(tokenAddress: string, chain: string) {
    const response = await fetch(`https://api-legacy.bubblemaps.io/map-metadata?token=${tokenAddress}&chain=${chain}`);
    const data = await response.json();
    return data as MapMetadata;
}

export async function getMessageText(tokenAddress: string, chain: string) {
    const [mapData, mapMetadata] = await Promise.all([getMapData(tokenAddress, chain), getMapMetadata(tokenAddress, chain)]);
    console.log(mapData);
    console.log(mapMetadata);
const top5Holders = mapData.nodes.slice(0, 5).map(node => `<a href="https://solscan.io/address/${node.address}">${node.address.slice(0, 4)}...${node.address.slice(-4)}</a> holds <code>${Number(node.percentage).toFixed(2)}%</code>`).join('\n');

    return `
<b>${mapData.full_name}</b>

<b>Decentralisation Score:</b> ${mapMetadata.decentralisation_score}
<b>Percent in CEXs:</b> ${mapMetadata.identified_supply.percent_in_cexs }
<b>Percent in Contracts:</b> ${mapMetadata.identified_supply.percent_in_contracts}
<b>Last Updated:</b> ${new Date(mapMetadata.ts_update * 1000).toLocaleString()}

<b>Top 5 Holders:</b>
${top5Holders}
    `;
}