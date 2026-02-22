# Repo Organization

## Backend
- src/
    - ENTRYPOINT (main.go)
- pkg/
    - Go packages used in backend

## Frontend
- www/
    - index.html
    - css/
    - js/
        - emitted javascript
    - src/
        - ENTRYPOINT (main.ts)
        - data.ts : data objects defined here
        - types.ts : types defined here
        - cmp/
            - web components written here
            - map-window.ts is the class that creates the map