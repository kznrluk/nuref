import React, {ReactElement} from 'react';
import styles from './controller.module.scss';
import {BiCrop, BiMinusFront, BiTrash} from "react-icons/bi";
import {CgEditFlipH} from "react-icons/cg";

interface ControllerProps {
    onClickCropButton: () => void;
    onClickFlipButton: () => void;
    onClickPopUpButton: () => void;
    onClickTrashButton: () => void;
}

function Controller(props: ControllerProps): ReactElement {
    return (
        <div className={styles.controller}>
            <button>
                <BiCrop onClick={props.onClickCropButton}/>
            </button>
            <button>
                <CgEditFlipH onClick={props.onClickFlipButton}/>
            </button>
            <button>
                <BiMinusFront onClick={props.onClickPopUpButton}/>
            </button>
            <button>
                <BiTrash onClick={props.onClickTrashButton}/>
            </button>
        </div>
    );
}

export default Controller;
