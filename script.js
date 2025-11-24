function htmlEscape(text) {
    text = String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
    return text;
}

function htmlEscapeTag(segments, ...interpolations) {
    const parts = segments.slice(0, 1);
    for (let i=0; i<interpolations.length; i++) {
        parts.push(
            htmlEscape(interpolations[i]),
            segments[i + 1]
        );
    }
    return parts.join("");
}

async function resilientFetch(input) {
    try {
        return await fetch(input);
    } catch(err) {
        if (err instanceof TypeError) {
            await new Promise(r => setTimeout(r, 200));
            return fetch(input);
        } else {
            throw err;
        }
    }
}

async function getLatestVersion() {
    const resp = await resilientFetch("https://jsr.io/@gohjy/init-scripts/meta.json");
    const jsonData = await resp.json();
    return jsonData.latest;
}

async function getExports(version) {
    const resp = await resilientFetch(`https://jsr.io/@gohjy/init-scripts/${version}_meta.json`);
    const jsonData = await resp.json();
    return Object.keys(jsonData.exports);
}

async function main() {
    const latestVersion = await getLatestVersion();
    const exports = await getExports(latestVersion);

    const exportUris = exports.map(x => x.slice(2));

    const mainArea = document.querySelector(".main-area");

    for (const exportUri of exportUris) {
        const div = document.createElement("div");
        div.classList.add("instruction-section");
        div.innerHTML = htmlEscapeTag`
        <h2><code>${exportUri}</code></h2>
        <code>deno run jsr:@gohjy/init-scripts@${latestVersion}/${exportUri}</code>
        `;
        mainArea.append(div);
    }
    document.querySelector(".loading-screen").classList.remove("active");
}

main();
