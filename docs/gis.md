# 🗺️ Morada AO - GIS Guide

## O que é GIS?

**GIS** (Geographic Information Systems) = Sistemas para capturar, armazenar, analisar e visualizar dados geográficos.

Morada AO usa **PostGIS** (extensão PostgreSQL) para:
- ✅ Operações geoespaciais (distância, proximidade, área)
- ✅ Queries eficientes de localização
- ✅ Análise de cobertura geográfica
- ✅ Integração com mapas

---

## PostGIS Basics

### Instalação

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-postgis

# macOS (Homebrew)
brew install postgis

# Windows
# Usar instalador oficial
```

### Habilitar PostGIS

```sql
-- Em cada database
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verificar
SELECT postgis_version();
-- postgis_version: 3.4.0
```

---

## Tipos de Dados

### GEOMETRY vs GEOGRAPHY

```sql
-- GEOMETRY (coordenadas planas, rápido)
SELECT ST_Point(13.2306, -8.8159)::GEOMETRY;

-- GEOGRAPHY (esférico, preciso para longas distâncias)
SELECT ST_Point(13.2306, -8.8159)::GEOGRAPHY;

-- Usar GEOGRAPHY para distâncias > 1km
-- Usar GEOMETRY para áreas urbanas pequenas
```

---

## Operações Comuns

### 1. Distância entre dois pontos

```sql
-- Distância em metros entre Luanda e Cazenga
SELECT ST_Distance(
  ST_GeomFromText('POINT(13.2306 -8.8159)', 4326)::GEOGRAPHY,  -- Luanda
  ST_GeomFromText('POINT(13.2286 -8.8739)', 4326)::GEOGRAPHY   -- Cazenga
);
-- Result: 6500 (metros ~ 6.5 km)
```

### 2. Endereços num raio (N km)

```sql
-- Encontrar endereços dentro de 5 km de um ponto
SELECT id, location_name, latitude, longitude,
  ST_Distance(
    geom::GEOGRAPHY,
    ST_GeomFromText('POINT(13.2306 -8.8159)', 4326)::GEOGRAPHY
  ) as distance_m
FROM addresses
WHERE ST_DWithin(
  geom::GEOGRAPHY,
  ST_GeomFromText('POINT(13.2306 -8.8159)', 4326)::GEOGRAPHY,
  5000  -- 5 km em metros
)
ORDER BY distance_m ASC;
```

### 3. Verificar se ponto está num polígono

```sql
-- Exemplo: Verificar se endereço está na província de Luanda
SELECT COUNT(*) 
FROM addresses
WHERE ST_Contains(
  (SELECT geom FROM provinces WHERE name = 'Luanda'),
  geom
);
```

### 4. Cluster de endereços

```sql
-- Agrupar endereços próximos (até 500 metros)
SELECT 
  ST_ClusterKMeans(geom, 10) OVER() as cluster_id,
  COUNT(*) as count,
  ST_Centroid(ST_Union(geom)) as center
FROM addresses
WHERE district = 'Luanda'
GROUP BY cluster_id;
```

### 5. Heatmap (densidade)

```sql
-- Calcular densidade de endereços por gridcell (1 km²)
SELECT 
  ST_AsText(cell),
  COUNT(*) as address_count,
  100 * COUNT(*) / (SELECT COUNT(*) FROM addresses) as percentage
FROM addresses,
  LATERAL ST_Subdivide(
    ST_MakeEnvelope(13.1, -8.9, 13.4, -8.7, 4326),
    8  -- Profundidade da quadtree
  ) cell
WHERE ST_Intersects(geom, cell)
GROUP BY cell
ORDER BY address_count DESC;
```

---

## Schema com PostGIS

### Tabela com Geometry

```sql
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  
  -- Coluna geoespacial
  geom GEOMETRY(POINT, 4326) GENERATED ALWAYS AS (
    ST_Point(longitude, latitude)
  ) STORED,
  
  location_name VARCHAR(255),
  district VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Índice espacial (GIST = Generalized Search Tree)
  CONSTRAINT enforce_dims_geom CHECK (ST_NDims(geom) = 2),
  CONSTRAINT enforce_srid_geom CHECK (ST_SRID(geom) = 4326)
);

-- Índice para queries rápidas
CREATE INDEX idx_addresses_geom ON addresses USING GIST(geom);
```

---

## Queries Avançadas

### 1. Routing (Distância mais curta)

```sql
-- Requer pgRouting extension
-- Encontrar rota mais curta entre dois endereços
SELECT route_id, ST_Length(geom) as distance_m
FROM route_summary
WHERE
  start_vertex = (SELECT id FROM addresses WHERE id = 'start-uuid')
  AND end_vertex = (SELECT id FROM addresses WHERE id = 'end-uuid');
```

### 2. Voronoi (Áreas de Cobertura)

```sql
-- Criar diagrama de Voronoi para distribuidoras
SELECT 
  distributor_id,
  ST_AsGeoJSON(ST_Intersection(
    ST_Envelope(ST_Union(geom)),
    ST_VoronoiPolygons(ST_Collect(geom))
  )) as service_area
