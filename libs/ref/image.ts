export class ImageRef {
    public uuid: string;
    public readonly src: string
    public readonly alt: string
    public blobString?: string

    constructor(src: string, alt: string = "hi", id: string) {
        this.src = src;
        this.alt = alt;
        this.uuid = id;
    }

    async saveBlob() {
        const file = await fetch(this.src).then(r => r.blob())
        this.blobString = await file.text()
    }

    getSrc() {
        if (!this.blobString) {
            this.saveBlob();
            return this.src;
        }
        return this.src;
    }
}
