import React from "react";
import {Grid, Paper, Typography} from '@material-ui/core'

function App() {
    return (
        <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
        >
            <Grid
                xs={12}
                item
                style={{
                    padding: 60
                }}
            >

                <Paper style={{height: '90vh'}} variant="outlined" square>
                    <Grid
                        container
                        direction="column"
                        justify="center"
                        alignItems="center"
                    >
                        <Grid
                            item={12}
                            style={{padding: 40}}
                        >
                            <Typography>Select a Device ID to begin</Typography>

                        </Grid>
                        <Grid
                            item={12}
                            style={{padding: 40}}
                        >


                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    );
}

export default App;
