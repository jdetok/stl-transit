import { dispNone, infoSect } from "@/consts";
import { infoSectProps } from "@/types";

export default function InfoSect({ blocks }: infoSectProps) {
    return (
        <div id={infoSect} style={dispNone}>{
            blocks.map((b, i) => (
                <div key={`${b.id}-${i}`} id={b.id} style={dispNone}>
                    <h2>{b.ttl}</h2>
                    <p>{b.txt}</p>
                </div>
            ))
        }</div>
    )
}