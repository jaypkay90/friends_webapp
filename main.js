document.addEventListener('DOMContentLoaded', function() {

	function main() {
		const doc_title = document.title;
		include_header();
		include_footer();
		// If Placeholder for QuizModal is on the page
		if (document.getElementById('include_QuizModal')) {
			// Fill placeholder in HTML doc with code for Quiz modal
			include_quiz_modal();
			// Load JS code for Quiz Modal
			load_quiz_modal();
		}
		if (doc_title === "Quiz - Friends Forever") {
			play_quiz();
		};
	}

	function include_header() {
		// Include header on every page of the website
		const header = document.getElementById('include_header');
		header.innerHTML = `
			<!-- Add bootstrap navbar -->
			<nav class="navbar navbar-expand-lg fixed-top bg-light">
				<div class="container-fluid navbar-font">
					<a class="navbar-brand" href="index.html">
						<img class="navbar-logo" src="img/friends_logo.png" alt="Friends Logo">
					</a>
					<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
						<span class="navbar-toggler-icon"></span>
					</button>
					<div class="collapse navbar-collapse" id="navbarSupportedContent">
						<ul class="navbar-nav ms-auto">
							<!-- <li class="nav-item">
								<a class="nav-link active" aria-current="page" href="index.html">Home</a>
							</li> -->
							<li class="nav-item dropdown">
								<a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
									Characters
								</a>
								<ul class="dropdown-menu">
									<li><a class="dropdown-item" href="chandler.html">Chandler</a></li>
									<li><a class="dropdown-item" href="joey.html">Joey</a></li>
									<li><a class="dropdown-item" href="monica.html">Monica</a></li>
									<li><a class="dropdown-item" href="phoebe.html">Phoebe</a></li>
									<li><a class="dropdown-item" href="rachel.html">Rachel</a></li>
									<li><a class="dropdown-item" href="ross.html">Ross</a></li>
									<!-- <li><hr class="dropdown-divider"></li>
									<li><a class="dropdown-item" href="#">Something else here</a></li> -->
								</ul>
							</li>
							<li class="nav-item">
								<a class="nav-link" href="seasons.html">Seasons</a>
							</li>
							<li class="nav-item">
								<a class="nav-link" href="quiz.html">Quiz</a>
							</li>
							<li class="nav-item">
								<a class="nav-link disabled">Disabled</a>
							</li>
						</ul>
						<form class="d-flex" role="search">
							<input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
							<button class="btn btn-outline-success" type="submit">Search</button>
						</form>
					</div>
				</div>
			</nav>
			`;
	}

	function include_quiz_modal() {
		const modal_placeholder = document.getElementById('include_QuizModal');
		modal_placeholder.innerHTML = `
			<div class="modal" tabindex="-1" role="dialog" id="QuizModal">
				<div class="modal-dialog modal-dialog-centered" role="document">
					<div class="modal-content">
						<div class="card bg-secondary bg-gradient bg-opacity-50">
							<div class="card-header">
								<div class="d-flex justify-content-between">
									<h3 class="friends-font my-auto">Take our Quiz!</h3>
									<button type="button" class="close my-auto quiz_modalBtn" data-dismiss="modal" aria-label="Close">
										<span aria-hidden="true">&times;</span>
									</button>
								</div>
							</div>
							<div class="card-body friends-font text-center">
								<img src="img/friends_quiz.jpg" class="img-fluid" alt="Picture of Friends Quizzing Scene">
								<h3 class="pt-3">Can you prove yourself as the Ultimate Friends Fan?</h3>
							</div>
							<div class="card-footer font-arial text-center py-3">
								<a href="quiz.html" class="btn btn-success fs-4" id="quiz_modalBtn">Take Quiz</a>
							</div>
						</div>
					</div>
				</div>
			</div>
			`;
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

	function include_footer() {
		// Include Footer on every page of the website
		const footer = document.getElementById('include_footer');
		footer.innerHTML = `
			<!-- Add bootstrap footer -->
			<div class="container-fluid bg-light text-muted font-arial">
				<footer class="d-flex flex-wrap justify-content-between align-items-center py-3 border-top">
					<p class="col-md-4 mb-0 text-muted">&copy; 2023 Friends Forever</p>

					<a href="index.html" class="col-md-4 d-flex align-items-center justify-content-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
						<img src="img/friends_logo.png" class="footer-logo" alt="Friends Logo">
					</a>

					<ul class="nav col-md-4 justify-content-end">
						<li class="nav-item"><a href="index.html" class="nav-link px-2 text-muted">Home</a></li>
						<li class="nav-item"><a href="#char-grid" class="nav-link px-2 text-muted">Characters</a></li>
						<li class="nav-item"><a href="seasons.html" class="nav-link px-2 text-muted">Seasons</a></li>
						<li class="nav-item"><a href="quiz.html" class="nav-link px-2 text-muted">Quiz</a></li>
						<li class="nav-item"><a href="#" class="nav-link px-2 text-muted">About</a></li>
					</ul>
				</footer>
			</div>
			`;
	}

	function play_quiz() {
		// Code for Quiz.html
		// Store Quiz questions, answers and solutions in array of dictionaries
		const questions = [
		{
			question: "What was the name of the dog Ross and Monica had, when they were kids?",
			answers: ["Rover", "Buster", "Chi-Chi", "Fido"],
			correct: "Chi-Chi",
			solution: `The name of Ross and Monica's dog was Chi-Chi. They had this dog when they were
					little kids. Ross' and Monica's parents told their kids that Chi-Chi was sent to
					a farm in Connecticut when in reality Chi-Chi died.`
		},
		{
			question: "What is the name of Joey's stuffed penguin?",
			answers: ["Hugsy", "Waddles", "Mr. Penguin", "Penguino"],
			correct: "Hugsy",
			solution: `Joey's stuffed penguin is named Hugsy. Hugsy is a beloved companion of Joey's character.
					The penguin is frequently seen in Joey's apartment and accompanies him on various adventures.
					Hugsy holds sentimental value to Joey and is a recurring element in the show.`
		},
		{
			question: "Who is Monica's long-time on-again, off-again love interest?",
			answers: ["Barry", "Richard", "Paolo", "James"],
			correct: "Richard",
			solution: `Monica's long-time on-again, off-again love interest is
					Richard Burke. Richard, played by Tom Selleck, is an ophthalmologist who is significantly
					older than Monica. Their relationship faces challenges due to the age difference and differing
					life goals, leading to multiple breakups and reconciliations throughout the series. Despite
					their differences, Richard remains a significant figure in Monica's romantic journey, leaving
					a lasting impact on her character development.`
		},
		{
			question: 'Which character famously exclaimed, "We were on a break!" during a relationship dispute?',
			answers: ["Ross", "Joey", "Rachel", "Chandler"],
			correct: "Ross",
			solution: `Ross famously exclaimed, "We were on a break!" during a
					relationship dispute. The line is uttered in the aftermath of a disagreement
					between Ross and Rachel, who was his girlfriend at that time. This statement becomes a
					recurring catchphrase throughout the series and sparks debates among fans about the status of their
					relationship. The phrase symbolizes the complex dynamics and misunderstandings that can arise in
					romantic relationships.`
		},
		{
			question: "What is the name of Chandler's annoying ex-girlfriend?",
			answers: ["Emily", "Lisa", "Janice", "Sarah"],
			correct: "Janice",
			solution: `The name of Chandler's annoying ex-girlfriend is Janice Hosenstein. Janice, portrayed by Maggie Wheeler,
					is known for her distinctive voice and her recurring appearances throughout the series. Despite Chandler's
					attempts to end their relationship, Janice often reappears, much to his dismay. Her catchphrase, "Oh my God"
					is a recurring element that adds comedic moments to the show. Janice's character provides comedic relief and
					adds a touch of chaos to Chandler's life.`
		}
		];

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

	main();
});
