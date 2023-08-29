//board
let board;
boardWidth = Math.min(360, window.innerWidth);
boardHeight = Math.min(640, window.innerHeight);
let context;

//bird
let birdWidth = 44; //width/height ratio = 408/228 = 17/12
let birdHeight = 34;
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
let pipeInterval;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;
let gameOver = false;
let score = 0;
var gameStarted = false;
let walletConnect = false
let walletAddress = ""

let jumpSound = new Audio('flap.mp3');
let collisionSound = new Audio('flappy-bird-hit-sound.mp3');
let pointSound = new Audio('point.mp3')


window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //load images
    birdImg = new Image();
    birdImg.src = "./PEPE.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";
    start()
}
function start() {
    board = document.getElementById("board");
    var loginModal = document.getElementById("myModal");
    var NometaMask = document.getElementById("NometaMask")
    var connectButton = document.getElementById("connectButton");
    var shareButton = document.getElementById("shareButton");
    var createAccount = document.getElementById("CreateAccount");
    var DisconnectButtonProfile = document.getElementById("DisconnectButtonProfile");
    var DisconnectButtonCreate = document.getElementById("DisconnectButtonCreate");
    var DisconnectButtonLeader = document.getElementById("DisconnectButtonLeader");
    var playNow = document.getElementById("playNow");
    var playAgain = document.getElementById("playAgain");
    var gameOvers = document.getElementById("gameOver")
    var leaderButton = document.getElementById('leaderButton');
    var leaderButtonOver = document.getElementById('leaderButtonOver');
    const backProfile = document.getElementById('backProfile');
    var modal = document.getElementById("leaderboardModal");
    var profileModal = document.getElementById("profile")

    createAccount.addEventListener("click", createAcc);
    connectButton.addEventListener("click", connectWallet);
    connectButton.addEventListener("touchstart", connectWallet);
    shareButton.addEventListener("click", shareOnTwitter);
    playNow.addEventListener("click", () => {
        score = 0;
        board.style.display = 'block'
        startGame()
    });
    playAgain.addEventListener("click", () => {
        score = 0;
        board.style.display = 'block'
        startGame()
    });
    leaderButton.addEventListener("click",  ()=>{
        get_leaderBoard_data()
        displayLeaderboard()
    });
    leaderButtonOver.addEventListener("click", () => {
        topScore()
        gameOvers.style.display = 'none';
        profileModal.style.display = 'block'
    });
    backProfile.addEventListener('click', () => {
        topScore()
        modal.style.display = 'none'
        profileModal.style.display = 'block'
    })
    DisconnectButtonProfile.addEventListener("click", () => {
        location.reload()
    });
    DisconnectButtonCreate.addEventListener("click", () => {
        location.reload()
    });
    DisconnectButtonLeader.addEventListener("click", () => {
        location.reload()
    });

    if (typeof window.ethereum !== "undefined") {
        connectButton.style.display = "block"
        loginModal.style.display = 'block'

    } else {
        NometaMask.style.display = "block"
        loginModal.style.display = 'block'
        console.log("please install metamask")
    }
}
function fetchUser(walletAddress) {
    const user = document.getElementById('user');
    const userNames = document.getElementById('userName');

    user.innerHTML = ''
    userNames.innerHTML = ''
    // // Make a POST request to your backend API
    fetch(`https://qr-code-api.oasisx.world/flappy-get-user/${walletAddress}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            userNames.innerHTML = `
                <p style="margin: 0;">${data.userName}</p>
            `
            user.innerHTML = `
                <p style="margin: 0;">${data.email}</p>
                <p style="margin: 0%;">${compressAddress(data.walletAddress, 5, 4)}.</p>
            `
        })
        .catch((error) => {
            console.error('Error:', error);
        });


}
function topScore() {
    const topScore = document.getElementById('topScore');

    topScore.innerHTML = ''

    // // Make a POST request to your backend API
    fetch('https://qr-code-api.oasisx.world/flappy-get-all-user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data.scores[0].score);
            topScore.innerHTML = `
            <p style="margin: 0;"> <span style="color: rgb(57, 130, 0);">TOP SCORE #</span><span
                    style="color: #f2f2f2;"> ${data.scores[0].score} </span></p>
                <p style="margin: 0;"><span style="color: rgb(57, 130, 0);">USER</span><span style="color: #f2f2f2;"> #
                ${data.scores[0].userName}</span></p>
            `
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
function get_leaderBoard_data() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    const yourScore = document.getElementById('yourScore');
    const yourRank = document.getElementById('yourRank');
    // Clear old leaderboard data
    leaderboardBody.innerHTML = '';
    yourScore.innerHTML = '';
    yourRank.innerHTML = '';
    // // Make a POST request to your backend API
    fetch('https://qr-code-api.oasisx.world/flappy-get-all-user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data.scores);
            // Create rows for the leaderboard table using the data
            let dataRows = data.scores.map((item, index) => {
                return `
                        <p style="margin: 0; color: rgb(57, 130, 0);"><span>${index + 1}</span>#<span>${item.userName}</span></p>
                        <p style="margin: 0%; color: #f2f2f2;">${item.score}</p>
                        <hr style="margin: 15px auto 15px auto; border-color: rgb(57, 130, 0); width: 100%;">
                `
            }
            ).join('');
            leaderboardBody.innerHTML = dataRows;
            
            let score;
            let rank;
            data.scores.map((item, index) => {
                if (item.walletAddress == walletAddress) {
                    score = item.score
                    rank = index + 1
                }
            })
            yourScore.innerHTML = `
                <hr style="background: green; border: none; height: 2px;">
                <p id="yourScore"style="color: #f2f2f2; font-size: 20px;"> YOUR SCORE ${score}</p>
                <hr style="background: green; border: none; height: 2px;">
            `;
            yourRank.innerHTML = `
                <span style="color: #f2f2f2; font-size: 18px">  RANK # ${rank}</span>
                <br>
            `;
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    // Insert the new rows
}
function leaderBoard_data(scores=0) {
    const leaderboardBody = document.getElementById('leaderboardBody');
    const yourScore = document.getElementById('yourScore');
    const yourRank = document.getElementById('yourRank');
    // Clear old leaderboard data
    leaderboardBody.innerHTML = '';
    yourScore.innerHTML = '';
    yourRank.innerHTML = '';
    // // Make a POST request to your backend API
    fetch('https://qr-code-api.oasisx.world/flappy-update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: `${walletAddress}`, score: scores }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data["0"]);
            // Create rows for the leaderboard table using the data
            let dataRows = data["0"].map((item, index) => {
                return `
                        <p style="margin: 0; color: rgb(57, 130, 0);"><span>${index + 1}</span>#<span>${item.userName}</span></p>
                        <p style="margin: 0%; color: #f2f2f2;">${item.score}</p>
                        <hr style="margin: 15px auto 15px auto; border-color: rgb(57, 130, 0); width: 100%;">
                `
            }
            ).join('');
            leaderboardBody.innerHTML = dataRows;
            
            let score;
            let rank;
            data["0"].map((item, index) => {
                if (item.walletAddress == walletAddress) {
                    score = item.score
                    rank = index + 1
                }
            })
            yourScore.innerHTML = `
                <hr style="background: green; border: none; height: 2px;">
                <p id="yourScore"style="color: #f2f2f2; font-size: 20px;"> YOUR SCORE ${score}</p>
                <hr style="background: green; border: none; height: 2px;">
            `;
            yourRank.innerHTML = `
                <span style="color: #f2f2f2; font-size: 18px">  RANK # ${rank}</span>
                <br>
            `;
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    // Insert the new rows
}
function connectWallet() {
    var loginModal = document.getElementById("myModal");
    var profileModal = document.getElementById("profile")
    var createModal = document.getElementById("create");

    // Request account access
    ethereum.request({ method: "eth_requestAccounts" })
        .then(function (accounts) {

            walletAddress = accounts[0]

            // Account connected successfully
            console.log("Wallet connected:", accounts[0]);

            // Send the wallet address to the backend.
            fetch('https://qr-code-api.oasisx.world/flappy-save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: `${accounts[0]}` })
            })
                .then(response => response.json())
                .then((data) => {
                    loginModal.style.display = 'none'
                    if (data.message === "User already registered") {
                        profileModal.style.display = 'block'
                        fetchUser(accounts[0])
                        topScore()
                    } else {
                        createModal.style.display = 'block'
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        })
        .catch(function (error) {
            // Error occurred while connecting the wallet
            console.error("Wallet connection error:", error);
        });
}
function createAcc() {

    var createModal = document.getElementById("create");
    var profileModal = document.getElementById("profile")

    var name = "";
    var email = "";
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    var name = nameInput.value;
    var email = emailInput.value;

    topScore()
    if (name.length > 0) {
        // Send the wallet address to the backend.
        fetch('https://qr-code-api.oasisx.world/flappy-save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress, userName: name, email })
        })
            .then(response => response.json())
            .then((data) => {
                createModal.style.display = "none";
                profileModal.style.display = "block";
                fetchUser(walletAddress)

            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
}
function startGame() {
    var leaderboardModal = document.getElementById("leaderboardModal");
    var profileModal = document.getElementById("profile")
    var gameOvers = document.getElementById("gameOver")

    leaderboardModal.style.display = "none"
    profileModal.style.display = "none";
    gameOvers.style.display = 'none';

    // Clear previous interval if it exists
    if (pipeInterval) {
        clearInterval(pipeInterval);
    }
    // Reset the pipeArray and score
    gameStarted = false;
    gameOver = false
    
    requestAnimationFrame(update);
    pipeInterval = setInterval(placePipes, 1500); //every 1.5 seconds
 

    // document.addEventListener("keydown", moveBird);
    document.addEventListener("keydown", function(event) {
        if (event.code === "Space") {
            gameStarted = true;
        }
        moveBird(event);
    });
    document.addEventListener("touchstart", function(event) {
        gameStarted = true;
        moveBird(event);
    });
}
function update() {
    if (gameOver) {
        return;
    }
    requestAnimationFrame(update);
    if (!gameStarted) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    //bird.y += velocityY;
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
            pointSound.play()
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            collisionSound.play();
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "black";
    context.font = "45px 'Silkscreen', cursive";
    context.fillText(score, 5, 45);

    if (gameOver) {
        bird.y = birdY;
        pipeArray = [];
        velocityY = 0; // Reset the vertical velocity to zero
        velocityX = -2; //pipes moving left speed
        gravity = 0.4;    // Hide the leaderboard modal
        leaderBoard_data(score)
        topScore()
        displayLeaderboard();
        return;
    }
}
function placePipes() {
    if (gameOver) {
        return;
    }
    if(!gameStarted){
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

    if (!gameOver) {
        if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX" || e.type === "touchstart") {
            jumpSound.play();
            //jump
            velocityY = -6;
        }
    }
}
function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
        a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}
function compressAddress(address, visibleCharStart, visibleCharEnd, separator = '...') {
    return address.substring(0, visibleCharStart) + separator + address.substring(address.length - visibleCharEnd);
}
function displayLeaderboard() {
    
    var leader = document.getElementById("leaderboardModal");
    var profileModal = document.getElementById("profile");
    var gameOvers = document.getElementById("gameOver");
    board = document.getElementById("board");

    if(!gameOver){  //profile model to leader board
        profileModal.style.display = "none";
        leader.style.display = "block";
    } else if(board.style.display === "block"){ //game board to game over
        
        board.style.display = "none";
        gameOvers.style.display = 'block';
    } else {    
        profileModal.style.display = 'none';
        leader.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    // span.onclick = function () {
    //     modal.style.display = "none";
    // }

    // When the user clicks anywhere outside of the modal, close it
    // window.onclick = function(event) {
    //   if (event.target == modal) {
    //     modal.style.display = "none";
    //   }
    // }
}
function shareOnTwitter() {
twitterText = `🚀Just hit ${score} points in my addictive Flappy Bird 🐦 game. Collect 'PEPE' crypto tokens, Conquer tough obstacles, and compete for the $1500 USDC prize pool💰. 

Can you beat my score? 
Join the fun: https://pepe-flappy.netlify.app/ 🌐

🔥#FlappyBird #web3gaming`
    const twitterURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
    window.open(twitterURL, '_blank', 'width=550,height=420');
}
