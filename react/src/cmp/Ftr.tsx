import { itemProps } from "@/types";

type ftrProps = { items: itemProps[] };

export default function Ftr({ items }: ftrProps) {
    return (
        <div className='ftr'>{
            items.map((item, i) => (
                <div key={i}>{
                    item.link
                        ? item.linkTxt
                            ? <span>{item.txt}<a href={item.link}></a>{item.linkTxt}</span>
                            : <a href={item.link} target={item.blank ? '_blank' : ''}>{item.txt}</a>
                        : item.onClick
                            ? item.linkTxt
                                ? <span>{item.txt}<button onClick={item.onClick}>{item.linkTxt}</button></span>
                                : <button onClick={item.onClick}>{item.txt}</button>
                            : <span>{item.txt}{item.linkTxt}</span>
                }</div>
            ))
        }</div>
    )
}