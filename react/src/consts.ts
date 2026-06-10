import Extent from '@arcgis/core/geometry/Extent';
import { HighlightOptionsProperties } from '@arcgis/core/views/support/HighlightOptions';
import { FieldProperties } from '@arcgis/core/layers/support/Field';
import { newHighlightSetting, fieldInfos } from '@/utils';
import { choropleth, CollectionProperties } from '@/types';
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

export const TRACTS_LAYER_TTL = 'US Census Tracts';
export const TRACTS_LAYER_URL = '/layers/tracts';

export const COUNTIES_LAYER_TTL = 'US Counties';
export const COUNTIES_LAYER_URL = '/layers/counties';

export const ML_LAYER_TTL = 'MetroLink Stops';
export const ML_LAYER_URL = '/layers/metrolink';

export const BUS_LAYER_TTL = 'MetroBus Stops';
export const BUS_LAYER_URL = '/layers/metrobus';

export const CYCLE_LAYER_TTL = 'Bicycle/Walking Paths';
export const CYCLE_LAYER_URL = '/layers/cycle';

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
    {name: 'freq_wk', alias: 'Weekday Frequency (minutes)', type: 'integer'},
    {name: 'freq_sa', alias: 'Saturday Frequency (minutes)', type: 'integer'},
    {name: 'freq_su', alias: 'Sunday Frequency (minutes)', type: 'integer'},
];

export const LINES_FIELDINFOS = fieldInfos(
    LINES_FIELDS, ['ObjectID', 'route', 'route_type']
)

export const STOP_FIELDS: FieldProperties[] = [
    { name: 'ObjectID', alias: 'ObjectID', type: 'oid' },
    { name: 'stop_id', alias: 'Stop ID', type: 'string' },
    { name: 'stop_name', alias: 'Name', type: 'string' },
    { name: 'wheelchair_access', alias: 'Wheelchair Accessible', type: 'string' },
    { name: 'route_count', alias: 'Route Count', type: 'integer' },
    { name: 'route_names', alias: 'Route Names', type: 'string' },
    { name: 'route_ids', alias: 'Route Nums', type: 'string' },
    { name: 'amenity_access', alias: 'Amenity Access', type: 'string' },
    { name: 'grocery_access', alias: 'Grocery Store Access', type: 'string' },
    { name: 'school_access', alias: 'School/Kindergarten Access', type: 'string' },
    { name: 'college_access', alias: 'College/University Access', type: 'string' },
    { name: 'park_access', alias: 'Park Access', type: 'string' },
    { name: 'facility_access', alias: 'Social Facility Access', type: 'string' },
    { name: 'medical_access', alias: 'Medical Facility Access', type: 'string' },
    { name: 'church_access', alias: 'Place of Worship Access', type: 'string' },
    { name: 'entertainment_access', alias: 'Entertainment Access', type: 'string' },
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