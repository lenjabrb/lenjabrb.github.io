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
     5. AUDIOGUIDE (Modal + Sprachausgabe)
     Nutzt die Web Speech API (speechSynthesis), die in den meisten
     modernen Browsern verfügbar ist. Es wird keine Audiodatei benötigt.
     ------------------------------------------------------------------- */
  const modal = document.getElementById("modalAudioguide");
  const textElement = document.getElementById("audioguideText");
  const statusElement = document.getElementById("audioguideStatus");
  const startButton = document.getElementById("audioStart");
  const stopButton = document.getElementById("audioStop");

  const sprachausgabeVerfuegbar = "speechSynthesis" in window;

  // Stoppt die Wiedergabe und setzt die Anzeige zurück
  function stoppeAudio() {
    if (sprachausgabeVerfuegbar) {
      window.speechSynthesis.cancel();
    }
    if (textElement) textElement.classList.remove("is-speaking");
    if (statusElement) statusElement.textContent = "";
  }

  // Startet die Wiedergabe
  function starteAudio() {
    if (!sprachausgabeVerfuegbar) {
      statusElement.textContent =
        "Leider unterstützt Ihr Browser keine Sprachausgabe. Sie können den Text oben lesen.";
      return;
    }

    stoppeAudio(); // laufende Wiedergabe zuerst beenden

    const rede = new SpeechSynthesisUtterance(textElement.textContent.trim());
    rede.lang = "de-DE"; // deutsche Aussprache
    rede.rate = 0.95;    // etwas langsamer = feierlicher

    // Passende deutsche Stimme suchen, falls vorhanden
    const stimmen = window.speechSynthesis.getVoices();
    const deutscheStimme = stimmen.find(function (s) {
      return s.lang && s.lang.toLowerCase().startsWith("de");
    });
    if (deutscheStimme) rede.voice = deutscheStimme;

    rede.onstart = function () {
      textElement.classList.add("is-speaking");
      statusElement.textContent = "Der Audioguide spricht …";
    };

    rede.onend = function () {
      textElement.classList.remove("is-speaking");
      statusElement.textContent = "Ende der Führung. Vielen Dank fürs Zuhören!";
    };

    rede.onerror = function () {
      textElement.classList.remove("is-speaking");
      statusElement.textContent = "Die Wiedergabe konnte leider nicht gestartet werden.";
    };

    window.speechSynthesis.speak(rede);
  }

  // Buttons verbinden
  if (startButton) startButton.addEventListener("click", starteAudio);
  if (stopButton) stopButton.addEventListener("click", stoppeAudio);

  // Beim Schließen des Modals (Kreuz, Esc, Klick daneben) wird die Wiedergabe beendet
  if (modal) modal.addEventListener("hidden.bs.modal", stoppeAudio);

  // Beim Verlassen oder Neuladen der Seite ebenfalls stoppen
  window.addEventListener("beforeunload", stoppeAudio);

  /* -------------------------------------------------------------------
     6. JAHRESZAHL IM FOOTER
     Setzt automatisch das aktuelle Jahr ein.
     ------------------------------------------------------------------- */
  const jahrElement = document.getElementById("jahr");
  if (jahrElement) {
    jahrElement.textContent = new Date().getFullYear();
  }
});