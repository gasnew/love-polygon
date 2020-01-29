# Love Polygon--TODO

## Roadmap
+ Draggable tokens
+ Landing page
  + Session ids
  + Create or join session
  + Name selection
+ Server provides nodes
  + This happens once every player drops token center-screen
+ Node transfers
  + Stress test this by causing two clients to "fight" for the same token
+ Server provides goals/relationships with nodes
  + Render text to indicate shared node ownership
  + Render text to indicate relationship
+ Cake, cookies, and candy
  + Add three types of tokens
  + Add needs
+ Button to cause round-ending timer when need is met
+ Milestone 1 complete!
+ Playtest a little (Voting will be done on paper)
+ Rewrite the UI in React because not everyone's phone can deal with WebGL
+ Voting
  + Rotate through players (ending with person who ended the round)
    + When your turn, screen says, "Tell everyone which of these people had a crush on you. So-and-so is taking notes."
    + Next person in the rotation takes notes. This is the only person who can make inputs
    + Everyone else can see names being selected
  + When selections are confirmed and submitted, all screens indicate whether this is correct then move on to next player
  + Alert dialog when submitting guess--"Make sure this is what Bobob wants!"
  + Final "See Round 1 results" button
+ Gameplay upgrades
  + Swapping!
  + Only three plates per person
+ Initial Final screen
  x Rotates through all players tallying up scores (probs not going to do this
  one. The table was sufficient in playtests)
    x Needs met?
    x Guessed all who had crush?
    x Did they succeed in their mission?
  + Finally displays table of all scores
- Stability
  - iphones don’t work:(
    - can probably implement custom target hit detection to fix
  - Can easily switch between touch backend and multibackend
  - need to store session info in cookie because errors happen and refreshes are needed
    - Prompt user about rejoining session x as y
  - Catch error and refresh?
- Final screen pt. 2
  - Lead person can initiate next round
  - Points accumulate
  - Ties are indicated properly (two tie at top => both 2nd place)
  - At end of third round, button links to lobby page
- Milestone 2 complete!!
- More gameplay upgrades
  - Ask the voter whether the note-taker's selections are correct
- Playtest a bit more
- Improve lobby screen
  - Be able to see how many people are in the lobby
  - Only people whose hearts are in the jar are included in the round. Everyone
    else is kicked (probably just notification with a button to go back to the
    main page) until the round is over.
  - Setting and editing name happens here (so people can change their names
    when starting a new set of rounds)
  - Name character limit is imposed for styling reasons
  - Jar of hearts (with players' names!)
- Practice mode
  - Can trade all you want but cannot end round
  - Party leader can move it back to lobby to start a real round
- Improve landing page
  - Two buttons: "Create session" and "Join session"
- Love polygon
  - Actually a graph
  - Separate tab on completion screen?
- Visual upgrades
  - Use Jesse's art! :heart:
  - Use React Spring?
  - Standardize on material design?
  - Adjust for different resolutions
  - Think about page formatting for once
  - Hover animation
  - Drop animation
  - Take animation (w/ gloved hand)
  - Deliver animation (w/ gloved hand)
  - Scrolling background with food/heart symbols?
  - Scene transitions
  - Heart/Broken heart/tissue box stamp for guessing crushes correctly?
  - Use ExpansionPanel for VotingBallot
- Milestone 3!!
- Playtest, playtest, playtest!
- Sound effects!
  - pick up
  - drop
  - round ending timer
  - celebrate
- Figure out how to actually calculate probabilities, e.g., "How many crushes
  should there be such that guessing nobody isn't the best strategy."
- Host on the cloud for all to see
  - AWS CDK?
  - Configure app environment (i.e., redis URL)
  - Dockerize the server and client
- Make actual landing page
  - Look at Google Keep notes for stuff on donations and game description
- Open-source the project

## Pipe dreams
- Technical refactors
  - Use socket.io-redis to support multiple hosts on one Redis cluster?
  - Use something other than socket.io for pubsub?
- Compose music for the lobby
- Close session loop?
  - Three different types of round
    1. ???
    2. ???
    3. True love (bonus points if you guess who)

## Known bugs
- Websocket connection is often flaky (could this be the Chrome same-host connection limit?)
  - Not a problem in practice
- Players can transfer tokens from another player's storage node
  - Either, current token should be set to null (maybe not great)
  - Or, transfers to another player can only occur from shared nodes
- Relationship generation can fail
+ Someone can be a wingman for a person who has a crush on them
- Multiple players of the same name can be created if both validate successfully and then join socket. I.e., no socket validation
  -  Solution: Force disconnect in this case (relies on top feature to fit in
- After switching to fullscreen, I will receive state updates, even for moves I make
- Timers (used for countdown and timing before voting) can be broken by restarting the server

## Features to fit in
- When the client disconnects, drop back into game in refresh

## Playtest notes
Progress is indicated in terms of where I am regarding making these actual items.
* -: needs to be triaged or clarified
* /: considering or may already be addressed
* x: rejected
* +: folded into an above milestone (though maybe not completed yet)

### 1/24/20
/ images_urls type error
  / fixed?
- switching party leaders is fun
  - Maybe we want to randomly assign the note-taker?
+ need to store session info in cookie because errors happen and refreshes are needed
+ adjust for different resolutions
+ iphones don’t work:(
  + can probably implement custom target hit detection to fix
+ fun names are OK
  + but should impose character limit for styling reasons
x maybe creating session id is fun
  x no
+ fixed crush counts would be good
x add tiebreaker
- actually show graph of relationships
+ better describe game
+ multiple rounds with cumulative points
