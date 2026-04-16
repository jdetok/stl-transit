import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildCalciteAction, buildCalciteButton, buildCalciteDropdown, buildCalciteNotice, buildCalcitePanel, buildCalciteSelect, buildCalciteSelectBlock, buildCalciteTable, buildCalciteTableBlock, buildCalciteTooltip } from '../src/calcite';

beforeEach(() => {
    if (!customElements.get('calcite-panel')) {
        customElements.define('calcite-panel', class extends HTMLElement {
            heading: any
            hidden: any
            closable: any
        });
    }
});

describe('ensure factories return expected element', () => {
    const factories: Record<string, { fn: Function, props?: any }> = {
        'calcite-panel': { fn: buildCalcitePanel, props: { heading: 'test', closable: true } },
        'calcite-tooltip': { fn: buildCalciteTooltip, props: { text: 'test' } },
        'calcite-table': { fn: buildCalciteTable, props: { hasHeader: true, rows: [[]] } },
        'calcite-button': { fn: buildCalciteButton, props: { txt: 'test' } },
        'calcite-select': { fn: buildCalciteSelect, props: { heading: 'test', onSelChange: vi.fn() } },
        'calcite-dropdown': { fn: buildCalciteDropdown, props: { heading: 'test', onSelChange: vi.fn() } },
        'calcite-block': { fn: buildCalciteSelectBlock, props: { heading: 'test', selProps: { heading: 'test', onSelChange: vi.fn() } } },
    };
    for (const [tag, f] of Object.entries(factories)) {
        it(`returns a ${tag} element`, async () => {
            let el: any;
            if (f.fn.constructor.name.toLowerCase().includes('async')) {
                el = await (f.fn(f.props));
            } else {
                el = f.fn(f.props);
            }
            expect(el.tagName.toLowerCase()).toBe(tag);
        });
    }
});

describe('buildCalcitePanel() edge cases', () => {
    it('appends a child element to the panel if elementType is passed', () => {
        const panel = buildCalcitePanel({ elementType: 'div' });
        expect(panel.children.length).toBe(1);
    });
    it('appends no children to the panel when elementType is not passed', () => {
        const panel = buildCalcitePanel({});
        expect(panel.children.length).toBe(0);
    });
    it('adds a css class if cssClass is passed', () => {
        const panel = buildCalcitePanel({ cssClass: 'test' });
        expect(panel.classList.length).toBe(1);
    });
    it('classList is empty if cssClass is not passed', () => {
        const panel = buildCalcitePanel({});
        expect(panel.classList.length).toBe(0);
    });
});
