# BattleShip Pseudocode

```
Load map.txt into 2D array (opponentMap)
    rows = array 1
    columns = array 2

create empty 2D array
    same layout as opponentMap, but all cells are blank (visibleMap)
    set starting ammo to 30
Loop while Playing is true
{
    Display visibleMap to the player
    prompt for coords
        validate input
        parse the input to extract row and column values
    decrease ammo count
    if ship was hit
        determine which ship was hit
        Inform player of the hit
        update visibleMap at coords with 'X'
    if ship was missed
        update visibleMap at coords with 'O'
        Inform player of the miss
    
    if there are no more ships remaining
        set playing to false
        set gameResult to success
    
    if there is no more ammo, and no more ships
        set playing to false
        set gameResult to failure      
}


if gameResult is success
    output success message to user
if gameResults is failure
    output failure message        
```