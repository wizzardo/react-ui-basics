import React from 'react';
import "./index.css"
import AutocompleteSelect, {MODE_INLINE_MULTIPLE, MODE_MULTIPLE_AUTO, MODE_MULTIPLE_MINI_INLINE} from "../react-ui-basics/AutocompleteSelect";
import {SCROLLBAR_MODE_HIDDEN} from "../react-ui-basics/Scrollable";
import Button from "../react-ui-basics/Button";

export default {
    title: 'Select',
    component: AutocompleteSelect,
};

export const story1 = () => <AutocompleteSelect
    withArrow={false}
    label={"Select value"}
    data={[...Array(100)].map((_, i) => `value #${i}`)}
/>;
story1.story = {
    name: 'basic autocomplete',
};

const MenuIcon = () => <Button flat={true} round={true}>
    <i className="material-icons">more_vert</i>
</Button>;
export const story2 = () => <AutocompleteSelect className="menu"
                                                scroll={SCROLLBAR_MODE_HIDDEN}
                                                value={true}
                                                withArrow={false}
                                                selectedComponent={MenuIcon}
                                                withFilter={false}
                                                selectedMode={'inline'}
                                                data={[
                                                    'edit',
                                                    'delete',
                                                ]}
                                                labels={{
                                                    'edit': <div className={"row"}><i className="material-icons">edit</i>
                                                        Edit
                                                    </div>,
                                                    'delete': <div className={"row"}><i className="material-icons">delete_outline</i>
                                                        Delete
                                                    </div>,
                                                }}
/>;
story2.story = {
    name: 'menu',
};


export const story3 = () => <AutocompleteSelect
    mode={MODE_MULTIPLE_AUTO}
    withArrow={false}
    inlineSelected={true}
    label={"Select value"}
    data={[...Array(100)].map((_, i) => `value #${i}`)}
/>;
story3.story = {
    name: 'multiselect inlined',
};


export const story4 = () => <AutocompleteSelect
    withArrow={false}
    allowCustom={true}
    value={"test"}
    label={"Select value"}
    data={[...Array(100)].map((_, i) => `value #${i}`)}
/>;
story4.story = {
    name: 'with custom values',
};