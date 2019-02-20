// @flow

// Some code in this file is modified from a Material Design example:
// https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/page-layout-examples/sign-in/SignIn.js

import axios from 'axios';
import React, { Component } from 'react';
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

import type { Session } from './state';

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
  setSession: Session => void,
};
type State = {|
  sessionIdField: {
    value: string,
    error: boolean,
  },
  playerNameField: {
    value: string,
    error: boolean,
  },
  activeStep: number,
|};

class LandingPage extends Component<Props, State> {
  state = {
    sessionIdField: {
      value: 'darginblargin',
      error: false,
    },
    playerNameField: {
      value: 'Bill just bill',
      error: false,
    },
    activeStep: 1,
  };

  render() {
    const { sessionIdField, playerNameField, activeStep } = this.state;
    const { setSession, classes } = this.props;

    const joinSession = async () => {
      if (!playerNameField.value) {
        this.setState(() => ({ playerNameField: { value: '', error: true } }));
        handleBack();
      } else {
        await axios.post('api/join-session', {
          sessionId: sessionIdField.value,
          playerName: playerNameField.value,
        });
        setSession({
          id: sessionIdField.value,
          name: playerNameField.value,
        });
      }
    };
    const generateSessionId = async () => {
      const response = await axios.post('api/get-session-id');
      this.setState(() => ({
        sessionIdField: { value: response.data.message.id, error: false },
      }));
    };

    const handleNext = () => {
      this.setState(state => ({
        activeStep: state.activeStep + 1,
      }));
    };
    const handleBack = () => {
      this.setState(state => ({
        activeStep: state.activeStep - 1,
      }));
    };
    const handleTextInput = name => event => {
      const value = event.target.value;
      this.setState(() => ({
        [name]: {
          value,
          error: false,
        },
      }));
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
              <StepLabel>Enter your name</StepLabel>
              <StepContent>
                <TextField
                  label="Name"
                  value={playerNameField.value}
                  onChange={handleTextInput('playerNameField')}
                  {...(playerNameField.error
                    ? {
                        error: true,
                        helperText: 'Please enter a valid name.',
                      }
                    : {})}
                  margin="normal"
                  variant="outlined"
                  fullWidth
                />
                <div className={classes.actionsContainer}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    className={classes.button}
                  >
                    Next
                  </Button>
                </div>
              </StepContent>
            </Step>
            <Step>
              <StepLabel>Enter a session</StepLabel>
              <StepContent>
                <TextField
                  label="Session ID"
                  value={sessionIdField.value}
                  onChange={handleTextInput('sessionIdField')}
                  {...(sessionIdField.error
                    ? {
                        error: true,
                        helperText: 'Please enter a valid session ID.',
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
                  onClick={generateSessionId}
                >
                  Generate Session ID
                </Button>
                <Divider className={classes.divider} />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={joinSession}
                >
                  Join Session
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
}

export default withStyles(styles)(LandingPage);
