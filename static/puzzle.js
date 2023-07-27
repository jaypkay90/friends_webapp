document.addEventListener('DOMContentLoaded', function() {
    // Store puzzle cells and puzzle pieces in seperate lists
    const puzzle_cells = document.querySelectorAll('[id^="cell-"]');
    const puzzle_pieces = document.querySelectorAll('.puzzle-piece');
    
    // Get gameboard and stats elements
    const gameboard = document.querySelector(".puzzle-gameboard");
    const timer_element = document.getElementById("time");
    const moves_element = document.getElementById("moves");
    const points_element = document.getElementById("points");

    // Get all elements needed for the two modals, which show up at the end of the game
    const score_input = document.getElementById("scoreInput");
    const times_played_input = document.getElementById("timesPlayedInput");
    const display_badge = document.getElementById("displayBadge");
    const display_score = document.getElementById("displayScore");
    const new_highscore = document.getElementById("newHighscore");
    const badge_img = document.getElementById("BadgeImg");
    const score_img = document.getElementById("ScoreImg");

    // Set total_points and moves initially to 0
    let timer_interval;
    let total_points = 0;
    let moves = 0;

    // Define grid: We have three rows and three cols
    const rows = 3;
    const cols = 3;

    // dragged_piece: The puzzle piece, that we drag over
    // swapped_piece: The puzzle piece, that we want to swap the dragged_piece with
    let dragged_piece;
    let swapped_piece;

    function play_puzzle() {
        // At the beginning of the game: Start timer and...
        // ... add eventListeners to puzzle_pieces to apply dragging and swapping ability
        start_timer();
        puzzle_pieces.forEach(piece => {
            piece.addEventListener('dragstart', start);
            piece.addEventListener('dragover', over);
            piece.addEventListener('dragenter', enter);
            piece.addEventListener('dragleave', leave);
            piece.addEventListener('drop', drop);
            piece.addEventListener('dragend', end);
        });
    }

    function start() {
        // As soon as we click on the piece, we want to drag, set this piece as dragged_piece
        dragged_piece = this;
    }

    function over(event) {
        // Dragover event is fired continously, while the dragged element is over another element.
        // Dropping is not allowed by default. To enable dropping, event.preventDefault() must be called.
        event.preventDefault();
    }

    function enter(event) {
        // By default, when a draggable element enters a drop target area, the browser will display a "no drop" cursor 
        // to show that dropping is not allowed. We don't want that, so we have to prevent the default behaviour 
        event.preventDefault();
    }

    function leave() {
        // Dragleave event is fired every time we move the dragged element away from a drop target
        // The defaut behaviour of dragleave is "do nothing", which is exactly what we want
        // In fact, we don't need the dragleave eventListener and this function for the game to work
        // I just included it to show that all possible dragging events were considered
    }

    function drop() {
        // As soon as we drop the dragged_piece, set the piece we want to drop it on as swapped_piece
        swapped_piece = this;
    }

    function end() {
        // This function is executed after the dragged_piece was dropped (listener: 'dragend')

        // "Swapping" is only allowed with the "blank piece", wich is piece 09
        if (!swapped_piece.src.includes("puzzle-09.png")) {
            return;
        }

        // Get the cell number of the dragged and swapped piece
        let dragged_cell = dragged_piece.parentNode.id;
        let swapped_cell = swapped_piece.parentNode.id;
        let dragged_cellnr = parseInt(dragged_cell.split('-')[1]);
        let swapped_cellnr = parseInt(swapped_cell.split('-')[1]);

        // Calculate row and col of the dragged and swapped piece
        let dragged_row = Math.floor(((dragged_cellnr - 1) / rows)) + 1;
        let dragged_col = Math.floor(((dragged_cellnr - 1) % cols)) + 1;
        let swapped_row = Math.floor(((swapped_cellnr - 1) / rows)) + 1;
        let swapped_col = Math.floor(((swapped_cellnr - 1) % cols)) + 1;
        
        // Swapping the dragged_piece and the swapped_piece is only allowed, if...
        // 1. Both are in the same col AND the swapped piece is either one row above or below the dragged_piece
        let move_up = (swapped_row === dragged_row - 1) && (swapped_col === dragged_col);
        let move_down = (swapped_row === dragged_row + 1) && (swapped_col === dragged_col);
        // OR 2. Both are in the same row AND the swapped piece is in a col besides the dragged_piece
        let move_left = (swapped_col === dragged_col - 1) && (swapped_row === dragged_row);
        let move_right = (swapped_col === dragged_col + 1) && (swapped_row === dragged_row);

        // If swapping of the two pieces is allowed...
        if (move_up || move_down || move_left || move_right) {
            swap_pieces();
            update_moves();
            // Check if user won the game (solved the puzzle)
            game_won = check_order();
            if (game_won === true) {
                // Stop timer, get time, calc score and show solution picture
                clearInterval(timer_interval);
                let total_seconds = get_time();
                calc_points(total_seconds);
                show_solution_picture();

                // Wait two seconds and end the game
                setTimeout(function() {
                    end_game();
                }, 2000)
            }
        }
    }

    function swap_pieces() {
        // "Swap" the img sources of the two puzzle pieces
        let stored_img = dragged_piece.src;
        dragged_piece.src = swapped_piece.src;
        swapped_piece.src = stored_img;
    }

    function calc_points(total_seconds) {
        // User gets 50 base points for every piece in the correct position
        let base_points = 50 * puzzle_pieces.length;

        // For every move the user made to solve the puzzle, he looses 1 point
        total_points = base_points - moves;
        if (total_points < 0) {
            total_points = 0;
        }

        // If the user is able to solve the puzzle in less than 5 minutes, he gets 0.2 bonous points for every remaining second up to five minutes
        if (total_seconds < 300) {
            total_points += (300 - (total_seconds * 0.2));
        }

        total_points = Math.ceil(total_points);
        points_element.textContent = total_points;
    }

    function update_moves() {
        // After each swap: Increment moves by 1 and show value in moves_element
        moves += 1;
        moves_element.textContent = moves;
    }

    function check_order() {
        // Go through the puzzle_cells
        for (cell of puzzle_cells) {
            // Get the number of the puzzle cell and the number of the puzzle piece
            let cell_nr = parseInt(cell.id.split('-')[1]);
            let piece_element = cell.querySelector('img');
            let piece_nr = parseInt(piece_element.src.split('puzzle-0')[1].split('.png')[0]);

            // If cell and piece nr don't match, we can return immediately, because the pieces are not in the correct order
            if (cell_nr != piece_nr) {
                return false;
            }
        }

        // If we passed the loop, all pieces are in the correct order. The user solved the puzzle and wins the game
        return true;
    }

    function show_solution_picture() {
        // Delete everything on the gameboard
        while (gameboard.firstChild) {
            gameboard.removeChild(gameboard.firstChild);
        }

        // Show solution picture on the gameboard
        solution_pic = document.createElement('img');
        solution_pic.src = 'static/img/puzzle/solution.jpg';
        solution_pic.alt = 'Puzzle Solution Picture';
        solution_pic.classList.add('img-fluid');
        gameboard.appendChild(solution_pic);
        
        // Change color of the gameboard to green
        gameboard.style.borderColor = '#198754';

        // Show congratulation text below the gameboard
        congratulation_element = document.getElementById('congratulation');
        congratulation_element.textContent = "Congratulations! You solved the puzzle!";
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

    function end_game() {
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

    play_puzzle();
});