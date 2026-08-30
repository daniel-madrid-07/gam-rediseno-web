<script lang="ts">
  import type { Snippet } from "svelte";
  import { dialogoAbierto } from "@lib/estado/interfaz";

  /**
   * Base de todos los diálogos.
   *
   * Usa `<dialog>` nativo con `showModal()`, que ya resuelve gratis lo que a
   * mano sale mal casi siempre: el foco queda atrapado dentro, el fondo se
   * vuelve inerte, Escape cierra y el elemento se anuncia como diálogo modal.
   * Lo único que hay que añadir es devolver el foco a quien lo abrió, porque
   * eso sí depende de la aplicación.
   */
  interface Props {
    /** Identificador con el que se abre desde el átomo compartido. */
    nombre: string;
    clase?: string;
    etiqueta?: string;
    etiquetadoPor?: string;
    children: Snippet;
  }

  const { nombre, clase = "", etiqueta, etiquetadoPor, children }: Props = $props();

  let elemento = $state<HTMLDialogElement | null>(null);
  let quienAbrio: HTMLElement | null = null;

  const abierto = $derived($dialogoAbierto === nombre);

  $effect(() => {
    const dialogo = elemento;
    if (!dialogo) return;

    if (abierto && !dialogo.open) {
      quienAbrio = document.activeElement as HTMLElement | null;
      dialogo.showModal();
    } else if (!abierto && dialogo.open) {
      dialogo.close();
    }
  });

  /** Cierra tanto si lo pide el botón como si lo pide la tecla Escape. */
  function alCerrar(): void {
    if ($dialogoAbierto === nombre) dialogoAbierto.set(null);
    if (quienAbrio?.isConnected) quienAbrio.focus();
    quienAbrio = null;
  }

  /** Pulsar sobre el fondo oscuro cierra; sobre el panel, no. */
  function alPulsarFondo(evento: MouseEvent): void {
    if (evento.target === elemento) dialogoAbierto.set(null);
  }
</script>

<dialog
  bind:this={elemento}
  class={clase}
  aria-label={etiquetadoPor ? undefined : etiqueta}
  aria-labelledby={etiquetadoPor}
  onclose={alCerrar}
  onclick={alPulsarFondo}
>
  {@render children()}
</dialog>
