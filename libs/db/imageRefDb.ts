import Dexie, {Table} from "dexie";
import {DB_NAME} from "../config";
import {ImageRef} from "../ref/image";

class ImageRefStore extends Dexie {
    imageRefs!: Table<ImageRef, number>

    constructor() {
        super(DB_NAME);
        this.version(1).stores({
            imageRefs: '&uuid'
        })
        this.imageRefs.mapToClass(ImageRef);
    }
}

export const imageRefDb = new ImageRefStore();
export const updateImageRef = (imageRef: ImageRef) => {
    imageRefDb.imageRefs.put(imageRef);
}
