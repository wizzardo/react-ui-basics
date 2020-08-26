import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import './ImageGallery.css'
import Animated from "./Animated";
import Button from "./Button";
import SpinningProgress from "./SpinningProgress";
import {UNDEFINED, preventDefault, stopPropagation, classNames, DOCUMENT, WINDOW, addEventListener, removeEventListener, setTimeout} from "./Tools";
import MaterialIcon from "./MaterialIcon";
import ReactDOM from "react-dom";

const min = Math.min;
const abs = Math.abs;

const toPx = (value) => value + 'px';

const previewRatio = 4 / 3;
const previewHeight = 80;
const previewWidth = previewRatio * previewHeight;
const previewPadding = 12;
const previewsHeight = previewHeight + 15;

const calculatePosition = (it, ratio, width, height, previewsHeight) => {
    const windowWidth = min(DOCUMENT.body.clientWidth, WINDOW.innerWidth);
    const windowHeight = min(DOCUMENT.body.clientHeight, WINDOW.innerHeight);

    const offset = windowHeight * 0.03;
    if (Number.isNaN(ratio))
        ratio = 0;

    if (ratio > 1) {
        it.toWidth = windowWidth - offset * 2;
        it.toHeight = it.toWidth / ratio;
        if (it.toHeight > windowHeight - previewsHeight - 2 * offset) {
            it.toHeight = windowHeight - previewsHeight - 2 * offset;
            it.toWidth = it.toHeight * ratio;
        }
    } else {
        it.toHeight = windowHeight - previewsHeight - 2 * offset;
        it.toWidth = it.toHeight * ratio;
        if (it.toWidth > windowWidth - offset * 2) {
            it.toWidth = windowWidth - offset * 2;
            it.toHeight = it.toWidth / ratio;
        }
    }

    if (width && it.toWidth > width) {
        it.toWidth = width;
        it.toHeight = height;
    }

    it.toTop = offset + (windowHeight - previewsHeight - 2 * offset - it.toHeight) / 2;
    it.toLeft = (windowWidth - it.toWidth) / 2;

    it.toWidthPx = toPx(it.toWidth);
    it.toHeightPx = toPx(it.toHeight);
    it.toTopPx = toPx(it.toTop);
    it.toLeftPx = toPx(it.toLeft);
};

const calculatePreviewsScroll = (index, length, width) => {
    if (length <= 7)
        return 0;

    if (index < 3)
        return 0;

    if (index > length - 4)
        return -(length - 7) * (previewWidth + previewPadding);

    return -(index * (previewWidth + previewPadding) + (previewWidth) / 2 - width / 2);
};

function calculatePreview(width, height, url) {
    let top = 0;
    let left = 0;

    let ratio = width / height;

    if (width !== previewWidth || height !== previewHeight) {
        if (ratio < previewRatio) {
            width = previewWidth;
            height = width / ratio;
            top = -(height - previewHeight) / 2;
        } else {
            height = previewHeight;
            width = height * ratio;
            left = -(width - previewWidth) / 2;
        }
    }

    return {
        url,
        position: 'absolute',
        width: toPx(width),
        height: toPx(height),
        top: toPx(top),
        left: toPx(left),
    };
}


const ACTION_PREFIX = 'IMAGE_GALLERY_';
const ACTION_IMAGE_GALLERY_SHOW = ACTION_PREFIX + 'SHOW';
const ACTION_IMAGE_GALLERY_CLOSE = ACTION_PREFIX + 'CLOSE';
const ACTION_IMAGE_GALLERY_FULL_IMAGE_LOADED = ACTION_PREFIX + 'FULL_IMAGE_LOADED';
const ACTION_IMAGE_GALLERY_PREVIEW_LOADED = ACTION_PREFIX + 'PREVIEW_LOADED';

