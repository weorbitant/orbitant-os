# Escribir para ElevenLabs — referencia de locución sintética

> Documento de referencia. Fuente: artefacto propio, consolidado el 17 de agosto
> de 2026 a partir de la documentación oficial de ElevenLabs y de criterio de uso.
> Las afirmaciones marcadas **doc** proceden de la documentación oficial; las
> marcadas **práctica** son criterio de uso y consenso de comunidad, no están
> respaldadas por la documentación y conviene verificarlas contra la voz y el
> material propios.

La puntuación, la entonación y la expresividad casi nunca fallan por el modelo:
fallan porque el guion está escrito para que lo lea una persona, no para que lo
interprete un sintetizador.

**Texto escrito:**

> Le devolvemos el 21% antes del 17/08/2026, sin coste. Seguro?

Cifras y símbolos leídos con fonética inglesa, pregunta sin curva entonativa,
frase sin respiración.

**Guion TTS:**

> Le devolvemos el veintiún por ciento… antes del diecisiete de agosto de dos mil
> veintiséis. Sin coste.
> ¿[curious] Seguro?

Mismo mensaje, escrito como se pronuncia y con las marcas que el modelo sí
entiende.

---

## 1 · Modelo y voz pesan más que el guion

La voz es el parámetro más importante de v3 **doc**. Si la voz de referencia no
tiene el registro que pides, la etiqueta no lo arregla: una voz que susurra no
gritará con `[shouts]`. Elige voz antes de pelearte con el texto.

- Las clonaciones profesionales (PVC) aún no están optimizadas para v3 **doc**.
  Si necesitas etiquetas de audio, usa un Instant Voice Clone o una voz diseñada.
- Las voces neutras son las más estables entre idiomas y estilos **doc**. Para
  expresividad, la voz clonada debe incluir en sus muestras tanto tramos neutros
  como dinámicos.

### Qué modelo para qué trabajo

| Modelo | Para qué | Límite |
|---|---|---|
| `eleven_v3` | Máxima expresividad y etiquetas de audio, 70+ idiomas. Más variable entre generaciones. | 5.000 car. |
| `eleven_multilingual_v2` | Lo más estable en formato largo. La opción por defecto para narración corporativa o documental en español. | 10.000 car. |
| `eleven_flash_v2_5` | Latencia ~75 ms, 32 idiomas, mitad de precio por carácter. Conversacional y tiempo real. | 40.000 car. |

### Ajustes que causan la mayoría de las quejas

- **Estabilidad en v3** **doc**: *Creative* es más emocional pero alucina;
  *Natural* es el punto de equilibrio; *Robust* es estable pero deja de responder
  a las indicaciones. Si usas etiquetas, nunca *Robust*.
- **Style exaggeration a 0** **doc**. La documentación lo dice sin rodeos: por
  encima de cero provoca velocidad inconsistente, errores de pronunciación y
  sonidos añadidos.
- **Velocidad entre 0,7 y 1,2** (1,0 por defecto) **doc**. Los extremos degradan
  la calidad. Si necesitas más cambio de ritmo, reescribe; no fuerces el
  parámetro.

---

## 2 · Puntuación y pausas

Aquí está la mitad de los fallos de entonación, y hay una trampa de versión que
rompe guiones enteros: **Eleven v3 no soporta las etiquetas SSML de pausa**. Un
guion lleno de `<break>` migrado a v3 se lee con ese texto ignorado o convertido
en ruido.

| Recurso | Efecto | Dónde funciona |
|---|---|---|
| `<break time="1.5s" />` | Pausa exacta, hasta 3 segundos | v2 · v2.5 — **nunca en v3** |
| `…` | Pausa con peso; tono de duda | Todos; **el recurso principal en v3** |
| `—` (raya) | Pausa corta, interrupción | Todos; menos consistente |
| Punto y aparte | Reinicia la línea entonativa | Todos; lo más infravalorado |
| MAYÚSCULAS | Énfasis sobre esa palabra | Todos |

- Demasiados `<break>` en una misma generación desestabilizan el audio **doc**:
  el modelo acelera o introduce ruidos y artefactos. Es un problema reconocido y
  abierto.
- **El salto de párrafo es la herramienta de entonación más barata.** Fuerza un
  reset prosódico limpio. Si un bloque suena monótono o con carrerilla, pártelo
  en párrafos antes de tocar ningún ajuste.
- Las voces reaccionan distinto a las pausas **doc**, sobre todo las entrenadas
  con muletillas del tipo «eh» o «ah».

> `It was a VERY long day [sigh] … nobody listens anymore.`
> Ejemplo de la documentación: mayúscula para el énfasis, etiqueta para el gesto,
> puntos suspensivos para la pausa cargada.

---

## 3 · Emoción: etiquetas o contexto narrativo

> `[whispers] Nunca pensé que fuera posible… pero aquí estamos.`
> `—¿Te vas? —preguntó ella, con la voz temblando.`

