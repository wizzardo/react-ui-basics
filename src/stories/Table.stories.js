import React, {useState} from 'react';
import "./index.css"
import Table from "../react-ui-basics/Table";
import ScrollableTable from "../react-ui-basics/ScrollableTable";

export default {
    title: 'Table',
    component: Table,
};

export const story1 = () => {
    const [data, setData] = useState([...Array(50).keys()].map(i => ({id: i, column1: `value ${i}`, column2: `value ${i}`, column3: `value ${i}`})))
    return <Table
        onChange={item => {
            const newData = [...data];
            newData[item.id] = item
            setData(newData)
        }}
        data={data}
        columns={[
            {
                header: 'Column 1', field: 'column1', editable: true,
            },
            {
                header: 'Column 2 (not sortable)', sortable: false, field: 'column2',
            },
            {
                header: 'Column 3 with formatter', field: 'column3', formatter: ((value) => value.toUpperCase())
            },
        ]}
    />;
};
story1.story = {
    name: 'basic',
};


export const story2 = () => <ScrollableTable
    data={[...Array(50).keys()].map(i => ({column1: `value ${i}`, column2: `value ${i}`, column3: `value ${i}`}))}
    columns={[
        {
            header: 'Column 1', field: 'column1',
        },
        {
            header: 'Column 2 (not sortable)', sortable: false, field: 'column2',
        },
        {
            header: 'Column 3 with formatter', field: 'column3', formatter: ((value) => value.toUpperCase())
        },
    ]}
/>;
story2.story = {
    name: 'scrollable with fixed header',
};