export class Actions {
    static show = (gallery) => (dispatch) => {
        const images = gallery.images;
        const length = images.length;
        const withPreviews = length > 1;
        const data = {
            index: gallery.index,
            images: images.map(it => {
                const el = it.el;
                const rect = el.getBoundingClientRect();
                it.fromLeft = rect.left;
                it.fromTop = rect.top;
                it.fromWidth = el.clientWidth;
                it.fromHeight = el.clientHeight;

                it.fromLeftPx = toPx(it.fromLeft);
                it.fromTopPx = toPx(it.fromTop);
                it.fromWidthPx = toPx(it.fromWidth);
                it.fromHeightPx = toPx(it.fromHeight);

                let ratio = el.clientWidth / el.clientHeight;
                calculatePosition(it, ratio, el.naturalWidth || el.width, el.naturalHeight || el.height, withPreviews ? previewsHeight : 0);
                if (!it.toWidth || !it.toHeight)
                    Actions.loadPreview(it)(dispatch);
                return it;
            }),
            previews: {
                show: withPreviews,
                width: min(length, 7) * previewWidth + min(length - 1, 6) * previewPadding,
                totalWidth: toPx(length * previewWidth + (length - 1) * previewPadding),
                scroll: UNDEFINED,
                images: images.map(it => {
                    const el = it.el;

                    let width = el.clientWidth;
                    let height = el.clientHeight;
                    return calculatePreview(width, height, el.src);
                })
            },
        };

        data.previews.scroll = calculatePreviewsScroll(data.index, data.previews.images.length, data.previews.width);

        dispatch({type: ACTION_IMAGE_GALLERY_SHOW, data});
        Actions.load(data.images[data.index])(dispatch)
    };
    static close = () => (dispatch) => dispatch({type: ACTION_IMAGE_GALLERY_CLOSE});
    static loaded = (item, image) => (dispatch) => dispatch({type: ACTION_IMAGE_GALLERY_FULL_IMAGE_LOADED, item, image});
    static loadedPreview = (item, image) => (dispatch) => dispatch({type: ACTION_IMAGE_GALLERY_PREVIEW_LOADED, item, image});
    static load = (item) => (dispatch) => {
        const image = new Image();
        image.onload = () => Actions.loaded(item, image)(dispatch);
        image.src = item.url;
    };

    static loadPreview = (item) => (dispatch) => {
        const image = new Image();
        image.onload = () => Actions.loadedPreview(item, image)(dispatch);
        image.src = item.previewUrl;
    };
}

const reducers = {
    [ACTION_IMAGE_GALLERY_SHOW]: (state, action) => ({...action.data, open: true}),
    [ACTION_IMAGE_GALLERY_CLOSE]: (state, action) => ({...state, open: false}),
    [ACTION_IMAGE_GALLERY_FULL_IMAGE_LOADED]: (state, action) => {
        const item = action.item;
        const image = action.image;
        const result = {...state, images: state.images.slice()};
        const index = state.images.findIndex(it => it.id === item.id);
        const it = {...result.images[index], loaded: true};
        // debugger
        // if (it.toWidth > image.width)
        calculatePosition(it, image.width / image.height, image.width, image.height, result.previews.show ? previewsHeight : 0);
        result.images[index] = it;
        return result;
    },
    [ACTION_IMAGE_GALLERY_PREVIEW_LOADED]: (state, action) => {
        const item = action.item;
        const image = action.image;
        const result = {...state, images: state.images.slice()};
        const index = state.images.findIndex(it => it.id === item.id);
        const it = {...result.images[index]};
        if (!it.toWidth || !it.toHeight)
            calculatePosition(it, image.width / image.height, image.width, image.height, result.previews.show ? previewsHeight : 0);
        result.images[index] = it;

        result.previews.images = [...state.previews.images];
        const preview = calculatePreview(image.width, image.height, result.previews.images[index].url);
        result.previews.images[index] = preview;

        return result;
    },
};

const small = (it, index, i, length) => {
    if (index !== i)
        return big(it, index, i, 0, length);

    return {
        position: 'absolute',
        top: it.fromTopPx,
        left: it.fromLeftPx,
        width: it.fromWidthPx,
        height: it.fromHeightPx,
        opacity: 0,
    };
};

const zoom = (it, index, i, length) => {
    if (index !== i)
        return big(it, index, i, 0, length);

    return {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    };
};

const big = (it, index, i, shift, length, previous) => {
    const styles = {
        position: 'absolute',
        top: it.toTopPx,
        left: toPx(it.toLeft + shift),
        width: it.toWidthPx,
        height: it.toHeightPx,
    };

    // if (i !== previous && abs(index - i) > 0) {
    //     // styles.transition = 'none';
    //     // styles.transitionDelay = `${1000 * abs(index - i)}ms`
    //     styles.opacity = '0'
    // }

    if (previous !== UNDEFINED && abs(index - previous) > 1) {
        styles.transitionDelay = 100 * abs(previous - i) + 'ms';
    }

    if (index !== i) {
        const width = WINDOW.innerWidth;
        // if (index === 0 && i === length - 1) {
        //     styles.left = (it.toLeft + width + (i - 1 === index ? shift : 0)) + 'px';
        // } else if (index === length - 1 && i === 0) {
        //     styles.left = (it.toLeft + width + (i - 1 === index ? shift : 0)) + 'px';
        // } else
        if (i < index)
            styles.left = toPx(it.toLeft - width + (i + 1 === index ? shift : 0));
        else
            styles.left = toPx(it.toLeft + width + (i - 1 === index ? shift : 0));
    }
    return styles;
};

