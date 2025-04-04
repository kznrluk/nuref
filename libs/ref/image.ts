import {v4} from "uuid";

export class ImageRef {
    public uuid: string;
    public blob: Blob;
    public position = {x: 100, y: 100, width: 250, height: 250, rotate: 0}
    public positionUpdated: number = 0
    public isFlipped: boolean = false;
    public croppedImageBlob: Blob | null = null;
    public croppedImageObjectURL: string | undefined;
    public workSpaces: string[] = [];

    public meta: string | null = null; // 予備

    private objectURL: string | undefined;

    constructor(blob: Blob, id: string) {
        this.blob = blob;
        this.uuid = id;
    }

    clearObjectURL() {
        this.objectURL = '';
        this.croppedImageObjectURL = '';
    }

    updatePosition(x: number | null, y: number | null, width: number | null, height: number | null, rotate: number | null) {
        this.position = {
            x: x ?? this.position.x,
            y: y ?? this.position.y,
            width: width ?? this.position.width,
            height: height ?? this.position.height,
            rotate: rotate ?? this.position.rotate,
        }

        this.positionUpdated = Date.now()
    }

    setCroppedBlob(blob: Blob) {
        this.croppedImageBlob = blob;
        this.croppedImageObjectURL = URL.createObjectURL(this.croppedImageBlob);
    }

    getOriginalSrc() {
        if (this.objectURL) {
            return this.objectURL;
        }

        this.objectURL = URL.createObjectURL(this.blob);
        return this.objectURL;
    }

    getSrc() {
        if (this.croppedImageBlob) {
            if (this.croppedImageObjectURL) {
                return this.croppedImageObjectURL;
            }
            this.croppedImageObjectURL = URL.createObjectURL(this.croppedImageBlob);
            return this.croppedImageObjectURL;
        }

        return this.getOriginalSrc();
    }
}

export const createImageRefFromUrl = (src: string, workSpaceID: string): Promise<ImageRef> => {
    return new Promise(async (resolve, reject) => {
        try {
            const blob = await fetch(src).then(r => r.blob());
            const imageRef = new ImageRef(blob, v4());
            imageRef.workSpaces = [workSpaceID];

            const tempUrl = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                const naturalWidth = img.naturalWidth;
                const naturalHeight = img.naturalHeight;

                const MAX_SIZE = 500;
                let initialWidth = naturalWidth;
                let initialHeight = naturalHeight;

                if (initialWidth > MAX_SIZE || initialHeight > MAX_SIZE) {
                    const ratio = Math.min(MAX_SIZE / initialWidth, MAX_SIZE / initialHeight);
                    initialWidth = Math.max(1, Math.round(initialWidth * ratio)); // 最小1px
                    initialHeight = Math.max(1, Math.round(initialHeight * ratio)); // 最小1px
                } else if (initialWidth <= 0 || initialHeight <= 0) {
                    initialWidth = 250;
                    initialHeight = 250;
                }

                imageRef.updatePosition(null, null, initialWidth, initialHeight, null);

                URL.revokeObjectURL(tempUrl);
                resolve(imageRef);
            };
            img.onerror = (err) => {
                URL.revokeObjectURL(tempUrl);
                console.error("Failed to load image dimensions:", err);
                imageRef.updatePosition(null, null, 250, 250, null);
                resolve(imageRef);
            };
            img.src = tempUrl;

        } catch (error) {
            console.error("Failed to create ImageRef:", error);
            reject(error);
        }
    });
}
