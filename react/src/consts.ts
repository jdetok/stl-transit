import Extent from '@arcgis/core/geometry/Extent';
import { HighlightOptionsProperties } from '@arcgis/core/views/support/HighlightOptions';
import { FieldProperties } from '@arcgis/core/layers/support/Field';
import { newHighlightSetting, fieldInfos, scrollToInfoBlock } from '@/utils';
import { choropleth, CollectionProperties, cplethEls, infoBlockProps, itemProps } from '@/types';
import { CSSProperties } from 'react';

export const loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export const hdrTtl = 'St. Louis Transit Map';

export const infoSect = 'info-sect';
const abtBlk = 'abt';
const dataBlk = 'data';
const techBlk = 'tech';

// text/anchors rendered at bottom of page
export const ftrItems: itemProps[] = [
    { txt: 'Created by ', linkTxt: 'Justin DeKock', onClick: () => scrollToInfoBlock(infoSect, abtBlk), },
    { txt: 'Data Sources ', onClick: () => scrollToInfoBlock(infoSect, dataBlk), },
    { txt: 'Technologies/Development', onClick: () => scrollToInfoBlock(infoSect, techBlk), },
    { txt: 'Source Code', blank: true, link: 'https://github.com/jdetok/stl-transit.git' },
];

export const infoSectBlocks: infoBlockProps[] = [
    { id: abtBlk, ttl: 'About the Developer', txt: loremIpsum},
    { id: dataBlk, ttl: 'Data Sources', txt: loremIpsum},
    { id: techBlk, ttl: 'Technologies Used', txt: loremIpsum},
];

export const CHOROPLETH: choropleth = {
    lvl1: [94, 150, 98],
    lvl2: [17, 200, 152],
    lvl3: [0, 210, 255],
    lvl4: [44, 60, 255],
    lvl5: [50, 1, 63],
} as const;

export const BASE = 'http://localhost:9999';

export const BASEMAP = 'dark-gray';
export const WKID = 4326;
export const EXTENT = {
    xmin: -90.32,
    ymin: 38.53,
    xmax: -90.15,
    ymax: 38.75,
    spatialReference: {wkid: WKID},
} as Extent;

export const PANEL_CSS_CLASSES: Record<string, string> = {
    legend: 'panel-legend',
    layerlist: 'panel-layerlist',
    modifiers: 'panel-modifiers',
    basemaps: 'panel-basemaps',
    print: 'panel-print',
    routes: 'panel-routes',
};

export const dispNone: CSSProperties = { display: 'none' };
export const dispBlock: CSSProperties = { display: 'block' };

export const TRACTS_LAYER_TTL = 'US Census Tracts';
export const TRACTS_LAYER_URL = '/layers/tracts';

export const COUNTIES_LAYER_TTL = 'US Counties';
export const COUNTIES_LAYER_URL = '/layers/counties';

export const LINES_LAYER_URL = '/layers/lines';

export const ML_LAYER_URL = '/layers/metrolink';
export const ML_LAYER_TTL = 'MetroLink Stations';
export const ML_LINES_LAYER_TTL = 'MetroLink Lines';

export const BUS_LAYER_URL = '/layers/metrobus';
export const BUS_LAYER_TTL = 'MetroBus Stops';
export const BUS_LINES_LAYER_TTL = 'MetroBus Lines';

export const CYCLE_LAYER_TTL = 'Bicycle/Walking Paths';
export const CYCLE_LAYER_URL = '/layers/cycle';

export const AMTRAK_LAYER_TTL = 'Amtrak Stations';
export const AMTRAK_LAYER_URL = '/layers/amtrak';

export const STEP_XS = 0.01;
export const STEP_SM = 0.1;
export const STEP_MD = 0.025;
export const STEP_LG = 0.5;
export const STEP_XL = 1;

export const MAX_OPAC_TRACT = 0.5;
export const MAX_MJLT_LINES_MLINK = 5;
export const MAX_MULT_LINES_MBUS = 12;
export const MAX_MULT_STOPS = 3;

export const SVAL_OPAC_TRACT = 0.05;
export const SVAL_MULT = 1;

export const BUS_STOP_SIZE = 4;
export const BUS_STOP_Y_COLOR = [0, 255, 255, 0.5];
export const BUS_STOP_NO_COLOR = [180, 110, 200, 0.5];
export const BUS_STOP_NA_COLOR = [0, 165, 255, 0.5];

