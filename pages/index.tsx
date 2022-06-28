import type {NextPage} from 'next'
import React, {useCallback, useState} from "react";
import {Reference} from "./reference";
import {createImageRefFromUrl, ImageRef} from "../libs/ref/image";
import {imageRefDb} from "../libs/db/imageRefDb";
import {useLiveQuery} from "dexie-react-hooks";

const Home: NextPage = () => {
    const [imageList, setImageList] = useState<Array<ImageRef>>([
        // new ImageRef("https://images.pexels.com/photos/4221068/pexels-photo-4221068.jpeg?cs=srgb&fm=jpg&w=1280&h=1920", 'default', 'default')
    ])

    const addImage = useCallback(async (src: string, alt: string) => {
        const image = await createImageRefFromUrl(src);
        // MEMO: 関数でないと即時更新できず複数ファイル追加に対応できない
        setImageList((imageList) => [...imageList, image])

        await imageRefDb.imageRefs.add(image)
            .catch(e => console.error("cant add image to db: " + e))
    }, [])


    useLiveQuery(
        async () => {
            try {
                // 重いかも
                const records = await imageRefDb.imageRefs.toArray();
                setImageList(records.sort((a, b) => a.positionUpdated - b.positionUpdated));
            } catch (e) {
                console.warn('failed to load items')
            }
        }
    , [addImage]);

    const addImageFromFiles = useCallback((fileList: FileList) => {
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
    }, [addImage])

    const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        addImageFromFiles(event.dataTransfer.files);
    }, [addImageFromFiles]);

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

            <input
                type="file"
                accept="image/*"
                style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    fontSize: '16px'
                }}
                onChange={(event) => {
                    event.preventDefault();
                    if (event.currentTarget.files) {
                        addImageFromFiles(event.currentTarget.files)
                    }
                }}
            />
        </>
    )
}

export default Home
