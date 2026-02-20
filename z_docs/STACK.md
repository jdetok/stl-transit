# High level technical document

## Backend
- Go ^1.25
    - ### Fetching external data
        - Go packages fetch geospatial data from several sources and transform them into relevant structures
        - see z_docs/sources/gis_data.csv for data sources
    - ### API
        - expose endpoints for the frontend to use when building layers
- ### FEATURES REQUIRED
    - reliably call external APIs for data
    - merge several data sets to create a large type which can be exposed as an endpoint
    

## Frontend
- Typescipt, vite for bundling, ArcGIS Maps SDK for JavasScript for mapping
- the map should not be full screen by default, fit within larger web page design
    - web components
    - css grid
- ### FEATURES REQUIRED
    - display base map with feature layers
    - ability to display/hide each feature layer
    - ability to view map as window of full screen
