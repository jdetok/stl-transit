type hdrProps = { ttl: string };

export default function Hdr({ ttl }: hdrProps) {
    return (
        <div className="hdr">
            <h1>{ttl}</h1>
        </div>
    )
}