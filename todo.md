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
+ Playtest 1! (Voting will be done on paper)
+ Rewrite the UI in React because not everyone's phone can deal with WebGL
- Voting
  - Rotate through players (ending with person who ended the round)
    - When your turn, screen says, "Tell everyone which of these people had a crush on you. So-and-so is taking notes."
    - Next person in the rotation takes notes. This is the only person who can make inputs
    - Everyone else can see names being selected
  - When selections are confirmed and submitted, all screens indicate whether this is correct then move on to next player
- Final screen
  - Rotates through all players tallying up scores
    - Needs met?
    - Guessed all who had crush?
    - Did they succeed in their mission?
  - Finally displays table of all scores and lets lead person initiate next round
- Playtest 2!!
- Visual upgrades
  - Standardize on material design?
  - Think about page formatting for once
  - Hover animation
  - Drop animation
  - Take animation (w/ gloved hand)
  - Deliver animation (w/ gloved hand)
  - Scrolling background with food/heart symbols?
  - Scene transitions
- Improve lobby screen
  - Add practice mode
  - Be able to see how many people are in the lobby
- Playtest 3!!
- Host on the cloud for all to see
  - AWS CDK?
  - Configure app environment (i.e., redis URL)
  - Dockerize the server and client
- Make actual landing page
- Open-source the project

## Pipe dreams
- Technical refactors
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
+ Someone can be a wingman for a person who has a crush on them
- Multiple players of the same name can be created if both validate successfully and then join socket. I.e., no socket validation
  -  Solution: Force disconnect in this case (relies on top feature to fit in
- After switching to fullscreen, I will receive state updates, even for moves I make

## Features to fit in
- When the client disconnects, drop back into game in refresh
- 
