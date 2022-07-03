import {NextPage} from "next";
import {useEffect, useRef, useState} from "react";
import {imageRefDb} from "../libs/db/imageRefDb";
import {ImageRef} from "../libs/ref/image";

const Popup: NextPage = () => {
    const [image, setImage] = useState<ImageRef>();
    const imageDivRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const query = new URLSearchParams(location.search)
        const uuid = query.get('uuid')
        try {
            if (uuid) {
                imageRefDb.imageRefs.get(uuid)
                    .then((d) => {
                        if (d) {
                            setImage(d)
                        }
                    })
            }
        } catch (e) {
            console.warn('failed to load items')
        }
    }, [])


    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: 'linear-gradient(45deg, #cccccc 25%, transparent 25%, transparent 75%, #cccccc 75%), linear-gradient(45deg, #cccccc 25%, transparent 25%, transparent 75%, #cccccc 75%)',
            backgroundColor: '#FFFFFF',
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 16px 16px',
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden'
        }}>
            {image ?
                <div
                    ref={imageDivRef}
                    id={"imageDiv_" + image.uuid}
                    style={{
                        height: '100vh',
                        width: '100vw',
                        transform: `rotate(${image.position.rotate}deg)`,
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={image.getSrc()}
                        style={{
                            objectFit: 'cover',
                            transform: image.isFlipped ? 'scaleX(-1)' : '',
                            maxWidth: '100%',
                            maxHeight: '100%'
                        }}
                     alt=""
                    />
                </div>
                : <p>Loading...</p>
            }
        </div>
    )
}

export default Popup;