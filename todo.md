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
+ Usability
  + iPhones don’t work:(
    + Maybe they do! Check with Molly and Isaac if we have time:)
    + Can probably implement custom target hit detection to fix
    + They actually work! Had to update react-dnd-touch-backend
  + Automatically switch between touch backend and multibackend
  + Create only one redis connection per server
  + Improve experience getting into a session
    + Put session ID in URL--this can be used as link to lobby
    + Improve landing page
      + Two buttons: "Create session" and "Join session"
    + Delete nameless player (and nodes and token) who disconnects
    + Move setting name to in the lobby
      + Setting and editing name happens here (so people can change their names
        when starting a new set of rounds)
      + Only people whose hearts are in the jar are included in the round.
        Everyone else gets to sit in the lobby
    + Store username and ID in sessionStorage for dropping back into session
  x Catch error and refresh?
  + Make scrolling a non-issue
    + There is no way to scroll to put relevant information off-screen
    + Verify this works on iPhones (even with the weird elastic end-of-page
      scroll behavior)
    + Only lock scrolling on some screens
+ Final screen pt. 2
  + Lead person can initiate next round
  + Points accumulate
  + Ties are indicated properly (two tie at top => both 2nd place)
  + At end of third round, button links to lobby page
+ True love!!
  + Bonus points (+5?) in final round if you can guess the only pair of players
    who had a crush on each other
  + This probably occurs after voting once all the information is out there
  + lock-in
+ Milestone 2 complete!!
+ Playtest a bit more
/ Improve lobby screen
  - See list of players in the lobby and their statuses
  - Name character limit is imposed for styling reasons
  - Names must be unique
  + Name input field appears in dialog and is focused on page load (if name is
    empty). It can be opened again
  - Jar of hearts (with players' names!)
    - This is sorted so you can see who entered first
    - If leader leaves, next up becomes leader
  - New start button that shows how many players are in the game and what roles
    will be filled
  - Players have unique colors (preselected 6)
- Top info and navigation bar for all phases
  - "Main Menu"
  - Player name
  - Phase name and round number
  - Session ID
  - Share and copy buttons
  - See mockups
- Improve romance screen
  - Arc of plates
  - Joint plates are colored accordingly
  - Better header for crush
  - Better needs indicator
  - Better "end round" button
- Practice mode
  - Can trade all you want but cannot end round
  - Party leader can move it back to lobby to start a real round
  - Lots of cool tutorial info
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
    - Create/Join session
      - Heart dropping onto white background
      - Wipes away when loaded
    - Start round
      - Cookie, cake, then candy drop onto screen, background different color
        for each impact
      - "You have a crush on {name}" or "You are {name}'s wingman"
      - One item gets outline with text of the same color that reads, "{name}
        needs three {items}s"
      - Then in a split below, "You need three {items} to end the round"
  - Heart/Broken heart/tissue box stamp for guessing crushes correctly?
  - Use ExpansionPanel for VotingBallot
  - Backdrop for connection problems
  - Shared plates are colored according to their players and form the shape of
    an arc
  - Players can select avatars
  - Make sure note-taker is noticeable
  - Descriptions for points in table
- More gameplay upgrades
  - Ask the voter whether the note-taker's selections are correct
  - Include "pick"ing, which will prevent a player from stealing an item from
    another player's hand
  - Allow player to hop back into active session (on top header bar?) even from
    the landing page
  - Allow player to hop in for another player in a session
    - Perhaps this is a dialog that opens if you join a session that has at
      least one inactive player? It gives you the player name and the option to
      accept or be a new player
  - Prevent generating sessions by navigating to session page?
    - Route back to landing page with alert about the session not existing
- Milestone 3!!
- Playtest, playtest, playtest!
- Sound effects!
  - pick up
  - drop
  - round ending timer
  - celebrate
- Figure out how to actually calculate probabilities, e.g., "How many crushes
  should there be such that guessing nobody isn't the best strategy."
- Pre-results screen
  - Shows points being added to previous total
  - Shows how placements changed
  - Crowns victor on final round
  - Transitions to results screen
- Fix all or virtually all bugs
- Host on the cloud for all to see
  - AWS CDK?
  - Configure app environment (i.e., redis URL)
  - Dockerize the server and client
- Make actual landing page
  - Look at Google Keep notes for stuff on donations and game description
  - Include description of what it looks like to play the game, e.g., "Players
    are encouraged to say aloud their needs in an attempt to draw out any
    lovers."
- Open-source the project

## Pipe dreams
- Technical refactors
  - Use socket.io-redis to support multiple hosts on one Redis cluster?
  - Use something other than socket.io for pubsub?
- Compose music for the lobby
+ Close session loop?
  + Three different types of round
    1. Normal
    2. Normal
    3. True love (bonus points if you guess who)

## Known bugs
- Non-participating players' tokens may be deleted during normal play...
- Session exists after it's over
  - Set session to expire after all users disconnect?
  - Alternatively, user action sets 5-minute expiration for session
- Relationship generation can fail
- Timers (used for countdown and timing before voting) can be broken by restarting the server
  - Maybe solve with redis delayed task?
    https://redislabs.com/ebook/part-2-core-concepts/chapter-6-application-components-in-redis/6-4-task-queues/6-4-2-delayed-tasks/
- This one
      events.js:170
        throw er; // Unhandled 'error' event
        ^

  Error: read ECONNRESET
      at TCP.onStreamRead (internal/stream_base_commons.js:167:27)
  Emitted 'error' event at:
      at emitErrorNT (internal/streams/destroy.js:91:8)
      at emitErrorAndCloseNT (internal/streams/destroy.js:59:3)
      at processTicksAndRejections (internal/process/task_queues.js:81:17)
- After switching to fullscreen, I will receive state updates, even for moves I make
- What happens on the frontend when I delete a nameless player?
  - May have fixed this...
/ Players can have the same name
/ Players can transfer tokens from another player's storage node
  / Either, current token should be set to null (maybe not great)
  / Or, transfers to another player can only occur from shared nodes
+ Websocket connection is often flaky (could this be the Chrome same-host connection limit?)
  + Not a problem in practice
+ Use same player ID even for different sessions (could cause some user-facing issue)
+ Someone can be a wingman for a person who has a crush on them
+ Too many dispatches when setting and updating state--make an option to only
  dispatch once

## Playtest notes
Progress is indicated in terms of where I am regarding making these actual items.
* -: needs to be triaged or clarified
* /: considering or may already be addressed
* x: rejected
* +: folded into an above milestone (though maybe not completed yet)

### 1/24/20
/ images_urls type error
  / fixed?
+ switching party leaders is fun
  + Maybe we want to randomly assign the note-taker? Nah:)
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
+ actually show graph of relationships
+ better describe game
+ multiple rounds with cumulative points

