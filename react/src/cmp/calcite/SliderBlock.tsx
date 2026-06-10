import '@esri/calcite-components/dist/components/calcite-slider';
import { Block, blockProps } from "@/cmp/calcite/Container";
import { ChangeEvent, ReactNode, useEffect, useRef } from "react";
import { Slider } from '@esri/calcite-components/dist/components/calcite-slider';

export type sliderProps = {
    min?: number;
    max?: number;
    value?: number;
    step?: number;
    disaled?: boolean;
    onInput?: (value: number) => Promise<void>,
    children?: ReactNode;
};

export type sliderBlockProps = Omit<blockProps, 'childType' | 'key'> & sliderProps & { id: string };

export default function SliderBlock({ id, heading, onInput, min, max, value, step }: sliderBlockProps) {
    const sliderRef = useRef<Slider>(null);

    useEffect(() => {
        const el = sliderRef.current;
        if (!el || !onInput) return;
        
        const handler = () => {
            const value = sliderRef.current?.value;
            if (value === null) return;
            onInput(value as number);
        };

        el.addEventListener('calciteSliderChange', handler);
        return () => {
            el.removeEventListener('calciteSliderChange', handler);
        };
    }, [onInput]);

    return (
        <Block id={id} childType='slider' heading={heading}>
            <calcite-slider
                ref={sliderRef}
                min={min}
                max={max}
                name={id}
                value={value}
                step={step}
                style={{ width: '200px' }}
            />
        </Block>
    );
}