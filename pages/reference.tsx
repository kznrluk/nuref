import React, {ReactElement, useEffect, useRef} from "react";
import {Rnd} from "react-rnd";
import {ImageRef} from "../libs/ref/image";

export const Reference = (
    props: { image: ImageRef, bringToFront: (uuid: string) => void }
): ReactElement => {
    const image = props.image
    const imageRef = useRef<HTMLImageElement>(null);

    const imageElement = (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            ref={imageRef}
            src={image.src}
            alt={image.alt}
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
            }}
            onDragStart={(e) => {
                e.preventDefault();
            }}
        />
    )

    let rndRef: Rnd | null = null;
    const rnd: ReactElement<Rnd> = (
        <Rnd
            ref={c => {
                rndRef = c;
            }}
            default={{
                x: 150,
                y: 205,
                width: 1280 / 3,
                height: 1920 / 3,
            }}
            minWidth={30}
            minHeight={30}
            onDragStart={() => {
                props.bringToFront(image.uuid);
            }}
            style={{
                backgroundColor: '#FAFAFA'
            }}
        >
            {imageElement}
        </Rnd>
    )

    useEffect(() => {
        imageRef.current?.addEventListener('load', (event) => {
            const img = event.currentTarget as HTMLImageElement;
            if (img) {
                const ratio = img.naturalWidth / img.naturalHeight;
                const width = 500 * ratio;
                const height = 500;
                rndRef?.updateSize({width, height})
            }
        })
    }, [rndRef, imageRef])

    return (
        rnd
    )
}


