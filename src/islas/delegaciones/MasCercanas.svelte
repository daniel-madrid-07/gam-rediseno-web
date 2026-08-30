<script lang="ts">
  import type { Delegacion, DelegacionCercana } from "@tipos";
  import { formatearDistancia, masCercanas, posicionActual, type FalloGeo } from "@lib/geo";

  /**
   * «¿Cuál es mi delegación?», respondido con las coordenadas que ya están en
   * los datos.
   *
   * Existe porque la búsqueda por nombre deja fuera al caso más común: quien
   * está en un municipio sin delegación escribe su ciudad, no encuentra nada y
   * no llega a enterarse de que tiene una a treinta kilómetros.
   *
   * El cálculo es local: las 54 coordenadas viajan ya en la página y la
   * posición no sale del dispositivo. Ni servicio de mapas, ni clave de API,
   * ni un dato de ubicación cruzando internet.
   *
   * Nunca se pide el permiso al cargar. Un navegador que pregunta por la
   * ubicación sin que nadie lo haya pedido es una molestia, y además Chrome
   * penaliza los permisos solicitados sin interacción previa.
   */
  interface Props {
    delegaciones: Delegacion[];
    /** Cuántas se proponen. Tres cubre el caso de "la de al lado está cerrada". */
    cuantas?: number;
  }

  const { delegaciones, cuantas = 3 }: Props = $props();

  type Estado = "reposo" | "buscando" | "listo" | "error";

  let estado = $state<Estado>("reposo");
  let cercanas = $state<DelegacionCercana[]>([]);
  let motivo = $state<FalloGeo | null>(null);

  /** Cada fallo se explica por lo que puede hacer la persona al respecto. */
  const MENSAJES: Record<FalloGeo, string> = {
    denegado:
      "No nos has dado permiso de ubicación. Puedes activarlo en el candado de la barra de direcciones, o buscar tu provincia aquí abajo.",
    "no-disponible":
      "Tu dispositivo no ha podido darnos la ubicación. Busca tu provincia aquí abajo y te decimos cuál te atiende.",
    "tiempo-agotado":
      "La ubicación está tardando demasiado. Inténtalo otra vez o busca tu provincia aquí abajo.",
    "sin-soporte":
      "Este navegador no puede darnos la ubicación. Busca tu provincia aquí abajo.",
  };

  async function localizar(): Promise<void> {
    estado = "buscando";
    motivo = null;
    try {
      const posicion = await posicionActual();
      cercanas = masCercanas(delegaciones, posicion, cuantas);
      estado = cercanas.length > 0 ? "listo" : "error";
      if (cercanas.length === 0) motivo = "no-disponible";
    } catch (fallo) {
      motivo = fallo as FalloGeo;
      estado = "error";
    }
  }

  const telefonoE164 = (telefono: string): string => `+34${telefono.replace(/\s/g, "")}`;
</script>

<div class="cercanas">
  <div class="cercanas__cabeza">
    <div class="grow">
      <h3>¿Cuál es mi delegación?</h3>
      <p class="t-sm t-muted">
        Te decimos las {cuantas} más cercanas a donde estás. El cálculo se hace en tu
        dispositivo: tu ubicación no sale de aquí.
      </p>
    </div>

    <button
      type="button"
      class="btn btn--quiet"
      onclick={localizar}
      disabled={estado === "buscando"}
    >
      <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-pin"></use></svg>
      {estado === "buscando" ? "Localizando…" : estado === "listo" ? "Actualizar" : "Usar mi ubicación"}
    </button>
  </div>

  <div role="status" aria-live="polite">
    {#if estado === "error" && motivo}
      <p class="cercanas__aviso">
        <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-alert"></use></svg>
        {MENSAJES[motivo]}
      </p>
    {/if}

    {#if estado === "listo"}
      <ol class="cercanas__lista">
        {#each cercanas as delegacion, posicion (delegacion.id)}
          <li>
            <span class="cercanas__orden num" aria-hidden="true">{posicion + 1}</span>
            <span class="grow">
              <b>{delegacion.nombre}</b>
              <small>{delegacion.ciudad}</small>
            </span>
            <span class="cercanas__km num">
              <span class="vh">A </span>{formatearDistancia(delegacion.distanciaKm)}
            </span>
            <a class="btn btn--sm btn--gam" href={`tel:${telefonoE164(delegacion.telefono)}`}>
              <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-phone"></use></svg>
              <span class="vh">Llamar a {delegacion.nombre}: </span>{delegacion.telefono}
            </a>
          </li>
        {/each}
      </ol>
      <p class="t-xs t-muted">
        Distancia en línea recta, orientativa. Por carretera puede variar.
      </p>
    {/if}
  </div>
</div>