**El contexto narrativo se lee en voz alta.** La documentación es explícita: las
acotaciones del tipo «preguntó ella, con la voz temblando» guían la emoción, pero
el modelo también las pronuncia. O las eliminas en postproducción, o usas
etiquetas entre corchetes, que sí se consumen como dirección y además dan
resultados más predecibles. **doc**

### Categorías de etiquetas v3

- **Voz y emoción**: `[laughs]` · `[laughs harder]` · `[starts laughing]` ·
  `[wheezing]` · `[whispers]` · `[sighs]` · `[exhales]` · `[sarcastic]` ·
  `[curious]` · `[excited]` · `[crying]` · `[snorts]` · `[mischievously]`
- **Ritmo y entrega**: `[pause]` · `[rushed]` · `[stammers]` · `[drawn out]`
- **Reacciones humanas**: `[clears throat]` · `[gasps]` · `[worried]`
- **Acento y personaje**: `[British accent]` · `[French accent]` · `[pirate voice]`
- **Efectos de sonido**: `[applause]` · `[gunshot]` · `[explosion]`
- **Diálogo multivoz**: `Speaker 1: [excitedly] …` / `Speaker 2: [curiously] …`

La lista no es cerrada **doc**: la propia documentación invita a inventar
etiquetas descriptivas y a combinarlas para entregas complejas.

- La etiqueta tiene que casar con el carácter de la voz **doc**. Una voz seria y
  corporativa no responderá a `[giggles]` o `[mischievously]`.
- En diálogos, asigna una voz distinta a cada interlocutor desde la Voice
  Library, en lugar de confiar en que una sola voz haga los dos papeles.

---

## 4 · El español, en detalle

Aquí está el grueso del problema, y tiene una causa concreta: **los modelos
arrastran un fuerte sesgo fonético inglés** procedente de sus datos de
entrenamiento. Todo lo que no sea una palabra española plana —cifras, símbolos,
siglas, anglicismos, nombres propios— tiende a caerse al inglés.

### Números, símbolos y siglas: escríbelos como se dicen

Es la recomendación literal de la guía de resolución de problemas: escribe los
números fonéticamente o en palabras, tal y como quieres que suenen. **doc**

| No escribas | Escribe |
|---|---|
| 27 | veintisiete |
| 1.234,56 € | mil doscientos treinta y cuatro euros con cincuenta y seis |
| 17/08/2026 | diecisiete de agosto de dos mil veintiséis |
| 14:30 | las dos y media de la tarde |
| 21% | veintiún por ciento |
| 600 123 456 | seis cero cero, uno dos tres, cuatro cinco seis |
| IRPF | i erre pe efe |
| `info@empresa.com` | info arroba empresa punto com |
| 2ª planta | segunda planta |
| Ctrl + Z | control zeta |

La normalización automática está activada por defecto, pero la documentación
reconoce que los teléfonos, las divisas, las fechas en formato numérico, las
horas, las direcciones, las URL y las abreviaturas de unidades siguen siendo
puntos débiles. **doc**

### Tildes y diéresis: siempre

La tilde es la marca del acento tónico, y para el modelo *público*, *publico* y
*publicó* son tres palabras distintas. Lo mismo con *el* / *él*, *esta* /
*está*, *hacia* / *hacía*, y con la diéresis de *pingüino*. Un guion sin tildes
es un guion con la prosodia rota de origen. **práctica**

### Usa los signos de apertura ¿ y ¡

En español la curva entonativa de una pregunta arranca al principio del
enunciado, no al final. Sin el signo de apertura, el modelo no sabe que es una
pregunta hasta que ya la ha dicho, y sale la frase plana que se levanta de golpe
en la última sílaba. Es de las correcciones que más se notan al probarlas.
**práctica**

### Elige voz nativa de la variante correcta

El seseo, el yeísmo y la melodía los pone la voz, no el texto. Filtra la Voice
Library por *Spanish (Spain)* o *Spanish (Mexico)*, o clona a un hablante nativo.
Una voz entrenada en inglés leyendo español da pronunciación aceptable pero
cadencia anglosajona. Si el guion usa voseo, que la voz sea rioplatense; la
coherencia entre texto y acento es parte del realismo.

### Anglicismos y nombres de marca: el disparador del cambio de acento

La documentación lo reconoce: los errores de pronunciación aparecen sobre todo
«con palabras que también existen en otros idiomas». **doc** Tres salidas, de
menos a más control:

1. **Escribirlos como suenan** en tu español: *márketing*, *reunión de esprint*.
2. **IPA en línea** (v3) **doc**: v3 entiende transcripción fonética entre barras
   directamente en el texto, en 70+ idiomas, con una consistencia declarada del
   80-90 %. Incluye las marcas de acento (ˈ primaria, ˌ secundaria) y aplícalo
   solo a las palabras problemáticas.
3. **Diccionario de pronunciación** (v2 · v2.5) **doc**: en modelos anteriores,
   con CMU Arpabet o IPA, más alias de sustitución (por ejemplo UN → United
   Nations). Es la vía para fijar nombres de marca de una vez y para siempre.

> `El término "/ˌbaɪoʊˈkemɪstri/" designa el estudio de los procesos químicos.`
> Sintaxis IPA de v3: la transcripción va entre barras, dentro del propio texto.

