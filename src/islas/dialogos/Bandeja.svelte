<script lang="ts">
  import type { Maquina } from "@tipos";
  import { FAMILIAS } from "@datos/taxonomias";
  import { fuente, hayFoto, textoAlternativo } from "@lib/fotos";
  import { quitar, seleccion, vaciar } from "@lib/estado/seleccion";
  import { avisar, dialogoAbierto } from "@lib/estado/interfaz";
  import Dialogo from "./Dialogo.svelte";

  /**
   * La selección de equipos para pedir presupuesto de una vez.
   *
   * Al enviarla se rellena el mensaje del formulario con los nombres y se lleva
   * el foco allí: quien ha reunido seis familias no debería tener que
   * escribirlas otra vez a mano.
   */
  interface Props {
    catalogo: Maquina[];
  }

  const { catalogo }: Props = $props();

  const elegidas = $derived(
    $seleccion
      .map((id) => catalogo.find((m) => m.id === id))
      .filter((m): m is Maquina => Boolean(m)),
  );

  function irAlFormulario(): void {
    dialogoAbierto.set(null);
    const nombres = elegidas.map((m) => m.nombre);
    const area = document.getElementById("f-mensaje");
    if (area instanceof HTMLTextAreaElement && nombres.length) {
      area.value = `Quiero presupuesto para: ${nombres.join("; ")}.`;
      area.dispatchEvent(new Event("input", { bubbles: true }));
      setTimeout(() => area.focus(), 420);
    }
  }
</script>

<Dialogo nombre="bandeja" clase="side" etiquetadoPor="tray-title">
  <div class="side__panel">
    <div class="side__top">
      <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-clipboard"></use></svg>
      <h2 id="tray-title">Mi selección</h2>
      <button
        type="button"
        class="iconbtn"
        aria-label="Cerrar mi selección"
        onclick={() => dialogoAbierto.set(null)}
      >
        <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-close"></use></svg>
      </button>
    </div>

    <div class="side__body">
      {#if elegidas.length === 0}
        <div class="empty">
          <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-clipboard"></use></svg>
          <h3>Todavía no has elegido nada</h3>
          <p class="t-sm t-muted">
            Añade familias desde el catálogo y te preparamos un presupuesto con todas de una vez.
          </p>
          <button
            type="button"
            class="btn btn--quiet"
            onclick={() => {
              dialogoAbierto.set(null);
              document.getElementById("catalogo")?.scrollIntoView({ block: "start" });
            }}
          >
            Ir al catálogo
          </button>
        </div>
      {:else}
        {#each elegidas as maquina (maquina.id)}
          <div class="trayitem">
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

            <div class="grow">
              <b>{maquina.nombre}</b>
              <small>{FAMILIAS[maquina.familia].nombre}</small>
            </div>

            <button
              type="button"
              class="iconbtn"
              aria-label={`Quitar ${maquina.nombre} de mi selección`}
              onclick={() => {
                quitar(maquina.id);
                avisar(`Quitado de tu selección: ${maquina.nombre}`);
              }}
            >
              <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-trash"></use></svg>
            </button>
          </div>
        {/each}
      {/if}
    </div>

    <div class="side__foot">
      <button
        type="button"
        class="btn btn--gam btn--block"
        aria-disabled={elegidas.length === 0}
        onclick={irAlFormulario}
      >
        <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-mail"></use></svg>
        Pedir presupuesto de todo
      </button>
      <button
        type="button"
        class="btn btn--ghost btn--sm btn--block"
        onclick={() => {
          if (!elegidas.length) return;
          vaciar();
          avisar("Selección vaciada");
        }}
      >
        Vaciar la selección
      </button>
    </div>
  </div>
</Dialogo>
