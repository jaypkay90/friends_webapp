document.addEventListener('DOMContentLoaded', function() {

	function main() {
		const doc_title = document.title;
		// If Placeholder for QuizModal is on the page
		if (document.getElementById("QuizModal")) {
			// Load JS code for Quiz Modal
			load_quiz_modal();
		}
		if (doc_title === "Quiz - Friends Forever") {
			play_quiz();
		}
		if (doc_title === "Memory - Friends Forever") {
			play_memory();
		}
		if (doc_title === "Leaderboard - Friends Forever") {
			initialise_leaderboard();
		}
	}

	function load_quiz_modal() {
		// Quiz Modal Pop up window
		// Pop up window is only shown once per browser every 24 hours
		const body = document.querySelector("body");
		const quiz_modal = document.getElementById("QuizModal");
		const page_overlay = document.querySelector(".page-overlay");
		const quiz_modalBtns = document.querySelectorAll(".quiz_modalBtn");
		const quiz_modal_shown_last = localStorage.getItem('quiz_modal_shown_last');

		function qmodal_main() {
			// If time stamp flag exists in local storage
			if (quiz_modal_shown_last) {
				// Get current time
				const curr_time = new Date().getTime();
				// If modal was not shown during the last 24 hours (time difference greater than 24 hours), show it
				if (curr_time - parseInt(quiz_modal_shown_last) > 24 * 60 * 60 * 1000) {
					show_modal();
				}
			}
			// If time stamp flag does not yet exist, show modal
			else {
				show_modal();
			}
		}

		function close_modal() {
			// "Delete" modal and page-overlay. Enable scrolling on page body
			quiz_modal.style.display = "none";
			page_overlay.style.display = "none";
			body.classList.remove("no-scrolling");
		}

		function show_modal() {
			setTimeout(function() {
				// Set Time Stamp Flag in local storage.
				// Convert int to string, because local storage in some browsers can only store strings.
				localStorage.setItem('quiz_modal_shown_last', new Date().getTime().toString());
				// Show modal and page-overlay. Disable Scrolling
				quiz_modal.style.display = "block";
				page_overlay.style.display = "block";
				body.classList.add("no-scrolling");
				// remove aria-hidden attribute to make it visible for assistive technologies like sreen readers
				quiz_modal.removeAttribute("aria-hidden");
			}, 6000); // 6 seconds delay)

			// Add EventListener to each button on the modal
			quiz_modalBtns.forEach(button => {
				button.addEventListener("click", close_modal);
			});
		}

		qmodal_main();
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

	function play_quiz() {
		// Code for Quiz.html
		// Get all elements needed for code
		const quiz_img = document.getElementById('quiz-img');
		const question = document.getElementById('question');
		const question_border = document.getElementById('question-border');
		const nextBtn = document.getElementById('next');
		const answerElements = document.getElementById('answers');
		const solutionElement = document.getElementById('solution');
		const registerBtn = document.getElementById('registerBtn');

		// Store questions.length in variable, so the computer doesn't have to waste time calculating this multiple times
		const questions_length = questions.length;
		// answer buttons are stored in an array. qnr: questionnumber
		let answerBtns = [];
		let qnr;
		let score;

		function q_main() {
			// User goes through the quiz by clicking on the next button.
			// Add clickEventListener to next button
			nextBtn.addEventListener('click', function() {
				// When nextBtn is clicked, disable it, until the user selected an answer
				nextBtn.disabled = true;
				if (nextBtn.innerHTML === "Start Quiz") {
					startQ();
				}
				else if (nextBtn.innerHTML === "Next question") {
					qnr++;
					display_nextQ();
				}
				else if (nextBtn.innerHTML === "Play again") {
					startQ();
				}
				// If nextBtn.innerHTML === "Show result"
				else {
					remove_solution();
					display_result();
				}
			});
		}

		function startQ() {
			// Start Quiz function
			// Reset score and questionnumber
			qnr = 0;
			score = 0;
			// Make quiz_img + registerBtn invisible and question block visible
			quiz_img.style.display = "none";
			registerBtn.style.display = "none";
			question_border.classList.add("border-bottom", "border-secondary", "margin-bottom-20", "quizQ");
			question.classList.remove("pb-1");
			question.classList.add("pb-2");
			// Fill question element with first question
			question.innerHTML = `<b>${qnr + 1}/${questions_length}</b> ${questions[qnr].question}`;
			// Empty solution element, append answerBtns and add clickEventListener to answerBtns
			solutionElement.innerHTML = "";
			answers.classList.add("gap-3");
			append_answerBtns();
			answerBtns_clickEvent();
		}

		function display_nextQ() {
			// Function to display the next question
			// Enable answerBtns and make them grey again. Remove solution to last question
			reset_answerBtns();
			remove_solution();
			// Fill question Element with current questionnumber and current question
			question.innerHTML = `<b>${qnr + 1}/${questions_length}</b> ${questions[qnr].question}`;
			// Fill answerBtns with answers to current question
			answerBtns.forEach((button, i) => {
				button.innerHTML = questions[qnr].answers[i];
			});
			// If current question is the last question, change text of next button to "Show result"
			if (qnr === questions_length - 1) {
				nextBtn.innerHTML = "Show result";
			}
		}

		function answerBtns_clickEvent() {
			// Listen for clickEvents on answer buttons
			answerBtns.forEach(button => {
				button.addEventListener('click', function() {
					// If an answer button was clicked, disable it until user goes to next Question by clicking next button
					disable_answerBtns();
					nextBtn.disabled = false;
					// If user selected correct answer, make button green and update score
					if (button.innerHTML === questions[qnr].correct) {
						button.classList.add("bg-success");
						score++;
					}
					// If user selected wrong answer, make button red and make button with correct answer green
					else {
						button.classList.add("bg-danger");
						// Go through answer buttons until correct answer found and change color of this button to green
						for (let j = 0; j < answerBtns.length; j++) {
							if (answerBtns[j].innerHTML === questions[qnr].correct) {
								answerBtns[j].classList.add("bg-success");
								break;
							}
						}
					}
					show_solution();
				});
			});
		}

		function show_solution() {
			// Show solution to current question
			solutionElement.innerHTML = questions[qnr].solution;
			solutionElement.classList.add("mt-3");
		}

		function remove_solution() {
			// Remove solution from last question
			solutionElement.innerHTML = "";
			solutionElement.classList.remove("mt-3");
		}

		function append_answerBtns() {
			// Function to append answer buttons to the answers block
			answers.innerHTML = "";
			// Append an answer button to HTML doc for every possible answer
			questions[0].answers.forEach(answer => {
				const answerBtn = document.createElement("button");
				answerBtn.innerHTML = answer;
				answerBtn.classList.add("btn", "btn-secondary");
				answerElements.appendChild(answerBtn);
				// Append button to answerBtns array
				answerBtns.push(answerBtn);
			});
			// Change Text of nextBtn
			nextBtn.innerHTML = "Next question";
		}

		function reset_answerBtns() {
			// Enable every answer button and make them all grey again
			answerBtns.forEach(button => {
				button.classList.remove("bg-success");
				button.classList.remove("bg-danger");
				button.disabled = false;
			});
		}

		function disable_answerBtns() {
			// Disable all answer buttons
			answerBtns.forEach(button => {
				button.disabled = true;
			});
		}

		function display_result() {
			// Remove answer buttons from HTML doc and from answerBtns array
			answerBtns.forEach(button => {
				button.parentNode.removeChild(button);
			});
			answerBtns = [];
			// Make question block invisible
			question_border.classList.remove("border-bottom", "border-secondary", "margin-bottom-20", "quizQ");
			question.classList.remove("pb-2");
			question.classList.add("pb-1");
			question.innerHTML = "";
			// Update nextBtn and make quiz_img visible again
			nextBtn.disabled = false;
			nextBtn.innerHTML = "Play again";
			quiz_img.style.display = "block";
			// Show register button
			registerBtn.style.display = "inline-block";
			// Display score in answer-block and score evaluation in solution-block
			answers.classList.remove("gap-3");
			answers.innerHTML = `
				<h4 class="friends-font text-center text-success">
					You scored ${score} out of ${questions_length} points!
				<h4>
				`;
			solutionElement.innerHTML = evaluate_score();
		}

		function evaluate_score() {
			// Evaluate user score
			// To make code more flexible, I didn't hardcode the points
			// If more questions are added to the questions array, the code will still work
			let score_evaluation;
			if (score < 2/5 * questions_length) {
				score_evaluation = `Looks like you're pretty new to the Friends universe!
									You might not have scored high this time, but don't give up.
									Friends has a lot of memorable moments waiting for you to be explored.`;
			}
			else if (score > 1/5 * questions_length && score < 4/5 * questions_length) {
				score_evaluation = `Not that bad! You have a good knowledge of Friends, but there's still a lot
									for you to learn. Keep watching and exploring the show to boost your score.`;
			}
			else if (score >= 4/5 * questions_length && score < questions_length) {
				score_evaluation = `Impressive! Your score shows that you're an avid viewer of Friends.
									You've definitely paid attention to the details and you've proven yourself
									as a dedicated fan.`;
			}
			// If user scored max...
			else {
				score_evaluation = `Amazing job! You've nailed every question. Your perfect score shows an incredible
									level of familiarity with the show. You're absolutely in the league
									of the ultimate Friends fans!`;
			}
			return score_evaluation;
		}

		q_main();
	}

	function play_memory() {
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

		function mem_main() {
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
			/*if (current_card.src.endsWith('/static/img/memory/back.png')) {
				current_card.src = `/static/img/memory/${current_card.dataset.front}`;
			}
			// If card is currently faceup, turn facedown
			else {
				current_card.src = `/static/img/memory/back.png`;
			}*/

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

		mem_main();
	}

	function initialise_leaderboard() {
		const table = new DataTable('#leaderboard', {
			searching: false,
			pagingType: 'simple_numbers',
			//Order by "Score" in desc order by default
			order: [[2, 'desc']],
			// If element has class "disable-sorting", disable sorting
			columnDefs: [
				{ targets: 'disable-sorting', orderable: false, }
			],
			columns: [
				{ title: '#' },
				{ title: 'Name'},
				{ title: 'Highscore' },
				{ title: 'Badges' },
				{ title: 'Times played' },
			],
		});		

		// Enable ranking column
		table.on('order.dt search.dt', function() {
			const rows = table.rows({ order: 'applied', search: 'applied' }).nodes();
			rows.each(function(row, index) {
			  const rank = table.order()[0][1] === 'desc' ? index + 1 : rows.length - index;
			  $(row).find('td:first').text(rank);
			});
		}).draw();
	}

	main();
});
