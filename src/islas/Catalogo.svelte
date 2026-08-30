<script lang="ts">
  import { onMount, tick } from "svelte";
  import type { Maquina, Orden } from "@tipos";
  import { consultar } from "@lib/catalogo";
  import { filtros, limpiar, sincronizarUrl } from "@lib/estado/filtros";
  import { plural } from "@lib/texto";
  import { EMPRESA } from "@/config/sitio";
  import PanelFiltros from "./catalogo/PanelFiltros.svelte";
  import ChipsActivos from "./catalogo/ChipsActivos.svelte";
  import FichaMaquina from "./catalogo/FichaMaquina.svelte";

  /**
   * Explorador del catálogo: filtros, resultados y paginación.
   *
   * Es la única isla grande de la página. El catálogo entero llega como prop
   * desde Astro (ya validado contra el esquema en build), así que aquí no hay
   * ninguna petición de red: filtrar 35 familias en memoria es instantáneo y
   * funciona igual con la cobertura de una obra que con fibra.
   */
  interface Props {
    catalogo: Maquina[];
  }

  const { catalogo }: Props = $props();

  const ORDENES: [Orden, string][] = [
    ["rel", "Relevancia"],
    ["az", "Nombre A–Z"],
    ["altura", "Mayor altura"],
    ["carga", "Mayor carga"],
    ["cero", "Cero emisiones primero"],
  ];

  /** En pantalla estrecha se muestran menos para no alargar el scroll. */
  const esEstrecha = (): boolean => window.matchMedia("(max-width: 47.99rem)").matches;

  let porPagina = $state(9);
  let visibles = $state(9);
  let plegable = $state(false);

  const resultados = $derived(consultar(catalogo, $filtros));
  const mostradas = $derived(resultados.slice(0, visibles));
  const quedan = $derived(resultados.length - mostradas.length);

  onMount(() => {
    const estrecha = esEstrecha();
    porPagina = estrecha ? 6 : 9;
    visibles = porPagina;
    plegable = estrecha;

    const consulta = window.matchMedia("(max-width: 47.99rem)");
    const alCambiarAncho = (evento: MediaQueryListEvent): void => {
      plegable = evento.matches;
      porPagina = evento.matches ? 6 : 9;
    };
    consulta.addEventListener("change", alCambiarAncho);

    const desincronizar = sincronizarUrl();
    return () => {
      consulta.removeEventListener("change", alCambiarAncho);
      desincronizar();
    };
  });

  /* Cambiar un filtro devuelve la lista al principio: seguir en la página 3 de
     unos resultados que ya no existen desorienta más de lo que ahorra. */
  $effect(() => {
    void $filtros;
    visibles = porPagina;
  });

  async function verMas(): Promise<void> {
    const primeraNueva = visibles;
    visibles += porPagina;
    await tick();
    // El foco va a la primera ficha recién cargada, no se queda en el botón
    document.querySelectorAll<HTMLElement>("#cat-results .card")[primeraNueva]?.focus();
  }

  function irAResultados(): void {
    document.getElementById("cat-results")?.scrollIntoView({ block: "start" });
  }
</script>

<div class="explorer">
  <PanelFiltros {catalogo} {plegable} alVerResultados={irAResultados} />

  <div>
    <div class="results__bar">
      <p class="results__n grow" role="status" aria-live="polite">
        <b>{resultados.length}</b>
        {plural(resultados.length, "familia", "familias")}
        {#if resultados.length !== catalogo.length}de {catalogo.length}{/if}
      </p>

      <div class="selectfield">
        <label for="cat-sort">Ordenar</label>
        <select
          id="cat-sort"
          value={$filtros.orden}
          onchange={(e) => filtros.setKey("orden", e.currentTarget.value as Orden)}
        >
          {#each ORDENES as [valor, etiqueta] (valor)}
            <option value={valor}>{etiqueta}</option>
          {/each}
        </select>
      </div>
    </div>

    <ChipsActivos />

    <div
      class="cards"
      id="cat-results"
      role="region"
      aria-live="polite"
      aria-label="Resultados del catálogo"
      hidden={resultados.length === 0}
    >
      {#each mostradas as maquina (maquina.id)}
        <FichaMaquina {maquina} />
      {/each}
    </div>

    {#if quedan > 0}
      <div class="more">
        <p>Mostrando {mostradas.length} de {resultados.length} familias</p>
        <button type="button" class="btn btn--quiet" onclick={verMas}>Ver más familias</button>
      </div>
    {/if}

    {#if resultados.length === 0}
      <div class="empty">
        <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-search"></use></svg>
        <h3>Sin resultados con esos filtros</h3>
        <p class="t-sm t-muted" style="max-inline-size:42ch">
          Prueba a quitar algún filtro, o llámanos al {EMPRESA.telefono} y buscamos la máquina
          contigo.
        </p>
        <button type="button" class="btn btn--quiet" onclick={limpiar}>
          Quitar todos los filtros
        </button>
      </div>
    {/if}
  </div>
</div>
