
const CHIAVE_SALVATAGGIO = "progettoNonIdentificato";

let dati = JSON.parse(localStorage.getItem(CHIAVE_SALVATAGGIO)) || {
    saldo: 20,
    movimenti: []
};

let tipoOperazione = "uscita";
let movimentoDaModificare = null;
let filtroAttivo = "tutti";
let meseVisualizzato = new Date();
meseVisualizzato.setDate(1);

const saldoElemento = document.getElementById("saldo");
const entrateElemento = document.getElementById("totaleEntrate");
const usciteElemento = document.getElementById("totaleUscite");
const listaElemento = document.getElementById("listaMovimenti");

function formatoEuro(valore) {
    return valore.toLocaleString("it-IT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " €";
}

function salvaDati() {
    localStorage.setItem(CHIAVE_SALVATAGGIO, JSON.stringify(dati));
}

function aggiornaApp() {
    saldoElemento.textContent = formatoEuro(dati.saldo);

    const oggi = meseVisualizzato;

const nomeMese = oggi.toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric"
});

document.getElementById("meseSelezionato").textContent =
    nomeMese.charAt(0).toUpperCase() + nomeMese.slice(1);

    const movimentiMese = dati.movimenti.filter(m => {
        const data = new Date(m.data);

        return data.getMonth() === oggi.getMonth() &&
               data.getFullYear() === oggi.getFullYear();
    });

    const entrate = movimentiMese
        .filter(m => m.tipo === "entrata")
        .reduce((totale, m) => totale + m.importo, 0);

    const uscite = movimentiMese
        .filter(m => m.tipo === "uscita")
        .reduce((totale, m) => totale + m.importo, 0);

    entrateElemento.textContent = formatoEuro(entrate);
    usciteElemento.textContent = formatoEuro(uscite);

    listaElemento.innerHTML = "";

    if (dati.movimenti.length === 0) {
        listaElemento.innerHTML = "<p>Nessun movimento registrato.</p>";
        return;
    }

    dati.movimenti.forEach((m, indice) => {
        // Visualizzazione dal più recente al più vecchio
    });

for (let i = dati.movimenti.length - 1; i >= 0; i--) {
    const m = dati.movimenti[i];

    if (filtroAttivo !== "tutti" && m.tipo !== filtroAttivo) {
        continue;
    }

        const elemento = document.createElement("div");
        elemento.style.display = "flex";
        elemento.style.alignItems = "center";
        elemento.style.justifyContent = "space-between";
        elemento.style.gap = "8px";
        elemento.style.padding = "13px 0";
        elemento.style.borderBottom = "1px solid #333";

        const informazioni = document.createElement("div");
        informazioni.style.flex = "1";
        informazioni.style.minWidth = "0";

        const descrizione = document.createElement("div");
        descrizione.textContent = m.descrizione;
        descrizione.style.fontSize = "14px";
        descrizione.style.overflowWrap = "anywhere";

        const importo = document.createElement("strong");
        importo.textContent =
            (m.tipo === "entrata" ? "+ " : "- ") +
            formatoEuro(m.importo);

        importo.style.display = "block";
        importo.style.marginTop = "5px";
        importo.style.color =
            m.tipo === "entrata" ? "#3988ff" : "#ff424f";

        informazioni.append(descrizione, importo);

        const pulsanti = document.createElement("div");
        pulsanti.style.display = "flex";
        pulsanti.style.gap = "6px";

      const info = document.createElement("button");
info.textContent = "ⓘ";
info.style.padding = "9px";
info.style.background = "#252525";
info.style.color = "#3988ff";

info.onclick = () => mostraDettagli(i);

        const modifica = document.createElement("button");
        modifica.textContent = "✏️";
        modifica.style.padding = "9px";
        modifica.style.background = "#252525";
        modifica.onclick = () => modificaMovimento(i);

        const elimina = document.createElement("button");
        elimina.textContent = "🗑️";
        elimina.style.padding = "9px";
        elimina.style.background = "#252525";
        elimina.onclick = () => eliminaMovimento(i);

        pulsanti.append(info, modifica, elimina);
        elemento.append(informazioni, pulsanti);
        listaElemento.appendChild(elemento);
    }
}

function mostraModulo(tipo) {
    movimentoDaModificare = null;
    tipoOperazione = tipo;

    document.getElementById("titoloModulo").textContent =
        tipo === "entrata" ? "Nuova entrata" : "Nuova uscita";

    document.getElementById("conferma").textContent = "Conferma";

    document.getElementById("descrizione").value = "";
    document.getElementById("importo").value = "";

    document.getElementById("overlay").style.display = "flex";
}