### 2/8/20
+ talk to each other to play
+ bottom row is own plates
+ enter to join session
/ getting needs is too fast (four storage plates? four types of food? flowers, ice cream, teddy bear)
  + We're trying out four-of-a-kind
  - "Maximize scarcity => maximize communication, but keep enough luck/input
    randomness such that the game isn't too pure."
+ indicate note-taker
x lose points for not meeting crush’s needs
  x There is already a cost to not meeting crush's needs
+ pick an avatar
- Some role ideas (not sure if scope creep?)
  - throw away to trade? (role for that?)
  - trickster—nobody has crush on them (get as many people to guess them as possible)
- cooldown before can end game
  - Possibly. I'm still not sure whether it's bad someone can end the game immediately
+ final round—bonus points if mutual attraction
+ restrict name length

### 2/28/19
+ error message if drop in jar when no name -- won't be able to do this
- guessed wrong should not be red -- not sure about this? need to rethink that
  page someday
+ tendency to start tinkering before listening?
  + practice mode should solve this
- make it clearer when it is YOUR turn to vote
- indicate how many rounds in lobby and in top bar
- confirmation for starting next round
- partial score for partial guess (% of people you got right? 50% or more?)
  - I'm thinking we shouldn't do this--rather, solve the root problem, and
    limit max players to 6
- a lot going on
- loading my dudes loop?
  - not sure what causes this
- not clear people giving me things
  - should be solved by practice mode and colored plates
- indicate how many players guessed true love
- can’t scroll in true love (maybe fix button to bottom of screen?)
+ true love is a sham
- final table is a lot of info
