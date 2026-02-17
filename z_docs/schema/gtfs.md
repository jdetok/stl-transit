# Metro STL GTFS Data Overview
## Static Data (gtfs.Static)
- Agencies
- Routes
    - aka lines, Blue Line, Red Line, bus lines, etc
    - Id string (mostly digits, rail routes have letter at the end)
    - Blue Line: 19251B or 19587B
    - Red Line: 19251R or 19587B
- Stops
    - contains coordinates for each stop 
    - no mention of bus/rail here
- Services
- Trips
    - each trip relates to one route
    - each trip has an array of stop times, each relating to a stop
- Shapes
    - seems to be arrays of coordiantes to create the lines

## CLEANING/TRANSFORMING STATIC DATA
- metro.Routes type
    - maps each gtfs.Stop object to each associated gtfs.Route 
```go
type Routes map[*gtfs.Stop]map[*gtfs.Route]struct{}
```