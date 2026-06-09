import { Block, blockProps } from "@cmp/calcite/Container";
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

export type sliderBlockProps = blockProps & sliderProps;

export default function SliderBlock ({ key, heading, onInput, min, max, value, step }: sliderBlockProps) {
    return (
        <Block key={key} childType='slider' heading={heading}>
            <calcite-slider
                min={min}
                max={max}
                value={value}
                step={step}
                oncalciteSliderInput={onInput ? (e: CustomEvent) => onInput(e.detail.value) : undefined}
            />
        </Block>
    );
}