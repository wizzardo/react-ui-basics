import React, {useState} from 'react';
import "./index.css"
import Dropzone from "../react-ui-basics/Dropzone";
import "../react-ui-basics/Dropzone.css";

export default {
    title: 'Dropzone',
    component: Dropzone,
};

export const story1 = ({}) => {
    const [files, setFiles] = useState([])
    return <React.Fragment>
        <Dropzone onDrop={setFiles} overlayLabel={'Drop files here'}>
            <br/><br/>
            Click or drop files here
            <br/><br/>
            {files.map(it => <div>{it.name}</div>)}
            <br/>
        </Dropzone>
    </React.Fragment>;
};
story1.story = {
    name: 'basic',
};
