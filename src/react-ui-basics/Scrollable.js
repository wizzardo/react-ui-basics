import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import PropTypes from 'prop-types';
import './Scrollable.css'
import {classNames, preventDefault, WINDOW, addEventListener, removeEventListener, setTimeout, clearTimeout, setInterval, clearInterval, createRef, orNoop} from "./Tools";
import {propsGetter, stateGS, PureComponent, render, componentDidMount, componentDidUpdate, componentWillUnmount} from "./ReactConstants";

export const SCROLLBAR_MODE_HIDDEN = 'hidden';
export const SCROLLBAR_MODE_VISIBLE = 'visible';
export const SCROLLBAR_MODE_AUTO = 'auto';

let NATIVE_SCROLL_WIDTH = -1;

const WITHOUT_SCROLL = 'without-scroll';
const WITH_SCROLL = 'with-scroll';

const createFieldGetter = field => el => el[field];
const scrollHeightOf = createFieldGetter('scrollHeight');
const offsetHeightOf = createFieldGetter('offsetHeight');
const styleOf = createFieldGetter('style');
const scrollBarModeOf = createFieldGetter('scrollBarMode');

class Scrollable extends PureComponent {

    constructor(properties) {
        super(properties);
        const that = this;
        that.state = {};

        const props = propsGetter(that);
        const status = stateGS(that);

        const containerRef = createRef();
        const viewportRef = createRef();
        const scrollbarRef = createRef();
        const thumbRef = createRef();

        let resizeInterval;
        let initTimeout;

        const clear = () => {
            clearInterval(resizeInterval);
            clearTimeout(initTimeout);
        };

        const init = () => {
            clear();

            if (scrollBarModeOf(props()) === SCROLLBAR_MODE_HIDDEN) {
                status(WITHOUT_SCROLL);
                return;
            }

            const viewport = viewportRef();
            const scrollbar = scrollbarRef();
            const container = containerRef();
            const thumb = thumbRef();

            let scrolling = false;
            let scrolledToBottom = false;
            let scrolledToTop = false;
            let adjustedScrollWidth = false;
            let lastY = 0;
            let scrollY = 0;
            let ratio = 0;

            viewport.onscroll = (e) => {
                const scrollHeight = scrollHeightOf(viewport);
                const offsetHeight = offsetHeightOf(viewport);
                const scrollbarHeight = offsetHeightOf(scrollbar);
                const position = viewport.scrollTop / (scrollHeight - offsetHeight);

                styleOf(thumb).top = (position * (scrollbarHeight - offsetHeightOf(thumb))) + 'px';

                if (position >= 0.98) {
                    !scrolledToBottom && orNoop(props().onScrolledToBottom)();
                    scrolledToBottom = true;
                } else {
                    scrolledToBottom = false;
                }

                if (position <= 0.02) {
                    !scrolledToTop && orNoop(props().onScrolledToTop)();
                    scrolledToTop = true;
                } else {
                    scrolledToTop = false;
                }
            };
            const reset = () => {
                removeEventListener(WINDOW, 'mouseup', reset);
                removeEventListener(WINDOW, 'mousemove', moveListener);
                scrolling = false;
            };
            const moveListener = (e) => {
                if (scrolling) {
                    if (e.buttons === 0) {
                        reset();
                    } else {
                        viewport.scrollTop += (e.clientY - lastY) * ratio;
                        lastY = e.clientY;
                    }
                }
            };
            thumb.onmousedown = (e) => {
                lastY = e.clientY;
                scrollY = viewport.scrollTop;
                scrolling = true;
                ratio = scrollHeightOf(viewport) / offsetHeightOf(viewport);

                addEventListener(WINDOW, 'mouseup', reset);
                addEventListener(WINDOW, 'mousemove', moveListener);
            };
            thumb.ondragstart = preventDefault;
            thumb.onmouseup = reset;
            scrollbar.onclick = (e) => {
                if (e.target === scrollbar) {
                    let thumbPosition = parseInt(styleOf(thumb).top);
                    viewport.scrollTop += offsetHeightOf(viewport) * 0.9 * (e.offsetY < thumbPosition ? -1 : 1);
                }
            };

            const adjustScrollWidth = () => {
                if (NATIVE_SCROLL_WIDTH < 0) {
                    NATIVE_SCROLL_WIDTH = viewport.offsetWidth - viewport.clientWidth;
                    if (NATIVE_SCROLL_WIDTH === 0 && scrollHeightOf(viewport) !== offsetHeightOf(viewport)) {
                        NATIVE_SCROLL_WIDTH = -1;
                    }
                }

                if (!adjustedScrollWidth && NATIVE_SCROLL_WIDTH >= 0) {
                    styleOf(viewport).paddingRight = (50) + 'px';
                    styleOf(viewport).marginRight = -(NATIVE_SCROLL_WIDTH + 50) - scrollbar.clientWidth + 'px';
                    adjustedScrollWidth = true;
                }
            };

            adjustScrollWidth();

            const showScrollbar = (scrollbar, viewport, adjustScrollWidth) => {
                styleOf(scrollbar).visibility = 'inherit';
                styleOf(scrollbar).bottom = '0'; //enable scrollbar
                styleOf(viewport).overflow = '';
                adjustScrollWidth();
                status() !== WITH_SCROLL && status(WITH_SCROLL);
            };

            const hideScrollbar = (scrollbar, viewport) => {
                styleOf(scrollbar).visibility = 'hidden'; //disable scrollbar
                styleOf(viewport).overflow = 'inherit';
                styleOf(viewport).paddingRight = '0';
                styleOf(viewport).marginRight = '0';
                status() !== WITHOUT_SCROLL && status(WITHOUT_SCROLL);
            };

            initTimeout = setTimeout(() => {
                resizeInterval = setInterval(() => {
                    const scrollHeight = scrollHeightOf(viewport);
                    const scrollbarHeight = offsetHeightOf(scrollbar);

                    !adjustedScrollWidth && adjustScrollWidth();

                    const newRatio = scrollHeight / scrollbarHeight;
                    if ((ratio === newRatio && Number.isFinite(newRatio)) || Number.isNaN(newRatio)) return;

                    const offsetHeight = offsetHeightOf(viewport);
                    let containerOffsetHeight = offsetHeightOf(container);
                    if (containerOffsetHeight === scrollHeight && status() === WITHOUT_SCROLL)
                        return;

                    if (scrollHeight - offsetHeight - viewport.scrollTop <= 20 && newRatio < ratio && Number.isFinite(newRatio) && Number.isFinite(ratio)) {
                        viewport.scrollTop = 0; // scroll to top if scrollbar gets smaller
                    }

                    ratio = newRatio;
                    styleOf(thumb).height = (scrollbarHeight / newRatio) + 'px';
                    styleOf(container).height = scrollHeight + 'px';
                    containerOffsetHeight = offsetHeightOf(container);

                    if (scrollBarModeOf(props()) === SCROLLBAR_MODE_HIDDEN) {
                        if (status() !== WITHOUT_SCROLL)
                            hideScrollbar(scrollbar, viewport);

                        return
                    }

                    if (containerOffsetHeight < scrollHeight) {
                        adjustedScrollWidth = false;
                        showScrollbar(scrollbar, viewport, adjustScrollWidth);
                    } else {
                        hideScrollbar(scrollbar, viewport);
                    }

                    scrolledToBottom = false;
                    scrolledToTop = false;

                    const position = viewport.scrollTop / (scrollHeight - offsetHeight);
                    styleOf(thumb).top = (position * (scrollbarHeight - offsetHeightOf(thumb))) + 'px';
                }, 50);
            }, 200)
        };

        that[componentDidMount] = init;
        that[componentWillUnmount] = clear;

        that[componentDidUpdate] = (prevProps) => {
            if (scrollBarModeOf(props()) !== scrollBarModeOf(prevProps))
                init();
        };

        that.setScroll = (y) => {
            viewportRef().scrollTop = y
        };
        that.getScroll = () => viewportRef().scrollTop;
        that.getScrollHeight = () => scrollHeightOf(viewportRef());
        that.getHeight = () => containerRef().clientHeight;

        that[render] = () => {
            const _props = props();
            const {className, children} = _props;
            return (
                <div className={classNames('Scrollable', className, status() || WITH_SCROLL)} style={styleOf(_props)} ref={containerRef}>
                    <div className="viewport" ref={viewportRef}>
                        {children}
                    </div>
                    <div className={classNames('scrollbar', scrollBarModeOf(_props) || SCROLLBAR_MODE_AUTO)} ref={scrollbarRef}>
                        <div className="thumb" ref={thumbRef}/>
                    </div>
                </div>
            )
        };
    }
}

export default Scrollable

if (window.isNotProductionEnvironment) {
    Scrollable.propTypes = {
        scrollBarMode: PropTypes.oneOf([SCROLLBAR_MODE_AUTO, SCROLLBAR_MODE_HIDDEN, SCROLLBAR_MODE_VISIBLE]),
        className: PropTypes.string,
        style: PropTypes.object,
        onScrolledToBottom: PropTypes.func,
        onScrolledToTop: PropTypes.func,
    }
}