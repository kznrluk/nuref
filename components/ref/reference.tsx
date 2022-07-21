import React, {ReactElement, useCallback, useEffect, useRef, useState} from "react";
import {ImageRef} from "../../libs/ref/image";
import {updateImageRef} from "../../libs/db/imageRefDb";
import Moveable, {OnDrag, OnDragEnd, OnResize, OnRotate} from "react-moveable";
import {flushSync} from "react-dom";
import {OnResizeEnd, OnRotateEnd} from "react-moveable/types";
import ReactCrop, {Crop, PixelCrop} from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css'
import {createCanvas} from "../createCanvas";
import Controller from "./controller";
import clsx from "clsx";
import styles from "./reference.module.scss"

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
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const [crop, setCrop] = useState<Crop>()
    const cropImageRef = useRef<HTMLImageElement>(null)
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

    useEffect(() => {
        if (isPopupMode) {
            const timer = setInterval(() => {
                if (isPopupMode.closed) {
                    clearInterval(timer);
                    setIsPopupMode(null)
                    props.focused();
                }
            }, 150);
        }
    }, [isPopupMode])

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
                onMouseDown={() => props.focused()}
            />
            { isFocused ? controller : '' }
        </div>
    )

    const applyCropping = useCallback(() => {
        if (!completedCrop) {
            image.croppedImageBlob = null;
            setIsEditMode(false);
            setIsUpdatingSize(true);
        }
        if (cropImageRef.current && completedCrop) {
            const canvas = createCanvas(cropImageRef.current, completedCrop, 0)
            new Promise<Blob | null>((r) => canvas.toBlob(r))
                .then((data: Blob | null) => {
                    if (data) {
                        image.setCroppedBlob(data)
                        setIsEditMode(false);
                        setIsUpdatingSize(true);
                    }
                })
        }
    }, [completedCrop, image])

    useEffect(() => {
        if (image.positionUpdated === 0 || (viewImageRef.current && isUpdatingSize)) {
            const img = viewImageRef.current!;
            img.onload = () => {
                const ratio = img.naturalWidth / img.naturalHeight;
                const width = 500 * ratio;
                const height = 500;
                image.updatePosition(null, null, width, height, null);
                updateImageRef(image)
                setReferenceSize([width, height])
                props.removeFocus();
                setCrop(undefined)
            }
        }
    }, [image, image.croppedImageBlob, image.positionUpdated, isUpdatingSize, props])

    return (
        <>
            {isEditMode
                ?
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: '#e8eaec',
                        boxShadow: '0 0 16px 4px rgba(0, 0, 0, 0.25)',
                        maxHeight: '850px',
                        width: '650px',
                        padding: '15px',
                        borderRadius: '3px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: '10',
                    }}
                >
                    <div
                        style={{
                            padding: '16px',
                            backgroundColor: '#1d1f22',
                            overflow: 'scroll'
                        }}
                    >
                        <ReactCrop
                            disabled={!isEditMode}
                            crop={crop}
                            onChange={(pixelCrop) => setCrop(pixelCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                overflow: 'visible'
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                ref={cropImageRef}
                                src={image.getOriginalSrc()}
                                style={{
                                    background: 'linear-gradient(45deg, #cccccc 25%, transparent 25%, transparent 75%, #cccccc 75%), linear-gradient(45deg, #cccccc 25%, transparent 25%, transparent 75%, #cccccc 75%)',
                                    backgroundColor: '#FFFFFF',
                                    backgroundSize: '32px 32px',
                                    backgroundPosition: '0 0, 16px 16px',

                                    width: `100%`,
                                    height: `100%`,
                                }}
                                alt=""
                            />
                        </ReactCrop>
                    </div>
                    <button
                        style={{
                            marginTop: '16px',
                            border: '0',
                            color: '#FAFAFA',
                            backgroundColor: "#1d1f22",
                            fontSize: '16px',
                            width: '128px',
                            height: '40px',
                            borderRadius: '100vh',
                            cursor: 'pointer',
                        }}
                        onClick={applyCropping}
                    >OK
                    </button>
                </div>
                :
                <>
                    {isIOS ? controller : "" /* IOSはdivの中に入れるとクリックイベントが効かなくなる */}
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
                        keepRatio={isAltMode}
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
                            setReferenceSize([+target.style!.width.split('px')[0], +target.style!.height.split('px')[0]])
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
            }
        </>
    )
}

export default Reference
