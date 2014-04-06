#! /bin/python
import lxml.builder
from lxml import etree
import time
import json

last_used_id = 0

# Set dummy lat and lon to be able to box properly the changes
min_lat = 90
max_lat = -90
min_lon = 180
max_lon = -180

def minMax (lat, lon):
    global min_lat
    global max_lat
    global min_lon
    global max_lon
    if lat < min_lat:
        min_lat = lat
    if lat > max_lat:
        max_lat = lat
    if lon < min_lon:
        min_lon = lon
    if lon > max_lon:
        max_lon = lon

def node (latitude, longitude, timestamp, attributes):
    global last_used_id
    minMax(latitude, longitude)
    last_used_id = last_used_id + 1
    E = lxml.builder.ElementMaker()
    node =  E.node(
        id = str(-last_used_id),
        visible = "true",
        version = "1",
        lat = latitude,
        lon = longitude,
        timestamp=time.strftime(timestamp)
    )
    return node

jsonText = "{_id:\"asd\", timestamp:\"123123123\"}"
osm = etree.Element('osm')
osm.append(node('52', '23', '123123123', dict(lol='asd')))
osm.insert(0,lxml.builder.ElementMaker().bounds(
    minlat=str(min_lat),
    minlon=str(min_lon),
    maxlat=str(max_lat),
    maxlon=str(max_lon),
    origin='Thistool')
)

# pretty string
s = etree.tostring(osm, pretty_print=True)
print s
