import React from 'react';
import {mount} from 'enzyme';
import AutocompleteSelect from "./AutocompleteSelect";

describe('AutocompleteSelect listPortal position', () => {
    it('calculates list position with listPortal and scroll when listPortalPosition is left', () => {
        const portal = document.createElement('div');
        portal.scrollTop = 50;
        portal.scrollLeft = 20;
        portal.getBoundingClientRect = () => ({
            top: 100,
            left: 50,
            bottom: 400,
            right: 350,
            width: 300,
            height: 300,
        });

        const wrapper = mount(
            <AutocompleteSelect
                listPortal={portal}
                data={['item1', 'item2']}
            />
        );

        const instance = wrapper.instance();
        instance.el.getBoundingClientRect = () => ({
            top: 150,
            bottom: 186,
            left: 80,
            right: 280,
            width: 200,
            height: 36,
        });

        wrapper.setState({isActive: true});
        instance.updateListPosition();

        expect(instance.state.listStyles).toEqual({
            position: 'absolute',
            top: `${186 - 100 + 50}px`, // 136px
            left: `${80 - 50 + 20}px`,  // 50px
            minWidth: '200px',
            maxHeight: '300px',
        });
    });

    it('calculates list position with listPortal and list bounding rect when listPortalPosition is right', () => {
        const portal = document.createElement('div');
        portal.scrollTop = 30;
        portal.scrollLeft = 10;
        portal.getBoundingClientRect = () => ({
            top: 100,
            left: 50,
            bottom: 500,
            right: 450,
            width: 400,
            height: 400,
        });

        const wrapper = mount(
            <AutocompleteSelect
                listPortal={portal}
                listPortalPosition="right"
                data={['item1', 'item2']}
            />
        );

        const instance = wrapper.instance();
        instance.el.getBoundingClientRect = () => ({
            top: 150,
            bottom: 186,
            left: 100,
            right: 300,
            width: 200,
            height: 36,
        });

        // Mock list getBoundingClientRect with width 250
        if (instance.list?.el?.el) {
            instance.list.el.el.getBoundingClientRect = () => ({
                top: 0,
                left: 0,
                bottom: 200,
                right: 250,
                width: 250,
                height: 200,
            });
        }

        wrapper.setState({isActive: true});
        instance.updateListPosition();

        // rect.right (300) - portalRect.left (50) + scrollLeft (10) - listWidth (250) = 10px
        expect(instance.state.listStyles).toEqual({
            position: 'absolute',
            top: `${186 - 100 + 30}px`, // 116px
            left: `${300 - 50 + 10 - 250}px`, // 10px
            minWidth: '200px',
            maxHeight: '300px',
        });
    });
});
