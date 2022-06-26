import type {NextPage} from 'next'
import React, {useCallback, useMemo, useState} from "react";
import {v4} from "uuid";
import {Reference} from "./reference";
import {ImageRef} from "../libs/ref/image";
import {imageRefStoreDb} from "../libs/db/db";
import {useLiveQuery} from "dexie-react-hooks";

const Home: NextPage = () => {
    const [imageList, setImageList] = useState<Array<ImageRef>>([
        new ImageRef("https://images.pexels.com/photos/4221068/pexels-photo-4221068.jpeg?cs=srgb&fm=jpg&w=1280&h=1920", 'default', 'default')
    ])

    const addImage = useCallback(async (src: string, alt: string) => {
        const image = new ImageRef(src, alt, v4());
        // MEMO: 関数でないと即時更新できず複数ファイル追加に対応できない
        setImageList((imageList) => [...imageList, image])

        await image.saveBlob();
        await imageRefStoreDb.imageRefs.add(image)
            .catch(e => console.error("cant add image to db: " + e))
    }, [])


    const loadedImages = useLiveQuery(
        () => {
            try {
                return imageRefStoreDb.imageRefs.toArray()
            } catch (e) {
                console.warn('failed to load items')
                return [];
            }
        }
    );

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

    const bringToFront = useCallback((uuid: string) => {
        console.log(loadedImages)
        const find = imageList.find(i => i.uuid === uuid)!
        if (find) {
            setImageList([...imageList.filter((i) => i.uuid !== uuid), find]);
        }
    }, [imageList]);

    const imageElementList = imageList.map((image) => {
        return (
            <Reference image={image} key={image.uuid} bringToFront={bringToFront}/>
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
