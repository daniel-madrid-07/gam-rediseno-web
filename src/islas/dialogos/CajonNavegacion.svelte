<script lang="ts">
  import type { ServicioBreve } from "@lib/proyecciones";
  import { FAMILIAS, type ClaveFamilia } from "@datos/taxonomias";
  import { filtros } from "@lib/estado/filtros";
  import { dialogoAbierto } from "@lib/estado/interfaz";
  import { EMPRESA } from "@/config/sitio";
  import Dialogo from "./Dialogo.svelte";

  /**
   * Menú de navegación en móvil.
   *
   * Repite la estructura del megamenú de escritorio en vertical. Cualquier
   * enlace cierra el cajón: dejarlo abierto tapando la sección a la que se
   * acaba de saltar es el fallo clásico de este patrón.
   */
  interface Props {
    servicios: ServicioBreve[];
  }

  const { servicios }: Props = $props();

  const CON_SECCION: Record<string, string> = {
    mantenimiento: "#mantenimiento",
    formacion: "#formacion",
  };

  const SECCIONES = [
    { texto: "Catálogo completo", href: "#catalogo" },
    { texto: "Mantenimiento", href: "#mantenimiento" },
    { texto: "Formación", href: "#formacion" },
    { texto: "Delegaciones", href: "#delegaciones" },
    { texto: "Sostenibilidad", href: "#sostenibilidad" },
    { texto: "Preguntas frecuentes", href: "#faq" },
    { texto: "Contacto", href: "#contacto" },
  ];

  const familias = Object.entries(FAMILIAS) as [ClaveFamilia, (typeof FAMILIAS)[ClaveFamilia]][];

  function elegirFamilia(clave: ClaveFamilia): void {
    filtros.setKey("familias", [clave]);
    dialogoAbierto.set(null);
    setTimeout(() => document.getElementById("catalogo")?.scrollIntoView({ block: "start" }), 60);
  }

  function abrirServicio(servicio: ServicioBreve): void {
    const seccion = CON_SECCION[servicio.id];
    dialogoAbierto.set(null);
    setTimeout(() => {
      if (seccion) document.querySelector(seccion)?.scrollIntoView({ block: "start" });
      else dialogoAbierto.set(`servicio:${servicio.id}`);
    }, 60);
  }
</script>

<Dialogo nombre="cajon" clase="drawer" etiqueta="Menú de navegación">
  <div class="drawer__panel">
    <div class="drawer__top">
      <span class="brandmark">
        <svg class="ico ico--fill" viewBox="0 0 124 46" aria-hidden="true" focusable="false">
          <use href="#logo-gam"></use>
        </svg>
      </span>
      <span class="grow"></span>
      <button
        type="button"
        class="iconbtn"
        aria-label="Cerrar el menú"
        onclick={() => dialogoAbierto.set(null)}
      >
        <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-close"></use></svg>
      </button>
    </div>

    <div class="drawer__body">
      <details>
        <summary>
          Maquinaria
          <svg class="ico chev" aria-hidden="true" focusable="false">
            <use href="#i-chevron-down"></use>
          </svg>
        </summary>
        <div>
          {#each familias as [clave, familia] (clave)}
            <a href={`?fam=${clave}#catalogo`} onclick={(e) => { e.preventDefault(); elegirFamilia(clave); }}>
              {familia.nombre}
            </a>
          {/each}
        </div>
      </details>

      <details>
        <summary>
          Servicios
          <svg class="ico chev" aria-hidden="true" focusable="false">
            <use href="#i-chevron-down"></use>
          </svg>
        </summary>
        <div>
          {#each servicios as servicio (servicio.id)}
            <a
              href={CON_SECCION[servicio.id] ?? "#servicios"}
              onclick={(e) => { e.preventDefault(); abrirServicio(servicio); }}
            >
              {servicio.nombre}
            </a>
          {/each}
        </div>
      </details>

      {#each SECCIONES as seccion (seccion.href)}
        <a class="drawer__link" href={seccion.href} onclick={() => dialogoAbierto.set(null)}>
          {seccion.texto}
        </a>
      {/each}
    </div>

    <div class="drawer__foot">
      <a class="btn btn--tel btn--block btn--lg" href={`tel:${EMPRESA.telefonoE164}`}>
        <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-phone"></use></svg>
        {EMPRESA.telefono}
      </a>
      <button
        type="button"
        class="btn btn--ghost btn--block"
        onclick={() => dialogoAbierto.set("asistente")}
      >
        <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-sliders"></use></svg>
        No sé qué máquina necesito
      </button>
    </div>
  </div>
</Dialogo>
