import React, {ReactElement, useEffect, useRef, useState} from "react";
import {ImageRef} from "../libs/ref/image";
import {updateImageRef} from "../libs/db/imageRefDb";
import Moveable, { OnDrag, OnDragEnd, OnResize, OnRotate} from "react-moveable";
import {flushSync} from "react-dom";
import {OnResizeEnd, OnRotateEnd} from "react-moveable/types";

export interface OptionMap {
    isAltMode: boolean
}

const Reference = (
    props: { image: ImageRef, isFocused: boolean, focused: () => void, opt: OptionMap }
): ReactElement => {
    const image = props.image
    const divRef = useRef<HTMLDivElement>(null);
    // todo
    const [isEditMode] = useState<boolean>(false);

    const imageElement = (
        <div
            id={"imageDiv_" + image.uuid}
            ref={divRef}
            style={{
                position: 'absolute',
                top: image.position.x!,
                left: image.position.y!,
                width: `${image.position.width}px`,
                height: `${image.position.height}px`,
                transform: `rotate(${image.position.rotate}deg)`,
                boxShadow: props.isFocused ? '0 0 16px 4px rgba(0, 0, 0, 0.5)' : '0 0 16px 4px rgba(0, 0, 0, 0.25)',
                overflow: isEditMode ? 'visible' : 'hidden'
            }}
            onMouseDown={() => props.focused()}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                id={"image_" + image.uuid}
                src={image.getSrc()}
                alt=""
                style={{
                    position: "absolute",
                    width: `100%`,
                    height: `100%`,
                    objectFit: 'cover',
                }}
                onDragStart={(e) => e.preventDefault()}
            />
        </div>
    )

    useEffect(() => {
        if (image.positionUpdated === 0) {
            divRef.current?.addEventListener('load', (event) => {
                const img = event.currentTarget as HTMLImageElement;
                if (img) {
                    const ratio = img.naturalWidth / img.naturalHeight;
                    const width = 500 * ratio;
                    const height = 500;
                    image.updatePosition(null, null, width, height, null);
                    if (divRef.current) {
                        divRef.current.style.width = `${width}px`;
                        divRef.current.style.height = `${height}px`;
                    }
                }
            })
        }
    }, [divRef, image])

    const isFocused = props.isFocused;
    const isAltMode = props.opt.isAltMode

    return (
        <>
            {imageElement}

            <Moveable
                flushSync={flushSync}
                target={document.getElementById("imageDiv_" + image.uuid)}
                draggable={isFocused && !isEditMode}
                origin={false}

                throttleDrag={0}
                onDragStart={() => props.focused()}
                onDrag={({target, left, top,}: OnDrag) => {
                    target!.style.left = `${left}px`;
                    target!.style.top = `${top}px`;
                }}
                onDragEnd={(event: OnDragEnd) => {
                    const {target} = event;
                    image.updatePosition(
                        +target.style!.top.split('px')[0],
                        +target.style!.left.split('px')[0],
                        +target.style!.width.split('px')[0],
                        +target.style!.height.split('px')[0],
                        null
                    );
                    updateImageRef(image);
                }}

                resizable={isFocused && !isEditMode}
                keepRatio={!isEditMode}
                onResize={(event: OnResize) => {
                    const {target, width, height, delta, drag} = event;

                    const {left, top} = drag;
                    target!.style.left = `${left}px`;
                    target!.style.top = `${top}px`;
                    delta[0] && (target!.style.width = `${width}px`);
                    delta[1] && (target!.style.height = `${height}px`);
                }}
                onResizeEnd={(event: OnResizeEnd) => {
                    const {target} = event;
                    image.updatePosition(
                        +target.style!.top.split('px')[0],
                        +target.style!.left.split('px')[0],
                        +target.style!.width.split('px')[0],
                        +target.style!.height.split('px')[0],
                        null
                    );
                    updateImageRef(image);
                }}

                rotatable={isFocused && !isEditMode}
                onRotate={(event: OnRotate) => {
                    const {target, rotate, transform} = event;
                    if (!isAltMode) {
                        target!.style.transform = transform;
                    } else {
                        const throttle = Math.round(rotate / 22.5) / (1 / 22.5)
                        target!.style.transform = `rotate(${throttle}deg)`;
                    }
                }}
                onRotateEnd={(event: OnRotateEnd) => {
                    const rotateEvent = event.lastEvent as OnRotate;
                    let value = rotateEvent.rotate;
                    if (isAltMode) {
                        value = Math.round(value / 22.5) / (1 / 22.5)
                    }
                    const {target} = event;

                    image.updatePosition(
                        null,
                        null,
                        +target.style!.width.split('px')[0],
                        +target.style!.height.split('px')[0],
                        value,
                    );

                    updateImageRef(image);
                }}
            />
        </>
    )
}

export default Reference
