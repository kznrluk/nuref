import Dexie, {Table} from "dexie";
import {DB_NAME} from "../config";
import {ImageRef} from "../ref/image";

class ImageRefStore extends Dexie {
    imageRefs!: Table<ImageRef, string>

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

export const deleteImageRef = (imageRef: ImageRef) => {
    imageRefDb.imageRefs.delete(imageRef.uuid);
}

export const deleteAllImagesInWorkspace = async (workSpaceID: string) => {
    const allImages = await imageRefDb.imageRefs.toArray();
    const imagesToDelete = allImages.filter(image => image.workSpaces.includes(workSpaceID));
    
    for (const image of imagesToDelete) {
        await imageRefDb.imageRefs.delete(image.uuid);
    }
    
    return imagesToDelete.length;
}
