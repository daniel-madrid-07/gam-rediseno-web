<script lang="ts">
  import { aviso } from "@lib/estado/interfaz";

  /**
   * Avisos efímeros («Añadido a tu selección»).
   *
   * `role="status"` y no `role="alert"`: son confirmaciones de algo que la
   * persona acaba de hacer, no emergencias. `alert` interrumpe la lectura en
   * curso del lector de pantalla, y para un «hecho» eso es maleducado.
   *
   * El contenedor existe siempre aunque esté vacío. Si se insertara al aparecer
   * el aviso, el lector no tendría nada que observar y no anunciaría nada.
   */
  const actual = $derived($aviso);
</script>

<div class="toast" data-show={actual !== null} data-tono={actual?.tono} role="status" aria-live="polite">
  {#if actual}
    <svg class="ico" aria-hidden="true" focusable="false">
      <use href={actual.tono === "error" ? "#i-alert" : "#i-check-circle"}></use>
    </svg>
    <span>{actual.texto}</span>
  {/if}
</div>
