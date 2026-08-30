<script lang="ts">
  import type { Maquina } from "@tipos";
  import { ENTORNOS, FAMILIAS } from "@datos/taxonomias";
  import { fuente, hayFoto, textoAlternativo } from "@lib/fotos";
  import { alternar, seleccion } from "@lib/estado/seleccion";
  import { avisar } from "@lib/estado/interfaz";

  /**
   * Ficha de una familia de maquinaria.
   *
   * `tabindex="-1"` no es decorativo: al pulsar «Ver más familias» el foco se
   * lleva a la primera ficha nueva, y sin él no habría dónde ponerlo. Quien
   * navega con teclado continuaría desde el botón, al final de la lista, con
   * las fichas recién cargadas por encima y sin enterarse.
   */
  interface Props {
    maquina: Maquina;
  }

  const { maquina }: Props = $props();

  const elegida = $derived($seleccion.includes(maquina.id));
  const foto = $derived(hayFoto(maquina.id) ? fuente(maquina.id) : null);

  /** El entorno sólo se destaca cuando la familia es exclusiva de uno. */
  const soloUnEntorno = $derived(
    maquina.entornos.length === 1 ? ENTORNOS[maquina.entornos[0]!] : null,
  );

  function alPulsarAñadir(): void {
    const añadida = alternar(maquina.id);
    avisar(
      añadida
        ? `Añadido a tu selección: ${maquina.nombre}`
        : `Quitado de tu selección: ${maquina.nombre}`,
      añadida ? "ok" : "neutro",
    );
  }
</script>

<article class="card" id={`maq-${maquina.id}`} tabindex="-1" aria-labelledby={`t-${maquina.id}`}>
  {#if foto}
    <div class="card__fig">
      <div class="card__flags">
        {#if maquina.cero}
          <span class="pill pill--ok">
            <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-leaf"></use></svg>
            Cero emisiones
          </span>
        {/if}
        {#if soloUnEntorno}
          <span class="pill">{soloUnEntorno}</span>
        {/if}
      </div>
      <img
        src={foto.src}
        srcset={foto.srcset}
        sizes="(min-width: 64rem) 19rem, (min-width: 40rem) 45vw, 92vw"
        alt={textoAlternativo(maquina.id, maquina.nombre)}
        width="800"
        height="600"
        loading="lazy"
        decoding="async"
      />
    </div>
  {:else}
    <figure class="card__fig card__fig--sinfoto">
      <div class="card__flags">
        {#if maquina.cero}
          <span class="pill pill--ok">
            <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-leaf"></use></svg>
            Cero emisiones
          </span>
        {/if}
        {#if soloUnEntorno}
          <span class="pill">{soloUnEntorno}</span>
        {/if}
      </div>
      <svg class="ico" aria-hidden="true" focusable="false"><use href={`#${maquina.icono}`}></use></svg>
      <figcaption>Foto a petición</figcaption>
    </figure>
  {/if}

  <div class="card__body">
    <span class="card__fam">{FAMILIAS[maquina.familia].nombre}</span>
    <h3 id={`t-${maquina.id}`}>{maquina.nombre}</h3>
    <p>{maquina.descripcion}</p>
    <dl class="specs" aria-label={`Rangos técnicos de ${maquina.nombre}`}>
      {#each maquina.ficha as [clave, valor] (clave)}
        <dt>{clave}</dt>
        <dd>{valor}</dd>
      {/each}
    </dl>
  </div>

  <div class="card__foot">
    <button
      type="button"
      class="btn btn--quiet btn--sm"
      aria-pressed={elegida}
      aria-label={`${elegida ? "Quitar" : "Añadir"} ${maquina.nombre} ${elegida ? "de" : "a"} mi selección`}
      onclick={alPulsarAñadir}
    >
      <svg class="ico" aria-hidden="true" focusable="false">
        <use href={elegida ? "#i-check" : "#i-plus"}></use>
      </svg>
      {elegida ? "Añadida" : "Añadir"}
    </button>
    <a class="btn btn--sm" href="#form-contacto" data-ask={maquina.id}>Pedir precio</a>
  </div>
</article>
