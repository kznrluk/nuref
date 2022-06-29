import type {NextPage} from 'next'
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {createImageRefFromUrl, ImageRef} from "../libs/ref/image";
import {deleteImageRef, imageRefDb} from "../libs/db/imageRefDb";
import Reference from "../components/reference";

const Home: NextPage = () => {
    const [imageList, setImageList] = useState<Array<ImageRef>>([
        // new ImageRef("https://images.pexels.com/photos/4221068/pexels-photo-4221068.jpeg?cs=srgb&fm=jpg&w=1280&h=1920", 'default', 'default')
    ])
    const [focusedUUID, setFocusedUUID] = useState<string|null>(null);

    useMemo(() => console.log(focusedUUID), [focusedUUID])

    const addImage = useCallback(async (src: string, alt: string) => {
        const image = await createImageRefFromUrl(src);
        // MEMO: 関数でないと即時更新できず複数ファイル追加に対応できない
        setImageList((imageList) => [...imageList, image])

        await imageRefDb.imageRefs.add(image)
            .catch(e => console.error("cant add image to db: " + e))
    }, [])

    const deleteFocusedImage = useCallback(() => {
        const target = imageList.find(({uuid}) => uuid === focusedUUID);
        if (!target || focusedUUID === '') {
            return false;
        }
        deleteImageRef(target);
        setImageList(imageList.filter(e => e.uuid !== target.uuid));
    }, [imageList, focusedUUID]);

    useEffect(() => {
        try {
            // 重いかも
            imageRefDb.imageRefs.toArray().then(records => {
                const result = records.sort((a, b) => a.positionUpdated - b.positionUpdated)
                result.forEach(e => e.clearObjectURL())
                setImageList(result);
            });
        } catch (e) {
            console.warn('failed to load items')
        }
    }, [])

    useEffect(() => {
        document.onkeydown = (ev) => {
            const code = ev.code;
            if (code === 'Delete') {
                deleteFocusedImage();
            }
        };
    }, [deleteFocusedImage])

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
            <Reference focused={() => setFocusedUUID(image.uuid)} isFocused={focusedUUID === image.uuid} image={image} key={image.uuid} bringToFront={bringToFront}/>
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
                onMouseDown={() => setFocusedUUID('')}
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
                    event.currentTarget.value = '';
                }}
            />
        </>
    )
}

export default Home
