<script lang="ts">
  import {
    preferencias,
    restablecer,
    type Escala,
    type Tema,
  } from "@lib/estado/preferencias";
  import { dialogoAbierto } from "@lib/estado/interfaz";
  import Dialogo from "./Dialogo.svelte";

  /**
   * Ajustes de apariencia y accesibilidad.
   *
   * Ofrecerlos en la propia página no sobra por tener el sistema operativo sus
   * preferencias: mucha gente usa un ordenador compartido, o de la empresa, o
   * no sabe dónde se cambia el contraste en Windows. El panel respeta lo que
   * diga el sistema mientras la persona no elija otra cosa aquí.
   */

  const TEMAS: [Tema, string, string][] = [
    ["light", "Claro", "i-sun"],
    ["dark", "Oscuro", "i-moon"],
    ["auto", "Sistema", "i-monitor"],
  ];

  const ESCALAS: [Escala, string][] = [
    ["100", "100 %"],
    ["115", "115 %"],
    ["130", "130 %"],
    ["150", "150 %"],
  ];

  interface Ajuste {
    clave: "contraste" | "movimiento" | "enlaces" | "espaciado";
    titulo: string;
    detalle: string;
    /** Valor que representa el interruptor encendido. */
    activo: string;
    inactivo: string;
  }

  const AJUSTES: Ajuste[] = [
    {
      clave: "contraste",
      titulo: "Contraste reforzado",
      detalle: "Negro sobre blanco y bordes marcados",
      activo: "high",
      inactivo: "normal",
    },
    {
      clave: "movimiento",
      titulo: "Reducir animaciones",
      detalle: "Sin desplazamientos ni transiciones",
      activo: "off",
      inactivo: "on",
    },
    {
      clave: "enlaces",
      titulo: "Subrayar todos los enlaces",
      detalle: "Distinguirlos sin depender del color",
      activo: "always",
      inactivo: "auto",
    },
    {
      clave: "espaciado",
      titulo: "Espaciado ampliado",
      detalle: "Más aire entre letras, palabras y líneas",
      activo: "wide",
      inactivo: "normal",
    },
  ];
</script>

<Dialogo nombre="accesibilidad" clase="side a11y" etiquetadoPor="a11y-title">
  <div class="side__panel">
    <div class="side__top">
      <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-a11y"></use></svg>
      <h2 id="a11y-title">Accesibilidad</h2>
      <button
        type="button"
        class="iconbtn"
        aria-label="Cerrar el panel de accesibilidad"
        onclick={() => dialogoAbierto.set(null)}
      >
        <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-close"></use></svg>
      </button>
    </div>

    <div class="side__body">
      <p class="t-sm t-muted">
        Estos ajustes se guardan en este navegador y se aplican a toda la web.
      </p>

      <fieldset>
        <legend>Tema de color</legend>
        <div class="seg" role="radiogroup" aria-label="Tema de color">
          {#each TEMAS as [valor, etiqueta, icono] (valor)}
            <label>
              <input
                type="radio"
                name="tema"
                value={valor}
                checked={$preferencias.tema === valor}
                onchange={() => preferencias.setKey("tema", valor)}
              />
              <span>
                <svg class="ico" aria-hidden="true" focusable="false">
                  <use href={`#${icono}`}></use>
                </svg>
                {etiqueta}
              </span>
            </label>
          {/each}
        </div>
      </fieldset>

      <fieldset>
        <legend>Tamaño del texto</legend>
        <div class="seg" role="radiogroup" aria-label="Tamaño del texto">
          {#each ESCALAS as [valor, etiqueta] (valor)}
            <label>
              <input
                type="radio"
                name="escala"
                value={valor}
                checked={$preferencias.escala === valor}
                onchange={() => preferencias.setKey("escala", valor)}
              />
              <span>{etiqueta}</span>
            </label>
          {/each}
        </div>
      </fieldset>

      <fieldset>
        <legend>Ajustes de lectura</legend>
        {#each AJUSTES as ajuste (ajuste.clave)}
          <label class="switch">
            <span>
              {ajuste.titulo}
              <small>{ajuste.detalle}</small>
            </span>
            <input
              type="checkbox"
              checked={$preferencias[ajuste.clave] === ajuste.activo}
              onchange={(e) =>
                preferencias.setKey(
                  ajuste.clave,
                  (e.currentTarget.checked ? ajuste.activo : ajuste.inactivo) as never,
                )}
            />
            <span class="switch__t" aria-hidden="true"></span>
          </label>
        {/each}
      </fieldset>

      <button type="button" class="btn btn--ghost btn--block" onclick={restablecer}>
        <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-refresh"></use></svg>
        Restablecer todo
      </button>

      <p class="t-xs t-muted">
        La web sigue las pautas WCAG 2.2 nivel AA. Si encuentras una barrera, escríbenos a
        <a href="mailto:clientes@gamrentals.com">clientes@gamrentals.com</a> y la corregimos.
      </p>
    </div>
  </div>
</Dialogo>
