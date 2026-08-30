<script lang="ts">
  import type { ClaveFaceta, Maquina } from "@tipos";
  import { CANALES, ENTORNOS, FAMILIAS, MOTORES } from "@datos/taxonomias";
  import { alternarValor, encaja, recuentos } from "@lib/catalogo";
  import { filtros, limpiar } from "@lib/estado/filtros";

  /**
   * Facetas del catálogo.
   *
   * Cada opción lleva su recuento calculado con el resto de filtros aplicados,
   * y se deshabilita cuando ese recuento es cero: así nadie llega a una lista
   * vacía por marcar una casilla que nunca iba a dar resultados. Una opción ya
   * marcada nunca se deshabilita, o no habría forma de desmarcarla.
   */
  interface Props {
    catalogo: Maquina[];
    /** En móvil el panel arranca plegado y ocupa lo mínimo. */
    plegable?: boolean;
    alVerResultados?: () => void;
  }

  const { catalogo, plegable = false, alVerResultados }: Props = $props();

  interface Faceta {
    clave: ClaveFaceta;
    titulo: string;
    abierta: boolean;
    opciones: [string, string][];
    pertenece: (m: Maquina, valor: string) => boolean;
  }

  const FACETAS: Faceta[] = [
    {
      clave: "familias",
      titulo: "Familia",
      abierta: true,
      opciones: Object.entries(FAMILIAS).map(([k, v]) => [k, v.nombre]),
      pertenece: (m, v) => m.familia === v,
    },
    {
      clave: "canales",
      titulo: "Cómo lo quieres",
      abierta: true,
      opciones: Object.entries(CANALES),
      pertenece: (m, v) => (m.canales as string[]).includes(v),
    },
    {
      clave: "entornos",
      titulo: "Entorno",
      abierta: false,
      opciones: Object.entries(ENTORNOS),
      pertenece: (m, v) => (m.entornos as string[]).includes(v),
    },
    {
      clave: "motores",
      titulo: "Motorización",
      abierta: false,
      opciones: Object.entries(MOTORES),
      pertenece: (m, v) => (m.motores as string[]).includes(v),
    },
  ];

  const cuentas = $derived.by(() => {
    const salida: Record<string, Record<string, number>> = {};
    for (const faceta of FACETAS) {
      salida[faceta.clave] = recuentos(
        catalogo,
        $filtros,
        faceta.clave,
        faceta.opciones.map(([valor]) => valor),
        faceta.pertenece,
      );
    }
    return salida;
  });

  /* Cuántas quedarían al marcar "cero emisiones", con lo demás tal como está. */
  const cuentaCero = $derived(
    catalogo.filter((m) => m.cero && encaja(m, $filtros, "cero")).length,
  );

  const marcada = (clave: ClaveFaceta, valor: string): boolean =>
    (($filtros[clave] as string[]) ?? []).includes(valor);

  function alternarFaceta(clave: ClaveFaceta, valor: string): void {
    const actual = $filtros[clave] as string[];
    filtros.setKey(clave, alternarValor(actual, valor) as never);
  }
</script>

{#snippet cuerpo()}
  <div class="filters__top">
    <h3>Filtros</h3>
    <button type="button" class="btn btn--ghost btn--sm" onclick={limpiar}>Limpiar</button>
  </div>

  <div>
    {#each FACETAS as faceta (faceta.clave)}
      <details class="fgroup" open={faceta.abierta}>
        <summary>
          {faceta.titulo}
          <svg class="ico chev" aria-hidden="true" focusable="false">
            <use href="#i-chevron-down"></use>
          </svg>
        </summary>
        <div class="fgroup__body">
          {#each faceta.opciones as [valor, etiqueta] (valor)}
            {@const n = cuentas[faceta.clave]?.[valor] ?? 0}
            <label class="check">
              <input
                type="checkbox"
                checked={marcada(faceta.clave, valor)}
                disabled={n === 0 && !marcada(faceta.clave, valor)}
                onchange={() => alternarFaceta(faceta.clave, valor)}
              />
              <span>{etiqueta}</span>
              <span class="n">{n}</span>
            </label>
          {/each}
        </div>
      </details>
    {/each}

    <details class="fgroup" open>
      <summary>
        Sostenibilidad
        <svg class="ico chev" aria-hidden="true" focusable="false">
          <use href="#i-chevron-down"></use>
        </svg>
      </summary>
      <div class="fgroup__body">
        <label class="check">
          <input
            type="checkbox"
            checked={$filtros.cero}
            onchange={(e) => filtros.setKey("cero", e.currentTarget.checked)}
          />
          <span>Solo cero emisiones</span>
          <span class="n">{cuentaCero}</span>
        </label>
      </div>
    </details>
  </div>
{/snippet}

<aside class="filters" role="search" aria-labelledby="h-filtros">
  {#if plegable}
    <details class="filtros-movil" id="filtros">
      <summary>
        <span id="h-filtros">Filtrar el catálogo</span>
        <svg class="ico chev" aria-hidden="true" focusable="false">
          <use href="#i-chevron-down"></use>
        </svg>
      </summary>
      {@render cuerpo()}
      <div class="filtros-movil__pie">
        <button type="button" class="btn btn--quiet btn--sm btn--block" onclick={alVerResultados}>
          Ver resultados
        </button>
      </div>
    </details>
  {:else}
    <div id="filtros">
      <span class="vh" id="h-filtros">Filtrar el catálogo</span>
      {@render cuerpo()}
    </div>
  {/if}
</aside>
