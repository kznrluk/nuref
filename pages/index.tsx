import type {NextPage} from 'next'
import styles from '../styles/Home.module.css'
import {useCallback, useState} from "react";
import {useDropzone} from "react-dropzone";
import {Rnd} from "react-rnd";
import {DraggableEvent} from "react-draggable";
import {MdAddPhotoAlternate} from "react-icons/md";

class Image {
    static id: number = 0;
    public readonly src: string
    public readonly alt: string

    constructor(src: string, alt: string = "hi") {
        this.src = src;
        this.alt = alt;
    }
}

const Home: NextPage = () => {
    const [imageList, setImageList] = useState<Array<Image>>([new Image("https://lh6.googleusercontent.com/qiVwW2ENIaLVzpbgPHYObF_qJlqButdv3E54S3QsX8QTmjx_kYjEz1D0Z0w1sBW--W8bvvPFoZ_YfA=w1282-h1232")])

    const onDrop = useCallback(async (files: File[]) => {
        for (const file of files) {
            if (file.type.startsWith("image/")) {
                const url = URL.createObjectURL(file);
                console.log(url)
                setImageList([...imageList, new Image(url)])
            } else {
                setImageList([...imageList, new Image("", "Non supported file: " + file.type)])
            }
        }
    }, [imageList]);

    const bringToFront = useCallback((ev: DraggableEvent) => {
        const target = ev.currentTarget as unknown as HTMLDivElement
        const indexAttr = target.getAttribute('index')
        if (indexAttr !== null) {
            const index = Number(indexAttr)
            setImageList([...imageList.filter((_, i) => i != index), imageList[index]]);
        }
    }, [imageList]);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    const imageElementList = imageList.map((image, index) => {
        return (
            <Rnd
                index={index}
                default={{
                    x: 150,
                    y: 205,
                    width: 500,
                    height: 190,
                }}
                minWidth={30}
                minHeight={30}
                bounds="window"
                key={image.src}
                onDragStart={(e) => {
                    bringToFront(e);
                    e.preventDefault()
                }}
                style={{
                    backgroundColor: '#FAFAFA'
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt={image.alt}
                     style={{
                         width: '100%',
                         height: '100%',
                         objectFit: 'cover',
                     }}></img>
            </Rnd>
        );
    })

    return (
        <>
            <div {...getRootProps()} className={styles.container}>
                <input {...getInputProps()} />
                {
                    isDragActive ?
                        <MdAddPhotoAlternate style={{fontSize: "64px"}}/> :
                        <MdAddPhotoAlternate style={{fontSize: "64px"}}/>
                }
            </div>

            {imageElementList}
        </>
    )
}

export default Home
