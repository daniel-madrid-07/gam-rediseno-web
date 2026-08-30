<script lang="ts">
  import type { ClaveFaceta } from "@tipos";
  import { CANALES, ENTORNOS, FAMILIAS, MOTORES } from "@datos/taxonomias";
  import { alternarValor } from "@lib/catalogo";
  import { filtros, limpiar } from "@lib/estado/filtros";

  /**
   * Resumen de los filtros puestos, cada uno con su aspa para quitarlo.
   *
   * Duplica lo que ya dice el panel lateral, y es a propósito: en móvil el
   * panel está plegado y sin esta fila no hay ninguna señal de que la lista
   * viene recortada. Aparecer con cero resultados y sin explicación es la forma
   * más rápida de que alguien piense que el catálogo está roto.
   */

  interface Chip {
    clave: ClaveFaceta | "busqueda";
    valor: string;
    etiqueta: string;
  }

  const ETIQUETAS: Record<string, Record<string, string>> = {
    familias: Object.fromEntries(Object.entries(FAMILIAS).map(([k, v]) => [k, v.nombre])),
    canales: CANALES,
    entornos: ENTORNOS,
    motores: MOTORES,
  };

  const chips = $derived.by(() => {
    const salida: Chip[] = [];
    for (const clave of ["familias", "canales", "entornos", "motores"] as const) {
      for (const valor of $filtros[clave] as string[]) {
        salida.push({ clave, valor, etiqueta: ETIQUETAS[clave]?.[valor] ?? valor });
      }
    }
    if ($filtros.cero) salida.push({ clave: "cero", valor: "1", etiqueta: "Cero emisiones" });
    if ($filtros.busqueda.trim()) {
      salida.push({
        clave: "busqueda",
        valor: "1",
        etiqueta: `“${$filtros.busqueda.trim()}”`,
      });
    }
    return salida;
  });

  function quitar(chip: Chip): void {
    if (chip.clave === "busqueda") {
      filtros.setKey("busqueda", "");
      return;
    }
    if (chip.clave === "cero") {
      filtros.setKey("cero", false);
      return;
    }
    const actual = $filtros[chip.clave] as string[];
    filtros.setKey(chip.clave, alternarValor(actual, chip.valor) as never);
  }
</script>

{#if chips.length}
  <div class="chips" style="margin-block-end:var(--s5)" role="group" aria-label="Filtros activos">
    {#each chips as chip (`${chip.clave}:${chip.valor}`)}
      <button type="button" class="chip" onclick={() => quitar(chip)}>
        {chip.etiqueta}
        <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-close"></use></svg>
        <span class="vh">Quitar este filtro</span>
      </button>
    {/each}

    {#if chips.length > 1}
      <button type="button" class="chip chip--ghost" onclick={limpiar}>Quitar todos</button>
    {/if}
  </div>
{/if}
