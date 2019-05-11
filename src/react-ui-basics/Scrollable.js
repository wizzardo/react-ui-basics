import React from 'react';
import PropTypes from 'prop-types';
import './Scrollable.css'
import {classNames, ref} from "./Tools";

export const SCROLLBAR_MODE_HIDDEN = 'hidden';
export const SCROLLBAR_MODE_VISIBLE = 'visible';
export const SCROLLBAR_MODE_AUTO = 'auto';

let NATIVE_SCROLL_WIDTH = -1;

const WITHOUT_SCROLL = 'without-scroll';
const WITH_SCROLL = 'with-scroll';

class Scrollable extends React.Component {

    static propTypes = {
        scrollBarMode: PropTypes.oneOf([SCROLLBAR_MODE_AUTO, SCROLLBAR_MODE_HIDDEN, SCROLLBAR_MODE_VISIBLE])
    };

    state = {};

    render = () => {
        const {className, scrollBarMode, children, style} = this.props;
        const {status} = this.state;
        return (
            <div className={classNames('Scrollable', className, status || WITH_SCROLL)} style={style} ref={ref('container', this)}>
                <div className="viewport" ref={ref('viewport', this)}>
                    {children}
                </div>
                <div className={classNames('scrollbar', scrollBarMode || SCROLLBAR_MODE_AUTO)} ref={ref('scrollbar', this)}>
                    <div className="thumb" ref={ref('thumb', this)}/>
                </div>
            </div>
        )
    };

    init = () => {
        this.clear();

        if (this.props.scrollBarMode === SCROLLBAR_MODE_HIDDEN) {
            this.setState({status: WITHOUT_SCROLL});
            return;
        }

        const container = this.container;
        const viewport = this.viewport;
        const scrollbar = this.scrollbar;
        const thumb = this.thumb;

        const state = {scrolling: false, scrolledToBottom: false};
        viewport.onscroll = (e) => {
            const scrollHeight = viewport.scrollHeight;
            const offsetHeight = viewport.offsetHeight;
            const scrollbarHeight = scrollbar.offsetHeight;
            const position = viewport.scrollTop / (scrollHeight - offsetHeight);

            thumb.style.top = (position * (scrollbarHeight - thumb.offsetHeight)) + 'px';

            if (scrollHeight - offsetHeight - viewport.scrollTop <= 200) {
                if (!state.scrolledToBottom && this.props.onScrolledToBottom) {
                    this.props.onScrolledToBottom()
                }
                state.scrolledToBottom = true;
            } else {
                state.scrolledToBottom = false;
            }
        };
        const reset = () => {
            window.removeEventListener('mouseup', reset);
            window.removeEventListener('mousemove', moveListener);
            state.scrolling = false;
        };
        const moveListener = (e) => {
            if (!state.scrolling) return;

            if (e.buttons === 0) {
                reset();
                return;
            }
            viewport.scrollTop += (e.clientY - state.lastY) * state.ratio;
            state.lastY = e.clientY;
        };
        thumb.onmousedown = (e) => {
            state.lastY = e.clientY;
            state.scrollY = viewport.scrollTop;
            state.scrolling = true;
            state.ratio = viewport.scrollHeight / viewport.offsetHeight;

            window.addEventListener('mouseup', reset);
            window.addEventListener('mousemove', moveListener);
        };
        thumb.ondragstart = (e) => e.preventDefault();
        thumb.onmouseup = reset;
        scrollbar.onclick = (e) => {
            if (e.target !== scrollbar) return;

            let thumbPosition = parseInt(thumb.style.top);
            viewport.scrollTop += viewport.offsetHeight * 0.9 * (e.offsetY < thumbPosition ? -1 : 1);
        };

        const adjustScrollWidth = () => {
            if (NATIVE_SCROLL_WIDTH < 0) {
                NATIVE_SCROLL_WIDTH = viewport.offsetWidth - viewport.clientWidth;
                if (NATIVE_SCROLL_WIDTH === 0 && viewport.scrollHeight !== viewport.offsetHeight) {
                    NATIVE_SCROLL_WIDTH = -1;
                }
            }

            if (!state.adjustScrollWidth && NATIVE_SCROLL_WIDTH >= 0) {
                viewport.style.paddingRight = (50) + 'px';
                viewport.style.marginRight = -(NATIVE_SCROLL_WIDTH + 50) - scrollbar.clientWidth + 'px';
                state.adjustScrollWidth = true;
            }
        };

        adjustScrollWidth();

        this.initTimeout = setTimeout(() => {
            this.resizeInterval = setInterval(() => {
                const scrollHeight = viewport.scrollHeight;
                const scrollbarHeight = scrollbar.offsetHeight;

                adjustScrollWidth();

                const ratio = scrollHeight / scrollbarHeight;
                if ((state.ratio === ratio && Number.isFinite(ratio)) || Number.isNaN(ratio)) return;

                const offsetHeight = viewport.offsetHeight;
                let containerOffsetHeight = container.offsetHeight;
                if (containerOffsetHeight === scrollHeight && this.state.status === WITHOUT_SCROLL)
                    return;

                if (scrollHeight - offsetHeight - viewport.scrollTop <= 20 && ratio < state.ratio) {
                    viewport.scrollTop = 0; // scroll to top if scrollbar gets smaller
                }

                state.ratio = ratio;
                thumb.style.height = (scrollbarHeight / ratio) + 'px';
                container.style.height = scrollHeight + 'px';
                containerOffsetHeight = container.offsetHeight;

                if (this.props.scrollBarMode === SCROLLBAR_MODE_HIDDEN) {
                    if (this.state.status !== WITHOUT_SCROLL)
                        this.hideScrollbar(scrollbar, viewport);

                    return
                }

                if (containerOffsetHeight < scrollHeight) {
                    this.showScrollbar(scrollbar, viewport, state, adjustScrollWidth);
                } else {
                    this.hideScrollbar(scrollbar, viewport);
                }

                const position = viewport.scrollTop / (scrollHeight - offsetHeight);
                thumb.style.top = (position * (scrollbarHeight - thumb.offsetHeight)) + 'px';
            }, 50);
        }, 200)
    };

    showScrollbar = (scrollbar, viewport, state, adjustScrollWidth) => {
        scrollbar.style.visibility = 'inherit';
        scrollbar.style.bottom = '0'; //enable scrollbar
        viewport.style.overflow = '';
        state.adjustScrollWidth = false;
        adjustScrollWidth();
        if (this.state.status !== WITH_SCROLL)
            this.setState({status: WITH_SCROLL});
    };

    hideScrollbar = (scrollbar, viewport) => {
        scrollbar.style.visibility = 'hidden'; //disable scrollbar
        viewport.style.overflow = 'inherit';
        viewport.style.paddingRight = '0';
        viewport.style.marginRight = '0';
        if (this.state.status !== WITHOUT_SCROLL)
            this.setState({status: WITHOUT_SCROLL});
    };

    clear = () => {
        this.resizeInterval && clearInterval(this.resizeInterval);
        this.initTimeout && clearTimeout(this.initTimeout);
    };

    componentDidMount = this.init;
    componentWillUnmount = this.clear;

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.scrollBarMode !== prevProps.scrollBarMode)
            this.init();
    }

    setScroll = (y) => this.viewport.scrollTop = y;
    getScroll = () => this.viewport.scrollTop;
    getHeight = () => this.container.clientHeight;
}

export default Scrollable
