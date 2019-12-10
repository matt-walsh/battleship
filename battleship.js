"use strict;"
/*
	Project Title: Battleship
	Author(s): Matt Walsh
	Date Created: 2019-11-6
	Description: A simple version of the game battleship
*/
let readlineSync = require("readline-sync");
let fs = require("fs");

//Takes an array of lines repsenting a row
//returns a 2D array representing the battlefield
//or returns null if the input is not properly formatted
function MakeMap(inRawMap){
    let rawMapRows = inRawMap.split(`\r\n`);
    let formattedMap = [];

    for (let i = 0; i < rawMapRows.length; i++) {
        let stringRow = rawMapRows[i].split(`,`);
        let numericalRow = [];

        //Ensure each value is a number
        for (let j = 0; j < stringRow.length; j++) {
            let stringCell = parseInt(stringRow[j]);
            if(isNaN(stringCell)){
                return null;
            }
            else{
                numericalRow.push(stringCell);
            }
        }

        //Add numericalRow to the map
        formattedMap.push(numericalRow);
    }

    return formattedMap;
}

//Takes in a number of rows and columns
//returns a 2D array representing an empty battlefield
function MakeEmptyMap(rows, cols, char){
    let emptyMap = [];
    for (let i = 0; i < rows; i++) {
        emptyMap.push(new Array(cols).fill(char));    
    }

    return emptyMap;
}

//Takes in a formatted Battleship Map and prints it to the screen
function PrintMap(inFormattedMap){
    let leftPadding;
    //Determine the default left padding for the grid
    if(inFormattedMap.length > 0 && inFormattedMap.length < 9)
    {
        //1 - 9 Rows
        leftPadding = " ";
    }
    else if(inFormattedMap.length < 99){
        //10 - 99
        leftPadding = "  ";
    }
    //Print Top Grid Letters
    let coordHeading = `${leftPadding}`;
    let letterOffset = 65 //Start at letter A
    for (let i = 0; i < inFormattedMap[0].length; i++) {
        coordHeading += ` ${String.fromCharCode(letterOffset)}`;
        letterOffset++;
    }
    console.log(`${coordHeading}`);
    for (let i = 0; i < inFormattedMap.length; i++) {
        let rowNumber = i + 1;
        
        //Evenly space the grid based on the number of digits in the y axis
        if(rowNumber > 9){
            //Two digits means we must reduce the space by one
            leftPadding = " ";
        }

        let lineOutput = `${rowNumber}${leftPadding}`;
        for (let j = 0; j < inFormattedMap[i].length; j++) {
            //Write the output to the screen
            lineOutput += `${inFormattedMap[i][j]} `;
        }
        console.log(lineOutput);
    }
}

