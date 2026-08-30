<script lang="ts">
  import { esValido } from "@lib/validacion";
  import { CAMPOS, MOTIVOS, tipoDeInput, type CampoFormulario } from "@datos/formulario";
  import { seleccion } from "@lib/estado/seleccion";
  import { avisar } from "@lib/estado/interfaz";
  import { EMPRESA } from "@/config/sitio";
  import type { Maquina } from "@tipos";

  /**
   * Formulario de solicitud de presupuesto.
   *
   * La validación se dispara al salir del campo, no mientras se escribe: marcar
   * en rojo un correo a medio teclear es una regañina por algo que la persona
   * todavía está haciendo. Una vez marcado como inválido, sí se revalida en
   * cada pulsación, para que el error desaparezca en cuanto se corrige.
   *
   * IMPORTANTE: hoy no hay servidor detrás. El `endpoint` llega vacío y el
   * formulario lo dice claramente en vez de fingir un envío correcto.
   */
  interface Props {
    catalogo: Maquina[];
    comunidades: string[];
    /** URL que recibe el formulario. Sin ella, el envío queda desactivado. */
    endpoint?: string;
  }

  const { catalogo, comunidades, endpoint = "" }: Props = $props();

  const valores = $state<Record<string, string>>({});
  const invalidos = $state<Record<string, boolean>>({});
  let consentimiento = $state(false);
  let servicio = $state("");
  let zona = $state("");
  let mensaje = $state("");
  let enviando = $state(false);
  let resultado = $state<{ tono: "ok" | "error" | "aviso"; texto: string } | null>(null);

  /* Lo que haya en la bandeja se propone como mensaje inicial. */
  $effect(() => {
    if (mensaje.trim() || $seleccion.length === 0) return;
    const nombres = $seleccion
      .map((id) => catalogo.find((m) => m.id === id)?.nombre)
      .filter((n): n is string => Boolean(n));
    if (nombres.length) mensaje = `Quiero presupuesto para: ${nombres.join("; ")}.`;
  });

  const validarCampo = (campo: CampoFormulario): boolean => {
    if (!campo.obligatorio) return true;
    const ok = esValido(campo.tipo, valores[campo.id] ?? "");
    invalidos[campo.id] = !ok;
    return ok;
  };

  function alSalir(campo: CampoFormulario): void {
    if (valores[campo.id]) validarCampo(campo);
  }

  function alEscribir(campo: CampoFormulario): void {
    // Sólo se revalida si ya estaba marcado: no se regaña mientras se escribe
    if (invalidos[campo.id]) validarCampo(campo);
  }

  async function enviar(evento: SubmitEvent): Promise<void> {
    evento.preventDefault();

    const fallos = CAMPOS.filter((c) => !validarCampo(c));
    const servicioOk = esValido("seleccion", servicio);
    const consentOk = esValido("consentimiento", consentimiento);
    invalidos["f-servicio"] = !servicioOk;
    invalidos["f-consent"] = !consentOk;

    const total = fallos.length + Number(!servicioOk) + Number(!consentOk);
    if (total > 0) {
      resultado = {
        tono: "error",
        texto: `Faltan ${total} ${total === 1 ? "campo" : "campos"} por revisar. Te hemos llevado al primero.`,
      };
      const primero = fallos[0]?.id ?? (!servicioOk ? "f-servicio" : "f-consent");
      document.getElementById(primero)?.focus();
      return;
    }

    if (!endpoint) {
      resultado = {
        tono: "aviso",
        texto: `Esta es una versión de demostración y el envío no está conectado todavía. Para una solicitud real, llama al ${EMPRESA.telefono} o escribe a clientes@gamrentals.com.`,
      };
      return;
    }

    enviando = true;
    try {
      const respuesta = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...valores,
          servicio,
          zona,
          mensaje,
          equipos: $seleccion.join(", "),
        }),
      });
      if (!respuesta.ok) throw new Error(String(respuesta.status));
      resultado = {
        tono: "ok",
        texto: `Solicitud enviada. Te contestamos en horario laboral; si es urgente, llama al ${EMPRESA.telefono}.`,
      };
      avisar("Solicitud enviada", "ok");
      (evento.target as HTMLFormElement).reset();
    } catch {
      resultado = {
        tono: "error",
        texto: `No hemos podido enviar la solicitud. Inténtalo de nuevo o llámanos al ${EMPRESA.telefono}.`,
      };
    } finally {
      enviando = false;
    }
  }
</script>

