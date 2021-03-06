// @flow

// Some code in this file is modified from a Material Design example:
// https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/page-layout-examples/sign-in/SignIn.js

import axios from 'axios';
import _ from 'lodash';
import React, { useState } from 'react';
import queryString from 'query-string';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import FavoriteOutlinedIcon from '@material-ui/icons/FavoriteOutlined';
import Paper from '@material-ui/core/Paper';
import Step from '@material-ui/core/Step';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';

import { SESSION_ID_LENGTH, VALID_SESSION_ID_CHARACTERS } from './constants';

const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    [theme.breakpoints.up(400 + theme.spacing(3 * 2))]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(
      3
    )}px`,
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  stepper: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
});

type Props = {
  classes: any,
  setSessionId: string => void,
};
type Field = {
  value: string,
  error: string,
};

function LandingPage({ classes, setSessionId }: Props) {
  const [sessionIdField, setSessionIdField] = useState<Field>({
    value: '',
    error: '',
  });
  // TODO: Perhaps joining/creating a session is step 2 after looking looking
  // at instructions, donating, etc.
  const [activeStep, setActiveStep] = useState(0);

  const setAndStoreSessionId = sessionId => {
    // Store session ID in URL for link sharing
    window.location.search = queryString.stringify({ sessionId });
    setSessionId(sessionId);
  };

  const joinSession = async sessionId => {
    const { error } = (
      await axios.post('api/check-session', {
        sessionId,
      })
    ).data;
    if (error) {
      setSessionIdField({
        ...sessionIdField,
        error,
      });
      return;
    }

    setAndStoreSessionId(sessionId);
  };

  const createSession = async () => {
    const { error, sessionId } = (await axios.get('api/create-session')).data;
    if (error) {
      setSessionIdField({
        ...sessionIdField,
        error,
      });
      return;
    }
    setAndStoreSessionId(sessionId);
  };

  const handleBack = () => setActiveStep(activeStep - 1);
  const handleTextInput = setField => event => {
    const value = event.target.value;
    setField({
      value: _.replace(
        value.toUpperCase(),
        new RegExp(`[^${VALID_SESSION_ID_CHARACTERS}]+`),
        ''
      ).substring(0, SESSION_ID_LENGTH),
      error: '',
    });
  };

  return (
    <main className={classes.main}>
      <CssBaseline />
      <Paper className={classes.paper}>
        <Avatar className={classes.avatar}>
          <FavoriteOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Love Polygon
        </Typography>
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          className={classes.stepper}
        >
          <Step>
            <StepLabel>Join or create a session</StepLabel>
            <StepContent>
              <TextField
                label="Room ID"
                value={sessionIdField.value}
                onChange={handleTextInput(setSessionIdField)}
                {...(sessionIdField.error
                  ? {
                      error: true,
                      helperText: sessionIdField.error,
                    }
                  : {})}
                margin="normal"
                variant="outlined"
                fullWidth
                onKeyPress={({ key }) => {
                  if (key === 'Enter') joinSession(sessionIdField.value);
                }}
              />
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={() => joinSession(sessionIdField.value)}
              >
                Join Room
              </Button>
              <Divider className={classes.divider} />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={createSession}
              >
                New Room
              </Button>
              <div className={classes.actionsContainer}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  className={classes.button}
                >
                  Back
                </Button>
              </div>
            </StepContent>
          </Step>
        </Stepper>
      </Paper>
    </main>
  );
}

export default withStyles(styles)(LandingPage);
