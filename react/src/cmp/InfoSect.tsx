import { dispNone, infoSect } from "@/consts";
import { infoSectProps } from "@/types";

export default function InfoSect({ blocks }: infoSectProps) {
    return (
        <div id={infoSect} style={dispNone}>{
            blocks.map((b, i) => (
                <div key={`${b.id}-${i}`} id={b.id} style={dispNone}>
                    <h2>{b.ttl}</h2>
                    <p>{b.infoTxt}</p>
                    <div>{
                        b.children
                            ? <>{ b.children }</>
                            : b.child
                                ? <>{b.child}</>
                                : b.sects
                                    ? b.sects.map((s, i) => (
                                        <div key={i}>
                                            <h3>{s.ttl}</h3>
                                            <p>{s.txt}</p>
                                        </div>
                                    ))         
                                    : b.multiTxt
                                        ? b.multiTxt.map((t, i) => (
                                            <p key={i}>{t}</p>
                                        ))
                                        : <p>{b.txt}</p>
                    }</div>
                </div>
            ))
        }</div>
    )
}