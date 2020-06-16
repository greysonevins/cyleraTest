import React, {useState, useEffect, useMemo} from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import axios from "axios";
import {useHistory, useLocation} from 'react-router-dom';
import * as qs from "query-string";


export default function Header() {

    const [dataFethced, setDataFetched] = useState(null);
    const [selectDevice, setSelectDevice] = useState('');
    const history = useHistory();
    const location = useLocation()
    let defaults = {num_windows: 10, window_time: 60, end_time: parseInt(Date.now() / 1000)}
    useMemo(() => {
        if (!!history
            &&
            !!history?.location.pathname
            && history.location?.pathname
            && history.location.pathname.split("/").length > 1) {
            const device = history.location.pathname.split("/")[history.location.pathname.split("/").length - 1]
            setSelectDevice(device)
        }
    }, [history.location.pathname])


    useMemo(() => {
        if (!!selectDevice && !location.search) history.push({
            pathname: `/device/${selectDevice}`,
            search: "?" + new URLSearchParams(defaults).toString()
        })
        else if (!!selectDevice && !!location.search) {
            let state = {};

            Object.entries(qs.parse(location.search)).forEach(([k, v]) => {
                let newValue = parseInt(v)
                if (!!newValue) {
                    state[k] = newValue
                }
            })

            state = {...defaults, ...state}


            const urlSearch = new URLSearchParams(state).toString()
            history.push({
                pathname: `/device/${selectDevice}`,
                search: '?' + urlSearch
            })
        }
    }, [selectDevice])
    useEffect(() => {
        axios
            .get('/api/all_devices')
            .then(res => setDataFetched(res.data));
    }, []);

    return (

        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" noWrap>
                    {selectDevice ? 'View Device' : 'Home'}
                </Typography>
                <FormControl style={{color: "inherit", marginLeft: 50}}>
                    <Select
                        value={selectDevice}
                        onChange={(e) => setSelectDevice(e.target.value)}
                        placeholder={'Select Device to begin'}
                        name="device_id"
                        displayEmpty
                        style={{width: '60vh', color: "inherit"}}
                    >
                        {!selectDevice && (
                            <MenuItem value="" disabled>
                                Select Device to Begin
                            </MenuItem>
                        )}

                        {!!dataFethced && dataFethced?.devices && (
                            dataFethced.devices.map((device_uuid, ind) =>
                                <MenuItem key={ind} value={device_uuid}>{device_uuid}</MenuItem>
                            )
                        )}
                    </Select>
                </FormControl>
            </Toolbar>

        </AppBar>


    )

}
