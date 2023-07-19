


//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;
let gamestart = false
let walletConnect = false

window.onload = function () {
    var modal = document.getElementById("myModal");
    var myModalPlease = document.getElementById("myModalPlease");
    // Get the button element
    var connectButton = document.getElementById("connectButton");
    var startButton = document.getElementById("startButton");

    function showModal() {
        modal.style.display = "block";
    }
    // Function to hide the modal
    function hideModal() {
        modal.style.display = "none";
    }

    function showModalPlease() {
        myModalPlease.style.display = "block";
    }
    // Function to hide the modal
    function hideModalPlease() {
        myModalPlease.style.display = "none";
    }

    function startGame() {
        // Rest of your game initialization code...
        document.getElementById("startButtonContainer").style.display = "none";
        requestAnimationFrame(update);
        setInterval(placePipes, 1500); //every 1.5 seconds
        document.addEventListener("keydown", moveBird);
        document.addEventListener("touchstart", moveBird);
    }
    function connectWallet() {
        // Request account access
        ethereum.request({ method: "eth_requestAccounts" })
            .then(function (accounts) {
                // Account connected successfully
                console.log("Wallet connected:", accounts[0]);

                // Send the wallet address to the backend
                fetch('https://qr-code-api.oasisx.world/flappy-save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ walletAddress: "0x987" })
                })
                .then(response => response.json())
                .then(data => console.log(data))
                .catch((error) => {
                        console.error('Error:', error);
                });

                hideModal(); // Hide the modal after successful connection
                startButton.addEventListener("click", startGame);
                startButton.addEventListener("touchstart", startGame);
                // startGame()
            })
            .catch(function (error) {
                // Error occurred while connecting the wallet
                console.error("Wallet connection error:", error);
            });

    }


    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // startButton.addEventListener("click", startGame);
    // startButton.addEventListener("touchstart", startGame);
    if (typeof window.ethereum !== "undefined") {
        if (ethereum.selectedAddress !== null) {
            // startGame()
            startButton.addEventListener("click", startGame);
            startButton.addEventListener("touchstart", startGame);
        } else {
            showModal()
            connectButton.addEventListener("click", connectWallet);
            startButton.addEventListener("touchstart", connectWallet);
        }
    } else {
        showModalPlease()
        console.log("please install metamask")
    }
}

function update() {

    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);


    if (gameOver) {
        
        // // Make a POST request to your backend API
        // fetch('https://qr-code-api.oasisx.world/TwinCyclops', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ score: score }),
        // })
        // .then(response => response.json())
        // .then(data => {
        //     console.log('Success:', data);
        // })
        // .catch((error) => {
        //     console.error('Error:', error);
        // });
        
        displayLeaderboard();
        return;
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX" || e.type === "touchstart") {
        //jump
        velocityY = -6;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
        a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}



function displayLeaderboard() {
    const leaderboardContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Leaderboard</title>
            <link rel="stylesheet" href="flappybird.css">
            <script src="flappybird.js"></script>
        </head>
        <body>
            <div id="leaderboard">
                <h2>Leaderboard</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Populate leaderboard data dynamically -->
                        <tr>
                            <td>1</td>
                            <td>John</td>
                            <td>100</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>Jane</td>
                            <td>90</td>
                        </tr>
                        <!-- ... -->
                    </tbody>
                </table>
                <button id="restartButton">Restart Game</button>
            </div>
            <script>
                const restartButton = document.getElementById("restartButton");
                restartButton.addEventListener("click", restartGame);
                
                function restartGame() {
                    window.opener.restartGame();
                    window.close();
                }
            </script>
        </body>
        </html>
    `;

    // Open a new pop-up window
    const leaderboardWindow = window.open("", "Leaderboard", "width=400,height=500");
    leaderboardWindow.document.write(leaderboardContent);
    leaderboardWindow.document.close();
}

