type itemProps = { txt: string, link?: string };
type ftrProps = { items: itemProps[] };

export default function Ftr({ items }: ftrProps) {
    return (
        <div className='ftr'>{
            items.map(item => (
                <div>{
                    item.link ? <a href={item.link}>{item.txt}</a> : <span>{item.txt}</span>
                }</div>
            ))
        }</div>
    )
}