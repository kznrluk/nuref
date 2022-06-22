import type {NextPage} from 'next'
import React, {useCallback, useRef, useState} from "react";
import {Rnd} from "react-rnd";
import {DraggableEvent} from "react-draggable";
import {v4} from "uuid";

class ImageRef {
    public uuid: string;
    public readonly src: string
    public readonly alt: string
    public callback: (img: ImageRef) => void;

    private image: any;
    private naturalSize: [number, number] = [0, 0];

    constructor(src: string, alt: string = "hi", id: string) {
        this.src = src;
        this.alt = alt;
        this.uuid = id;
        this.callback = () => {
        };

        if (typeof window !== "undefined") {
            this.image = new window.Image();
            this.image.src = this.src;
            this.image.onload = () => {
                this.naturalSize = [this.image.naturalWidth, this.image.naturalHeight]
                this.callback(this);
            }
        }
    }

    onReady(func: (img: ImageRef) => void) {
        this.callback = func;
    }

    getDefaultSize(): [number, number] {
        return this.naturalSize;
    }

    render() {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={this.src}
                alt={this.alt}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
        )
    }
}

const Home: NextPage = () => {
    const [imageList, setImageList] = useState<Array<ImageRef>>([
        new ImageRef("https://images.pexels.com/photos/4221068/pexels-photo-4221068.jpeg?cs=srgb&fm=jpg&w=1280&h=1920", 'default', 'default')
    ])

    const rndRef = useRef(null);

    const addImage = useCallback((src: string, alt: string) => {
        const image = new ImageRef(src, alt, v4());
        image.onReady(i => {
            // MEMO: 関数でないと即時更新できず複数ファイル追加に対応できない
            setImageList((imageList) => [...imageList, i])
        })
    }, [])

    const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        const fileList = event.dataTransfer.files;
        const files: File[] = [];

        for (let i = 0; i < fileList.length; i++) {
            // 😇😇😇
            const f = fileList.item(i);
            if (f) {
                files.push(f)
            }
        }

        for (const file of files) {
            if (file.type.startsWith("image/")) {
                const url = URL.createObjectURL(file);
                addImage(url, 'ok')
            } else {
                addImage("", "Non supported file: " + file.type)
            }
        }
    }, [addImage]);

    const onPaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
        if (!event.clipboardData
            || !event.clipboardData.types
            || (event.clipboardData.types.length != 1)
            || (event.clipboardData.types[0] != "Files")) {
            return;
        }

        if (event.clipboardData.items[0]) {
            const file = event.clipboardData.items[0].getAsFile();
            if (file) {
                event.preventDefault()
                const url = URL.createObjectURL(file);
                addImage(url, 'ok')
            }
        }
    }, [addImage])

    const onInput = useCallback((event: React.FormEvent<HTMLDivElement>) => {
        event.preventDefault()
        const imageTag = event.currentTarget.querySelector("img");
        if (imageTag) {
            addImage(imageTag.src, imageTag.alt)
        } else {
            console.log("not image")
        }

        event.currentTarget.innerHTML = '';
    }, [addImage])

    const bringToFront = useCallback((ev: DraggableEvent) => {
        const target = ev.currentTarget as unknown as HTMLDivElement
        const uuid = target.getAttribute('imageuuid')
        if (uuid !== null) {
            setImageList([...imageList.filter((i) => i.uuid !== uuid), imageList.find(i => i.uuid === uuid)!]);
        }
    }, [imageList]);

    const imageElementList = imageList.map((image) => {
        const [imageWidth, imageHeight] = image.getDefaultSize();
        const ratio = imageWidth / imageHeight;
        const width = 500 * ratio;
        const height = 500;

        return (
            <Rnd
                default={{
                    x: 150,
                    y: 205,
                    width, height
                }}
                minWidth={30}
                minHeight={30}
                bounds="window"
                key={image.uuid}
                imageuuid={image.uuid}
                onDragStart={(e) => {
                    bringToFront(e);
                    e.preventDefault()
                }}
                style={{
                    backgroundColor: '#FAFAFA'
                }}
                ref={rndRef}
            >
                {image.render()}
            </Rnd>
        );
    })

    return (
        <>
            <div
                contentEditable={true}
                style={{
                    position: 'absolute',
                    top: 0,
                    margin: 0,
                    width: '100%',
                    height: '100%',
                }}
                onPaste={(e) => onPaste(e)}
                onInput={(e) => onInput(e)}
                onDrop={(e) => onDrop(e)}
            >
            </div>

            {imageElementList}
        </>
    )
}

export default Home
