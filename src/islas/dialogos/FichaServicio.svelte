<script lang="ts">
  import type { Servicio } from "@tipos";
  import { dialogoAbierto } from "@lib/estado/interfaz";
  import { fuente, hayFoto, textoAlternativo } from "@lib/fotos";
  import { EMPRESA } from "@/config/sitio";
  import Dialogo from "./Dialogo.svelte";

  /**
   * Detalle de un servicio.
   *
   * Un único diálogo sirve para los diez: el identificador viaja en el átomo
   * compartido con el prefijo `servicio:`. Diez diálogos en el HTML serían diez
   * veces el mismo marcado y diez veces las fotos en el documento.
   */
  interface Props {
    servicios: Servicio[];
  }

  const { servicios }: Props = $props();

  const PREFIJO = "servicio:";

  const activo = $derived.by(() => {
    const abierto = $dialogoAbierto;
    if (!abierto?.startsWith(PREFIJO)) return null;
    return servicios.find((s) => s.id === abierto.slice(PREFIJO.length)) ?? null;
  });
</script>

{#if activo}
  <Dialogo nombre={`${PREFIJO}${activo.id}`} clase="sheet" etiquetadoPor="sheet-title">
    <div class="sheet__panel">
      <div class="sheet__top">
        <div class="svc__ico">
          <svg class="ico" aria-hidden="true" focusable="false">
            <use href={`#${activo.icono}`}></use>
          </svg>
        </div>
        <div class="grow">
          <span class="kicker">{activo.resumen}</span>
          <h2 id="sheet-title">{activo.nombre}</h2>
        </div>
        <button
          type="button"
          class="iconbtn"
          aria-label="Cerrar el detalle del servicio"
          onclick={() => dialogoAbierto.set(null)}
        >
          <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-close"></use></svg>
        </button>
      </div>

      <div class="sheet__body">
        {#if hayFoto(activo.id)}
          {@const foto = fuente(activo.id)}
          <img
            class="sheet__shot"
            src={foto.src}
            srcset={foto.srcset}
            sizes="(min-width: 48rem) 42rem, 92vw"
            alt={textoAlternativo(activo.id, activo.nombre)}
            width="800"
            height="600"
            loading="lazy"
            decoding="async"
          />
        {/if}

        <p class="sheet__lede">{activo.descripcion}</p>
        <p>{activo.detalle}</p>

        <div>
          <h3 style="margin-block-end:var(--s4)">Qué incluye</h3>
          <ul class="ticks" role="list">
            {#each activo.puntos as punto (punto)}
              <li>
                <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-check"></use></svg>
                {punto}
              </li>
            {/each}
          </ul>
        </div>
      </div>

      <div class="sheet__foot">
        <a
          class="btn btn--gam"
          href={activo.enlace.href}
          target={activo.enlace.externo ? "_blank" : undefined}
          rel={activo.enlace.externo ? "noopener" : undefined}
          onclick={() => {
            if (!activo.enlace.externo) dialogoAbierto.set(null);
          }}
        >
          {activo.enlace.texto}
          <svg class="ico" aria-hidden="true" focusable="false">
            <use href={activo.enlace.externo ? "#i-external" : "#i-arrow-right"}></use>
          </svg>
        </a>
        <a class="btn btn--ghost" href={`tel:${EMPRESA.telefonoE164}`}>
          <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-phone"></use></svg>
          {EMPRESA.telefono}
        </a>
      </div>
    </div>
  </Dialogo>
{/if}
