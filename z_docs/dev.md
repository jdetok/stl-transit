# Catchall dev doc

## working with postgis docker
`
docker compose down --rmi all -v postgis && rm -r db/postgis
`<br>
`
docker compose up postgis --build
`