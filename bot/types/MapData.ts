export interface MapData {
    version: number;
    chain: string;
    token_address: string;
    dt_update: string;
    full_name: string;
    symbol: string;
    is_X721: boolean;
    metadata: {
        max_amount: number;
        min_amount: number;
    };
    nodes: Nodes[];
    token_links: TokenLink[];
    links: Link[];
   
}

export interface MapMetadata {
    decentralisation_score: number;
    identified_supply: {
        percent_in_cexs: number;
        percent_in_contracts: number;
    }
    ts_update: number;
    status: string;
}

export interface Nodes {
    address: string;
    amount: number;
    is_contract: boolean;
    is_exchange: boolean;
    name: string;
    percentage: number;
    transaction_count: number;
    transfer_X721_count: number | null;
    transfer_count: number;
}

export interface Node {
    
}

export interface TokenLink {
    address: string;
    decimals: number;
    name: string;
    symbol: string;
    links: Link[];
}

export interface Link {
    backward: number;
    forward: number;
    source: number;
    target: number;
}