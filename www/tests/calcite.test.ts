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

describe('buildCalcitePanel()', () => {
    it('returns a calcite-panel element', () => {
        const el = buildCalcitePanel({heading: 'test', closable: true});
        expect(el.tagName.toLowerCase()).toBe('calcite-panel');
    });
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