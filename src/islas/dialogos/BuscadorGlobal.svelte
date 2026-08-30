<script lang="ts">
  import type { Resultado } from "@tipos";
  import { buscar, type EntradaIndice } from "@lib/buscador";
  import { resaltar } from "@lib/texto";
  import { dialogoAbierto } from "@lib/estado/interfaz";
  import { filtros } from "@lib/estado/filtros";
  import Dialogo from "./Dialogo.svelte";

  /**
   * Buscador global, al estilo paleta de comandos.
   *
   * Se abre con Ctrl+K o con la barra, igual que en las herramientas que ya usa
   * a diario cualquiera que trabaje con un ordenador. El patrón ARIA es
   * `combobox` con `listbox`: el foco no se mueve nunca del campo de texto y la
   * opción activa se señala con `aria-activedescendant`, que es lo que permite
   * seguir escribiendo mientras se recorre la lista con las flechas.
   */
  interface Props {
    /** Índice ya aplanado en build: aquí no se recorre el catálogo entero. */
    indice: EntradaIndice[];
  }

  const { indice }: Props = $props();

  let consulta = $state("");
  let activo = $state(0);
  let campo = $state<HTMLInputElement | null>(null);

  const resultados = $derived(buscar(indice, consulta));
  const abierto = $derived($dialogoAbierto === "buscador");

  $effect(() => {
    if (abierto) {
      consulta = "";
      activo = 0;
      setTimeout(() => campo?.focus(), 40);
    }
  });

  $effect(() => {
    void resultados;
    activo = 0;
  });

  function mover(paso: number): void {
    if (resultados.length === 0) return;
    activo = (activo + paso + resultados.length) % resultados.length;
    document
      .getElementById(`pal-${activo}`)
      ?.scrollIntoView({ block: "nearest" });
  }

  function abrirResultado(resultado: Resultado): void {
    dialogoAbierto.set(null);

    if (resultado.tipo === "maquina") {
      // La búsqueda del catálogo se queda puesta, para que se vea por qué salió
      filtros.setKey("busqueda", resultado.titulo);
    }

    setTimeout(() => {
      document.querySelector(resultado.href)?.scrollIntoView({ block: "start" });
      if (resultado.tipo === "maquina") {
        setTimeout(() => document.getElementById(`maq-${resultado.id}`)?.focus(), 300);
      }
    }, 60);
  }

  function alTeclear(evento: KeyboardEvent): void {
    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      mover(1);
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      mover(-1);
    } else if (evento.key === "Enter") {
      const elegido = resultados[activo];
      if (elegido) {
        evento.preventDefault();
        abrirResultado(elegido);
      }
    }
  }
</script>

<Dialogo nombre="buscador" clase="palette" etiqueta="Buscar en todo el sitio">
  <div class="palette__panel">
    <div class="palette__q">
      <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-search"></use></svg>
      <label class="vh" for="pal-q">Buscar máquinas, servicios y delegaciones</label>
      <input
        type="text"
        id="pal-q"
        bind:this={campo}
        bind:value={consulta}
        onkeydown={alTeclear}
        placeholder="Busca una máquina, un servicio o tu delegación…"
        autocomplete="off"
        spellcheck="false"
        role="combobox"
        aria-expanded="true"
        aria-controls="pal-out"
        aria-autocomplete="list"
        aria-activedescendant={resultados.length ? `pal-${activo}` : undefined}
      />
      <span class="palette__esc">Esc</span>
    </div>

    <div class="palette__out" id="pal-out" role="listbox" aria-label="Resultados de búsqueda">
      {#each resultados as resultado, indice (`${resultado.tipo}-${resultado.id}`)}
        <button
          type="button"
          id={`pal-${indice}`}
          role="option"
          aria-selected={indice === activo}
          data-activo={indice === activo}
          onmousemove={() => (activo = indice)}
          onclick={() => abrirResultado(resultado)}
        >
          <svg class="ico" aria-hidden="true" focusable="false">
            <use href={`#${resultado.icono}`}></use>
          </svg>
          <span class="grow">
            <b>
              {#each resaltar(resultado.titulo, consulta) as tramo}
                {#if tramo.marcado}<mark>{tramo.texto}</mark>{:else}{tramo.texto}{/if}
              {/each}
            </b>
            <small>{resultado.detalle}</small>
          </span>
        </button>
      {:else}
        <p class="t-sm t-muted" style="padding:var(--s4)">
          {consulta.trim().length < 2
            ? "Escribe al menos dos letras."
            : "Sin resultados. Prueba con otra palabra."}
        </p>
      {/each}
    </div>

    <div class="palette__foot">
      <span><kbd>↑</kbd><kbd>↓</kbd> moverse</span>
      <span><kbd>Enter</kbd> abrir</span>
      <span><kbd>Esc</kbd> cerrar</span>
    </div>
  </div>
</Dialogo>

<svelte:window
  onkeydown={(evento) => {
    const activoAhora = document.activeElement;
    const escribiendo =
      activoAhora instanceof HTMLElement &&
      /^(INPUT|TEXTAREA|SELECT)$/.test(activoAhora.tagName);

    if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "k") {
      evento.preventDefault();
      dialogoAbierto.set("buscador");
    } else if (evento.key === "/" && !escribiendo) {
      evento.preventDefault();
      dialogoAbierto.set("buscador");
    }
  }}
/>