<form class="form" id="form-contacto" novalidate aria-labelledby="h-con" onsubmit={enviar}>
  <div class="field field--full">
    <h3>Solicita información</h3>
    <p class="t-sm t-muted">
      Los campos marcados con <span class="req" aria-hidden="true">*</span> son obligatorios. Te
      respondemos en horario laboral.
    </p>
  </div>

  {#each CAMPOS as campo (campo.id)}
    <div class="field">
      <label for={campo.id}>
        {campo.etiqueta}
        {#if campo.obligatorio}<span class="req" aria-hidden="true">*</span>{/if}
      </label>
      <input
        type={tipoDeInput(campo.tipo)}
        id={campo.id}
        name={campo.nombre}
        required={campo.obligatorio}
        autocomplete={campo.autocompletar}
        aria-invalid={campo.obligatorio ? String(Boolean(invalidos[campo.id])) : undefined}
        aria-describedby={`${campo.ayuda ? `h-${campo.nombre} ` : ""}e-${campo.nombre}`}
        bind:value={valores[campo.id]}
        onblur={() => alSalir(campo)}
        oninput={() => alEscribir(campo)}
      />
      {#if campo.ayuda}
        <span class="help" id={`h-${campo.nombre}`}>{campo.ayuda}</span>
      {/if}
      {#if campo.error}
        <span class="err" id={`e-${campo.nombre}`}>
          <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-alert"></use></svg>
          {campo.error}
        </span>
      {/if}
    </div>
  {/each}

  <div class="field">
    <label for="f-servicio">¿Qué necesitas? <span class="req" aria-hidden="true">*</span></label>
    <select
      id="f-servicio"
      name="servicio"
      required
      bind:value={servicio}
      aria-invalid={String(Boolean(invalidos["f-servicio"]))}
      aria-describedby="e-servicio"
    >
      <option value="">Elige una opción</option>
      {#each MOTIVOS as opcion (opcion)}
        <option>{opcion}</option>
      {/each}
    </select>
    <span class="err" id="e-servicio">
      <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-alert"></use></svg>
      Elige el servicio para dirigir tu consulta al equipo correcto.
    </span>
  </div>

  <div class="field">
    <label for="f-zona">Comunidad del trabajo</label>
    <select id="f-zona" name="zona" bind:value={zona}>
      <option value="">Elige una comunidad</option>
      {#each comunidades as nombre (nombre)}
        <option>{nombre}</option>
      {/each}
    </select>
  </div>

  <div class="field field--full">
    <label for="f-mensaje">Cuéntanos el trabajo</label>
    <textarea
      id="f-mensaje"
      name="mensaje"
      rows="4"
      bind:value={mensaje}
      aria-describedby="h-mensaje"
      placeholder="Ej.: necesito una tijera eléctrica de 10 m para mantenimiento en nave, tres semanas, en Zaragoza."
    ></textarea>
    <span class="help" id="h-mensaje">
      Cuanto más concreto seas (altura, carga, superficie y fechas), más ajustada será la propuesta.
    </span>
  </div>

  <div class="field field--full">
    <label class="consent" for="f-consent">
      <input
        type="checkbox"
        id="f-consent"
        name="consent"
        required
        bind:checked={consentimiento}
        aria-invalid={String(Boolean(invalidos["f-consent"]))}
        aria-describedby="e-consent"
      />
      <span>
        He leído y acepto la política de privacidad, y autorizo el tratamiento de mis datos para
        responder a esta solicitud. <span class="req" aria-hidden="true">*</span>
      </span>
    </label>
    <span class="err" id="e-consent">
      <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-alert"></use></svg>
      Necesitamos tu consentimiento para poder responderte.
    </span>
  </div>

  <div class="formstatus" data-state={resultado?.tono} role="status" aria-live="polite">
    {#if resultado}
      <svg class="ico" aria-hidden="true" focusable="false">
        <use href={{ ok: "#i-check-circle", aviso: "#i-info", error: "#i-alert" }[resultado.tono]}></use>
      </svg>
      <span>{resultado.texto}</span>
    {/if}
  </div>

  <div class="form__actions">
    <button type="submit" class="btn btn--gam btn--lg" disabled={enviando}>
      <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-mail"></use></svg>
      {enviando ? "Enviando…" : "Enviar solicitud"}
    </button>
    <a class="btn btn--ghost btn--lg" href={`tel:${EMPRESA.telefonoE164}`}>
      <svg class="ico" aria-hidden="true" focusable="false"><use href="#i-phone"></use></svg>
      Prefiero llamar
    </a>
  </div>
</form>
