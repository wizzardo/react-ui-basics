import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import './ImageGallery.css'
import Animated from "./Animated";
import Button from "./Button";
import SpinningProgress from "./SpinningProgress";
import {
    UNDEFINED,
    preventDefault,
    stopPropagation,
    classNames,
    DOCUMENT,
    WINDOW,
    addEventListener,
    removeEventListener,
    setTimeout,
    orNoop,
    createRef,
    debounce,
    isDifferent
} from "./Tools";
import MaterialIcon from "./MaterialIcon";
import {componentDidUpdate, componentWillUnmount, componentDidMount, render, propsGetter, stateGSs} from "./ReactConstants";

const min = Math.min;
const abs = Math.abs;

const toPx = (value) => value + 'px';

const previewRatio = 4 / 3;
const previewHeight = 80;
const previewWidth = previewRatio * previewHeight;
const previewPadding = 8;
const previewsHeight = previewHeight + 15;

const calculatePosition = (it, ratio, width, height, previewsHeight, embedded, container) => {
    const windowWidth = embedded ? container.clientWidth : min(DOCUMENT.body.clientWidth, WINDOW.innerWidth);
    const windowHeight = embedded ? container.clientHeight : min(DOCUMENT.body.clientHeight, WINDOW.innerHeight);

    let offset = it.offset;
    if (offset == null)
        offset = (embedded ? 0 : windowHeight * 0.03);

    let offsetTop = it.offsetTop
    offsetTop = offsetTop == null ? offset : offsetTop
    let offsetBottom = it.offsetBottom
    offsetBottom = offsetBottom == null ? offset : offsetBottom
    let offsetLeft = it.offsetLeft
    offsetLeft = offsetLeft == null ? offset : offsetLeft
    let offsetRight = it.offsetRight
    offsetRight = offsetRight == null ? offset : offsetRight

    if (Number.isNaN(ratio))
        ratio = 0;
    if (embedded) {
        if (ratio > 1) {
            it.toHeight = windowHeight - previewsHeight - -offsetTop - offsetBottom;
            it.toWidth = it.toHeight * ratio;
        } else {
            it.toWidth = windowWidth - offsetLeft - offsetRight;
            it.toHeight = it.toWidth / ratio;
        }
    } else if (ratio > 1) {
        it.toWidth = windowWidth - offsetLeft - offsetRight;
        it.toHeight = it.toWidth / ratio;
        if (it.toHeight > windowHeight - previewsHeight - offsetTop - offsetBottom) {
            it.toHeight = windowHeight - previewsHeight - offsetTop - offsetBottom;
            it.toWidth = it.toHeight * ratio;
        }
    } else {
        it.toHeight = windowHeight - previewsHeight - offsetTop - offsetBottom;
        it.toWidth = it.toHeight * ratio;
        if (it.toWidth > windowWidth - offsetLeft - offsetRight) {
            it.toWidth = windowWidth - offsetLeft - offsetRight;
            it.toHeight = it.toWidth / ratio;
        }
    }

    // if (width && it.toWidth > width) {
    //     it.toWidth = width;
    //     it.toHeight = height;
    // }

    it.toTop = offsetTop + (windowHeight - previewsHeight - offsetTop - offsetBottom - it.toHeight) / 2;
    it.toLeft = (windowWidth - it.toWidth) / 2;

    it.toWidthPx = toPx(it.toWidth);
    // it.toHeightPx = toPx(it.toHeight);
    it.toTopPx = toPx(it.toTop);
    it.toLeftPx = toPx(it.toLeft);
};

