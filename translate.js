function onCreated() {
}

browser.menus.create({
  id: "libre-translate",
  title: "Translate page",
  contexts: ["page"]
}, onCreated);

browser.menus.onClicked.addListener((info, tab) => {
  console.log("clicked!");
  switch (info.menuItemId) {
    case "libre-translate":
      console.log("translating...");
      browser.tabs.executeScript(tab.id, {
        code: "Array.from(document.querySelectorAll('p')).map(x => x.innerHTML)",
      }).then((paragraphs) => {
        console.log(paragraphs);
        translatePage(paragraphs[0]).then((translations) => {
          browser.tabs.executeScript(tab.id, {
            code: `let tx = ${JSON.stringify(translations)}; document.querySelectorAll('p').forEach((p, i) => { p.innerHTML = tx[i]; })`
          });
        });
      });
      break;
  }
});

async function translatePage(paragraphs) {
  let translations = [];

  for (const p of paragraphs) {
    console.log(p);
    const res = await fetch("https://DOMAIN/translate", {
        method: "POST",
        body: JSON.stringify({
              q: p,
              source: "de",
              target: "en",
              format: "html"
            }),
        headers: { "Content-Type": "application/json" }
    });

    const body = await res.json();

    console.log(body);

    translations.push(body.translatedText);
  }

  return translations;
}
