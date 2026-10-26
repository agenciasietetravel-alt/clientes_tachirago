#!/bin/zsh
traer () {
  local edo=$1 archivo=$2
  cat > /tmp/q_vias_$archivo.ql <<Q
[out:json][timeout:300];
area["name"="$edo"]["admin_level"="4"]["boundary"="administrative"]->.a;
way["highway"~"^(motorway|trunk|primary|secondary)\$"](area.a);
out geom;
Q
  curl -s --max-time 340 -A "AndesGOO/1.0 (tachiragoo.com)" --data-urlencode "data@/tmp/q_vias_$archivo.ql" \
    https://overpass-api.de/api/interpreter -o ${archivo}_vias.json
  echo "$archivo: $(wc -c < ${archivo}_vias.json) bytes  inicio=$(head -c 24 ${archivo}_vias.json)"
}
traer "Táchira" tachira
sleep 5
traer "Mérida" merida
sleep 5
traer "Trujillo" trujillo