// DO NOT EDIT: The main function to house our program code 
function main()
{   
    //Const. Const never changes...
    const MAP_FILE = `D:\\Repos\\sem_1\\prog1700_mw\\prog1700_mw\\Assignments\\assignment-4\\battleship\\map.txt`;//`./map.txt`;
    const STARTING_AMMO = 30;
    
    //Controls the game loop.
    let gameRunning = true;

    //Maps of the game board
    let opponentMap = [];
    let visibleMap = [];

    let rawMap = [];

    //Load map.txt from file
    try {
        rawMap = fs.readFileSync(MAP_FILE, 'utf-8');

        //Make a valid map from the input, this will be hidden from the player
        try {
            opponentMap = MakeMap(rawMap);
            if(opponentMap.length === 0){
                gameRunning = false;
                throw "The map file is not properly formatted. Please obtain or create a valid map and try again";
            }
            
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(`Could not access map.txt. Please ensure it exists, you have read access, and then try again`);
        gameRunning = false;
    }
    //Game Loop
    while (gameRunning) {
        let ships = [
            {
                'character' : '1',
                'name' : "Destroyer",
                'health' : 2
            },
            {
                'character' : '2',
                'name' : "Cruiser",
                'health' : 3 
            },
            {
                'character' : '3',
                'name' : "Submarine",
                'health' : 3    
            },
            {
                'character' : '4',
                'name' : "Battleship",
                'health' : 4
            },
            {
                'character' : '5',
                'name': "Aircraft Carrier",
                'health' : 5 
            },
        ];

        //Create an empty map. This is what the player will see in the console, shots will also be recorded here
        visibleMap = MakeEmptyMap(opponentMap.length,opponentMap[0].length, ' ');  

        let shotsTaken = 0;
        let shotsHit = 0;
        let victory = false;

        //Display Intro
        console.log(`Let's play Battleship!`); 
        console.log(`You have ${STARTING_AMMO} missiles to fire to sink all five ships.\n`);

        for (let ammo = STARTING_AMMO; ammo > 0 ; ammo--) {
            PrintMap(visibleMap);
            console.log("");
            let shotX, shotY;
            let gettingInput = true;
            while(gettingInput){
                let target = readlineSync.question(`Choose your target (Ex. A1): `);
                let errorMessage = `The coordinates you entered, '${target}', `

                //Parse input and extract coords. Array will be length = 1 if the regex failed.
                // On a success, index = 0 will be an empty string.
                let coords = target.toUpperCase().split(/([A-Z])/);

                if(coords.length !== 1){
                    shotX = coords[1].charCodeAt(0) - 65;
                    if(shotX < opponentMap.length){
                        shotY = parseInt(coords[2]);
                        if(!isNaN(shotY) && shotY <= opponentMap.length && shotY > 0){
                            //account for array index starts at zero
                            shotY -= 1;
    
                            //Check if the coords have already been attempted
                            if(visibleMap[shotY][shotX] === 'O'){
                                errorMessage += `have already been tageted. Please try again.`;
                            }
                            else{
                                gettingInput = false;
                                break;
                            }
                        }
                        else{
                            errorMessage += `Are not valid. Please try again.`
                        }
                    }
                    else{
                        errorMessage += `Are not valid. Please try again.`
                    }
                }
                else{
                    errorMessage += `Are not valid. Please try again.`
                }

                console.log(errorMessage)
            }

            //Check if it was a hit
            if(opponentMap[shotY][shotX] > 0){
                //It was a hit!
                shotsHit++;

                //Find the ship in the ships list
                let shipHit = ships.find(ship => {
                    return parseInt(ship.character) === opponentMap[shotY][shotX];
                });

                let outputText = `Direct hit on the enemies' ${shipHit.name}, Captain!`;

                //Decrease the ships health
                shipHit.health--;

                if(shipHit.health === 0){
                    ships.splice(ships.indexOf(shipHit), 1)
                    outputText += ` She's going down!`;
                }
                else if(shipHit.health === 1){
                    outputText += ` It looks in pretty rough shape. One more hit should do it!`;
                }

                //Update the visible map
                visibleMap[shotY][shotX] = 'X';
                
                //Display message to the user
                console.log(outputText);
            }
            else {
                visibleMap[shotY][shotX] = 'O'; 
                console.log("Miss");
            }

            shotsTaken++;
            console.log(`You have ${STARTING_AMMO - shotsTaken} missiles remaining`);
            //Check if any ships remain
            if (ships.length === 0) {
                victory = true;
                break;
            }

        }

        //Handle the end of the game
        if(victory){
            console.log(`YOU SUNK MY ENTIRE FLEET!`);
            console.log(`You had ${shotsHit} of ${shotsTaken} hits, which sank all the ships`);
            console.log(`You won, congratulations!`);
        }
        else{
            console.log(`GAME OVER.`);
            console.log(`You had ${shotsHit} of ${shotsTaken} hits. but didn't sink all the ships`);
            console.log(`Better luck next time.`);
        }
        console.log()

        gameRunning = readlineSync.keyInYNStrict(`Would you like to play again? `)
    }
}

// DO NOT EDIT: Trigger our main function to launch the program
if (require.main === module)
{
    main();
}
