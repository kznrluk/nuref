import type {NextPage} from 'next'
import React, {useCallback, useEffect, useState} from "react";
import {createImageRefFromUrl, ImageRef} from "../../libs/ref/image";
import {deleteImageRef, imageRefDb} from "../../libs/db/imageRefDb";
import Reference from "../../components/reference";
import {BsColumns, BsColumnsGap, BsFolderPlus, BsGithub, BsShift, BsShiftFill} from "react-icons/bs";
import {useRouter} from "next/router";
import CreatableSelect from "react-select/creatable";
import Head from 'next/head';

const WorkSpace: NextPage = () => {
    const [imageList, setImageList] = useState<Array<ImageRef>>([])
    const [focusedUUID, setFocusedUUID] = useState<string | null>(null);
    const [emojiIndex, setEmojiIndex] = useState<number>(0);
    const [isAltMode, setIsAltMode] = useState<boolean>(false);
    const [isImageViewMode, setIsImageViewMode] = useState<boolean>(false);
    const [workSpaceID, setWorkSpaceID] = useState<string | null>(null);
    const [availableWorkSpaceIDList, setAvailableWorkSpaceIDList] = useState<string[]>([]);

    const router = useRouter();
    // MEMO: Next側でエスケープしてくれるのでXSSは大丈夫
    const {wsid} = router.query;
    useEffect(() => {
        if (router.isReady) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setWorkSpaceID(!wsid || wsid.length === 0 ? 'main' : Array.isArray(wsid) ? wsid[0] : wsid)
        }
    }, [router.isReady, wsid])

    const addImage = useCallback(async (src: string) => {
        if (!workSpaceID) {
            return;
        }
        const image = await createImageRefFromUrl(src, workSpaceID);
        // MEMO: 関数でないと即時更新できず複数ファイル追加に対応できない
        setImageList((imageList) => [...imageList, image])

        await imageRefDb.imageRefs.add(image)
            .catch(e => console.error("cant add image to db: " + e))
    }, [workSpaceID])

    const deleteImage = useCallback((targetUUID: string) => {
        const target = imageList.find(({uuid}) => uuid === targetUUID);
        if (!target) {
            return false;
        }
        deleteImageRef(target);
        setImageList(imageList.filter(e => e.uuid !== target.uuid));
    }, [imageList])

    const deleteFocusedImage = useCallback(() => {
        if (focusedUUID !== null) {
            deleteImage(focusedUUID);
        }
    }, [focusedUUID, deleteImage]);

    useEffect(() => {
        if (workSpaceID) {
            router.replace('/ws/' + workSpaceID)
        }
    }, [workSpaceID])

    useEffect(() => {
        if (!workSpaceID) return;
        try {
            // 重いかも
            imageRefDb.imageRefs.toArray().then(records => {
                let wsList: string[] = [];
                const result = records
                    .filter(i => {
                        wsList.push(...i.workSpaces)
                        return i.workSpaces.includes(workSpaceID);
                    })
                    .sort((a, b) => a.positionUpdated - b.positionUpdated)
                result.forEach(e => e.clearObjectURL())
                setImageList(result);
                // @ts-ignore
                setAvailableWorkSpaceIDList([...new Set(wsList)])
            });
        } catch (e) {
            console.warn('failed to load items')
        }
    }, [workSpaceID])

    useEffect(() => {
        document.onkeydown = (ev) => {
            const code = ev.code;
            if (code === 'Delete') {
                deleteFocusedImage();
            }
            if (code === 'ShiftLeft' && !isAltMode) {
                setIsAltMode(true)
            }
        };

        document.onkeyup = (ev) => {
            const code = ev.code;
            if (code === 'ShiftLeft') {
                setIsAltMode(false)
            }
        }
    }, [isAltMode, deleteFocusedImage])

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
                addImage(url)
            } else {
                //
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
                addImage(url)
            }
        }
    }, [addImage])

    const onInput = useCallback((event: React.FormEvent<HTMLDivElement>) => {
        event.preventDefault()
        const imageTag = event.currentTarget.querySelector("img");
        if (imageTag) {
            addImage(imageTag.src)
        } else {
            console.log("not image")
        }

        event.currentTarget.innerHTML = '';
    }, [addImage])

    const bringToFront = useCallback((uuid: string) => {
        const find = imageList.find(i => i.uuid === uuid)!
        if (find) {
            setImageList([...imageList.filter((i) => i.uuid !== uuid), find]);
            setIsImageViewMode(false);
        }
    }, [imageList]);

    const imageElementList = imageList.map((image) => {
        return (
            <Reference
                focused={() => {
                    bringToFront(image.uuid);
                    setFocusedUUID(image.uuid);
                }}
                isImageViewMode={isImageViewMode}
                isFocused={focusedUUID === image.uuid} image={image}
                removeFocus={() => setFocusedUUID('')}
                removeMySelf={() => {
                    deleteImage(image.uuid)
                }}
                key={image.uuid}
                opt={{isAltMode: isAltMode}}
            />
        );
    })

    return (
        <>
            <Head>
                <title>{workSpaceID} - NuRef</title>
            </Head>
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

            <div
                style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row-reverse',
                    flexWrap: 'wrap',
                    gap: '90px 20px',
                    backgroundColor: isImageViewMode ? 'rgba(255, 255, 255, 0.5)' : 'unset',
                }}
            >
                {imageElementList}
            </div>

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
                    position: 'fixed',
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
                    >NuRef β {['🖼️', '🎨', '🧑‍🎨', '🖌️'][emojiIndex]}</p>
                </div>
                <div>
                    {router.isReady ?
                        <CreatableSelect
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    height: '3px',
                                    borderRadius: '3px',
                                    borderWidth: 0,
                                    minHeight: '30px',
                                    width: '150px'
                                }),
                                valueContainer: (provided) => ({
                                    ...provided,
                                    padding: '0px 4px'
                                }),
                                indicatorsContainer: (provided) => ({
                                    ...provided,
                                    padding: '0px 0px'
                                }),
                                dropdownIndicator: (provided) => ({
                                    ...provided,
                                    padding: '0px 8px'
                                })
                            }}
                            options={availableWorkSpaceIDList.map(e => ({value: e, label: e}))}
                            value={{value: workSpaceID, label: workSpaceID}}
                            isClearable={false}
                            onChange={(option) => {
                                const value = option!.value!;
                                setWorkSpaceID(value);
                            }}
                        ></CreatableSelect>
                        :
                        <p>loading</p>
                    }

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
                        cursor: 'pointer',
                        paddingTop: '3px',
                    }}
                    onClick={() => setIsAltMode(!isAltMode)}
                >
                    {isAltMode ? <BsShiftFill/> : <BsShift/>}
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
                    onClick={() => {
                        setIsImageViewMode(!isImageViewMode)
                        setFocusedUUID('')
                    }}
                >
                    {isImageViewMode ? <BsColumns/> : <BsColumnsGap/>}
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
                    <a href="https://github.com/kznrluk/nuref" target="_blank" rel="noreferrer"><BsGithub/></a>
                </div>
            </div>
        </>
    )
}

export default WorkSpace
