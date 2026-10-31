export const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do 
    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
    nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
    irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim
    id est laborum.
`.replace(/[\r\n]/gm, "");

export const txtAbtDev = `This site was designed & developed by Justin DeKock, Saint Louis 
    University graduate student pursuing an M.S. in Information Systems.
`.replace(/[\r\n]/gm, "")

export const txtDataBlk = `The site's data was obtained from the sources below.`;

export const gtfsTxt = `
    The GTFS standard 
`.replace(/[\r\n]/gm, "")

export const dataSources: Record<string, {ttl: string, txt?: string}> = {
    'gtfs': { ttl: 'GTFS: General Transit Feed Specification', txt: loremIpsum },
    'acs': { ttl: 'ACS: American Community Survey (2024)', txt: loremIpsum },
    'tiger': { ttl: 'TIGER: Topologically Integrated Geographic Encoding and Referencing system', txt: loremIpsum },
    'osm': { ttl: 'OSM: Open Street Map', txt: loremIpsum },
};