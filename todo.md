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
  - Hover animation
  - Drop animation
  - Take animation (w/ gloved hand)
  - Deliver animation (w/ gloved hand)
  - Scrolling background with food/heart symbols?
  - Scene transitions
- Animations
  - e.g.
     ```
     animate(data, delta); // data must have id
     animate(data, delta) {
       const tweens = getTweens(data.id);
       const newData = reduce(tweens,
         (result, tween) => tween(delta)(result),
         data
       )
       setTweens(data.id, filter(tweens, done));
       return newData;
     }
     ```
- Gift graph
- Close session loop
  - Three different types of round
    1. ???
    2. ???
    3. True love (bonus points if you guess who)
- Playtest 2!!
- Host on AWS

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
