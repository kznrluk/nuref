import React, {ReactElement, useEffect, useRef} from "react";
import {Position, ResizableDelta, Rnd} from "react-rnd";
import {ImageRef} from "../libs/ref/image";
import {ResizeDirection} from "re-resizable";
import {DraggableData, DraggableEvent} from "react-draggable";
import {updateImageRef} from "../libs/db/imageRefDb";

const Reference = (
    props: { image: ImageRef, bringToFront: (uuid: string) => void, isFocused: boolean, focused: () => void }
): ReactElement => {
    const image = props.image
    const imageRef = useRef<HTMLImageElement>(null);

    const imageElement = (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            ref={imageRef}
            src={image.getSrc()}
            alt=""
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
                x: image.position.x,
                y: image.position.y,
                width: image.position.width,
                height: image.position.height,
            }}
            minWidth={30}
            minHeight={30}
            onDragStart={() => {
                props.bringToFront(image.uuid);
            }}
            style={{
                backgroundColor: '#FAFAFA',
                boxShadow: props.isFocused ? '0 0 16px 4px rgba(0, 0, 0, 0.5)' : '0 0 16px 4px rgba(0, 0, 0, 0.25)',
            }}
            onResizeStop={(e: MouseEvent | TouchEvent, dir: ResizeDirection, elementRef: HTMLElement, delta: ResizableDelta, position: Position) => {
                image.updatePosition(position.x, position.y, elementRef.clientWidth, elementRef.clientHeight)
                updateImageRef(image)
            }}
            onMouseDown={props.focused}
            onDragStop={(e: DraggableEvent, data: DraggableData) => {
                image.updatePosition(data.x, data.y, null, null)
                updateImageRef(image)
            }}
        >
            {imageElement}
        </Rnd>
    )

    useEffect(() => {
        if (image.positionUpdated === 0) {
            imageRef.current?.addEventListener('load', (event) => {
                const img = event.currentTarget as HTMLImageElement;
                if (img) {
                    const ratio = img.naturalWidth / img.naturalHeight;
                    const width = 500 * ratio;
                    const height = 500;
                    image.updatePosition(null,null, width, height);
                    rndRef?.updateSize({width, height})
                }
            })
        }
    }, [rndRef, imageRef, image])

    return (
        rnd
    )
}

export default Reference
