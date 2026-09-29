(function () {
  "use strict";

  var QUOTES = [
    "El éxito es la suma de pequeños esfuerzos repetidos cada día.",
    "Cree en ti y todo será posible.",
    "La elegancia es la única belleza que nunca se marchita. — Audrey Hepburn",
    "Haz de cada día tu obra maestra.",
    "Las oportunidades no ocurren, las creas tú.",
    "Tu actitud determina tu altitud.",
    "La moda se desvanece, el estilo es eterno. — Yves Saint Laurent",
    "Empieza donde estás, usa lo que tienes, haz lo que puedes.",
    "Una mujer con visión es una mujer imparable.",
    "El brillo que proyectas nace de tu interior.",
    "Trabaja en silencio y deja que el éxito haga el ruido.",
    "Hoy es un buen día para brillar.",
    "La confianza es el mejor accesorio: nunca pasa de moda.",
    "Cada prenda que vendes lleva un pedacito de tu sueño."
  ];

  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var dayOfYear = Math.floor((now - start) / 86400000);
  var quoteEl = document.querySelector("[data-quote-text]");
  if (quoteEl) quoteEl.textContent = QUOTES[dayOfYear % QUOTES.length];

  var fmt = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  var dateStr = fmt.format(now);
  var quoteDate = document.querySelector("[data-quote-date]");
  if (quoteDate) quoteDate.textContent = dateStr;
  var today = document.querySelector("[data-today]");
  if (today) today.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
})();
