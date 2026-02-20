import { MapWindow, TAG } from "./map-window.js";

const COMPONENTS = [
    {
        tag: TAG,
        cls: MapWindow
    }
]

export function declareCustomElements() {
    for (const c of COMPONENTS) {
        console.trace(`defining element with tag ${c.tag}`);
        customElements.define(c.tag, c.cls);
    }
}