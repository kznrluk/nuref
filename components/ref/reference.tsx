import React, {ReactElement, useEffect, useRef, useState} from "react";
import {ImageRef} from "../../libs/ref/image";
import {updateImageRef} from "../../libs/db/imageRefDb";
import Moveable, {OnDrag, OnDragEnd, OnResize, OnRotate} from "react-moveable";
import {flushSync} from "react-dom";
import {OnResizeEnd, OnRotateEnd} from "react-moveable/types";
import 'react-image-crop/dist/ReactCrop.css'
import Controller from "./controller";
import clsx from "clsx";
import styles from "./reference.module.scss"
import Editor from "./editor";

export interface OptionMap {
    isAltMode: boolean
}

const Reference = (
    props: { image: ImageRef, isFocused: boolean, isImageViewMode: boolean, removeFocus: () => void, removeMySelf: () => void, focused: () => void, opt: OptionMap }
): ReactElement => {
    const image = props.image
    const [isFlipped, setIsFlipped] = useState<boolean>(image.isFlipped);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [isIOS, setIsIOS] = useState<boolean>(false);
    const [isUpdatingSize, setIsUpdatingSize] = useState<boolean>(false);
    const viewImageRef = useRef<HTMLImageElement>(null)
    const [referenceSize, setReferenceSize] = useState<number[]>([image.position.width, image.position.height])
    const [isPopupMode, setIsPopupMode] = useState<Window | null>(null);

    const isFocused = props.isFocused;
    const isAltMode = props.opt.isAltMode

    useEffect(() => {
        const ua = window.navigator.userAgent.toLowerCase();
        if (ua.indexOf("ipad") > -1 || (ua.indexOf("macintosh") > -1 && "ontouchend" in document) || /[ \(]ip/.test(ua)) {
            setIsIOS(true)
        }
    }, [])

    useEffect(() => {
        image.isFlipped = isFlipped;
        updateImageRef(image)
    }, [image, isFlipped])

    const popupButtonHandler = () => {
        const opened = window.open(
            `/popup?uuid=${image.uuid}`, '_blank',
            `popup=1,width=${referenceSize[0] * 1.3},height=${referenceSize[1] * 1.3}`
        );
        const timer = setInterval(() => {
            if (opened!.closed) {
                clearInterval(timer);
                setIsPopupMode(null)
                props.focused();
            }
        }, 150);

        props.removeFocus();
        setIsPopupMode(opened)
    };

    const controller = (
        <Controller
            onClickCropButton={() => setIsEditMode(true)}
            onClickFlipButton={() => setIsFlipped(!isFlipped)}
            onClickPopUpButton={popupButtonHandler}
            onClickTrashButton={() => props.removeMySelf()}
        />
    )

    const imageElement = (
        <div
            id={"imageDiv_" + image.uuid}
            className={clsx(
                styles.reference,
                isFocused && styles.referenceIsFocused,
                isPopupMode && styles.referencePopUpMode,
                props.isImageViewMode && styles.referenceViewMode,
            )}

            style={{
                top: image.position.x!,
                left: image.position.y!,
                width: props.isImageViewMode ? '20%' : referenceSize[0],
                height: props.isImageViewMode ? 'unset' : referenceSize[1],
                transform: `rotate(${image.position.rotate}deg)`,
            }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                ref={viewImageRef}
                src={image.getSrc()}
                alt="reference"
                style={{ transform: isFlipped ? 'scaleX(-1)' : 'unset' }}
                onDragStart={(e) => e.preventDefault()}
                onMouseDown={() => props.focused()}
            />
            { isFocused ? controller : '' }
        </div>
    )

    useEffect(() => {
        if (image.positionUpdated === 0 || isUpdatingSize) {
            const img = viewImageRef.current!;
            img.onload = () => {
                const ratio = img.naturalWidth / img.naturalHeight;
                const width = 500 * ratio;
                const height = 500;
                image.updatePosition(null, null, width, height, null);
                updateImageRef(image)
                setReferenceSize([width, height])
                setIsUpdatingSize(false);
                props.removeFocus(); // hotfix: Moveableの枠が残る問題
            }
        }
    }, [image, image.positionUpdated, isUpdatingSize, props])

    const updatePositionFromElement = (target: HTMLElement | SVGElement, rotate: number | null = null) => {
        image.updatePosition(
            +target.style!.top.split('px')[0],
            +target.style!.left.split('px')[0],
            +target.style!.width.split('px')[0],
            +target.style!.height.split('px')[0],
            rotate ? rotate : null
        );
        updateImageRef(image);
        setReferenceSize([+target.style!.width.split('px')[0], +target.style!.height.split('px')[0]]);
    }

    const editor = <Editor image={image} onEditEnd={() => { setIsEditMode(false); setIsUpdatingSize(true) }}></Editor>;
    const viewer = (
        <>
            {isIOS ? controller : "" /* QUICKFIX for iOS */}
            {imageElement}
            <Moveable
                flushSync={flushSync}
                target={document.getElementById("imageDiv_" + image.uuid)}
                draggable={isFocused && !isEditMode}
                origin={false}

                throttleDrag={0}
                onDragStart={() => props.focused()}
                onDrag={({target, left, top}: OnDrag) => {
                    target!.style.left = `${left}px`;
                    target!.style.top = `${top}px`;
                }}
                onDragEnd={(event: OnDragEnd) => updatePositionFromElement(event.target)}

                resizable={isFocused && !isEditMode}
                keepRatio={isAltMode}
                onResize={(event: OnResize) => {
                    const {target, width, height, delta, drag} = event;
                    const {left, top} = drag;
                    target!.style.left = `${left}px`;
                    target!.style.top = `${top}px`;
                    delta[0] && (target!.style.width = `${width}px`);
                    delta[1] && (target!.style.height = `${height}px`);
                }}
                onResizeEnd={(event: OnResizeEnd) => updatePositionFromElement(event.target)}

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
                    const value = rotateEvent.rotate;
                    updatePositionFromElement(event.target, isAltMode ? Math.round(value / 22.5) / (1 / 22.5) : value)
                }}
            />
        </>
    )

    return isEditMode ? editor : viewer
}

export default Reference