export const ML_STOP_SIZE = 15;
export const ML_STOP_OUTLINE_WIDTH = 1;
export const ML_LINE_SIZE = 3;
export const ML_RED_COLOR = [127, 0, 0, 0.5];
export const ML_BLUE_COLOR = [0, 0, 255, 0.5];
export const ML_BOTH_COLOR = [127, 0, 255, 0.5];
export const RAIL_INNER_COLOR = [0, 0, 0, 0.6];

export const AMTRAK_COLOR = [245, 245, 245, 0.6];
export const AMTRAK_SIZE = 18;

export const CYCLE_LAYER_GRAVEL_COLOR = [180, 80, 170, 0.6];
export const CYCLE_LAYER_ASPHALT_COLOR = [208, 148, 75, 0.6];
export const CYCLE_LAYER_OTHER_COLOR = [75, 108, 208, 0.6];
export const CYCLE_LAYER_SIZE = .8;

export const GROCERY_INNER_COLOR = [0, 0, 255, 0.5];
export const PARKS_COLOR = [20, 255, 115, 0.35];
export const FUN_COLOR = [255, 153, 255, 0.25];
export const SOCIAL_COLOR = [184, 217, 255, 0.35];
export const SCHOOL_COLOR = [242, 238, 122, 0.3];
export const UNI_COLOR = [160, 238, 150, 0.3];
export const CHURCH_COLOR = [10, 238, 255, 0.3];
export const MED_COLOR = [255, 25, 25, 0.3];
export const COUNTIES_OUTLINE_COLOR = [0, 0, 0, 0.5];
export const COUNTIES_OUTLINE_SIZE = 1.5;
export const COUNTIES_INNER_COLOR = [255, 255, 255, 0];

export const LINES_CLASSBREAKS: cplethEls[] = [
    [0, 19, [62, 225, 67]],
    [20, 29, [50, 150, 127]],
    [30, 44, [0, 127, 255]],
    [45, 59, [255, 200, 127]],
    [60, 60, [255, 100, 100]],
    [61, 720, [255, 70, 10]],
];

export const PLACE_FIELDS: FieldProperties[] = [
    { name: 'ObjectID', alias: 'ObjectID', type: 'oid' },
    { name: 'name', alias: 'Name', type: 'string' },
    { name: 'type', alias: 'Type', type: 'string' },
    { name: 'operator', alias: 'Operator', type: 'string' },
    { name: 'bus_near', alias: 'Bus Routes within 1/2Mi.', type: 'string' },
    { name: 'rail_near', alias: 'Rail Routes within 1Mi.', type: 'string' },
];
export const PLACE_FIELDINFOS = fieldInfos(PLACE_FIELDS, ['ObjectID', 'type']);

export const LINES_FIELDS: FieldProperties[] = [
    {name: 'ObjectID', alias: 'ObjectID', type: 'oid'},
    {name: 'route', alias: 'route', type: 'string'},
    {name: 'route_desc', alias: 'route_desc', type: 'string'},
    {name: 'route_type', alias: 'route_type', type: 'string'},
    {name: 'stops_total', alias: 'Total Stops', type: 'integer'},
    { name: 'freq_wk', alias: 'Weekday Frequency (minutes)', type: 'integer' },
    {name: 'freq_sa', alias: 'Saturday Frequency (minutes)', type: 'integer'},
    {name: 'freq_su', alias: 'Sunday Frequency (minutes)', type: 'integer' },
    { name: 'connected_bus_routes', alias: 'connected_bus_routes', type: 'string' },
];

export const LINES_FIELDINFOS = fieldInfos(
    LINES_FIELDS, ['ObjectID', 'route_desc', 'route', 'route_type']
)

export const STOP_FIELDS: FieldProperties[] = [
    { name: 'ObjectID', alias: 'ObjectID', type: 'oid' },
    { name: 'stop_id', alias: 'Stop ID', type: 'string' },
    { name: 'stop_name', alias: 'Name', type: 'string' },
    { name: 'wheelchair_access', alias: 'Wheelchair Accessible', type: 'string', valueType: 'binary' },
    { name: 'route_count', alias: 'Route Count', type: 'integer' },
    { name: 'route_names', alias: 'Route Names', type: 'string' },
    { name: 'route_ids', alias: 'Route Nums', type: 'string' },
    { name: 'grocery_access', alias: 'Grocery Store Access', type: 'string', valueType: 'binary' },
    { name: 'school_access', alias: 'School/Kindergarten Access', type: 'string', valueType: 'binary' },
    { name: 'college_access', alias: 'College/University Access', type: 'string', valueType: 'binary' },
    { name: 'park_access', alias: 'Park Access', type: 'string', valueType: 'binary' },
    // { name: 'amenity_access', alias: 'Amenity Access', type: 'string', valueType: 'binary' },
    // { name: 'facility_access', alias: 'Social Facility Access', type: 'string', valueType: 'binary' },
    // { name: 'medical_access', alias: 'Medical Facility Access', type: 'string', valueType: 'binary' },
    // { name: 'church_access', alias: 'Place of Worship Access', type: 'string', valueType: 'binary' },
    // { name: 'entertainment_access', alias: 'Entertainment Access', type: 'string', valueType: 'binary' },
];