FROM addresses
GROUP BY distributor_id;
```

### 3. Análise de Cobertura

```sql
-- % de Luanda com endereços registados
SELECT 
  100 * ST_Area(ST_Intersection(
    (SELECT ST_Union(geom) FROM addresses WHERE district = 'Luanda'),
    (SELECT geom FROM districts WHERE name = 'Luanda')
  )) / ST_Area((SELECT geom FROM districts WHERE name = 'Luanda'))
  as coverage_percentage;
```

### 4. Agregação Espacial

```sql
-- Resumo por bairro
SELECT 
  district,
  COUNT(*) as total_addresses,
  ST_Centroid(ST_Union(geom)) as center,
  ST_Area(ST_Envelope(ST_Union(geom))) as area_m2,
  COUNT(*) / (ST_Area(ST_Envelope(ST_Union(geom))) / 1000000) as density_per_km2
FROM addresses
GROUP BY district
ORDER BY total_addresses DESC;
```

---

## Performance Tips

### 1. Usar GIST Index

```sql
-- ✅ BOM: Com índice
SELECT * FROM addresses 
WHERE geom && 'POLYGON(...)'::GEOMETRY;

-- ❌ LENTO: Sem índice (full table scan)
SELECT * FROM addresses 
WHERE ST_Contains(polygon_geom, geom);
```

### 2. BRIN Index para séries temporais

```sql
-- Para queries por data + localização
CREATE INDEX idx_addresses_created_geom 
ON addresses USING BRIN (created_at, geom);
```

### 3. Simplificar Geometrias

```sql
-- Para visualizações web (menos pontos = mais rápido)
SELECT 
  id,
  ST_Simplify(geom, 0.0001) as simplified_geom  -- 0.0001 degrees ~ 10 metros
FROM addresses;
```

### 4. Usar ST_DWithin em vez de ST_Distance

```sql
-- ✅ RÁPIDO: Pode usar índice
SELECT * FROM addresses
WHERE ST_DWithin(geom, center_point, 5000);

-- ❌ LENTO: Sem índice
SELECT * FROM addresses
WHERE ST_Distance(geom, center_point) < 5000;
```

---

## Dados de Teste

### Inserir Localizações Angola

```sql
-- Capitais Provinciais
INSERT INTO places (name, province, geom) VALUES
  ('Luanda', 'Luanda', ST_GeomFromText('POINT(13.2306 -8.8159)', 4326)),
  ('Cazenga', 'Luanda', ST_GeomFromText('POINT(13.2286 -8.8739)', 4326)),
  ('Benguela', 'Benguela', ST_GeomFromText('POINT(13.4055 -12.5763)', 4326)),
  ('Huambo', 'Huambo', ST_GeomFromText('POINT(15.7975 -12.7769)', 4326)),
  ('Cabinda', 'Cabinda', ST_GeomFromText('POINT(13.9626 -5.0408)', 4326));
```

### Bairros de Luanda

```sql
-- Polígonos dos bairros (simplificado)
INSERT INTO districts (name, province, geom) VALUES
  ('Marginal', 'Luanda', ST_GeomFromText('POLYGON((13.20 -8.80, 13.30 -8.80, 13.30 -8.85, 13.20 -8.85, 13.20 -8.80))', 4326)),
  ('Miramar', 'Luanda', ST_GeomFromText('POLYGON((13.15 -8.85, 13.25 -8.85, 13.25 -8.95, 13.15 -8.95, 13.15 -8.85))', 4326));
```

---

## Ferramentas Úteis

### QGIS (Desktop)

```bash
# Visualizar dados PostGIS
# 1. Download: https://qgis.org
# 2. Conectar a PostgreSQL
# 3. Arrastar camadas para mapa
# 4. Criar visualizações
```

### pgAdmin (Web)

```bash
# Query editor visual
# 1. Abrir pgAdmin
# 2. Conectar a base de dados
# 3. Executar queries SQL
# 4. Ver resultados em tabela
```

### ST_AsGeoJSON (Web)

```sql
-- Converter para GeoJSON (para Leaflet/MapBox)
SELECT 
  id,
  ST_AsGeoJSON(geom) as geometry,
  location_name
FROM addresses
WHERE district = 'Luanda';

-- Resultado:
-- {
--   "geometry": {"type": "Point", "coordinates": [13.2306, -8.8159]},
--   "properties": {"id": "...", "location_name": "Marginal"}
-- }
```

---

## Integração com React Leaflet

```typescript
// Carregar endereços e mostrar no mapa
import L from 'leaflet';

async function loadAddresses() {
  const response = await fetch('/api/addresses?limit=1000');
  const { data: addresses } = await response.json();
  
  const geoJson = {
    type: 'FeatureCollection',
    features: addresses.map(addr => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [addr.longitude, addr.latitude]
      },
      properties: {
        name: addr.locationName,
        district: addr.district,
        plusCode: addr.plusCode
      }
    }))
  };
  
  L.geoJSON(geoJson, {
    onEachFeature: (feature, layer) => {
      layer.bindPopup(`<b>${feature.properties.name}</b><br/>${feature.properties.plusCode}`);
    }
  }).addTo(map);
}
```

---

## Referências

- [PostGIS Manual](https://postgis.net/docs/)
- [ST_Functions](https://postgis.net/docs/reference/functions/)
- [QGIS Documentation](https://docs.qgis.org/)
- [GeoJSON Spec](https://geojson.org/)
- [Leaflet.js Docs](https://leafletjs.com/)

---

**Last Updated:** 2025-01-15  
**Version:** 1.0.0
