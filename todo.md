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
- Final screen
  - Rotates through all players tallying up scores
    - Needs met?
    - Guessed all who had crush?
    - Did they succeed in their mission?
  - Finally displays table of all scores and lets lead person initiate next round
- Milestone 2 complete!!
- Playtest a bit more
- Visual upgrades
  - Standardize on material design?
  - Think about page formatting for once
  - Hover animation
  - Drop animation
  - Take animation (w/ gloved hand)
  - Deliver animation (w/ gloved hand)
  - Scrolling background with food/heart symbols?
  - Scene transitions
  - Heart/Broken heart/tissue box stamp for guessing crushes correctly?
  - Use ExpansionPanel for VotingBallot
- Improve lobby screen
  - Add practice mode
  - Be able to see how many people are in the lobby
  - Jar of hearts (with players' names!)
- Milestone 3!!
- Playtest, playtest, playtest!
- Host on the cloud for all to see
  - AWS CDK?
  - Configure app environment (i.e., redis URL)
  - Dockerize the server and client
- Make actual landing page
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
