document.addEventListener('DOMContentLoaded', function() {

    // Get all elements needed to play memory game
    const cards = document.querySelectorAll(".mem-card");
    const timer_element = document.getElementById("time");
    const moves_element = document.getElementById("moves");
    const points_element = document.getElementById("points");
    const score_input = document.getElementById("scoreInput");
    const times_played_input = document.getElementById("timesPlayedInput");
    const display_badge = document.getElementById("displayBadge");
    const display_score = document.getElementById("displayScore");
    const new_highscore = document.getElementById("newHighscore");
    const badge_img = document.getElementById("BadgeImg");
    const score_img = document.getElementById("ScoreImg");

    // User is allowed to turn over only two cards at once, named first_turned and second_turned
    // At the start of the game, these variables point to null
    let first_turned = null;
    let second_turned = null;

    // At the start of the game, gameboard is unlocked, meaning: The user is able to turn over every card
    let lock_gameboard = false;
    let timer_interval;
    let total_points = 0;
    let moves = 0;
    let total_matches = 0;

    function memory_main() {
        // At the beginning of the game: Start timer and add click listener to every card
        start_timer();
        cards.forEach(card => {
            card.addEventListener("click", turn_card);
        });			  
    }

    function turn_card(event) {
        // Set current_card to card that the user clicked on
        let current_card = event.target

        // If gameboard is locked (two cards were clicked and match is currently being checked), disable turnover of all other cards by returning
        // OR If user clicks on the first card (the one he already turned over) --> disable turnover of that card by returning
        if (lock_gameboard === true || current_card === first_turned) {
            return;
        }

        // Update moves
        moves++;
        moves_element.innerHTML = moves;

        // Turn card faceup
        current_card.src = `/static/img/memory/${current_card.dataset.front}`;

        // If player turns over the first card (first click)...
        if (first_turned === null) {
            first_turned = current_card;
            
            // Player can't turn over first and second card at the same time.
            // Meaning: We don't need an else block here. We can return immediately
            return
        }

        // If player turned over the second card
        // Diasble turnover of all other cards (lock the gameboard), set current card as second card and check_match
        lock_gameboard = true;
        second_turned = current_card;
        check_match();
    }

    function check_match() {
        // If match...
        if (first_turned.dataset.front === second_turned.dataset.front) {

            // Remove EventListeners from the two cards that matched
            first_turned.removeEventListener("click", turn_card);
            second_turned.removeEventListener("click", turn_card);

            // Stop timer
            clearInterval(timer_interval);

            // Update total_matches
            total_matches++;

            // Indicate match by coloring card borders green
            first_turned.classList.remove("border-dark");
            first_turned.classList.add("border-success", "border-3");
            second_turned.classList.remove("border-dark");
            second_turned.classList.add("border-success", "border-3");

            // Get time and calculate points
            let total_seconds = get_time();
            calc_points(total_seconds);

            setTimeout(function() { // Wait 2 seconds and...
                //Reset cards
                first_turned.classList.remove("border-success", "border-3");
                first_turned.classList.add("border-dark");
                second_turned.classList.remove("border-success", "border-3");
                second_turned.classList.add("border-dark");

                // If all matches found, end game
                if (total_matches === cards.length / 2) {
                    end_game();
                    return
                }
                
                // Reset gameboard, moves and timer
                reset_gameboard();
                reset_moves_and_timer();
                start_timer();
            }, 2000); 
        }

        // If no match, wait 2 seconds, flip cards facedown and enable turnover of new cards 
        else {
            setTimeout(function() {			
                first_turned.src = `/static/img/memory/back.png`;
                second_turned.src = `/static/img/memory/back.png`;
                reset_gameboard();
            }, 2000);
        }
    }

    function reset_gameboard() {
        first_turned = null;
        second_turned = null;
        lock_gameboard = false;
    }

    function get_time() {
        // Get the timer value
        let timer_value = timer_element.innerHTML;

        // Split the timer value into minutes and seconds
        let [minutes, seconds] = timer_value.split(":");

        // Convert minutes and seconds to integers
        minutes = parseInt(minutes);
        seconds = parseInt(seconds);

        // Convert time to seconds
        let total_seconds = minutes * 60 + seconds;

        return total_seconds
    }

    function calc_points(total_seconds) {
        // CALCULATE POINTS FOR CURRENT MATCH
        // User gets 50 Base Points for every match
        let points = 50;

        // The perfect scenario is to use only two moves to make a match
        // If the user has to make more than two moves, the remaining moves are subtracted from the base points
        if (moves > 2) {
            points -= (moves - 2);
        }
        
        // If total time it took to make the match is less than 60 seconds, user gets the remaining time left to 60 seconds as bonus points
        if (total_seconds < 60) {
            points += (60 - total_seconds);
        }

        // UPDATE TOTAL POINTS
        total_points += points;
        points_element.innerHTML = total_points;
    }

    function start_timer() {
        let minutes = 0;
        let seconds = 0;
        
        // Call function to update timer every second
        timer_interval = setInterval(updateTimer, 1000);
        
        function updateTimer() {
            seconds++;
            if (seconds >= 60) {
                seconds = 0;
                minutes++;
            }
            
            // Format time to display on screen and display in timer_element
            let formattedTime = formatTime(minutes, seconds);
            timer_element.innerHTML = formattedTime;
        }
        
        function formatTime(minutes, seconds) {
            // If minutes and/or seconds < 10, put a '0' in front of the digit
            let formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
            let formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
            return formattedMinutes + ':' + formattedSeconds;
        }
    }

    function reset_moves_and_timer() {
        moves = 0;
        moves_element.innerHTML = moves;
        timer_element.innerHTML = "00:00";
    }
    
    function end_game() {
        reset_moves_and_timer();

        // Fill Badge Modal with content
        calc_badge();
        
        // Fill Result Modal with content
        // Evaluate user score
        evaluate_score();
        // Put user score and times_played in form value fields for submission
        score_input.value = total_points;
        times_played_input.value = times_played;

        // Load Badge Modal
        load_modal("BadgeModal");
    }

    function calc_badge() {
        // Increase times_played by one
        times_played += 1;

        // Play 2 times to win bronze medal, 5 times to win silver medal and 10 times to win gold medal
        if (times_played <= 2) {
            badge_img.src = `/static/img/bronze_medal.png`;
            if (times_played < 2) {
                display_badge.textContent = `Play one more time to win the Bronze medal!`;
            }
            else {
                display_badge.textContent = `Congratulations! You win the Bronze medal!`;
            }				
        }

        else if (times_played <= 5) {
            badge_img.src = `/static/img/silver_medal.png`;
            if (times_played < 5) {
                if ((5 - times_played) != 1) {
                    display_badge.textContent = `Play ${5 - times_played} more times to win the Silver medal!`;
                } 
                else {
                    display_badge.textContent = `Play one more time to win the Silver medal!`;
                }
            }
            else {
                display_badge.textContent = `Congratulations! You win the Silver medal!`;
            }				
        }

        else if (times_played <= 10) {
            badge_img.src = `/static/img/gold_medal.png`;
            if (times_played < 10) {
                if ((10 - times_played) != 1) {
                    display_badge.textContent = `Play ${10 - times_played} more times to win the Gold medal!`;
                }
                else {
                    display_badge.textContent = `Play one more time to win the Gold medal!`;
                }
            }
            else {
                display_badge.textContent = `Congratulations! You win the Gold medal!`;
            }
        }

        // If user played more than 10 times and therefor already owns all medals...
        else {
            badge_img.src = `/static/img/gold_medal.png`;
            display_badge.textContent = `You already won all badges! Keep playing to improve your Highscore!`;
        }
    }

    function evaluate_score() {
        // If no new highscore...
        if (total_points <= highscore) {
            score_img.src = `/static/img/score.png`;
            display_score.textContent = `You scored ${total_points} points!`;
        }

        // If new highscore...
        else {
            new_highscore.classList.add("pt-3");
            new_highscore.textContent = `New Highscore!`;
            score_img.src = `/static/img/highscore.png`;
            display_score.textContent = `You scored ${total_points} points!`;
        }
    }

    function load_modal(elementId) {
        // Pop up window for mini games
        // Pop up Modal shows either the user's score or his current badge.
        // The user's score is submitted via Post to the server when the user closes the score modal
        const body = document.querySelector("body");
        const current_modal = document.getElementById(elementId);
        const close_button = current_modal.querySelector(`#${elementId} .close-button`);
        const page_overlay = document.querySelector(".page-overlay");

        function show_modal() {
            // Show modal and page-overlay. Disable Scrolling
            current_modal.style.display = "block";
            page_overlay.style.display = "block";
            body.classList.add("no-scrolling");

            // Remove aria-hidden attribute to make modal visible for assistive technologies like sreen readers
            current_modal.removeAttribute("aria-hidden");

            // Add EventListener to Close Button
            close_button.addEventListener("click", close_modal);
        }

        function close_modal() {
            current_modal.style.display = "none";

            // If the current Modal is the Badge Modal, wait 500ms and show the Result Modal next
            if (elementId === "BadgeModal") {
                setTimeout(function() {
                    load_modal("ResultModal");
                }, 500);
            }
        }

        show_modal();
    }

    memory_main();

});