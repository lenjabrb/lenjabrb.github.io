/* =====================================================================
   MUSEUM OF US – script.js
   Enthält:
     1. Hilfsklasse "js-aktiv" (Einblend-Effekte nur mit JavaScript)
     2. Schatten der Navigation beim Scrollen
     3. Einblend-Animation beim Scrollen (IntersectionObserver)
     4. Karussell-Zähler ("Exponat 1 von 3")
     5. Audioguide im Modal (Web Speech API)
     6. Jahreszahl im Footer
   Alles wird erst ausgeführt, wenn das HTML vollständig geladen ist.
   ===================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  "use strict"; // strenger Modus: verhindert typische Fehler

  /* -------------------------------------------------------------------
     1. HILFSKLASSE
     Das CSS blendet .reveal-Elemente nur aus, wenn <html> die Klasse
     "js-aktiv" trägt. So bleibt die Seite auch ohne JavaScript lesbar.
     ------------------------------------------------------------------- */
  document.documentElement.classList.add("js-aktiv");

  /* -------------------------------------------------------------------
     2. NAVIGATION: Schatten beim Scrollen
     Sobald mehr als 10px gescrollt wurde, bekommt die Navbar die Klasse
     "is-scrolled" (siehe style.css).
     ------------------------------------------------------------------- */
  const navbar = document.querySelector(".museum-navbar");

  function aktualisiereNavbar() {
    if (!navbar) return; // Sicherheitsabfrage, falls das Element fehlt
    navbar.classList.toggle("is-scrolled", window.scrollY > 10);
  }

  window.addEventListener("scroll", aktualisiereNavbar, { passive: true });
  aktualisiereNavbar(); // einmal direkt ausführen (z. B. nach Neuladen mitten auf der Seite)

  /* -------------------------------------------------------------------
     3. EINBLEND-ANIMATION BEIM SCROLLEN
     Der IntersectionObserver meldet, wenn ein Element im sichtbaren
     Bereich erscheint. Dann wird die Klasse "is-visible" gesetzt.
     ------------------------------------------------------------------- */
  const einblendElemente = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const beobachter = new IntersectionObserver(
      function (eintraege, obs) {
        eintraege.forEach(function (eintrag) {
          if (eintrag.isIntersecting) {
            eintrag.target.classList.add("is-visible");
            obs.unobserve(eintrag.target); // nur einmal einblenden
          }
        });
      },
      { threshold: 0.15 } // 15 % des Elements müssen sichtbar sein
    );

    einblendElemente.forEach(function (el) {
      beobachter.observe(el);
    });
  } else {
    // Sehr alte Browser: alles sofort anzeigen
    einblendElemente.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* -------------------------------------------------------------------
     4. KARUSSELL-ZÄHLER
     Bootstrap löst beim Wechsel das Ereignis "slid.bs.carousel" aus.
     Wir lesen daraus die Nummer der neuen Folie (event.to, beginnt bei 0).
     ------------------------------------------------------------------- */
  const karussell = document.getElementById("karussellHighlights");
  const zaehler = document.getElementById("karussellZaehler");

  if (karussell && zaehler) {
    const anzahl = karussell.querySelectorAll(".carousel-item").length;

    karussell.addEventListener("slid.bs.carousel", function (event) {
      zaehler.textContent = "Exponat " + (event.to + 1) + " von " + anzahl;
    });
  }


  /* -------------------------------------------------------------------
     6. JAHRESZAHL IM FOOTER
     Setzt automatisch das aktuelle Jahr ein.
     ------------------------------------------------------------------- */
  const jahrElement = document.getElementById("jahr");
  if (jahrElement) {
    jahrElement.textContent = new Date().getFullYear();
  }
})