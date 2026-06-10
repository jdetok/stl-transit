import { JSX, useEffect, useRef, useState } from "react";
import { selectBlockProps, selectOption } from "./SelectBlock";
import '@esri/calcite-components/dist/components/calcite-list';
import '@esri/calcite-components/dist/components/calcite-list-item';
import { List } from '@esri/calcite-components/dist/components/calcite-list';

import { Block } from "./Container";

export default function ListBlock({ id, heading, onChange, optsProps }: selectBlockProps) {
    const dropdownRef = useRef<List>(null);
    const [fetchedOpts, setFetchedOpts] = useState<selectOption[]>([]);
    
    // fetch options if necessary
    useEffect(() => {
        if (!optsProps?.dataUrl) return;
        fetch(optsProps.dataUrl)
            .then(r => {
                console.log('response:', r.status, r.ok);
                return r.json();
            })
            .then(data => {
                const labels: string[] = optsProps.mapFeatures?.(data.features)
                    ?? data.features.map((f: any) => f.properties.route_desc);
                setFetchedOpts(labels.map(label => ({ label, value: label })));
            })
            .catch(err => console.error('DropdownBlock fetch error:', err));
    }, [optsProps?.dataUrl]);

    // list change handler
    useEffect(() => {
        const el = dropdownRef.current;
        if (!el || !onChange) return;
        const handler = () => {
            const selected = (el as any).selectedItems?.map((item: any) => item.dataset?.value ?? item.getAttribute('data-value'));
            if (!selected?.length) return;
            console.log('selected:', selected);
            onChange(selected.length === 1 ? selected[0] as string | string[] : selected);
        };
        el.addEventListener('calciteListChange', handler);
        return () => el.removeEventListener('calciteListChange', handler);
    }, [onChange]);

    const options: JSX.Element[] = [];
    const allOpts = [...(optsProps?.opts ?? []), ...fetchedOpts];
    allOpts.forEach(opt => {
        options.push(
            <calcite-list-item key={opt.value} data-value={opt.value} label={opt.label}></calcite-list-item>
        );
    });

    return (
        <Block id={id} childType='select' heading={heading}>
            <calcite-list ref={dropdownRef} name={id} selection-mode='multiple' label={heading as string}>
                {options}
            </calcite-list>
        </Block>
    );
}