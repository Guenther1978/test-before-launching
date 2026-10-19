
'use strict';
document.addEventListener('DOMContentLoaded', function () {

  // Zeit in ms zum betrachten der Bilder im Automatik-Modus
  const zeitZumBetrachten = 1000;

  // click-Handler auf alle Galerien legen. KÖNNTE man auch auf den Body legen und Bubbling nutzen, aber dann bekommt
  // man mit currentTarget die Galerie nicht geschenkt (und muss sie vom target mit closest(''.gallery') suchen)
  document.querySelectorAll(".gallery")
          .forEach( gallery => gallery.addEventListener("click", handleGalleryClick) );
  // EIGENEN click-Handler auf den Fullview.
  document.getElementById("gallery-fullview")
          .addEventListener("click", handleFullviewClickAndKeydown);
  // EIGENEN keydown-Handler aufs Dokument.
  document.addEventListener("keydown", handleFullviewClickAndKeydown);

  // Klick in einer Galerie ist simpel, das behandelt alles die showInFullview Funktion,
  // die auch vom handleFullviewClickAndKeydown zum navigieren verwendet wird.
  function handleGalleryClick(event) {
    // event.target ist das img Element oder welches HTML auch immer sonst im Thumb steckt. Suche
    // das a Element als Bezugspunkt für die Fullview-Anzeige heraus
    const clickedLink = event.target.closest("a");

    // Nicht auf einen Link geklickt? Nichts tun.
    if (!clickedLink) return;
    event.preventDefault();

    // Delegiere den Rest...
    showInFullview(clickedLink);
  }

  function showInFullview(link) {
          // der Fullscreen-Viewer
    const fullview = document.getElementById("gallery-fullview"),
          // die Galerie zum geklickten Link
          gallery = link.closest(".gallery"),
          // Das Thumbnail-Bild darin, brauchen wir für ...
          thumb = link.querySelector("img"),
          // ... den Caption-Text, der aus dem alt-Attribut generiert wird.
          caption = thumb ? thumb.alt : "";

    // Den angeklickten Link zum aria-selected Element machen
    link.parentElement.querySelectorAll("a[aria-selected]").forEach(link => link.removeAttribute("aria-selected"));
    link.setAttribute("aria-selected", "true");

    // src-Attribut im Vollbild auf das verlinkte Bild setzen und Caption in figcaption eintragen
    fullview.querySelector("img").src = link.href;
    fullview.querySelector("figcaption").textContent = caption;

    // Galerie-ID speichern für click-Handler im Fullview und Fullview einblenden (falls noch nicht passiert)
    fullview.dataset.gallery = gallery.id;
    fullview.showModal();
  }

  function handleFullviewClickAndKeydown(event) {
    const fullview = document.getElementById("gallery-fullview")
    if(!fullview) return;
    const gallery = document.getElementById(fullview.dataset.gallery);
    if(!gallery) return;
    const currentThumb = gallery.querySelector("a[aria-selected]");
    if (!currentThumb) return;
    let nextThumb,action="",stopped;

    if(event.type == "keydown") {
      action = event.key; // Welche Taste wurde gedrückt?
    }
    if(event.type == "click") {
      const clickedButton = event.target.closest("button");
      // Nicht auf einen Button geklickt? Nichts tun.
      if (!clickedButton) return;
      action = clickedButton.value; // Welcher Button wurde geklickt?
    }

    switch (action) {
      case 'close':
      case 'Escape':
      case 'x':
        stopAnimations(fullview);
        fullview.close();
        fullview.dataset.gallery = null;
        gallery.querySelector("a[aria-selected]").focus();
        break;
      case 'prev':
      case 'ArrowLeft':
        // Ausführliche Version
        nextThumb = navigateDOM(currentThumb,
                                elem => elem.previousElementSibling,
                                elem => elem.tagName == "A");
        if (!nextThumb)
          nextThumb = gallery.querySelector("a:last-of-type")

        showInFullview(nextThumb);
        break;
      case 'next':
      case 'ArrowRight':
        // Kompaktversion als Einzeiler
        showInFullview(navigateDOM(currentThumb, elem => elem.nextElementSibling, elem => elem.tagName == "A") || gallery.querySelector("a:first-of-type"));
        break;
      case 'play':
      case 'r':
        // Evtl. laufende Animationen benden
        stopped = stopAnimations(fullview);
        if (!stopped.playStopped)  {
          // Mit setInterval die Bilder nacheinander zeigen (next animieren)
          fullview.play = setInterval(function() {
           showInFullview(navigateDOM(gallery.querySelector("a[aria-selected]"), elem => elem.nextElementSibling, elem => elem.tagName == "A") ||
                        gallery.querySelector("a:first-of-type"));
          }, zeitZumBetrachten);
          fullview.classList.add("play");
        }
        break;
      case 'shuffle':
      case 's':
        // Evtl. laufende Animationen benden
        stopped = stopAnimations(fullview);
        if (!stopped.shuffleStopped) {
          // Per Zufall das nächste Bilde ermitteln und anzeigen
          const allThumbs = gallery.querySelectorAll("a");
          let randomNumber,lastNumber=-1;
          fullview.shuffle = setInterval(function() {
            do {
              randomNumber = Math.floor(Math.random()*allThumbs.length);
            } while(randomNumber == lastNumber)
            showInFullview(allThumbs[randomNumber]);
            lastNumber = randomNumber;
          }, zeitZumBetrachten);
          fullview.classList.add("shuffle");
        }
        break;
      case 'p':
        // Evtl. laufende Animationen benden
        stopAnimations(fullview);
        break;
    }

    /* Helper: Navigiere schrittweise durch's DOM, bis eine Bedingung erfüllt ist
     * "current" - Ausgangspunkt (ein HTML Elemnt)
     * Was das "nächste" Thumbnail-Element ist, legt der proceed-Callback fest.
     * Die Funktion sucht ausdrücklich nach a-Elementen - wenn andere Elemente im
     * Container sind, werden sie übersprungen. Wird kein Link mehr gefunden, gibt
     * die Funktion null zurück - um den Rest kümmere sich bitte der Aufrufer.
     */
    function navigateDOM(current, proceed, checkFound) {
      if (!current)
        return null;
      while (current = proceed(current)) {
        if (checkFound(current))
          break;
      }
      return current;
    }

    /* Helper: Beende evtl. laufende Animationen und gebe zurück,
     * welche Animation beendet wurde. */
    function stopAnimations(fullviewElement) {
      let playStopped = false,
          shuffleStopped = false;
      if(fullview.play) {
        clearInterval(fullviewElement.play);
        fullviewElement.play = null;
        fullviewElement.classList.remove("play");
        playStopped = true;
      }
      if(fullviewElement.shuffle) {
        clearInterval(fullviewElement.shuffle);
        fullviewElement.shuffle = null;
        fullviewElement.classList.remove("shuffle");
        shuffleStopped = true;
      }
      return { "playStopped": playStopped, "shuffleStopped": shuffleStopped };
    }

  }

});

