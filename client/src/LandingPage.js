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

import type { SessionInfo } from '../../server/networkTypes';

// NOTE: create-react-app does not allow importing outside of src/, so we have
// to keep these up-to-date with server/constants.js
export const VALID_SESSION_ID_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
export const SESSION_ID_LENGTH = 4;

const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme
      .spacing.unit * 3}px`,
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main,
  },
  stepper: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  divider: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
  actionsContainer: {
    marginBottom: theme.spacing.unit * 2,
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
    const { error } = (await axios.post('api/check-session', {
      sessionId,
    })).data;
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

  const handleNext = () => setActiveStep(activeStep + 1);
  const handleBack = () => setActiveStep(activeStep - 1);
  const handleTextInput = setField => event => {
    const value = event.target.value;
    console.log(value);
    console.log(`[^${VALID_SESSION_ID_CHARACTERS}]+`);
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
                label="Session ID"
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
              />
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={() => joinSession(sessionIdField.value)}
              >
                Join Session
              </Button>
              <Divider className={classes.divider} />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={createSession}
              >
                Create Session
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
