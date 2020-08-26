import React from 'react';
import "./index.css"
import ImageGallery, {ImageGalleryContainer} from "../react-ui-basics/ImageGallery";

export default {
    title: 'ImageGallery',
    component: ImageGallery,
};

class Attachment extends React.Component {
    render() {
        const {src, href, imgRef, data} = this.props;
        return <a className="image" onClick={this.onClick} onMouseDown={this.onMouseDown} href={href} target="_blank">
            <img ref={imgRef} src={src}/>
        </a>
    }

    onClick = (e) => {
        const {data, onClick} = this.props;
        onClick && onClick(e, data);
    };
    onMouseDown = (e) => {
        const {data, onMouseDown} = this.props;
        onMouseDown && onMouseDown(e, data);
    };
}

class ImageGalleryHolder extends React.Component {

    imageRefs = {};

    render() {
        const {attachments} = this.props;
        return <div className={"ImageGalleryHolder"}>
            <ImageGalleryContainer ref={it => this.gallery = it}/>
            <div className="images">
                {attachments.map(it =>
                    <Attachment key={it.id} imgRef={ref => this.imageRefs[it.id] = ref}
                                href={it.full}
                                src={it.thumbnail}
                                data={it}
                                onClick={this.preventIfImage} onMouseDown={this.showGallery}/>
                )}
            </div>
        </div>
    }

    showGallery = (e, attachment) => {
        if (attachment.isImage) {
            const images = this.props.attachments
                .map(it => this.imageRefs[it.id] && {
                    id: it.id,
                    previewUrl: it.thumbnail,
                    url: it.full,
                    el: this.imageRefs[it.id],
                })
                .filter(it => !!it);

            this.gallery.show({
                images,
                index: images.findIndex(it => it.id === attachment.id),
            });

            e.preventDefault()
        }
    };

    preventIfImage = (e, attachment) => attachment.isImage && e.preventDefault();
}

export const story1 = () => <div>
    <ImageGalleryHolder attachments={[
        {
            id: 0,
            isImage: true,
            thumbnail: 'https://picsum.photos/id/1002/367/267',
            full: 'https://picsum.photos/id/1002/4312/2868'
        }
    ]}/>
</div>;
story1.story = {
    name: 'single image',
};

export const story2 = () => <div>
    <ImageGalleryHolder attachments={[
        {
            id: 0,
            isImage: true,
            thumbnail: 'https://picsum.photos/id/1002/367/267',
            full: 'https://picsum.photos/id/1002/4312/2868'
        },
        {
            id: 1,
            isImage: true,
            thumbnail: 'https://picsum.photos/id/102/367/267',
            full: 'https://picsum.photos/id/102/4320/3240'
        },
        {
            id: 2,
            isImage: true,
            thumbnail: 'https://picsum.photos/id/1047/367/267',
            full: 'https://picsum.photos/id/1047/3264/2448'
        },
    ]}/>
</div>;
story2.story = {
    name: 'Several images',
};
