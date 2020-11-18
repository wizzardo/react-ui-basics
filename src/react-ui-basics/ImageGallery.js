import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import './ImageGallery.css'
import Animated from "./Animated";
import Button from "./Button";
import SpinningProgress from "./SpinningProgress";
import {UNDEFINED, preventDefault, stopPropagation, classNames, DOCUMENT, WINDOW, addEventListener, removeEventListener, setTimeout, orNoop} from "./Tools";
import MaterialIcon from "./MaterialIcon";
import {componentDidUpdate, componentWillUnmount, componentDidMount, render, propsGetter, stateGSs} from "./ReactConstants";

const min = Math.min;
const abs = Math.abs;

const toPx = (value) => value + 'px';

const previewRatio = 4 / 3;
const previewHeight = 80;
const previewWidth = previewRatio * previewHeight;
const previewPadding = 12;
const previewsHeight = previewHeight + 15;

const calculatePosition = (it, ratio, width, height, previewsHeight, embedded, container) => {
    const windowWidth = embedded ? container.clientWidth : min(DOCUMENT.body.clientWidth, WINDOW.innerWidth);
    const windowHeight = embedded ? container.clientHeight : min(DOCUMENT.body.clientHeight, WINDOW.innerHeight);

    const offset = embedded ? 0 : windowHeight * 0.03;
    if (Number.isNaN(ratio))
        ratio = 0;
    if (embedded) {
        if (ratio > 1) {
            it.toHeight = windowHeight - previewsHeight - 2 * offset;
            it.toWidth = it.toHeight * ratio;
        } else {
            it.toWidth = windowWidth - offset * 2;
            it.toHeight = it.toWidth / ratio;
        }
    } else if (ratio > 1) {
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

    // if (width && it.toWidth > width) {
    //     it.toWidth = width;
    //     it.toHeight = height;
    // }

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
const ACTION_IMAGE_GALLERY_FULL_IMAGE_LOADED = ACTION_PREFIX + 'FULL_IMAGE_LOADED';
const ACTION_IMAGE_GALLERY_PREVIEW_LOADED = ACTION_PREFIX + 'PREVIEW_LOADED';

export class Actions {
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
            images: images.map(it => {
                const el = it.el;
                if (el) {
                    const rect = el.getBoundingClientRect();
                    const fromWidth = el.clientWidth;
                    const fromHeight = el.clientHeight;

                    it.fromLeftPx = toPx(rect.left);
                    it.fromTopPx = toPx(rect.top);
                    it.fromWidthPx = toPx(fromWidth);
                    it.fromHeightPx = toPx(fromHeight);

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
                width: min(length, 7) * previewWidth + min(length - 1, 6) * previewPadding,
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
                    it.fromHeightPx = imageWithFromData.fromHeightPx;
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
    [ACTION_IMAGE_GALLERY_FULL_IMAGE_LOADED]: (state, action) => {
        const item = action.item;
        const image = action.image;
        const images = [...state.images];
        const result = {...state, images};
        const index = images.findIndex(it => it.id === item.id);
        const it = {...images[index], loaded: true};
        // debugger
        // if (it.toWidth > image.width)
        calculatePosition(it, image.width / image.height, image.width, image.height, result.previews.show ? previewsHeight : 0, state.embedded, state.container);
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
            touchesStart,
            zoomed,
            previewScroll,
        ] = stateGSs(that, 6);


        const props = propsGetter(that);

        that[componentDidUpdate] = (prevProps, prevState, snapshot) => {
            if (props().open !== prevProps.open && !props().open) {
                setTimeout(() => {
                    shift(0)
                    index(UNDEFINED)
                    previous(UNDEFINED)
                }, 250 + 100); // 250ms transition + 100ms to be sure it ended
            }
            if (index() !== UNDEFINED && !props().images[index()].loaded) {
                props().load(props().images[index()])
            }
        }

        const resizeListener = () => props().open && props().show({...props()})
        that[componentDidMount] = () => {
            addEventListener(WINDOW, 'resize', resizeListener)
        }
        that[componentWillUnmount] = () => {
            removeEventListener(WINDOW, 'resize', resizeListener)
        }


        const onKeyDown = e => {
            const keyCode = e.keyCode;
            if (keyCode === 37/*left*/) {
                left();
            }
            if (keyCode === 39/*right*/) {
                right();
            }
            if (keyCode === 27/*escape*/) {
                zoomed(false)
                !props().embedded && props().close();
            }
            preventDefault(e);
        };

        const onTouchStart = e => {
            e.swipeProcessed = false;
            if (e.button === 2) return;
            const touches = e.changedTouches || [{pageX: e.pageX, pageY: e.pageY}];
            // console.log('onTouchStart', touches, e);
            touchesStart(touches)
        };

        const onTouchMove = e => {
            if (!touchesStart() || zoomed())
                return;

            const touches = e.changedTouches || [{pageX: e.pageX, pageY: e.pageY}];
            // console.log('onTouchMove', touches, e)

            if (touches.length > 1)
                return;

            let touch = touches[0];
            let touchStart = touchesStart()[0];
            shift(touch.pageX - touchStart.pageX)
        };

        const onTouchEnd = e => {
            if (!touchesStart())
                return;

            const touches = e.changedTouches || [{pageX: e.pageX, pageY: e.pageY}];
            // console.log('onTouchEnd', touches, e)

            let touchEnd = touches[0];
            let touchStart = touchesStart()[0];
            let distX = touchEnd.pageX - touchStart.pageX;
            let distY = touchEnd.pageY - touchStart.pageY;

            touchesStart(UNDEFINED)
            shift(0)
            const minDistance = 20;

            if (abs(distX / distY) > 2 && abs(distX) > minDistance) {
                distX < 0 ? right() : left();
                e.swipeProcessed = true
            } else if (abs(distY / distX) > 2 && abs(distY) > minDistance) {
                !props().embedded && props().close();
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

        const animatedRoundButton = (show, className, onClick, icon) => (
            <Animated value={show}>
                <Button className={className} onClick={onClick} round={true}>
                    <MaterialIcon icon={icon}/>
                </Button>
            </Animated>);

        that[render] = () => {
            const {open, close} = props();
            const {images = [], previews = {}, indicator, embedded, loop,onClick} = props();

            const indexValue = index() !== UNDEFINED ? index() : props().index;
            const length = images.length;
            const isZoomed = zoomed();
            const shiftValue = shift() || 0;
            const previousValue = previous();
            return (
                <Animated value={open}>
                    <div className={classNames('ImageGallery', embedded && 'embedded')}
                         tabIndex={0}
                         ref={it => (that.gallery = it) && !embedded && it.focus()}
                         onKeyDown={onKeyDown}
                         onClick={e => e.target === that.gallery && !e.swipeProcessed && !embedded && close()}
                         onTouchStart={onTouchStart}
                         onTouchMove={onTouchMove}
                         onTouchEnd={onTouchEnd}
                         onMouseDown={onTouchStart}
                         onMouseUp={onTouchEnd}
                         onMouseMove={onTouchMove}
                         onMouseLeave={onTouchEnd}
                    >
                        {images.map((it, i) => {
                            return <Animated key={it.id} value={open} styles={isZoomed && i === indexValue ? {
                                default: small(it, indexValue, i, length),
                                mounting: zoom(it, indexValue, i, shiftValue, length, previousValue),
                                mountend: zoom(it, indexValue, i, shiftValue, length, previousValue),
                                unmounting: small(it, indexValue, i, length),
                            } : {
                                default: small(it, indexValue, i, length),
                                mounting: big(it, indexValue, i, shiftValue, length, previousValue),
                                mountend: big(it, indexValue, i, shiftValue, length, previousValue),
                                unmounting: small(it, indexValue, i, length),
                            }}>
                                <div
                                    onDoubleClick={e => {
                                        const img = e.target;
                                        if (img.naturalWidth === img.clientWidth && img.naturalHeight === img.clientHeight)
                                            return;
                                        zoomed(!isZoomed)
                                        if (!isZoomed) {
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
                                    onClick={() => {
                                        orNoop(onClick)(it)
                                    }}
                                    key={i} className={classNames('image', touchesStart() && 'dragging', isZoomed && 'zoomed', i === indexValue && 'current')}
                                >
                                    <img draggable={false} src={it.loaded ? it.url : it.previewUrl}/>

                                    {!it.loaded && <div className={'spinner'}><SpinningProgress/></div>}

                                    {!embedded && animatedRoundButton(open && !isZoomed,
                                        'close',
                                        close,
                                        'close'
                                    )}

                                    <div className="counter">
                                        {indexValue + 1} / {length}
                                    </div>

                                    {!isZoomed && it.loaded && it.overlay}
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

        const dispatch = (action) => setTimeout(() => {
            // console.log('before action', action, that.state)
            const state = IMAGE_GALLERY_REDUCER(that.state, action);
            // console.log('after action', action, state)
            if (state !== that.state)
                that.setState(state)
        }, 0)

        const props = propsGetter(that)

        const embedded = 'embedded'

        const show = that.show = (gallery) => {
            gallery[embedded] = !!props()[embedded]
            if (gallery[embedded])
                gallery.container = props().containerRef();
            Actions.show(gallery)(dispatch)
        };
        const close = that.close = () => {
            Actions.close()(dispatch)
        };
        const load = that.load = (item) => {
            Actions.load(item)(dispatch)
        };


        that[render] = () => <ImageGallery {...that.props} {...that.state} show={show} load={load} close={close}/>

        that[componentDidMount] = () => {
            props()[embedded] && show(props()[embedded])
        }
        that[componentDidUpdate] = (prevProps, prevState) => {
            prevProps[embedded] !== props()[embedded] && props()[embedded] && show(props()[embedded])
        }
    }
}
