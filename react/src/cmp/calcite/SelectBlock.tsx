import { useEffect, useRef , JSX } from "react";
import { Block, blockProps } from "./Container";
import { Select } from '@esri/calcite-components/dist/components/calcite-select';
import { featFilter } from "@/types";

export type selectOption = { value: string; label: string; };

export type selectProps = {
    id: string;
    onChange?: (val: string | string[]) => void;
    optsProps?: {
        allOpt?: selectOption,
        opts?: selectOption[],
        dataUrl?: string,
        mapFeatures?: (features: any[]) => string[];
        filter?: featFilter;
    };
    value?: string; 
}

export type selectBlockProps = Omit<blockProps, 'childType' | 'key'> & selectProps & { };

export default function SelectBlock({ id, heading, onChange, optsProps, value }: selectBlockProps) {
    const selectRef = useRef<Select>(null);

    useEffect(() => {
        const el = selectRef.current;
        if (!el || !onChange) return;
        
        const handler = () => {
            const value = selectRef.current?.value;
            if (value === null) return;
            onChange(value as string);
        };

        el.addEventListener('calciteSelectChange', handler);
        return () => {
            el.removeEventListener('calciteSelectChange', handler);
        };
    }, [onChange]);

    const options: JSX.Element[] = [];
    if (optsProps) {
        const all = optsProps.allOpt;
        if (all) {
            options.push(<calcite-option key='all' label={all.label} value={all.value} />);    
        }
        optsProps.opts?.forEach((opt) => {
            options.push(<calcite-option key={opt.value} label={opt.label} value={opt.value} />);
        });
    }

    return (
        <Block id={id} childType='select' heading={heading}>
            <calcite-select
                ref={selectRef}
                label={heading as string}
                name={id}
                value={value}
            >{options}</calcite-select>
        </Block>
    );
}