# Pokedex

Aplicación móvil construida con React Native y Expo que consume la [PokéAPI](https://pokeapi.co) para listar y explorar Pokémon, con soporte de caché local y scroll infinito.

---

## Requisitos previos

- Node.js >= 18
- npm >= 9
- Expo Go instalado en el dispositivo o un emulador Android/iOS configurado

---

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

Escanea el QR con Expo Go, o presiona `a` para Android / `i` para iOS.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo Expo |
| `npm run android` | Abre en emulador Android |
| `npm run ios` | Abre en simulador iOS |
| `npm run web` | Abre en navegador |
| `npm test` | Ejecuta los tests unitarios |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Tests con reporte de cobertura |

---

## Tests unitarios

Los tests cubren las capas de dominio e infraestructura. No dependen de React Native ni de ningún framework de UI, por lo que corren en entorno `node` puro con `ts-jest`.

```bash
npm test
```

### Cobertura

| Archivo | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| `data/cache/DaysCacheStrategy.ts` | 100% | 100% | 100% | 100% |
| `data/cache/HoursCacheStrategy.ts` | 100% | 100% | 100% | 100% |
| `data/cache/MinutesCacheStrategy.ts` | 100% | 100% | 100% | 100% |
| `data/cache/InfiniteCacheStrategy.ts` | 100% | 100% | 100% | 100% |
| `data/local/MemoryLocalDataSource.ts` | 68.75% | 100% | 100% | 68.75% |
| `services/PokemonRepositoryWithCache.ts` | 96.87% | 57.14% | 100% | 96.77% |

Las líneas no cubiertas en `MemoryLocalDataSource` corresponden a los bloques `catch` de errores internos del `Map`, que no son alcanzables en condiciones normales. La rama no cubierta en `PokemonRepositoryWithCache` es el bloque `catch` del intento de guardado en caché, que requeriría simular un fallo en el data source.

---

## Decisiones técnicas

### Arquitectura

El proyecto aplica principios **SOLID** con **Clean Architecture** aplicando separación estricta en capas. La regla de dependencia se respeta en todo momento: cada capa solo importa hacia adentro.

```
Presentación → Aplicación → Servicios/Datos → Dominio
```

#### Capas

```
app/                        ← Presentación: Expo Router
src/
  domain/                   ← Dominio: interfaces y modelos puros (sin dependencias)
    model/                  ← PokemonRepository (contrato), PokemonDetail, CachedPokemon...
    constant/               ← Config (URL base de la API)
  data/                     ← Datos: adaptadores de persistencia y estrategias de caché
    local/                  ← ILocalDataSource + implementaciones (Memory, AsyncStorage)
    cache/                  ← ICacheStrategy + implementaciones (Days, Hours, Minutes, Infinite)
  services/                 ← Infraestructura: repositorios concretos y contenedor de DI
  hooks/                    ← Aplicación: casos de uso como hooks de React
  component/                ← Componentes de UI reutilizables
```

---

### Dependencias

#### Expo

Se eligió Expo como plataforma de desarrollo por su ecosistema maduro y su capacidad de acelerar el ciclo de desarrollo sin sacrificar acceso a APIs nativas.

#### NativeWind

NativeWind v4 permite usar clases de utilidad de Tailwind CSS directamente en componentes React Native mediante la prop `className`. El mismo sistema de diseño (escala de colores, espaciado, tipografía) que se usaría en una web también aplica en mobile, reduciendo la fricción entre plataformas.egibles sin saltar a otro archivo.

#### @react-native-async-storage/async-storage

Se utiliza como repositorio de persistencia para la caché en disco. Solo como ejemplo de aplicación de la interfaz `ILocalDataSource`. El resto del sistema nunca importa AsyncStorage directamente, lo que permite sustituirlo (por ejemplo, por WatermelonDB o PouchDB) sin tocar ninguna otra capa. En entornos de test se usa `MemoryLocalDataSource`, que implementa la misma interfaz con un `Map` en memoria, sin necesidad de mockear el módulo nativo.

#### Jest

Se eligió Jest con `ts-jest` para los tests unitarios. Las capas de dominio, datos y servicios son TypeScript puro sin dependencias de React Native, por lo que los tests corren directamente en Node sin necesidad de configurar un emulador o jsdom con mocks nativos. Transpila TypeScript directamente en Jest sin requerir un paso de compilación previo, manteniendo los tipos en los tests y detectando errores de tipos en tiempo de testing.

---

### Patrones de diseño aplicados

#### Repository + Decorator
`PokemonRepository` es la interfaz central del dominio. `PokemonPokeApiRepository` la implementa accediendo a la red. `PokemonRepositoryWithCache` también la implementa, pero envuelve a cualquier otro `PokemonRepository` agregando caché transparentemente. La capa de aplicación (hooks) trabaja únicamente con la interfaz, nunca con las implementaciones concretas.

#### Strategy (caché TTL)
`ICacheStrategy` define el contrato para determinar si una entrada de caché sigue siendo válida. Las cuatro implementaciones (`DaysCacheStrategy`, `HoursCacheStrategy`, `MinutesCacheStrategy`, `InfiniteCacheStrategy`) son intercambiables en tiempo de ejecución a través de `DependencyContainer.setCacheStrategy()`.

#### Inyección de dependencias manual
`DependencyContainer` actúa como raíz de composición del sistema. Todas las dependencias se resuelven y conectan en un único lugar, siguiendo el principio de inversión de dependencias: `PokemonRepositoryWithCache` recibe sus colaboradores (`PokemonRepository`, `ILocalDataSource`, `ICacheStrategy`) por constructor, sin instanciarlos internamente.

#### Modelo de caché separado
`CachedPokemon` es un modelo distinto a `PokemonDetail`. Su propósito es aplanar la estructura anidada de la API (por ejemplo, `sprites.other['official-artwork'].front_default` se convierte en `sprites.officialArtwork`) para facilitar y optimizar la serialización en el almacenamiento local. `PokemonRepositoryWithCache` se encarga de la conversión entre ambos modelos en `serializePokemon` y `deserializePokemon`.