### Etiquetas en inglés, aunque el guion sea español

Las etiquetas de audio están entrenadas mayoritariamente con vocabulario inglés;
escritas en castellano a veces se pronuncian en lugar de interpretarse. Usa
`[whispers]`, no `[susurra]`. **práctica**

### Frases más cortas que en la prosa escrita

El español escrito profesional tiende a periodos largos con subordinadas
encadenadas. Leído por un sintetizador suena a boletín oficial, y el modelo
pierde la línea entonativa a mitad de camino. Corta en oraciones de **quince a
veinte palabras**. **práctica**

---

## 5 · Flujo de trabajo

En este orden, porque cada paso evita rehacer el siguiente.

1. **Mantén dos versiones del guion.** El humano —legible, con cifras y siglas—
   y el guion TTS —normalizado, con tildes, etiquetas e IPA—. No los mezcles
   nunca, o acabarás normalizando dos veces sobre texto ya normalizado.
2. **Genera primero un párrafo de prueba** que contenga un número, una fecha, una
   sigla y el nombre de marca. Escucha esos cuatro puntos específicamente antes
   de lanzar los diez minutos.
3. **Trocea a menos de 800 caracteres** **doc**. Por encima, la calidad se
   degrada dentro de la misma generación.
4. **Encadena los trozos con `previous_text` y `next_text`** en la API para que
   la prosodia no salte entre segmentos. En la interfaz, usa Studio: genera por
   partes y regenera solo la que salió mal.
5. **Fija `seed`** si necesitas reproducibilidad: la salida es no determinista por
   defecto. **doc**
6. **Aprovecha las dos regeneraciones gratuitas** por generación, válidas solo si
   el texto y los parámetros son idénticos. Según los benchmarks internos de
   ElevenLabs, regenerar resuelve aproximadamente la mitad de los problemas de
   calidad. **doc**
7. Si sale **audio corrupto o emborronado**, regenera esa sección y sigue. Es un
   fallo conocido, poco frecuente y sin causa identificada. **doc**

---

## 6 · Referencias

- **Best practices — ElevenLabs Documentation** — pausas y `<break>`, IPA en v3,
  emoción y acotaciones narrativas, velocidad, normalización de texto, ajustes de
  estabilidad.
  `elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices`
- **Prompting Eleven v3** — selección de voz, estabilidad Creative / Natural /
  Robust, catálogo de etiquetas, diálogo multivoz, límite de PVC.
  `elevenlabs.io/docs/best-practices/prompting/eleven-v3`
- **Text to Speech** — comparativa de modelos y límites, idiomas, no
  determinismo y seed, regeneraciones gratuitas, `previous_text` / `next_text`.
  `elevenlabs.io/docs/overview/capabilities/text-to-speech`
- **Troubleshooting** — números, símbolos y siglas leídos en inglés; troceado por
  debajo de 800 caracteres; style exaggeration a 0; audio corrupto.
  `elevenlabs.io/docs/eleven-creative/troubleshooting`
- **Audio tags 101: Directing emotional TTS in Eleven v3** — categorías de
  etiquetas, ausencia de SSML en v3, puntuación y mayúsculas para el ritmo.
  `elevenlabs.io/blog/v3-audiotags`
- **ElevenLabs v3 Audio Tags: Precision Delivery Control** — `[pause]`,
  `[rushed]`, `[stammers]`, `[drawn out]`.
  `elevenlabs.io/blog/eleven-v3-audio-tags-precision-delivery-control-for-ai-speech`
- **Eleven v3 Audio Tags: Multi-Character Dialogue** — etiquetas de interrupción
  y solapamiento.
  `elevenlabs.io/blog/eleven-v3-audio-tags-bringing-multi-character-dialogue-to-life`
- **Languages vs Accents in ElevenLabs — Deepgram** — sesgo fonético inglés de
  las voces por defecto.
  `deepgram.com/learn/elevenlabs-languages-vs-accents-support`
- **How can I force a certain pronunciation of a word or name? — Help** —
  fonemas SSML con IPA y CMU Arpabet.
  `help.elevenlabs.io/hc/en-us/articles/16712320194577`
- **Why does my voice change accent or language? — Help** — causas del cambio de
  acento a mitad de generación.
  `help.elevenlabs.io/hc/en-us/articles/19631995406481`
- **Errores de pronunciación en ElevenLabs y cómo minimizarlos** — números en
  letra, nombres propios con marcadores fonéticos.
  `tecnobits.com/solucionar-errores-de-pronunciacion-en-elevenlabs`
- **ElevenLabs v3: el audio sintético toma la clase de español** — variedades del
  español, aspiración de la /s/ final y voseo.
  `formacionele.com/elevenlabs-v3-el-audio-sintetico-toma-la-clase-de-espanol`
- **Domina la emulación de acentos con IA — ElevenLabs** — etiquetas de acento
  como diseño de personaje.
  `elevenlabs.io/es/blog/eleven-v3-audio-tags-emulating-accents-with-precision`
