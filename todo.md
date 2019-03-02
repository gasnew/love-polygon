# Love Polygon--TODO

## Roadmap
+ Draggable tokens
+ Landing page
  + Session ids
  + Create or join session
  + Name selection
- Server provides nodes
  - This happens once every player drops token center-screen
- Node transfers
  - Stress test this by causing two clients to "fight" for the same token
- Server provides goals/relationships with nodes
- Button to cause round-ending timer when need is met
- Playtest 1! (Voting will be done on paper)
- Voting
  - Possibly placing hearts in nodes?
  - At this point, take points by hand to try out a couple schemes:)
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
- Multiple players of the same name can be created if both validate successfully and then join socket. I.e., no socket validation
  -  Solution: Force disconnect in this case (relies on top feature to fit in

## Features to fit in
- When the client disconnects, return to the landing page with session info pre-entered
