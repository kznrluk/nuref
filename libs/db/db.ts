import Dexie, {Table} from "dexie";
import {DB_NAME} from "../config";
import {ImageRef} from "../ref/image";

class ImageRefStore extends Dexie {
    imageRefs!: Table<ImageRef, number>

    constructor() {
        super(DB_NAME);
        this.version(1).stores({
            imageRefs: '++id'
        })
    }
}

export const imageRefStoreDb = new ImageRefStore()