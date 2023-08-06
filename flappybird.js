//board
let board;
let boardWidth = 360;
let boardHeight = 640;
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
let gamestart = false
let walletConnect = false
let walletAddress = ""


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
    var loginModal = document.getElementById("myModal");
    var NometaMask = document.getElementById("NometaMask")
    var connectButton = document.getElementById("connectButton");

    if (typeof window.ethereum !== "undefined") {
        connectButton.style.display = "block"
        loginModal.style.display = 'block'
        connectButton.addEventListener("click", connectWallet);
        connectButton.addEventListener("touchstart", connectWallet);

    } else {
        NometaMask.style.display = "block"
        loginModal.style.display = 'block'
        console.log("please install metamask")
    }
}
function disconnect(){
    var disconnect = document.getElementById("DisconnectButton")
    disconnect.addEventListener("click", ()=>{
        location.reload()
    });
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

function topScore(){
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
function connectWallet() {
    var loginModal = document.getElementById("myModal");
    var profileModal = document.getElementById("profile")
    var playNow = document.getElementById("playNow")
    var createModal = document.getElementById("create");
    var createAccount = document.getElementById("CreateAccount")
    var leaderButton = document.getElementById('leaderButton')

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
                        disconnect()
                        playNow.addEventListener("click", startGame);
                        leaderButton.addEventListener("click", gameover);

                    } else {
                        createModal.style.display = 'block'
                        createAccount.addEventListener("click", createAcc);
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
    var name = "";
    var email = "";
    // Get the input field values
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    var createModal = document.getElementById("create");
    var profileModal = document.getElementById("profile")
    var playNow = document.getElementById("playNow")

    var name = nameInput.value;
    var email = emailInput.value;

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
                playNow.addEventListener("click", startGame);

            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
}
function startGame() {
    var leaderboardModal = document.getElementById("leaderboardModal");
    var profileModal = document.getElementById("profile")
    var playNow = document.getElementById("playNow");
    var leaderButton = document.getElementById('leaderButton')



    leaderboardModal.style.display = "none"
    profileModal.style.display = "none";


    // Clear previous interval if it exists
    if (pipeInterval) {
        clearInterval(pipeInterval);
    }
    // Reset the pipeArray and score
    gameOver = false

    requestAnimationFrame(update);
    pipeInterval = setInterval(placePipes, 1500); //every 1.5 seconds

    document.addEventListener("keydown", moveBird);
    document.addEventListener("touchstart", moveBird);
    playNow.addEventListener("click", startGame);
    leaderButton.addEventListener("click", gameover);

}
function update() {

    if (gameOver) {
        return;
    }
    requestAnimationFrame(update);

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
    context.fillStyle = "black";
    context.font = "45px 'Silkscreen', cursive";
    context.fillText(score, 5, 45);

    if (gameOver) {
        bird.y = birdY;
        pipeArray = [];
        velocityY = 0; // Reset the vertical velocity to zero
        velocityX = -2; //pipes moving left speed
        gravity = 0.4;    // Hide the leaderboard modal
        gameover()
        return;
    }
}
function gameover() {

    // // Make a POST request to your backend API
    fetch('https://qr-code-api.oasisx.world/flappy-update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: `${walletAddress}`, score: score }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data["0"]);
            topScore()
            displayLeaderboard(data["0"]);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
function resetGame() {
    gameOver = false;
    var modal = document.getElementById("leaderboardModal");
    modal.style.display = 'none';

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

    if (!gameOver) {
        if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX" || e.type === "touchstart") {
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
function displayLeaderboard(data) {
    
    score = 0;
    const leaderboardBody = document.getElementById('leaderboardBody');
    var modal = document.getElementById("leaderboardModal");
    const backProfile = document.getElementById('backProfile')
    var profileModal = document.getElementById("profile")



    // Clear old leaderboard data
    leaderboardBody.innerHTML = '';

    // Create rows for the leaderboard table using the data
    let dataRows = data.map((item, index) => {


        return `
        <p style="margin: 0; color: rgb(57, 130, 0);"><span>${index + 1}</span>#<span>${item.userName}</span></p>
        <p style="margin: 0%; color: #f2f2f2;">${item.score}</p>
        <hr style="margin: 15px auto 15px auto; border-color: rgb(57, 130, 0); width: 100%;">
        `
    }
    ).join('');
    // Insert the new rows
    leaderboardBody.innerHTML = dataRows;


    profileModal.style.display = "none";
    modal.style.display = "block";

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


    backProfile.addEventListener('click', () => {
        modal.style.display = 'none'
        profileModal.style.display = 'block'
    })
}
