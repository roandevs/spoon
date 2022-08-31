import Dropzone from 'react-dropzone-uploader';

export default function UploadFiles(props){
    return (
        <div id='upload-files'>
            <Dropzone
                onChangeStatus={props.handleChangeStatus}
                onSubmit={props.handleSubmit}
            />
        </div>
    )
}