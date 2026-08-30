<script lang="ts">
  import type { ClaveEntorno, ClaveFamilia } from "@datos/taxonomias";
  import type { Maquina } from "@tipos";
  import { MAXIMO_PROPUESTAS, PASOS } from "@datos/asistente";
  import { FILTROS_VACIOS, consultar } from "@lib/catalogo";
  import { filtros } from "@lib/estado/filtros";
  import { dialogoAbierto } from "@lib/estado/interfaz";
  import { fuente, hayFoto, textoAlternativo } from "@lib/fotos";
  import { plural } from "@lib/texto";
  import { EMPRESA } from "@/config/sitio";
  import Dialogo from "./Dialogo.svelte";

  /**
   * Asistente de selección: tres preguntas y una recomendación.
   *
   * Existe porque mucha gente sabe qué trabajo tiene que hacer pero no cómo se
   * llama la máquina que lo hace, y un catálogo con 35 nombres técnicos no le
   * sirve de nada. Las respuestas se traducen a los mismos filtros del
   * catálogo, así que al final se puede aplicar el resultado y seguir afinando.
   */
  interface Props {
    catalogo: Maquina[];
  }

  const { catalogo }: Props = $props();

  let paso = $state(0);
  const respuestas = $state<Record<string, string>>({ familias: "", entornos: "", cero: "" });

  const enResultado = $derived(paso >= PASOS.length);

  const filtrosDelAsistente = $derived({
    ...FILTROS_VACIOS,
    familias: respuestas["familias"] ? [respuestas["familias"] as ClaveFamilia] : [],
    entornos: respuestas["entornos"] ? [respuestas["entornos"] as ClaveEntorno] : [],
    cero: respuestas["cero"] === "1",
  });

  const propuestas = $derived(
    enResultado ? consultar(catalogo, filtrosDelAsistente).slice(0, MAXIMO_PROPUESTAS) : [],
  );

  function responder(valor: string): void {
    const faceta = PASOS[paso]?.faceta;
    if (faceta) respuestas[faceta] = valor;
    paso += 1;
  }

  function empezarDeNuevo(): void {
    paso = 0;
    for (const clave of Object.keys(respuestas)) respuestas[clave] = "";
  }

  function aplicarAlCatalogo(): void {
    filtros.set(filtrosDelAsistente);
    dialogoAbierto.set(null);
    setTimeout(() => document.getElementById("catalogo")?.scrollIntoView({ block: "start" }), 60);
  }

  function abrirFamilia(maquina: Maquina): void {
    filtros.set({ ...filtrosDelAsistente, familias: [maquina.familia] });
    dialogoAbierto.set(null);
    setTimeout(() => {
      document.getElementById(`maq-${maquina.id}`)?.scrollIntoView({ block: "center" });
      document.getElementById(`maq-${maquina.id}`)?.focus();
    }, 260);
  }
</script>

<Dialogo nombre="asistente" clase="side" etiquetadoPor="wz-title">
  <div class="side__panel">
    <div class="side__top">
      <svg class="ico" aria-hidden="true" focusable="false" style="color:var(--gam-ink)">
        <use href="#i-sliders"></use>
      </svg>
      <h2 id="wz-title">Asistente de selección</h2>
      <button
        type="button"
        class="iconbtn"
        aria-label="Cerrar el asistente"
        onclick={() => dialogoAbierto.set(null)}
      >
        <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-close"></use></svg>
      </button>
    </div>

    <div class="side__body" aria-live="polite">
      {#if !enResultado}
        {@const actual = PASOS[paso]}
        <div>
          <h3>{actual?.pregunta}</h3>
          <p class="t-sm t-muted" style="margin-block-start:var(--s2)">{actual?.ayuda}</p>
        </div>
        <div class="stack s3">
          {#each actual?.opciones ?? [] as opcion (opcion.titulo)}
            <button
              type="button"
              class="trayitem"
              style="inline-size:100%;text-align:start;cursor:pointer"
              onclick={() => responder(opcion.valor)}
            >
              <svg class="ico" aria-hidden="true" focusable="false">
                <use href={`#${opcion.icono}`}></use>
              </svg>
              <span class="grow">
                <b>{opcion.titulo}</b>
                <small>{opcion.detalle}</small>
              </span>
              <svg class="ico" aria-hidden="true" focusable="false">
                <use href="#i-chevron-right"></use>
              </svg>
            </button>
          {/each}
        </div>
      {:else if propuestas.length === 0}
        <h3>Sin familia estándar para esa combinación</h3>
        <p class="t-sm t-muted">
          Consulta con el equipo técnico: muchos trabajos se resuelven con una configuración a
          medida.
        </p>
        <a class="btn btn--gam" href={`tel:${EMPRESA.telefonoE164}`}>
          <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-phone"></use></svg>
          {EMPRESA.telefono}
        </a>
      {:else}
        <h3>
          {propuestas.length}
          {plural(propuestas.length, "familia encaja", "familias encajan")} con lo que necesitas
        </h3>
        <p class="t-sm t-muted">
          Familias que cumplen las tres condiciones. El modelo concreto y su disponibilidad los
          confirma tu delegación.
        </p>

        <div class="stack s3">
          {#each propuestas as maquina (maquina.id)}
            <button
              type="button"
              class="trayitem"
              style="inline-size:100%;text-align:start;cursor:pointer"
              onclick={() => abrirFamilia(maquina)}
            >
              {#if hayFoto(maquina.id)}
                {@const foto = fuente(maquina.id)}
                <img
                  src={foto.src}
                  srcset={foto.srcset}
                  sizes="4rem"
                  alt={textoAlternativo(maquina.id, maquina.nombre)}
                  width="800"
                  height="600"
                  loading="lazy"
                  decoding="async"
                />
              {:else}
                <svg class="ico" aria-hidden="true" focusable="false">
                  <use href={`#${maquina.icono}`}></use>
                </svg>
              {/if}
              <span class="grow">
                <b>{maquina.nombre}</b>
                <small>{maquina.ficha[0]?.[0]}: {maquina.ficha[0]?.[1]}</small>
              </span>
              <svg class="ico" aria-hidden="true" focusable="false">
                <use href="#i-arrow-right"></use>
              </svg>
            </button>
          {/each}
        </div>

        <button type="button" class="btn btn--gam btn--block" onclick={aplicarAlCatalogo}>
          <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-filter"></use></svg>
          Filtrar el catálogo con esta respuesta
        </button>
      {/if}
    </div>

    <div class="side__foot">
      <div class="row">
        <button
          type="button"
          class="btn btn--ghost btn--sm"
          disabled={paso === 0}
          onclick={() => (paso = Math.max(0, paso - 1))}
        >
          Atrás
        </button>
        <span class="grow t-xs t-muted num" style="text-align:end">
          {enResultado ? "Resultado" : `Paso ${paso + 1} de ${PASOS.length}`}
        </span>
      </div>
      <button type="button" class="btn btn--ghost btn--sm btn--block" onclick={empezarDeNuevo}>
        <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-refresh"></use></svg>
        Empezar de nuevo
      </button>
    </div>
  </div>
</Dialogo>
