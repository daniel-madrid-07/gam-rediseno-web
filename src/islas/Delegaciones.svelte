<script lang="ts">
  import type { Delegacion } from "@tipos";
  import { normalizar, plural } from "@lib/texto";
  import { EMPRESA } from "@/config/sitio";

  /**
   * Buscador de la red de delegaciones.
   *
   * Las 54 llegan como prop desde el build, así que buscar es filtrar un array
   * en memoria: sin peticiones, sin espera y sin depender de la cobertura.
   */
  interface Props {
    delegaciones: Delegacion[];
  }

  const { delegaciones }: Props = $props();

  const POR_PAGINA = 12;

  let consulta = $state("");
  let comunidad = $state("");
  let visibles = $state(POR_PAGINA);

  const comunidades = $derived(
    [...new Set(delegaciones.map((d) => d.comunidad))].sort((a, b) => a.localeCompare(b, "es")),
  );

  const encontradas = $derived.by(() => {
    const aguja = normalizar(consulta.trim());
    return delegaciones.filter((d) => {
      if (comunidad && d.comunidad !== comunidad) return false;
      if (!aguja) return true;
      return normalizar(`${d.nombre} ${d.ciudad} ${d.comunidad} ${d.cp}`).includes(aguja);
    });
  });

  const mostradas = $derived(encontradas.slice(0, visibles));
  const quedan = $derived(encontradas.length - mostradas.length);

  /* Al cambiar la consulta se vuelve al principio de la lista. */
  $effect(() => {
    void consulta;
    void comunidad;
    visibles = POR_PAGINA;
  });

  /** Una entrada sin código postal es cobertura, no una sede con dirección. */
  const esSoloCobertura = (d: Delegacion): boolean => d.cp === "-";

  const telefonoE164 = (telefono: string): string => `+34${telefono.replace(/\s/g, "")}`;
</script>

<search class="results__bar" aria-label="Buscar delegación">
  <div class="field-search grow" style="max-inline-size:26rem">
    <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-pin"></use></svg>
    <label class="vh" for="del-q">Buscar delegación por ciudad o provincia</label>
    <input
      type="search"
      id="del-q"
      bind:value={consulta}
      placeholder="Madrid, Sevilla, Bilbao, Las Palmas…"
      autocomplete="address-level2"
      enterkeyhint="search"
    />
    {#if consulta}
      <button
        type="button"
        class="field-search__x"
        aria-label="Borrar la búsqueda"
        onclick={() => (consulta = "")}
      >
        <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-close"></use></svg>
      </button>
    {/if}
  </div>

  <div class="selectfield">
    <label for="del-com">Comunidad</label>
    <select id="del-com" bind:value={comunidad}>
      <option value="">Todas</option>
      {#each comunidades as nombre (nombre)}
        <option value={nombre}>{nombre}</option>
      {/each}
    </select>
  </div>

  <p class="results__n" role="status" aria-live="polite">
    <b>{encontradas.length}</b>
    {plural(encontradas.length, "delegación", "delegaciones")}
    {#if encontradas.length !== delegaciones.length}de {delegaciones.length}{/if}
  </p>
</search>

{#if encontradas.length}
  <div class="delegs">
    {#each mostradas as delegacion (delegacion.id)}
      <article class="deleg">
        <h3>{delegacion.nombre}</h3>
        <span class="deleg__com">{delegacion.comunidad}</span>

        {#if esSoloCobertura(delegacion)}
          <p class="t-sm">
            <span class="pill pill--warn">Cobertura</span>
            {delegacion.direccion}
          </p>
        {:else}
          <address>
            {delegacion.direccion}<br />
            {delegacion.cp}
            {delegacion.ciudad}
          </address>
        {/if}

        <div class="deleg__meta">
          <a href={`tel:${telefonoE164(delegacion.telefono)}`}>
            <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-phone"></use></svg>
            {delegacion.telefono}
          </a>
          {#if delegacion.lat !== null && delegacion.lng !== null}
            <a
              href={`https://www.google.com/maps?q=${delegacion.lat},${delegacion.lng}`}
              target="_blank"
              rel="noopener"
            >
              <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-pin"></use></svg>
              Cómo llegar
            </a>
          {/if}
        </div>
      </article>
    {/each}
  </div>

  {#if quedan > 0}
    <div class="more">
      <p>Mostrando {mostradas.length} de {encontradas.length} delegaciones</p>
      <button type="button" class="btn btn--quiet" onclick={() => (visibles += POR_PAGINA)}>
        Ver más delegaciones
      </button>
    </div>
  {/if}
{:else}
  <div class="empty">
    <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-pin"></use></svg>
    <h3>No encontramos esa delegación</h3>
    <p class="t-sm t-muted">
      Llámanos al {EMPRESA.telefono} y te decimos cuál te atiende.
    </p>
  </div>
{/if}
