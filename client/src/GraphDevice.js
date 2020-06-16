import React, {useState, useEffect, useMemo} from 'react';
import axios from "axios";
import {
    Card,
    CardContent,
    CardActions,
    CircularProgress,
    Button,
    CardHeader,
    Grid,
    Slider,
    Typography
} from '@material-ui/core'
import {LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line} from 'recharts'
import DateFnsUtils from '@date-io/date-fns';
import DateFnsAdapter from "@date-io/date-fns";
import * as qs from 'query-string';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import {
    useParams,
    useLocation,
    useHistory
} from "react-router-dom";
import Slide from '@material-ui/core/Slide';


function GraphDeviceViz({change, graph}) {
    return (
        <Slide direction="left" timeout={{
            enter: 2000,
            exit: 200,
        }}
               in={change} unmountOnExit>
            <LineChart width={730} height={275} data={graph}
                       margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="time"/>
                <YAxis/>
                <Tooltip/>
                <Line type="monotone" dataKey="bytes_fs" stroke="#8884d8"/>
                <Line type="monotone" dataKey="bytes_ts" stroke="#82ca9d"/>
            </LineChart>
        </Slide>

    )
}

const dateFns = new DateFnsAdapter();

export default function GraphDevice() {
    let {device_uuid} = useParams()
    const location = useLocation()
    const history = useHistory()

    const [dataFethced, setDataFetched] = useState(null);
    let state = {};

    Object.entries(qs.parse(location.search)).forEach(([k, v]) => {
        state[k] = parseInt(v)
    })
    const {num_windows, window_time, end_time} = state;
    const [s1, setS1] = useState(window_time ? window_time : 60)
    const [s2, setS2] = useState(num_windows ? num_windows : 10)
    const [page, setPage] = useState(1)
    const [graph, setGraph] = useState(null)
    const [change, setChange] = useState(true)
    const [loading, setLoading] = useState(false)


    useMemo(() => {

        setLoading(false)
        setChange(false)
        setPage(1)

    }, [device_uuid])
    useEffect(() => {
        let CancelToken = axios.CancelToken;
        let cancel;
        const params = new URLSearchParams({device_uuid, page, end_time, num_windows, window_time}).toString()
        setLoading(true)
        axios
            .get(`/api/device?${params}`, {
                cancelToken: new CancelToken(function executor(c) {
                    cancel = c;
                })
            })
            .then(res => setDataFetched(res.data))
            .catch(e => {
                if (axios.isCancel(e)) {
                    console.log(`request cancelled:${e}`);
                } else {
                    console.log("another error happened:" + e.message);
                }
            })
            .finally(() => {
                setLoading(false)

            })
        return () => {
            cancel('cancelled')
        }


    }, [device_uuid, num_windows, window_time, end_time, page])

    useEffect(() => {
        if (!!dataFethced && !!dataFethced?.data && !dataFethced.data.error) {


            const timeTest = new Date(Object.keys(dataFethced.data.frames)[0] * 1000)
            const graph = Object.entries(dataFethced.data.frames).map(([key, value]) =>

                ({
                    time: dateFns.format(new Date(key * 1000), 'M-dd-yy HH:mm:s'),
                    bytes_fs: value.bytes_fs_total,
                    bytes_ts: value.bytes_ts_total
                })
            )
            setChange(true)

            setGraph(graph)

        }

    }, [dataFethced])
    return !!dataFethced && dataFethced?.data && !dataFethced.data.error ? (
            <MuiPickersUtilsProvider utils={DateFnsUtils}>

                <Card style={{margin: 40}}>
                    <CardHeader
                        title={`Visualizing bandwidths for device ${device_uuid}`}
                    />


                    {loading && (
                        <Grid
                            container
                            direction="row"
                            justify="center"
                            alignItems="center"
                        >
                            <Grid
                                item={4}
                                style={{padding: 40}}
                            >
                                <CircularProgress size={50}/>
                            </Grid>
                        </Grid>
                    )}
                    {!loading && (

                        <React.Fragment>
                            <CardContent>

                                <Grid
                                    container
                                    direction="row"
                                    justify="center"
                                    alignItems="center"
                                >
                                    <Grid
                                        item={4}
                                        style={{padding: 40}}
                                    >
                                        <Typography gutterBottom>
                                            Number of Seconds Per Window
                                        </Typography>
                                        <Slider valueLabelDisplay="auto" style={{width: '50vh'}} value={s1} min={0}
                                                max={100} onChange={(e, s) => setS1(s)}
                                                onChangeCommitted={(e, newValue) => history.push({
                                                    pathname: `/device/${device_uuid}`,
                                                    search: '?' + new URLSearchParams({
                                                        ...state,
                                                        window_time: newValue
                                                    }).toString()
                                                })}/>

                                    </Grid>
                                    <Grid
                                        item={4}
                                        style={{padding: 40}}
                                    >
                                        <Typography gutterBottom>
                                            Number of Windows
                                        </Typography>
                                        <Slider valueLabelDisplay="auto" style={{width: '50vh'}} value={s2} min={0}
                                                max={100} onChange={(e, s) => setS2(s)}
                                                onChangeCommitted={(e, newValue) =>

                                                    history.push({
                                                        pathname: `/device/${device_uuid}`,
                                                        search: '?' + new URLSearchParams({
                                                            ...state,
                                                            num_windows: newValue
                                                        }).toString()
                                                    })
                                                }/>
                                    </Grid>
                                    <Grid
                                        item={4}
                                    >
                                        <KeyboardDatePicker
                                            disableToolbar
                                            variant="inline"
                                            style={{marginBottom: 20}}
                                            format="MM/dd/yyyy"
                                            id="date-picker-inline"
                                            label="Choose End Date"
                                            value={end_time * 1000}
                                            onChange={(date) => history.push({
                                                pathname: `/device/${device_uuid}`,
                                                search: '?' + new URLSearchParams({
                                                    ...state,
                                                    end_time: parseInt(date.getTime() / 1000)
                                                }).toString()
                                            })}
                                        />
                                    </Grid>

                                    <Grid
                                        item={12}
                                        style={{padding: 40}}
                                    >
                                        <GraphDeviceViz change={change} graph={graph}/>
                                    </Grid>
                                </Grid>
                            </CardContent>
                            <CardActions>
                                <Grid
                                    container
                                    direction="row"
                                    justify="space-around"
                                    alignItems="center"
                                >
                                    <Grid
                                        item={4}
                                    >
                                        <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Last Page</Button>
                                    </Grid>
                                    <Grid
                                        item={4}
                                    >
                                        <Typography>Viewing Page {page} of {dataFethced.data.num_pages}</Typography>
                                    </Grid>
                                    <Grid
                                        item={4}
                                    >
                                        <Button disabled={dataFethced.data.next_page === -1}
                                                onClick={() => setPage(p => p + 1)}>Next Page</Button>
                                    </Grid>

                                </Grid>
                            </CardActions>
                        </React.Fragment>
                    )}

                </Card>
            </MuiPickersUtilsProvider>


        )
        : dataFethced && dataFethced?.error && dataFethced.error
            ? (
                <Typography>{`Error with device ID ${device_uuid}`}</Typography>) : null

}
