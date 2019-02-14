// @flow

// Some code in this file is modified from a Material Design example:
// https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/page-layout-examples/sign-in/SignIn.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import Tabs from '@material-ui/core/Tabs';

import SwipeableViews from 'react-swipeable-views';
import Tab from '@material-ui/core/Tab';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FavoriteOutlinedIcon from '@material-ui/icons/FavoriteOutlined';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import GroupAdd from '@material-ui/icons/GroupAdd';
import Group from '@material-ui/icons/Group';

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
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing.unit,
  },
  submit: {
    marginTop: theme.spacing.unit * 3,
  },
});

function TabContainer({ children, dir }) {
  return (
    <Typography component="div" align="center" style={{ padding: 8 * 3 }}>
      {children}
    </Typography>
  );
}

type Props = {
  classes: any,
  setSession: Session => void,
};
type State = {|
  sessionId: ?string,
  playerName: ?string,
  tab: number,
|};

class LandingPage extends Component<Props, State> {
  state = { sessionId: null, playerName: null, tab: 0 };

  render() {
    const { setSession, classes } = this.props;
    const joinSession = () => {
      setSession({
        id: 'abcd',
        name: 'joe bob joe',
      });
    };

    const handleTabChange = (event, tab) => {
      this.setState({ tab });
    };
    const handleTabChangeBySwiping = tab => {
      this.setState({ tab: tab });
    };
    const handleTextInput = name => event => {
      const value = event.target.value;
      this.setState(() => ({ [name]: value }));
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
              <TextField
                id="name"
                label="Name"
                value={this.state.playerName}
                onChange={handleTextInput('playerName')}
                margin="normal"
                required
                fullWidth
              />
          <Tabs
            value={this.state.tab}
            indicatorColor="primary"
            textColor="primary"
            onChange={handleTabChange}
          >
            <Tab label="Join" icon={<Group />} />
            <Tab label="Create" icon={<GroupAdd />} />
          </Tabs>
          <SwipeableViews
            axis="x"
            index={this.state.tab}
            onChangeIndex={handleTabChangeBySwiping}
          >
            <TabContainer>
              <TextField
                id="sessionId"
                label="Session ID"
                value={this.state.sessionId}
                onChange={handleTextInput('sessionId')}
                margin="normal"
                required
                fullWidth
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Join Session
              </Button>
            </TabContainer>
            <TabContainer dir="rtl">
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Create Session
              </Button>
            </TabContainer>
          </SwipeableViews>
        </Paper>
      </main>
    );
  }
}

LandingPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LandingPage);
