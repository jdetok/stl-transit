import '@esri/calcite-components/dist/components/calcite-slider';
import { Block, blockProps } from "@/cmp/calcite/Container";
import { ReactNode } from "react";

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
    return (
        <Block id={id} childType='slider' heading={heading}>
            <calcite-slider
                min={min}
                max={max}
                name={id}
                value={value}
                step={step}
                style={{ width: '200px' }}
                oncalciteSliderInput={onInput ? (e: CustomEvent) => onInput(e.detail.value) : undefined}
            />
        </Block>
    );
}