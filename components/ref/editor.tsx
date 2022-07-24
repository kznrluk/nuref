import {ReactElement, useRef, useState} from "react";
import styles from './editor.module.scss';
import ReactCrop, {PixelCrop} from "react-image-crop";
import {ImageRef} from "../../libs/ref/image";
import {createCanvas} from "../../libs/createCanvas";

interface EditorProps {
    image: ImageRef;
    onEditEnd: () => void;
}

const Editor = (props: EditorProps): ReactElement => {
    const image = props.image;
    const [crop, setCrop] = useState<PixelCrop>();
    const cropImageRef = useRef<HTMLImageElement>(null)

    const applyCrop = () => {
        if (cropImageRef.current && crop) {
            const canvas = createCanvas(cropImageRef.current, crop, 0)
            new Promise<Blob | null>((r) => canvas.toBlob(r))
                .then((data) => {
                    if (data) {
                        image.setCroppedBlob(data)
                        props.onEditEnd();
                    }
                })
        }
    }

    return (
        <div className={styles.editor}>
            <div className={styles.cropWrapper}>
                <ReactCrop crop={crop} onChange={(p) => setCrop(p)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={image.getOriginalSrc()}
                        ref={cropImageRef}
                        alt="editing"
                    />
                </ReactCrop>
            </div>
            <button className={styles.editorOkButton} onClick={applyCrop}>OK</button>
        </div>
    )
}

export default Editor;