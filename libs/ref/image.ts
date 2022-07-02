import {v4} from "uuid";

export class ImageRef {
    public uuid: string;
    public blob: Blob;
    public position = {x: 100, y: 100, width: 250, height: 250, rotate: 0}
    public positionUpdated: number = 0

    private objectURL: string | undefined;

    constructor(blob: Blob, id: string) {
        this.blob = blob;
        this.uuid = id;
    }

    clearObjectURL() {
        this.objectURL = '';
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

    getSrc() {
        if (this.objectURL) {
            return this.objectURL;
        }

        this.objectURL = URL.createObjectURL(this.blob);
        return this.objectURL;
    }
}

export const createImageRefFromUrl = async (src: string) => {
    const blob = await fetch(src).then(r => r.blob())
    return new ImageRef(blob, v4());
}
