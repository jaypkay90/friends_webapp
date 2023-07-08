document.addEventListener('DOMContentLoaded', function() {

	function main() {
		const doc_title = document.title;
		// If Placeholder for QuizModal is on the page
		if (document.getElementById('QuizModal')) {
			// Load JS code for Quiz Modal
			load_quiz_modal();
		}
		if (doc_title === "Quiz - Friends Forever") {
			play_quiz();
		};
		if (doc_title === "Memory - Friends Forever") {
			play_memory();
		};
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

	function play_quiz() {
		// Code for Quiz.html
		// Get all elements needed for code
		const quiz_img = document.getElementById('quiz-img');
		const question = document.getElementById('question');
		const question_border = document.getElementById('question-border');
		const nextBtn = document.getElementById('next');
		const answerElements = document.getElementById('answers');
		const solutionElement = document.getElementById('solution');

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
			// Make quiz_img invisible and question block visible
			quiz_img.style.display = "none";
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
		const cards = document.querySelectorAll(".mem-card");
		let first_turned, second_turned;
		let card_turned = false;
		let lock_gameboard = false;

		function mem_main() {
			cards.forEach(card => {
				card.addEventListener("click", turn_card);
			});			  
		}

		function turn_card() {
			// If gameboard is locked (two cards were clicked and match is currently being checked), disable turnover of all other cards
			// If user clicks on the first card he turned over, disable turnover of that card
			if (lock_gameboard === true || this === first_turned) {
				return;
			}

			// If card is currently facedown, turn faceup
			if (this.src.endsWith('/static/img/memory/back.png')) {
				this.src = `/static/img/memory/${this.dataset.front}`;
			}
			// If card is currently faceup, turn facedown
			else {
				this.src = `/static/img/memory/back.png`;
			}

			// If player turned over one card (first click)...
			if (card_turned === false) {
				// Set card_turned to true and save current card as first card turned
				card_turned = true;
				first_turned = this;
				
				// Player can't turn over first and second card at the same time.
				// Meaning: We don't need an else block here
				return
			}

			// If player turned over two cards
			// Set card_turned to false again and save current card as second card
			card_turned = false;
			second_turned = this;

			check_match();
		}

		function check_match() {
			// Lock gameboard (disable turnover of all cards), while match is being checked
			lock_gameboard = true;
			// If match, remove eventListener from the two cards that matched
			if (first_turned.dataset.front === second_turned.dataset.front) {
				console.log("Match!");
				first_turned.removeEventListener("click", turn_card);
				second_turned.removeEventListener("click", turn_card);
				setTimeout(function() {
					reset_gameboard();
				}, 2000); // Wait 2 seconds before enabling turnorver of new cards
			}
			// If no match, flip cards back over
			else {
				console.log("No match!");
				setTimeout(function() {
					first_turned.src = `/static/img/memory/back.png`;
					second_turned.src = `/static/img/memory/back.png`;
					// When cards were turned back facedown, unlock gameboard to enable turnover of new cards
					reset_gameboard();
				}, 2000); // Wait 2 seconds before turning cards facedown again and enabling turnover of new cards
			}
		}

		function reset_gameboard() {
			card_turned = false;
			lock_gameboard = false;
			first_turned = null;
			second_turned = null;
		}

		mem_main();
	}

	main();
});
