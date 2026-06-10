import { JSX, useEffect, useRef, useState } from "react";
import { selectBlockProps, selectOption } from "./SelectBlock";
import '@esri/calcite-components/dist/components/calcite-dropdown';
import '@esri/calcite-components/dist/components/calcite-dropdown-group';
import '@esri/calcite-components/dist/components/calcite-dropdown-item';
import { Dropdown } from '@esri/calcite-components/dist/components/calcite-dropdown';
import '@esri/calcite-components/dist/components/calcite-button';
import { Block } from "./Container";

export default function DropdownBlock({ id, heading, onChange, optsProps, value }: selectBlockProps) {
    const dropdownRef = useRef<Dropdown>(null);
    const [fetchedOpts, setFetchedOpts] = useState<selectOption[]>([]);
    
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

    useEffect(() => {
        const el = dropdownRef.current;
        if (!el || !onChange) return;
        const handler = () => {
            const selected = (el as any).selectedItems?.map((item: any) => item.textContent?.trim() ?? item.label ?? item.value);
            if (!selected?.length) return;
            onChange(selected.length === 1 ? selected[0] as string | string[] : selected);
        };
        el.addEventListener('calciteDropdownSelect', handler);
        return () => el.removeEventListener('calciteDropdownSelect', handler);
    }, [onChange]);

    const options: JSX.Element[] = [];
    if (optsProps?.allOpt) {
        const { label, value } = optsProps.allOpt;
        options.push(
            <calcite-dropdown-item key='all' value={value}>{label}</calcite-dropdown-item>
        );
    }
    const allOpts = [...(optsProps?.opts ?? []), ...fetchedOpts];
    allOpts.forEach(opt => {
        options.push(
            <calcite-dropdown-item key={opt.value} value={opt.value}>{opt.label}</calcite-dropdown-item>
        );
    });

    return (
        <Block id={id} childType='select' heading={heading}>
            <calcite-dropdown ref={dropdownRef} name={id} selection-mode='multiple'>
                <calcite-button slot='trigger'>{value ?? heading}</calcite-button>
                <calcite-dropdown-group selection-mode='multiple'>{options}</calcite-dropdown-group>
            </calcite-dropdown>
        </Block>
    );
}