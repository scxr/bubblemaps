import type { MapData, MapMetadata } from '../types/MapData';
import fs from 'fs';

let links = {}

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

function calculateConnections(mapData: MapData) {
    let links = mapData.links
    let nodes = mapData.nodes
    let top5 = mapData.nodes.slice(0, 5)
    let top5Tokens = top5.map(node => node.address)
    let connections: { [key: string]: {address: string, percentage: number, is_contract: boolean | null, is_exchange: boolean | null}[] } = {}
    for (const link of links) {
        let source = nodes[link.source]
        let target = nodes[link.target]
        if (source && target) {
            if (top5Tokens.includes(source.address)) {
                if (connections[source.address] ) {
                    connections[source.address].push({address: target.address, percentage: target.percentage, is_contract: target.is_contract, is_exchange: target.is_exchange})
                } else {
                    connections[source.address] = [{address: target.address, percentage: target.percentage, is_contract: target.is_contract, is_exchange: target.is_exchange}]
                }
            } else if (top5Tokens.includes(target.address)) {
                if (connections[target.address] ) {
                    connections[target.address].push({address: source.address, percentage: source.percentage, is_contract: source.is_contract, is_exchange: source.is_exchange })
                } else {
                    connections[target.address] = [{address: source.address, percentage: source.percentage, is_contract: source.is_contract, is_exchange: source.is_exchange}]
                }
            }
        }
    }
    return connections
}

function buildTop5Holders(mapData: MapData) {
    const connections = calculateConnections(mapData);
    return mapData.nodes.slice(0, 5).map((node, index) => {
        const holderText = `${index + 1}. <a href="https://solscan.io/address/${node.address}">${node.is_contract ? "📜": node.is_exchange ? "🏦" : "🥷"} ${node.address.slice(0, 4)}...${node.address.slice(-4)}</a> holds <code>${Number(node.percentage).toFixed(2)}%</code>`;
        
        const nodeConnections = connections[node.address];

        let connectionsText = '';
        if (nodeConnections && nodeConnections.length > 0) {
            connectionsText = "\n" + nodeConnections
                .map(conn => `\t\t\t\t• <a href="https://solscan.io/address/${conn.address}"> ${conn.is_contract ? "📜": conn.is_exchange ? "🏦" : "🥷"} ${conn.address.slice(0, 4)}...${conn.address.slice(-4)}</a> <code>${Number(conn.percentage).toFixed(2)}%</code>`)
                .join('\n');
        }
        
        return holderText + connectionsText;
    }).join('\n\n');
}

export async function getMessageText(tokenAddress: string, chain: string) {
    const [mapData, mapMetadata] = await Promise.all([getMapData(tokenAddress, chain), getMapMetadata(tokenAddress, chain)]);
    
    console.log(mapData);
    fs.writeFileSync('mapData.json', JSON.stringify(mapData, null, 2));
    console.log(mapMetadata);
    fs.writeFileSync('mapMetadata.json', JSON.stringify(mapMetadata, null, 2));
    let connections = calculateConnections(mapData)
    fs.writeFileSync('connections.json', JSON.stringify(connections, null, 2));

    return `
<b>${mapData.full_name}</b>

<b>Decentralisation Score:</b> ${mapMetadata.decentralisation_score}
<b>Percent in CEXs:</b> ${mapMetadata.identified_supply.percent_in_cexs}
<b>Percent in Contracts:</b> ${mapMetadata.identified_supply.percent_in_contracts}
<b>Last Updated:</b> ${new Date(mapMetadata.ts_update * 1000).toLocaleString()}

<b>Top 5 Holders:</b>
${buildTop5Holders(mapData)}

<b>Key:</b>
<code>📜</code> - Contract
<code>🏦</code> - Exchange
<code>🥷</code> - Holder
    `;
}