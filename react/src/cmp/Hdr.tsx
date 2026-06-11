type hdrProps = { ttl: string };

export default function Hdr({ ttl }: hdrProps) {
    return (
        <div className='hdr'>{ttl}</div>
    )
}