document.addEventListener('DOMContentLoaded', function() {

	function main() {
		// If Placeholder for QuizModal is on the page
		if (document.getElementById("QuizModal")) {
			// Load JS code for Quiz Modal
			load_quiz_modal();
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

	main();
});
