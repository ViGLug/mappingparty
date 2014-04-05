import lxml.builder
from lxml import etree
import time
import json

last_used_id = 0;

def addNode (js):
    global last_used_id
    last_used_id = last_used_id + 1
    E = lxml.builder.ElementMaker()
    node =  E.node(
        E.Attribute('', id=str(-last_used_id), visible="true", timestamp=time.strftime(str(123)))
    )
    return node

jsonText = "{_id:\"asd\", timestamp:\"123123123\"}"
osm = etree.Element('osm')
osm.append(addNode(jsonText))

# pretty string
s = etree.tostring(osm, pretty_print=True)
print s
