<script lang="ts">
  import { filtros } from "@lib/estado/filtros";
  import { dialogoAbierto } from "@lib/estado/interfaz";

  /**
   * Buscador del héroe: el punto de entrada real al catálogo.
   *
   * Escribe en el mismo átomo de filtros que usa el explorador, así que teclear
   * aquí filtra allí y además queda reflejado en la URL. No hay que pasar nada
   * entre las dos islas: comparten estado, no props.
   */

  let consulta = $state("");

  const SUGERENCIAS = [
    { texto: "Plataforma de tijera", busca: "tijera" },
    { texto: "Carretilla elevadora", busca: "carretilla" },
    { texto: "Grupo electrógeno", busca: "grupo electrogeno" },
    { texto: "Caseta de obra", busca: "caseta" },
  ];

  function irAlCatalogo(termino: string): void {
    consulta = termino;
    filtros.setKey("busqueda", termino);
    document.getElementById("catalogo")?.scrollIntoView({ block: "start" });
  }

  function alEnviar(evento: SubmitEvent): void {
    evento.preventDefault();
    irAlCatalogo(consulta);
  }
</script>

<search class="shelf" id="buscador" aria-label="Buscar maquinaria en el catálogo">
  <div class="shelf__card">
    <div class="shelf__lead">
      <h2>Buscar en el catálogo</h2>
      <p>35 familias de maquinaria, filtrables por altura, carga, entorno y motorización.</p>
    </div>

    <form class="shelf__form" onsubmit={alEnviar}>
      <div class="field-search">
        <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-search"></use></svg>
        <label class="vh" for="q-hero">Buscar una máquina en el catálogo</label>
        <input
          type="search"
          id="q-hero"
          bind:value={consulta}
          placeholder="Tijera, carretilla, grupo electrógeno, caseta…"
          autocomplete="off"
          spellcheck="false"
          enterkeyhint="search"
          aria-describedby="q-hero-ayuda"
        />
        {#if consulta}
          <button
            type="button"
            class="field-search__x"
            aria-label="Borrar la búsqueda"
            onclick={() => irAlCatalogo("")}
          >
            <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-close"></use></svg>
          </button>
        {/if}
      </div>

      <button type="submit" class="btn btn--gam btn--lg">
        Buscar
        <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-arrow-right"></use></svg>
      </button>
    </form>

    <div class="shelf__hints">
      <b id="q-hero-ayuda">Frecuentes:</b>
      {#each SUGERENCIAS as sugerencia (sugerencia.busca)}
        <button
          type="button"
          class="chip chip--ghost"
          onclick={() => irAlCatalogo(sugerencia.busca)}
        >
          {sugerencia.texto}
        </button>
      {/each}
      <button type="button" class="chip" onclick={() => dialogoAbierto.set("asistente")}>
        <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-sliders"></use></svg>
        No sé cuál necesito
      </button>
    </div>
  </div>
</search>