const calculatePreviewsScroll = (index, length, width) => {
    if (length <= 5)
        return 0;

    if (index < 3)
        return 0;

    if (index > length - 3)
        return -(length - 5) * (previewWidth + previewPadding);

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

const loadImage = (src, cb) => {
    const image = new Image();
    image.onload = () => {
        cb(image)
    };
    image.src = src;
}

const ACTION_PREFIX = 'IMAGE_GALLERY_';
const ACTION_IMAGE_GALLERY_SHOW = ACTION_PREFIX + 'SHOW';
const ACTION_IMAGE_GALLERY_CLOSE = ACTION_PREFIX + 'CLOSE';
const ACTION_IMAGE_GALLERY_RECALCULATE = ACTION_PREFIX + 'RECALCULATE';
const ACTION_IMAGE_GALLERY_FULL_IMAGE_LOADED = ACTION_PREFIX + 'FULL_IMAGE_LOADED';
const ACTION_IMAGE_GALLERY_PREVIEW_LOADED = ACTION_PREFIX + 'PREVIEW_LOADED';

export class Actions {
    static replaceImages = images => (dispatch, getState) => {
        const state = getState();
        const length = images.length;
        const nextState = {...state}
        nextState.images = images.map(item => {
            const image = state.images.find(it => it.url === item.url)
            if (image)
                return image

            const it = {...item}
            const el = it.el;
            if (el) {
                const rect = el.getBoundingClientRect();
                const fromWidth = el.clientWidth;
                const fromHeight = el.clientHeight;

                it.fromLeftPx = toPx(rect.left);
                it.fromTopPx = toPx(rect.top);
                it.fromWidthPx = toPx(fromWidth);

                let ratio = fromWidth / fromHeight;
                calculatePosition(it, ratio, el.naturalWidth || el.width, el.naturalHeight || el.height, withPreviews ? previewsHeight : 0, embedded, container);
            } else {
                it.toLeft = 100;
                it.toTop = 100;
            }
            if (!it.toWidth || !it.toHeight || !el)
                Actions.loadPreview(it)(dispatch);
            return it;
        })
        nextState.previews.width = min(length, 5) * previewWidth + min(length - 1, 4) * previewPadding;
        nextState.previews.totalWidth = toPx(length * previewWidth + (length - 1) * previewPadding);
        nextState.previews.images = nextState.images.map(item => {
            const preview = state.previews.images.find(it => it.url === item.previewUrl)
            if (preview)
                return preview

            const el = item.el;
            if (!el)
                return {};

            let width = el.clientWidth;
            let height = el.clientHeight;
            return calculatePreview(width, height, el.src);
        });

        dispatch({type: ACTION_IMAGE_GALLERY_SHOW, data: nextState});
    };

    static show = (gallery) => (dispatch) => {
        const images = gallery.images;
        const length = images.length;
        const withPreviews = length > 1 && (gallery.withPreviews === UNDEFINED || !!gallery.withPreviews);
        const container = gallery.container;
        const embedded = gallery.embedded;
        const index = gallery.index;
        const data = {
            index,
            container,
            embedded,
            withPreviews,
            images: images.map(item => {
                const it = {...item}
                const el = it.el;
                if (el) {
                    const rect = el.getBoundingClientRect();
                    const fromWidth = el.clientWidth;
                    const fromHeight = el.clientHeight;

                    it.fromLeftPx = toPx(rect.left);
                    it.fromTopPx = toPx(rect.top);
                    it.fromWidthPx = toPx(fromWidth);

                    let ratio = fromWidth / fromHeight;
                    calculatePosition(it, ratio, el.naturalWidth || el.width, el.naturalHeight || el.height, withPreviews ? previewsHeight : 0, embedded, container);
                } else {
                    it.toLeft = 100;
                    it.toTop = 100;
                }
                if (!it.toWidth || !it.toHeight || !el)
                    Actions.loadPreview(it)(dispatch);
                return it;
            }),
            previews: {
                show: withPreviews,
                width: min(length, 5) * previewWidth + min(length - 1, 4) * previewPadding,
                totalWidth: toPx(length * previewWidth + (length - 1) * previewPadding),
                scroll: UNDEFINED,
                images: images.map(it => {
                    const el = it.el;
                    if (!el)
                        return {};

                    let width = el.clientWidth;
                    let height = el.clientHeight;
                    return calculatePreview(width, height, el.src);
                })
            },
        };

        data.images.forEach(it => {
            if (!it.fromLeftPx) {
                const imageWithFromData = data.images.find(it => !!it.fromLeftPx);
                if (imageWithFromData) {
                    it.fromLeftPx = imageWithFromData.fromLeftPx;
                    it.fromTopPx = imageWithFromData.fromTopPx;
                    it.fromWidthPx = imageWithFromData.fromWidthPx;
                }
            }
        });
        data.previews.scroll = calculatePreviewsScroll(index, length, data.previews.width);

        dispatch({type: ACTION_IMAGE_GALLERY_SHOW, data});
        Actions.load(data.images[index])(dispatch)
    };
    static close = () => (dispatch) => {
        dispatch({type: ACTION_IMAGE_GALLERY_CLOSE});
    };
    static recalculate = () => (dispatch) => {
        dispatch({type: ACTION_IMAGE_GALLERY_RECALCULATE});
    };
    static loaded = (item, image) => (dispatch) => {
        dispatch({type: ACTION_IMAGE_GALLERY_FULL_IMAGE_LOADED, item, image});
    };
    static loadedPreview = (item, image) => (dispatch) => {
        dispatch({type: ACTION_IMAGE_GALLERY_PREVIEW_LOADED, item, image});
    };
    static load = (item) => (dispatch) => {
        loadImage(item.url, (image) => {
            Actions.loaded(item, image)(dispatch);
        })
    };

    static loadPreview = (item) => (dispatch) => {
        loadImage(item.previewUrl, (image) => {
            Actions.loadedPreview(item, image)(dispatch);
        })
    };
}

const reducers = {
    [ACTION_IMAGE_GALLERY_SHOW]: (state, action) => ({...action.data, open: true}),
    [ACTION_IMAGE_GALLERY_CLOSE]: (state, action) => ({...state, open: false}),
    [ACTION_IMAGE_GALLERY_RECALCULATE]: (state, action) => {
        const images = [...state.images];
        const result = {...state, images};
        for (let i = 0; i < images.length; i++) {
            if (!images[i].width && !images[i].fromWidthPx)
                continue

            const it = {...images[i]};
            const width = it.width || Number.parseInt(it.fromWidthPx);
            const height = it.height || Number.parseInt(it.fromHeightPx);
            calculatePosition(it, width / height, width, height, result.previews.show ? previewsHeight : 0, state.embedded, state.container);
            images[i] = it;
        }

        return result;
    },
    [ACTION_IMAGE_GALLERY_FULL_IMAGE_LOADED]: (state, action) => {
        const item = action.item;
        const image = action.image;
        const images = [...state.images];
        const result = {...state, images};
        const index = images.findIndex(it => it.id === item.id);

        const width = image.width
        const height = image.height
        const it = {...images[index], loaded: true, width, height};
        // debugger
        // if (it.toWidth > image.width)
        calculatePosition(it, width / height, width, height, result.previews.show ? previewsHeight : 0, state.embedded, state.container);
        images[index] = it;
        return result;
    },
    [ACTION_IMAGE_GALLERY_PREVIEW_LOADED]: (state, action) => {
        const item = action.item;
        const image = action.image;
        const images = [...state.images];
        const result = {...state, images};
        const index = images.findIndex(it => it.id === item.id);
        const it = {...images[index]};

        if (!it.toWidth || !it.toHeight)
            calculatePosition(it, image.width / image.height, image.width, image.height, result.previews.show ? previewsHeight : 0, state.embedded, state.container);
        images[index] = it;

        const previewImages = [...state.previews.images];
        result.previews.images = previewImages;
        const preview = calculatePreview(image.width, image.height, image.src);
        previewImages[index] = preview;

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
        // height: it.fromHeightPx,
        opacity: 0,
    };
};

const big = (it, index, i, shift, length, previous) => {
    const styles = {
        position: 'absolute',
        top: it.toTopPx,
        left: toPx(it.toLeft + shift),
        width: it.toWidthPx,
        // height: it.toHeightPx,
    };


    // if (previous !== UNDEFINED && abs(index - previous) > 1) {
    //     styles.transitionDelay = 100 * abs(previous - i) + 'ms';
    // }

    if (index !== i) {
        const width = WINDOW.innerWidth;
        const additionalOffset = it.toLeft < 0 ? -it.toLeft : 0;

        if (i < index)
            styles.left = toPx(it.toLeft - width - additionalOffset + (i + 1 === index ? shift : 0));
        else
            styles.left = toPx(it.toLeft + width + additionalOffset + (i - 1 === index ? shift : 0));
    }
    return styles;
};

class ImageGallery extends React.Component {
    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {};

        const [
            shift,
            index,
            previous,
            zoomed,
            previewScroll,
        ] = stateGSs(that, 5);


        const props = propsGetter(that);

        that[componentDidUpdate] = (prevProps, prevState, snapshot) => {
            if (props().open !== prevProps.open && !props().open) {
                setTimeout(() => {
                    shift(0)
                    index(UNDEFINED)
                    previous(UNDEFINED)
                }, 250 + 100); // 250ms transition + 100ms to be sure it ended
            }

            const images = props().images;
            if (!images)
                return

            const indexValue = index() !== UNDEFINED ? index() : props().index;
            const image = images[indexValue];
            if (!image) {
                const i = images.length - 1
                if (i === -1) {
                    if (prevProps.images !== images) {
                        onClose()
                    }
                } else {
                    scrollTo(i, UNDEFINED)
                }
            } else if (!image.loaded) {
                props().load(image)
            }
        }

        const resizeListener = debounce(() => {
            props().open && props().recalculate()
        }, 100)
        that[componentDidMount] = () => {
            addEventListener(WINDOW, 'resize', resizeListener)
        }
        that[componentWillUnmount] = () => {
            removeEventListener(WINDOW, 'resize', resizeListener)
        }
        const onClose = () => {
            resetZoom()
            moveListenerAdded = false;
            this.props.close();
        }

        const onKeyDown = e => {
            const keyCode = e.keyCode;
            if (keyCode === 37/*left*/) {
                left();
                preventDefault(e);
            }
            if (keyCode === 39/*right*/) {
                right();
                preventDefault(e);
            }
            if (keyCode === 27/*escape*/ && !props().embedded) {
                onClose();
                preventDefault(e);
            }
        };

        let touchesStart;
        let zoomValue = 1;
        let zoomValueStarted;
        let zoomedImage;
        let oldLeft;
        let oldTop;

        let defaultWidth;
        let defaultLeft;
        let defaultTop;
        let touchpadStarted = null;

        const onKeyUp = e => {
            const keyCode = e.keyCode;
            if (touchpadStarted && keyCode === 17/*ctrl*/ && zoomed() && zoomValue < 1) {
                resetZoom()
            }
        };

        const resetZoom = () => {
            if (!zoomed()) return
            zoomed(false)
            zoomedImage.style.width = defaultWidth;
            zoomedImage.style.left = defaultLeft;
            zoomedImage.style.top = defaultTop;
            zoomedImage.style.transition = null
            touchpadStarted = null
        }
        const initZoom = () => {
            zoomed(true)
            defaultWidth = zoomedImage.style.width;
            defaultLeft = zoomedImage.style.left;
            defaultTop = zoomedImage.style.top;
        }

        const initTouchpadDragging = () => {
            oldLeft = Number.parseFloat(zoomedImage.style.left);
            oldTop = Number.parseFloat(zoomedImage.style.top);
            zoomedImage.style.transition = 'none'
            touchpadStarted = true;
        }

        const onWheel = (e) => {
            if (!zoomed()) return;

            preventDefault(e)
            if (!touchpadStarted) {
                initTouchpadDragging()
            }

            if (e.ctrlKey) {
                let diff = e.deltaY * 0.005;

                let newZoom = Math.min(Math.max(zoomValue + diff, 0.5), 10)
                let zoomX = e.pageX;
                oldLeft = zoomX - (zoomX - oldLeft) * newZoom / zoomValue;

                let zoomY = e.pageY;
                oldTop = zoomY - (zoomY - oldTop) * newZoom / zoomValue;
                zoomValue = newZoom

                zoomedImage.style.width = (zoomValue * 100) + '%';
            } else {
                oldLeft += e.deltaX * 0.5;
                oldTop += e.deltaY * 0.5;
            }
            zoomedImage.style.left = oldLeft + 'px'
            zoomedImage.style.top = oldTop + 'px'
        }

        let moveListenerAdded

        const onTouchStart = e => {
            e.swipeProcessed = false;
            if (e.button === 2) return;
            const touches = e.touches || [{pageX: e.pageX, pageY: e.pageY}];
            // console.log('onTouchStart', e.touches, e.target);

            zoomedImage = e.target;
            zoomedImage = zoomedImage.tagName.toLowerCase() === 'img' ? zoomedImage.parentElement : zoomedImage;
            oldLeft = Number.parseFloat(zoomedImage.style.left);
            oldTop = Number.parseFloat(zoomedImage.style.top);
            if (zoomed()) {
                zoomedImage.style.transition = 'none'
            }
            if (!moveListenerAdded) {
                //need to add it like this to be able to call preventDefault
                addEventListener(this.gallery, 'touchmove', onTouchMove, false)
                moveListenerAdded = true;
            }

            if (touches.length === 2) {
                if (zoomed())
                    zoomValueStarted = zoomValue;
                else if (!props().embedded) {
                    initZoom()
                    zoomedImage.style.transition = 'none'
                    zoomValueStarted = zoomValue = Number.parseFloat(zoomedImage.style.width) / WINDOW.innerWidth;
                }
            }
            touchesStart = (touches)
        };

        const power2 = x => x * x;

        const distance = touches => {
            const a = touches[0]
            const b = touches[1]
            return Math.sqrt(power2(a.pageX - b.pageX) + power2(a.pageY - b.pageY))
        }
        const center = touches => {
            const a = touches[0]
            const b = touches[1]
            return {x: (a.pageX + b.pageX) / 2, y: (a.pageY + b.pageY) / 2}
        }

        const onTouchMove = e => {
            if (!touchesStart)
                return;

            const touches = e.touches || [{pageX: e.pageX, pageY: e.pageY}];
            // console.log('onTouchMove', touches, e)

            if (zoomed()) {
                preventDefault(e)
                if (touches.length === 2) {
                    const diff = distance(touches) / distance(touchesStart);

                    zoomValue = Math.min(Math.max(zoomValueStarted * diff, 0.5), 10)

                    let zoomedAt = center(touchesStart)
                    let zoomX = zoomedAt.x;
                    let newLeft = zoomX - (zoomX - oldLeft) * zoomValue / zoomValueStarted;

                    let zoomY = zoomedAt.y;
                    let newTop = zoomY - (zoomY - oldTop) * zoomValue / zoomValueStarted;

                    zoomedImage.style.left = newLeft + 'px'
                    zoomedImage.style.top = newTop + 'px'
                    zoomedImage.style.width = (zoomValue * 100) + '%';

                    return;
                } else {
                    let touch = touches[0];
                    let touchStart = touchesStart[0];
                    let newLeft = oldLeft + touch.pageX - touchStart.pageX
                    let newTop = oldTop + touch.pageY - touchStart.pageY
                    zoomedImage.style.left = newLeft + 'px'
                    zoomedImage.style.top = newTop + 'px'
                    return;
                }
            }

            if (touches.length > 1 || zoomed())
                return;

            let touch = touches[0];
            let touchStart = touchesStart[0];
            shift(touch.pageX - touchStart.pageX)
        };

        const onTouchEnd = e => {
            if (!touchesStart)
                return;

            if (zoomed()) {
                touchesStart = (UNDEFINED)
                if (zoomValue < 1) {
                    resetZoom()
                }
                return;
            }

            const touches = e.changedTouches || [{pageX: e.pageX, pageY: e.pageY}];
            // console.log('onTouchEnd', touches, e)

            let touchEnd = touches[0];
            let touchStart = touchesStart[0];
            let distX = touchEnd.pageX - touchStart.pageX;
            let distY = touchEnd.pageY - touchStart.pageY;

            touchesStart = (UNDEFINED)
            shift(0)
            const minDistance = 20;

            if (abs(distX / distY) > 2 && abs(distX) > minDistance) {
                distX < 0 ? right() : left();
                e.swipeProcessed = true
            } else if (abs(distY / distX) > 2 && abs(distY) > minDistance) {
                !props().embedded && onClose();
                e.swipeProcessed = true
            }
        };

        const scrollTo = (i, prev) => {
            const {previews} = props();
            index(i)
            previous(prev)
            previewScroll(calculatePreviewsScroll(i, previews.images.length, previews.width))
        };

        const left = (e) => {
            if (zoomed())
                return;
            preventDefault(e);
            stopPropagation(e);
            const indexValue = index() !== UNDEFINED ? index() : props().index;
            if (indexValue > 0)
                scrollTo(indexValue - 1, indexValue)
            else if (props().loop)
                scrollTo(props().images.length - 1, indexValue)
        };

        const right = (e) => {
            if (zoomed())
                return;
            preventDefault(e);
            stopPropagation(e);
            const {images} = props();
            const indexValue = index() !== UNDEFINED ? index() : props().index;
            if (indexValue < images.length - 1)
                scrollTo(indexValue + 1, indexValue)
            else if (props().loop)
                scrollTo(0, indexValue)
        };

        that.scrollTo = scrollTo;
        that.left = left;
        that.right = right;

        const animatedRoundButton = (show, className, onClick, icon) => (
            <Animated value={show}>
                <Button className={className} onClick={onClick} round={true}>
                    <MaterialIcon icon={icon}/>
                </Button>
            </Animated>);

        that[render] = () => {
            const {open} = props();
            const {images = [], previews = {}, indicator, embedded, loop, onClick, children} = props();

            const indexValue = index() !== UNDEFINED ? index() : props().index;
            const length = images.length;
            const isZoomed = zoomed();
            const shiftValue = shift() || 0;
            const previousValue = previous();
            return (
                <Animated value={open}>
                    <div className={classNames('ImageGallery', embedded && 'embedded', isZoomed && 'zoomed')}
                         tabIndex={0}
                         ref={it => (that.gallery = it) && !embedded && it.focus()}
                         onKeyDown={onKeyDown}
                         onKeyUp={onKeyUp}
                        // onClick={e => e.target === that.gallery && !e.swipeProcessed && !embedded && onClose()}
                         onTouchStart={onTouchStart}
                         onTouchEnd={onTouchEnd}
                         onMouseDown={onTouchStart}
                         onMouseUp={onTouchEnd}
                         onMouseMove={onTouchMove}
                         onMouseLeave={onTouchEnd}
                         onWheel={onWheel}
                    >
                        {images.map((it, i) => {
                            const isZoomedCurrent = isZoomed && i === indexValue;
                            const loaded = it.loaded;
                            return <Animated key={it.id} value={open} styles={{
                                default: small(it, indexValue, i, length),
                                mounting: big(it, indexValue, i, shiftValue, length, previousValue),
                                mountend: big(it, indexValue, i, shiftValue, length, previousValue),
                                unmounting: small(it, indexValue, i, length),
                            }}>
                                <div
                                    draggable={false}
                                    onDoubleClick={e => {
                                        const img = e.target;
                                        if (img.naturalWidth === img.clientWidth && img.naturalHeight === img.clientHeight)
                                            return;

                                        if (!isZoomed) {
                                            zoomedImage = img.tagName.toLowerCase() === 'img' ? img.parentElement : img;
                                            initZoom()
                                            zoomValue = 2;
                                            let newWidth = WINDOW.innerWidth * 2;
                                            let oldWidth = Number.parseFloat(zoomedImage.style.width);
                                            let oldLeft = Number.parseFloat(zoomedImage.style.left);
                                            let zoomX = e.pageX;
                                            let diff = newWidth / oldWidth;
                                            let newLeft = zoomX - (zoomX - oldLeft) * diff;

                                            let oldTop = Number.parseFloat(zoomedImage.style.top);
                                            let zoomY = e.pageY;
                                            let newTop = zoomY - (zoomY - oldTop) * diff;

                                            zoomedImage.style.width = '200%'
                                            zoomedImage.style.left = newLeft + 'px'
                                            zoomedImage.style.top = newTop + 'px'
                                        } else {
                                            resetZoom()
                                        }
                                    }}
                                    onClick={(e) => {
                                        !e.swipeProcessed && orNoop(onClick)(e, it, i)
                                    }}
                                    key={i} className={classNames('image', touchesStart && 'dragging', isZoomedCurrent && 'zoomed', i === indexValue && 'current')}
                                >
                                    <img draggable={false} src={loaded ? it.url : it.previewUrl} onDragStart={preventDefault}/>

                                    <Animated value={!loaded && Math.abs(indexValue - i) <= 1}>
                                        <div className={'spinner'}><SpinningProgress/></div>
                                    </Animated>

                                    {!embedded && animatedRoundButton(open && !isZoomedCurrent,
                                        'close',
                                        onClose,
                                        'close'
                                    )}


                                    <Animated value={loaded && !isZoomedCurrent}>
                                        <div className="counter">
                                            {indexValue + 1} / {length}
                                        </div>
                                    </Animated>

                                    {!isZoomedCurrent && loaded && it.overlay}
                                </div>
                            </Animated>;
                        })}

                        {animatedRoundButton(open && length > 1 && (indexValue > 0 || loop) && !isZoomed,
                            'arrow left',
                            left,
                            'chevron_left'
                        )}

                        {animatedRoundButton(open && length > 1 && (indexValue !== length - 1 || loop) && !isZoomed,
                            'arrow right',
                            right,
                            'chevron_right'
                        )}

                        <Animated value={open && length > 1 && !isZoomed}>
                            <div className="counter">
                                {indexValue + 1} / {length}
                            </div>
                        </Animated>

                        {indicator && <Animated value={open && length > 1 && !isZoomed}>
                            {indicator(indexValue, length)}
                        </Animated>}

                        <Animated value={open && previews.show && !isZoomed}>
                            <div className="previews" style={{width: previews.width}}>
                                <div className="viewport">
                                    <div className="container" style={{width: previews.totalWidth, left: toPx(previewScroll() || previews.scroll)}}>
                                        {(previews.images || []).map((it, i) =>
                                            <div key={i}
                                                 className={classNames('preview', indexValue === i && 'selected')}
                                                 onClick={() => scrollTo(i, indexValue)}
                                            >
                                                <img src={it.url} style={it}/>

                                                <div className="border">
                                                    <div className="line"/>
                                                </div>
                                            </div>)}
                                    </div>
                                </div>

                                {animatedRoundButton(indexValue > 0 || loop,
                                    'arrow left',
                                    left,
                                    'keyboard_arrow_left'
                                )}
                                {animatedRoundButton(indexValue !== length - 1 || loop,
                                    'arrow right',
                                    right,
                                    'keyboard_arrow_right'
                                )}
                            </div>
                        </Animated>

                        {children}
                    </div>
                </Animated>
            )
        }

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
    constructor(properties) {
        super(properties);
        const that = this;

        that.state = IMAGE_GALLERY_REDUCER(null, {})
        const getState = () => that.state;

        const dispatch = (action) => setTimeout(() => {
            // console.log('before action', action, that.state)
            const state = IMAGE_GALLERY_REDUCER(that.state, action);
            // console.log('after action', action, state)
            if (state !== that.state)
                that.setState(state)
        }, 0)

        const props = propsGetter(that)

        const embedded = 'embedded'
        const galleryRef = createRef()

        const show = that.show = (gallery) => {
            if (!!props()[embedded]) {
                if (props().containerRef()) {
                    Actions.show({
                        ...gallery,
                        [embedded]: !!props()[embedded],
                        container: props().containerRef(),
                    })(dispatch)
                } else {
                    setTimeout(show, 1, gallery)
                }
            } else {
                Actions.show(gallery)(dispatch)
            }
        };
        const close = that.close = () => {
            Actions.close()(dispatch)
        };
        const load = that.load = (item) => {
            Actions.load(item)(dispatch)
        };
        const recalculate = that.recalculate = () => {
            Actions.recalculate()(dispatch)
        };
        that.replaceImages = (images) => {
            Actions.replaceImages(images)(dispatch, getState)
        };

        that[render] = () => <ImageGallery ref={galleryRef} {...that.props} {...that.state} show={show} load={load} close={close} recalculate={recalculate}>
            {that.props.children}
        </ImageGallery>

        that[componentDidMount] = () => {
            props()[embedded] && show(props()[embedded])
            that.scrollTo = galleryRef().scrollTo;
            that.left = galleryRef().left;
            that.right = galleryRef().right;
        }
        that[componentDidUpdate] = (prevProps, prevState) => {
            isDifferent(prevProps[embedded], props()[embedded]) && props()[embedded] && show(props()[embedded])
        }
    }
}
