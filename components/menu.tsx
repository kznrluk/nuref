import {MouseEventHandler, ReactElement} from "react";
import styles from "./menu.module.scss";
import {CSSObjectWithLabel, StylesConfig} from "react-select";
import CreatableSelect from "react-select/creatable";
import {BsColumns, BsColumnsGap, BsFolderPlus, BsGithub, BsShift, BsShiftFill, BsTrash} from "react-icons/bs";
import {FiThumbsDown, FiThumbsUp} from "react-icons/fi";
import Link from "next/link";

const selectStyles: StylesConfig = {
    control: (provided: CSSObjectWithLabel) => ({
        ...provided,
        height: '3px',
        borderRadius: '3px',
        borderWidth: 0,
        minHeight: '30px',
        width: '150px',
        backgroundColor: 'unset'
    }),
    singleValue: (provided: CSSObjectWithLabel) => ({
        ...provided,
        color: '#181a1f',
        textAlign: 'center',
    }),
    valueContainer: (provided: CSSObjectWithLabel) => ({
        ...provided,
        padding: '0px 4px'
    }),
    indicatorSeparator: (provided: CSSObjectWithLabel) => ({
        ...provided,
        display: 'none'
    }),
    indicatorsContainer: (provided: CSSObjectWithLabel) => ({
        ...provided,
        padding: '0px 0px'
    }),
    dropdownIndicator: (provided: CSSObjectWithLabel) => ({
        ...provided,
        padding: '0px 8px'
    })
}

interface MenuProps {
    isAltMode: boolean;
    isImageViewMode: boolean;
    workSpaceID: string | null;
    workSpaceList: string[];

    onWorkSpaceIDChange: (workSpaceID: string) => void;
    onFileInputChange: MouseEventHandler<HTMLButtonElement>;
    onAltModeButtonClick: MouseEventHandler<HTMLButtonElement>;
    onImageViewButtonClick: MouseEventHandler<HTMLButtonElement>;
    onDeleteAllClick: MouseEventHandler<HTMLButtonElement>;
}

const Menu = (props: MenuProps): ReactElement => {
    // const workSpaceID = useWorkSpaceID();
    const workSpaceID = props.workSpaceID

    const currentWorkSpaceIDSelect = {
        value: workSpaceID ?? 'Loading',
        label: workSpaceID ?? 'Loading',
    }

    const workSpaceOptions = props.workSpaceList.map(e => ({ label: e, value: e }))

    return (
        <header className={styles.menu}>
            <Link href="/">NuRef</Link>
            <hr/>
            <div>
                <CreatableSelect
                    instanceId={'workSpaceSelect'}
                    styles={selectStyles}
                    options={workSpaceOptions}
                    value={currentWorkSpaceIDSelect}
                    onChange={(opt) => {
                        // @ts-ignore
                        props.onWorkSpaceIDChange(opt!.value!)
                    }}
                />
            </div>
            <hr/>
            <div className={styles.menuIcons}>
                <button onClick={props.onFileInputChange}>
                    <BsFolderPlus />
                </button>
                <button onClick={props.onAltModeButtonClick}>
                    { props.isAltMode ? <BsShiftFill /> : <BsShift /> }
                </button>
                <button onClick={props.onImageViewButtonClick}>
                    { props.isImageViewMode ? <BsColumns /> : <BsColumnsGap />}
                </button>
                <button onClick={props.onDeleteAllClick} style={{ color: '#dc3545' }}>
                    <BsTrash />
                </button>
            </div>
            <hr />
            <div className={styles.menuIcons}>
                <a href="https://github.com/kznrluk/nuref" target="_blank" rel="noreferrer">
                    <BsGithub />
                </a>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSc1uiiZmnnmolnUdvKJtj_QzXefgFbNLHd9GV1T-PUy_1f7kg/viewform?usp=sf_link" target="_blank" rel="noreferrer">
                    <FiThumbsUp />
                </a>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSfkR0WpcpfoyyL-5Vt4aTpMPKYyN9AnhUAEm1pTTPqZ-syyDw/viewform?usp=sf_link" target="_blank" rel="noreferrer">
                    <FiThumbsDown />
                </a>
            </div>
        </header>
    )
}

export default Menu
