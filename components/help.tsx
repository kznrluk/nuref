import React, {ReactElement} from "react";
import {BsFolderPlus} from "react-icons/bs";

const Help = (): ReactElement => {
    return (
        <div
            style={{
                position: 'absolute',
                top: '64px',
                left: '12px',
                width: '512px',
                height: '200px',
                borderRadius: '3px',
                border: 'dashed',
                padding: '16px',
                color: '#e8eaec'
            }}
        >
            <div style={{height: '100%'}}>
                <div>
                    <p style={{margin: 0, padding: 0, fontWeight: 'bold', paddingBottom: '8px'}}>Add Image</p>
                    <p style={{margin: 0, paddingBottom: '16px'}}>Click <BsFolderPlus/> icon or drag and drop your image
                        on blank area.</p>
                </div>
                <div>
                    <p style={{margin: 0, padding: 0, fontWeight: 'bold', paddingBottom: '8px'}}>Delete Image</p>
                    <p style={{margin: 0}}>Click on the image to be deleted and then press the delete key.</p>
                </div>
                <div style={{paddingTop: '24px', textAlign: 'center'}}>
                    <a style={{margin: 0, padding: 0, width: '100%', fontWeight: 'lighter'}}
                       href="https://github.com/kznrluk/nuref">
                        Support the project by clicking on the Star on GitHub🌟
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Help
