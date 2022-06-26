export class ImageRef {
    public uuid: string;
    public readonly src: string
    public readonly alt: string

    constructor(src: string, alt: string = "hi", id: string) {
        this.src = src;
        this.alt = alt;
        this.uuid = id;
    }
}