class ImageGallery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shift: 0,
            index: UNDEFINED,
            previous: UNDEFINED,
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.open !== prevProps.open && !this.props.open) {
            setTimeout(() => this.setState({
                shift: 0,
                index: UNDEFINED,
                previous: UNDEFINED,
            }), 250 + 100); // 250ms transition + 100ms to be sure it ended
        }
        if (this.state.index !== UNDEFINED && !this.props.images[this.state.index].loaded) {
            this.props.load(this.props.images[this.state.index])
        }
    }

    render() {
        const {open, close} = this.props;
        const {images = [], previews = {}} = this.props;
        const {shift, index = this.props.index, previous, previewScroll = previews.scroll, touchesStart, zoomed} = this.state;

        const length = images.length;
        return (
            <Animated value={open}>
                <div className={'ImageGallery'}
                     tabIndex={0}
                     ref={it => (this.gallery = it) && it.focus()}
                     onKeyDown={this.onKeyDown}
                     onClick={e => e.target === this.gallery && !e.swipeProcessed && close()}
                     onTouchStart={this.onTouchStart}
                     onTouchMove={this.onTouchMove}
                     onTouchEnd={this.onTouchEnd}
                     onMouseDown={this.onTouchStart}
                     onMouseUp={this.onTouchEnd}
                     onMouseMove={this.onTouchMove}
                     onMouseLeave={this.onTouchEnd}
                    // onDragStart={this.onTouchStart}
                    // onDragEnd={this.onTouchEnd}
                    // onDrag={this.onTouchMove}
                >
                    {images.map((it, i) => <Animated key={it.id} value={open} styles={zoomed && i === index ? {
                        default: small(it, index, i, length),
                        mounting: zoom(it, index, i, shift, length, previous),
                        mountend: zoom(it, index, i, shift, length, previous),
                        unmounting: small(it, index, i, length),
                    } : {
                        default: small(it, index, i, length),
                        mounting: big(it, index, i, shift, length, previous),
                        mountend: big(it, index, i, shift, length, previous),
                        unmounting: small(it, index, i, length),
                    }}>
                        <div
                            onDoubleClick={e => {
                                const img = e.target;
                                if (img.naturalWidth === img.clientWidth && img.naturalHeight === img.clientHeight)
                                    return;
                                this.setState({zoomed: !zoomed});
                                if (!zoomed) {
                                    const container = img.parentElement;
                                    const screen = container.parentElement;
                                    const bounds = container.getBoundingClientRect();
                                    let x = (e.pageX - bounds.x) / bounds.width;
                                    let y = (e.pageY - bounds.y) / bounds.height;
                                    const left = Math.max(x * img.naturalWidth - screen.clientWidth / 2, 0);
                                    const top = Math.max(y * img.naturalHeight - screen.clientHeight / 2, 0);
                                    setTimeout(() => {
                                        container.scrollLeft = left;
                                        container.scrollTop = top;
                                    }, 0);
                                }
                            }}
                            key={i} className={classNames('image', touchesStart && 'dragging', zoomed && 'zoomed')}>
                            <img draggable={false} src={it.loaded ? it.url : it.previewUrl}/>
                            {!it.loaded && <div className={'spinner'}><SpinningProgress/></div>}
                            <Animated value={open && !zoomed}>
                                <Button className="close" round={true} onClick={close}>
                                    <MaterialIcon icon={'close'}/>
                                </Button>
                            </Animated>
                        </div>
                    </Animated>)}

                    <Animated value={open && length > 1 && index > 0 && !zoomed}>
                        <Button className="arrow left" onClick={this.left} round={true}>
                            <MaterialIcon icon={'arrow_back'}/>
                        </Button>
                    </Animated>

                    <Animated value={open && length > 1 && index !== length - 1 && !zoomed}>
                        <Button className="arrow right" onClick={this.right} round={true}>
                            <MaterialIcon icon={'arrow_forward'}/>
                        </Button>
                    </Animated>

                    <Animated value={open && length > 1 && !zoomed}>
                        <div className="counter">
                            {index + 1} / {length}
                        </div>
                    </Animated>

                    <Animated value={open && previews.show && !zoomed}>
                        <div className="previews" style={{width: previews.width}}>
                            <div className="container" style={{width: previews.totalWidth, left: toPx(previewScroll)}}>
                                {(previews.images || []).map((it, i) =>
                                    <div key={i}
                                         className={classNames('preview', index === i && 'selected')}
                                         onClick={() => this.scrollTo(i, index)}
                                    >
                                        <img src={it.url} style={it}/>

                                        <div className="border">
                                            <div className="line"/>
                                        </div>
                                    </div>)}
                            </div>

                            <Animated value={open && length > 1 && index > 0}>
                                <Button className="arrow left" onClick={this.left} round={true}>
                                    <MaterialIcon icon={'keyboard_arrow_left'}/>
                                </Button>
                            </Animated>

                            <Animated value={open && length > 1 && index !== length - 1}>
                                <Button className="arrow right" onClick={this.right} round={true}>
                                    <MaterialIcon icon={'keyboard_arrow_right'}/>
                                </Button>
                            </Animated>

                            {/*<div className="center"></div>*/}
                        </div>
                    </Animated>

                </div>
            </Animated>
        )
    }

    onKeyDown = e => {
        const keyCode = e.keyCode;
        if (keyCode === 37/*left*/) {
            this.left();
        }
        if (keyCode === 39/*right*/) {
            this.right();
        }
        if (keyCode === 27/*escape*/) {
            this.setState({zoomed: false});
            this.props.close();
        }
        preventDefault(e);
    };

    onTouchStart = e => {
        e.swipeProcessed = false;
        if (e.button === 2) return;
        const touches = e.changedTouches || [{pageX: e.pageX, pageY: e.pageY}];
        // console.log('onTouchStart', touches, e);
        this.setState({touchesStart: touches})
    };

    onTouchMove = e => {
        const {touchesStart} = this.state;
        if (!touchesStart)
            return;

        // if (!e.buttons) {
        //     this.setState({touchesStart: UNDEFINED, shift: 0});
        //     return;
        // }

        const touches = e.changedTouches || [{pageX: e.pageX, pageY: e.pageY}];
        // console.log('onTouchMove', touches, e)

        if (touches.length > 1)
            return;

        let touch = touches[0];
        let touchStart = touchesStart[0];
        let shift = touch.pageX - touchStart.pageX;
        this.setState({shift})
    };

    onTouchEnd = e => {
        const {touchesStart} = this.state;
        if (!touchesStart)
            return;

        const touches = e.changedTouches || [{pageX: e.pageX, pageY: e.pageY}];
        // console.log('onTouchEnd', touches, e)

        let touchEnd = touches[0];
        let touchStart = touchesStart[0];
        let distX = touchEnd.pageX - touchStart.pageX;
        let distY = touchEnd.pageY - touchStart.pageY;

        this.setState({touchesStart: UNDEFINED, shift: 0});
        const minDistance = 20;

        if (abs(distX / distY) > 2 && abs(distX) > minDistance) {
            distX < 0 ? this.right() : this.left();
            e.swipeProcessed = true
        } else if (abs(distY / distX) > 2 && abs(distY) > minDistance) {
            this.props.close();
            e.swipeProcessed = true
        }
    };

    scrollTo = (index, previous) => {
        const {previews} = this.props;
        this.setState({index, previous, previewScroll: calculatePreviewsScroll(index, previews.images.length, previews.width)});
    };

    left = (e) => {
        if (this.state.zoomed)
            return;
        preventDefault(e);
        stopPropagation(e);
        const {images} = this.props;
        const {index = this.props.index} = this.state;
        if (index > 0)
            this.scrollTo(index - 1, index)
        // else
        //     this.setState({index: images.length - 1, previous: index});
    };

    right = (e) => {
        if (this.state.zoomed)
            return;
        preventDefault(e);
        stopPropagation(e);
        const {images} = this.props;
        const {index = this.props.index} = this.state;
        if (index < images.length - 1)
            this.scrollTo(index + 1, index)
        // else
        //     this.setState({index: 0, previous: index});
    };

    componentDidMount() {
        addEventListener(WINDOW, 'resize', this.resizeListener = () => this.props.open && this.props.show(this.props))
    }

    componentWillUnmount() {
        removeEventListener(WINDOW, 'resize', this.resizeListener)
    }
}

export const IMAGE_GALLERY_REDUCER_NAME = 'gallery';
export const IMAGE_GALLERY_REDUCER = (state, action) => {
    state = state || {};
    const reducer = reducers[action.type];
    return reducer ? reducer(state, action) : state;
};

export const mapStateToProps = (state, ownProps) => state[IMAGE_GALLERY_REDUCER_NAME];

export default ImageGallery;

export class ImageGalleryContainer extends React.Component {
    constructor(props) {
        super(props);
        const that = this;

        that.state = IMAGE_GALLERY_REDUCER(null, {})

        const dispatch = (action) => setTimeout(() => {
            const state = IMAGE_GALLERY_REDUCER(that.state, action);
            if (state !== that.state)
                that.setState(state)
        }, 0)


        that.show = (gallery) => {
            Actions.show(gallery)(dispatch)
        };
        that.close = () => {
            Actions.close()(dispatch)
        };
        that.load = (item) => {
            Actions.load(item)(dispatch)
        };
    }

    render() {
        return <ImageGallery {...this.state}
                             show={this.show}
                             load={this.load}
                             close={this.close}
        />;
    }
}
