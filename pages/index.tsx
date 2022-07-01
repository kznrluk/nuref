import type {NextPage} from 'next'
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {createImageRefFromUrl, ImageRef} from "../libs/ref/image";
import {deleteImageRef, imageRefDb} from "../libs/db/imageRefDb";
import Reference from "../components/reference";
import {BsFolderPlus, BsGithub, BsPatchQuestionFill} from "react-icons/bs";
import Help from "../components/help";

const Home: NextPage = () => {
    const [imageList, setImageList] = useState<Array<ImageRef>>([
        // new ImageRef("https://images.pexels.com/photos/4221068/pexels-photo-4221068.jpeg?cs=srgb&fm=jpg&w=1280&h=1920", 'default', 'default')
    ])
    const [focusedUUID, setFocusedUUID] = useState<string | null>(null);
    const [emojiIndex, setEmojiIndex] = useState<number>(0);
    const [showHelp, setShowHelp] = useState<boolean>(false);

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

    useEffect(() => {
        setEmojiIndex(Math.floor(Math.random() * 4));
    }, [])

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
            <Reference focused={() => setFocusedUUID(image.uuid)} isFocused={focusedUUID === image.uuid} image={image}
                       key={image.uuid} bringToFront={bringToFront}/>
        );
    })

    return (
        <>
            {showHelp ? <Help/> : false}
            <div
                contentEditable={true}
                style={{
                    position: 'absolute',
                    top: 0,
                    margin: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'default',
                }}
                onPaste={(e) => onPaste(e)}
                onInput={(e) => onInput(e)}
                onDrop={(e) => onDrop(e)}
                onMouseDown={() => setFocusedUUID('')}
            >
            </div>

            {imageElementList}

            <input
                id="selectFiles"
                type="file"
                accept="image/*"
                style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    fontSize: '16px',
                    display: 'none',
                }}
                onChange={(event) => {
                    event.preventDefault();
                    if (event.currentTarget.files) {
                        addImageFromFiles(event.currentTarget.files)
                    }
                    event.currentTarget.value = '';
                }}
            />

            <div
                style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    padding: '10px',

                    borderRadius: '3px',

                    width: 'auto',
                    height: '40px',
                    backgroundColor: '#e8eaec',
                    boxShadow: '0 0 16px 4px rgba(0, 0, 0, 0.25)',

                    color: "#1d1f22",

                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <div>
                    <p
                        style={{
                            fontSize: '16px',
                            paddingRight: '8px',
                        }}
                    >Power Refs {['🖼️', '🎨', '🧑‍🎨', '🖌️'][emojiIndex]}</p>
                </div>
                <div
                    style={{
                        fontSize: '24px',
                        display: 'grid',
                        placeItems: 'center',
                        paddingLeft: '12px',
                        cursor: 'pointer',
                        paddingTop: '3px',
                    }}
                >
                    <BsFolderPlus
                        onClick={() => {
                            document.getElementById('selectFiles')!.click();
                        }}
                    />
                </div>
                <div
                    style={{
                        fontSize: '24px',
                        display: 'grid',
                        placeItems: 'center',
                        paddingLeft: '12px',
                        paddingTop: '3px',
                    }}
                >
                    <a href="https://github.com/kznrluk/power-refs" target="_blank" rel="noreferrer"><BsGithub/></a>
                </div>
                <div
                    style={{
                        fontSize: '24px',
                        display: 'grid',
                        placeItems: 'center',
                        paddingLeft: '12px',
                        paddingTop: '0px',
                        cursor: 'pointer',
                    }}
                >
                    <BsPatchQuestionFill
                        onClick={() => setShowHelp(!showHelp)}
                    />
                </div>
            </div>
        </>
    )
}

export default Home