export const STOP_FIELDINFOS = fieldInfos(
    STOP_FIELDS, ['ObjectID', 'stop_id', 'stop_name', 'route_ids', 'route_count', 'route_names']
)

export const TRACTS_FIELDS: FieldProperties[] = [
    { name: 'ObjectID', alias: 'ObjectID', type: 'oid' },
    { name: 'geoid', alias: 'geoid', type: 'string' },
    { name: 'tract', alias: 'Tract', type: 'string' },
    { name: 'tract_name', alias: 'Tract Name', type: 'string' },
    { name: 'countyfp', alias: 'County FP', type: 'string' },
    { name: 'county_name', alias: 'County', type: 'string' },
    { name: 'popl', alias: 'Population', type: 'integer' },
    { name: 'popl_dens', alias: 'Persons/Sq.Mi', type: 'double' },
    { name: 'med_age', alias: 'Median Age', type: 'double' },
    { name: 'med_inc', alias: 'Median Income', type: 'double' },
    { name: 'med_rent', alias: 'Median Rent', type: 'double' },
    { name: 'popl_pov', alias: 'Population in Poverty', type: 'integer' },
    { name: 'pov_dens', alias: 'Persons/Sq.Mi in Poverty', type: 'double' },
    { name: 'popl_pov_pct', alias: '% Population in Poverty', type: 'string' },
    { name: 'stops_in_tract', alias: 'Transit Stops in Tract', type: 'string' },
];

export const TRACTS_FIELDINFOS = fieldInfos(
    TRACTS_FIELDS, ['ObjectID', 'geoid', 'tract', 'tract_name', 'countyfp']);

export const COUNTIES_FIELDS: FieldProperties[] = [
    { name: 'ObjectID', alias: 'ObjectID', type: 'oid' },
    { name: 'countyfp', alias: 'County FP', type: 'string' },
    { name: 'county_name', alias: 'County', type: 'string' },
    { name: 'popl', alias: 'Population', type: 'integer' },
    { name: 'popl_dens', alias: 'Population Density', type: 'double' },
    { name: 'med_age', alias: 'Median Age', type: 'double' },
    { name: 'med_inc', alias: 'Median Income', type: 'double' },
    { name: 'popl_pov', alias: 'Population in Poverty', type: 'integer' },
    { name: 'popl_pov_pct', alias: 'Percent in Poverty', type: 'string' },
    { name: 'stops_in_county', alias: 'Transit Stops in County', type: 'string' },
];
export const COUNTIES_FIELDINFOS = fieldInfos(COUNTIES_FIELDS, ['ObjectID', 'countyfp']);

export const CYCLING_FIELDS: FieldProperties[] = [
    { name: 'ObjectID', alias: 'ObjectID', type: 'oid' },
    { name: 'name', alias: 'Name', type: 'string' },
    { name: 'highway', alias: 'Highway', type: 'string' },
    { name: 'surface', alias: 'Surface', type: 'string' },
];
export const CYCLING_FIELDINFOS = fieldInfos(CYCLING_FIELDS, ['ObjectID', 'name', 'highway']);

export const AMTRAK_FIELDS: FieldProperties[] = [
    { name: 'ObjectID', alias: 'ObjectID', type: 'oid' },
    { name: 'name', alias: 'Name', type: 'string' },
    { name: 'operator', alias: 'Operator', type: 'string' },
];
export const AMTRAK_FIELDINFOS = fieldInfos(AMTRAK_FIELDS, ['ObjectID']);

// CUSTOM HIGHLIGHT SETTINGS
export const HL_PARKS = newHighlightSetting('parks', 'mediumseagreen');
export const HL_SCHOOLS = newHighlightSetting('schools', 'khaki');
export const HL_CHURCH = newHighlightSetting('church', 'violet');
export const HL_MED = newHighlightSetting('med', 'mediumvioletred');
export const HL_GROCERY = newHighlightSetting('grocery', 'white');

export const HIGHLIGHTS: CollectionProperties<HighlightOptionsProperties> = [
    newHighlightSetting('default', 'cyan'),
    HL_PARKS,
    HL_SCHOOLS,
    HL_CHURCH, 
    HL_MED,
    HL_GROCERY,
];
