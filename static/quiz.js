document.addEventListener('DOMContentLoaded', function() {

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

    function quiz_main() {
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
        // Make quiz_img + registerBtn invisible
        quiz_img.style.display = "none";
        registerBtn.style.display = "none";
        // Make nextBtn green and question block visible
        nextBtn.classList.add("bg-success");
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
        // Show register button and make nextBtn grey
        nextBtn.classList.remove("bg-success");
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

        // Add a sign up call to the text
        sign_up_call = `<h4 class="text-danger friends-font mt-3">Sign up to play more Friends related games!</h4>`;
        final_text = score_evaluation + "<br>" + sign_up_call;

        return final_text;
    }

    quiz_main();

});