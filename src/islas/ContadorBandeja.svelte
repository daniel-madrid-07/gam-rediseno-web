<script lang="ts">
  import { totalSeleccion } from "@lib/estado/seleccion";
  import { dialogoAbierto } from "@lib/estado/interfaz";
  import { plural } from "@lib/texto";

  /**
   * Botón de la bandeja en la cabecera.
   *
   * Es una isla diminuta a propósito: lo único que necesita hidratarse de toda
   * la cabecera es este número, porque cambia cuando alguien añade una máquina
   * desde el catálogo, que está a media página de distancia.
   */

  const total = $derived($totalSeleccion);
  const etiqueta = $derived(
    `Mi selección de equipos, ${total} ${plural(total, "equipo", "equipos")}`,
  );
</script>

<button
  type="button"
  class="iconbtn"
  id="btn-tray"
  aria-haspopup="dialog"
  aria-label={etiqueta}
  onclick={() => dialogoAbierto.set("bandeja")}
>
  <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-clipboard"></use></svg>
  <span class="iconbtn__n" data-empty={total === 0} aria-hidden="true">{total}</span>
</button>
