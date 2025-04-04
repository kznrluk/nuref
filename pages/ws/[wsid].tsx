import type {NextPage} from 'next'
import React, {useCallback, useEffect, useState} from "react";
import {createImageRefFromUrl, ImageRef} from "../../libs/ref/image";
import {deleteImageRef, imageRefDb} from "../../libs/db/imageRefDb";
import Reference from "../../components/ref/reference";
import {useRouter} from "next/router";
import Head from 'next/head';
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {useTranslation} from "react-i18next";
import Menu from "../../components/menu";

const WorkSpace: NextPage = () => {
    const [t, i18n] = useTranslation();
    const [imageList, setImageList] = useState<Array<ImageRef>>([])
    const [focusedUUID, setFocusedUUID] = useState<string | null>(null);
    const [isAltMode, setIsAltMode] = useState<boolean>(false);
    const [isImageViewMode, setIsImageViewMode] = useState<boolean>(false);
    const [lastImageDeleted, setLastImageDeleted] = useState<boolean>(false);
    const [tutorialStep, setTutorialStep] = useState<number>(0);
    const [workSpaceID, setWorkSpaceID] = useState<string | null>(null);
    const [availableWorkSpaceIDList, setAvailableWorkSpaceIDList] = useState<string[]>([]);
    const [isIOS, setIsIOS] = useState<boolean>(false);

    useEffect(() => {
        const ua = window.navigator.userAgent.toLowerCase();
        if (ua.indexOf("ipad") > -1 || (ua.indexOf("macintosh") > -1 && "ontouchend" in document) || /[ \(]ip/.test(ua)) {
            setIsIOS(true)
        }

        if (window) {
            const lang = window.navigator.language;
            i18n.changeLanguage(lang === 'ja' ? 'ja' : 'en')
        }
    }, [i18n])

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

        if (imageList.filter(i => i.workSpaces.includes(workSpaceID!)).length === 1) {
            setLastImageDeleted(true);
        }

        deleteImageRef(target);
        setImageList(imageList.filter(e => e.uuid !== target.uuid));
    }, [imageList, workSpaceID])

    useEffect(() => {
        if (workSpaceID && workSpaceID !== 'main' && !imageList.some(i => i.workSpaces.includes(workSpaceID))) {
            if (lastImageDeleted) {
                toast.warn(t('n_last_image_deleted', {workSpaceID}))
            } else {
                toast.success(t('n_new_workspace', {workSpaceID}))
            }
            setLastImageDeleted(false);
        }

        if (router.isReady && imageList.length === 0 && workSpaceID === 'main' && !lastImageDeleted) {
            if (isIOS) {
                toast.error(t('warn_ios'), {autoClose: false})
            } else {
                setTutorialStep(1);
                toast(t('t_welcome_nuref'), {autoClose: false})
            }
        }
        if (tutorialStep === 1 && imageList.length >= 1 && workSpaceID === 'main') {
            setTutorialStep(2);
            toast(t('t_image_added'), {autoClose: false})
        }
        if (tutorialStep === 2 && imageList.length >= 2 && workSpaceID === 'main') {
            setTutorialStep(3);
            toast(t('t_workspace'), {autoClose: false})
        }
        if (tutorialStep === 3 && workSpaceID !== 'main') {
            setTutorialStep(4);
            setTimeout(() => toast(t('t_workspace_url'), {autoClose: false}), 500);
        }
    }, [imageList, isIOS, lastImageDeleted, router.isReady, t, tutorialStep, workSpaceID])

    const deleteFocusedImage = useCallback(() => {
        if (focusedUUID !== null) {
            deleteImage(focusedUUID);
        }
    }, [focusedUUID, deleteImage]);

    useEffect(() => {
        if (router.isReady && workSpaceID) {
            const targetPath = '/ws/' + workSpaceID;
            if (router.asPath !== targetPath) {
                router.replace(targetPath)
            }
        }
    }, [workSpaceID, router, router.isReady])

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

    const addImageFromFiles = useCallback((fileList: FileList) => {
        let added = false;
        // @ts-ignore
        for (const file of fileList) {
            if (file.type.startsWith("image/")) {
                const url = URL.createObjectURL(file);
                added = true;
                addImage(url)
            }
        }
        if (!added) {
            if (window.navigator.userAgent.toLowerCase().indexOf('mac os x') > -1) {
                toast.warn(t('warn_macos_add_file'))
            } else if (window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                toast.warn(t('warn_firefox_add_file'))
            }
        }
    }, [addImage, t])

    const onPaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
        // @ts-ignore
        for (const item of event.clipboardData.items) {
            if (item.type.startsWith('image')) {
                event.preventDefault();
                event.stopPropagation();
                const file = item.getAsFile()
                const url = URL.createObjectURL(file);
                addImage(url)
            }
        }
    }, [addImage])

    const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        addImageFromFiles(event.dataTransfer.files);
    }, [addImageFromFiles]);

    const onInput = useCallback((event: React.FormEvent<HTMLDivElement>) => {
        // Firefox && Paste
        event.preventDefault()
        const imageTag = event.currentTarget.querySelector("img");
        if (imageTag) {
            addImage(imageTag.src)
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
                isAltMode={isAltMode}
                addImageFromFiles={addImageFromFiles}
            />
        );
    })


    return (
        <>
            <Head>
                <title>{workSpaceID ?? workSpaceID + " - NuRef"}</title>
            </Head>
            <div
                contentEditable={!isIOS}
                style={{
                    position: 'absolute',
                    top: 0,
                    margin: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'default',
                }}
                onPaste={onPaste}
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
                    backgroundColor: isImageViewMode ? 'rgba(255, 255, 255, 0.3)' : 'unset',
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

            <Menu
                isAltMode={isAltMode}
                isImageViewMode={isImageViewMode}
                workSpaceID={workSpaceID}
                workSpaceList={availableWorkSpaceIDList}

                onWorkSpaceIDChange={setWorkSpaceID}
                onFileInputChange={() => document.getElementById('selectFiles')!.click()}
                onAltModeButtonClick={() => setIsAltMode(!isAltMode)}
                onImageViewButtonClick={() => {
                    setIsImageViewMode(!isImageViewMode)
                    setFocusedUUID('')
                }}
            />
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={"light"}
            />
        </>
    )
}

export default WorkSpace
