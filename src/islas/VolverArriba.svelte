<script lang="ts">
  import { onMount } from "svelte";
  import { prefiereQuietud } from "@lib/contadores";

  /**
   * Botón de volver arriba.
   *
   * Aparece pasados 900 px de scroll y se retira al llegar al pie, donde
   * taparía los iconos de redes sociales. Al pulsarlo el foco va al primer
   * enlace de salto: sin eso, quien navega con teclado vuelve visualmente
   * arriba pero sigue tabulando desde el pie.
   */
  const UMBRAL_PX = 900;

  let visible = $state(false);
  let enElPie = $state(false);

  onMount(() => {
    const alScroll = (): void => {
      visible = window.scrollY > UMBRAL_PX;
    };
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });

    let observador: IntersectionObserver | undefined;
    const pie = document.getElementById("pie");
    if (pie && "IntersectionObserver" in window) {
      observador = new IntersectionObserver(
        (entradas) => {
          enElPie = entradas.some((entrada) => entrada.isIntersecting);
        },
        { threshold: 0 },
      );
      observador.observe(pie);
    }

    return () => {
      window.removeEventListener("scroll", alScroll);
      observador?.disconnect();
    };
  });

  function subir(): void {
    window.scrollTo({ top: 0, behavior: prefiereQuietud() ? "auto" : "smooth" });
    document.querySelector<HTMLElement>(".skiplinks a")?.focus();
  }
</script>

<button
  type="button"
  class="totop"
  data-show={visible}
  data-pie={enElPie}
  aria-label="Volver arriba"
  onclick={subir}
>
  <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-arrow-up"></use></svg>
</button>