function modificaMovimento(indice) {
    const m = dati.movimenti[indice];

    movimentoDaModificare = indice;
    tipoOperazione = m.tipo;

    document.getElementById("titoloModulo").textContent =
        "Modifica movimento";

    document.getElementById("conferma").textContent = "Salva modifiche";

    document.getElementById("descrizione").value = m.descrizione;
    document.getElementById("importo").value = m.importo;

    document.getElementById("overlay").style.display = "flex";
}

function confermaOperazione() {
    const descrizione = document.getElementById("descrizione").value.trim();

    const importo = Math.round(
        Number(document.getElementById("importo").value) * 100
    ) / 100;

    if (!descrizione) {
        alert("Scrivi una descrizione.");
        return;
    }

    if (!Number.isFinite(importo) || importo <= 0) {
        alert("Inserisci un importo valido.");
        return;
    }

    if (movimentoDaModificare !== null) {
        const vecchio = dati.movimenti[movimentoDaModificare];

        const vecchioValore =
            vecchio.tipo === "entrata" ? vecchio.importo : -vecchio.importo;

        const nuovoValore =
            tipoOperazione === "entrata" ? importo : -importo;

        const nuovoSaldo = Math.round(
            (dati.saldo - vecchioValore + nuovoValore) * 100
        ) / 100;

        if (nuovoSaldo < 0) {
            alert("Saldo insufficiente.");
            return;
        }

        dati.saldo = nuovoSaldo;

        dati.movimenti[movimentoDaModificare] = {
            ...vecchio,
            tipo: tipoOperazione,
            descrizione,
            importo
        };

        movimentoDaModificare = null;

    } else {
        if (tipoOperazione === "uscita" && importo > dati.saldo) {
            alert("Saldo insufficiente.");
            return;
        }

        dati.saldo = Math.round(
            (dati.saldo + (tipoOperazione === "entrata" ? importo : -importo)) * 100
        ) / 100;

        dati.movimenti.push({
            tipo: tipoOperazione,
            descrizione,
            importo,
            data: new Date().toISOString()
        });
    }

    salvaDati();
    aggiornaApp();

    document.getElementById("overlay").style.display = "none";
}

function eliminaMovimento(indice) {
    const m = dati.movimenti[indice];

    if (!confirm("Vuoi eliminare questo movimento?")) {
        return;
    }

    const valore =
        m.tipo === "entrata" ? m.importo : -m.importo;

    dati.saldo = Math.round((dati.saldo - valore) * 100) / 100;

    dati.movimenti.splice(indice, 1);

    salvaDati();
    aggiornaApp();
}

document.getElementById("btnEntrata").onclick =
    () => mostraModulo("entrata");

document.getElementById("btnUscita").onclick =
    () => mostraModulo("uscita");

document.getElementById("conferma").onclick =
    confermaOperazione;

document.getElementById("annulla").onclick = () => {
    movimentoDaModificare = null;
    document.getElementById("overlay").style.display = "none";
};

function mostraDettagli(indice) {
    const m = dati.movimenti[indice];

    document.getElementById("infoDescrizione").textContent =
        "Descrizione: " + m.descrizione;

    document.getElementById("infoImporto").textContent =
        "Importo: " + formatoEuro(m.importo);

    document.getElementById("infoTipo").textContent =
        "Tipo: " + (m.tipo === "entrata" ? "Entrata" : "Uscita");

    const data = new Date(m.data);

    document.getElementById("infoData").textContent =
        "Data: " + data.toLocaleDateString("it-IT") +
        " - " + data.toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit"
        });

    document.getElementById("overlayInfo").style.display = "flex";
}

document.getElementById("chiudiInfo").onclick = () => {
    document.getElementById("overlayInfo").style.display = "none";
};

document.querySelectorAll(".filtro").forEach(pulsante => {
    pulsante.onclick = () => {
        filtroAttivo = pulsante.dataset.filtro;

        document.querySelectorAll(".filtro").forEach(p => {
            p.classList.remove("attivo");
        });

        pulsante.classList.add("attivo");

        aggiornaApp();
    };
});

document.getElementById("mesePrecedente").onclick = () => {
    meseVisualizzato.setMonth(meseVisualizzato.getMonth() - 1);
    aggiornaApp();
};

document.getElementById("meseSuccessivo").onclick = () => {
    meseVisualizzato.setMonth(meseVisualizzato.getMonth() + 1);
    aggiornaApp();
};

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then(() => console.log("App pronta per l'offline"))
            .catch(errore => console.error("Errore Service Worker:", errore));
    });
}

aggiornaApp();
