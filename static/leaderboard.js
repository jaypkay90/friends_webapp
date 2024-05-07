document.addEventListener('DOMContentLoaded', function () {

    function initialise_leaderboard() {
		for (const game of gamedata) {
			// The gamename is the first key of the dictionary "game" in the list "gamedata"
			const gamename = Object.keys(game)[0];
			const table = create_datatable(gamename);
			add_table_heading(gamename);
			add_ranking_column(table);
		}
	}

	function create_datatable(gamename) {
		return table = new DataTable(`#${gamename}`, {
			searching: false,
			pagingType: 'simple_numbers',
			// Order by "Highscore" in desc order by default
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
	}

	function add_table_heading(gamename) {
		// Put a heading with the game name above the table
		// Create an h3 element
		const table_heading = document.createElement('h3');
		table_heading.classList.add('friends-font', 'margin-bottom-20')

		// Capitalize the first letter of the game name
		// gamename.charAt(0).toUpperCase(): Convert first letter of game name to uppercase
		// gamename.slice(1): Take the game name and slice off the first letter
		game_first_cap = gamename.charAt(0).toUpperCase() + gamename.slice(1);

		// Put capitalized game name into h3-Element
		table_heading.textContent = game_first_cap;

		// Append the h3 element before the table
		const table_wrapper = document.getElementById(`${gamename}_wrapper`);
		table_wrapper.parentNode.insertBefore(table_heading, table_wrapper);
	}
	
	function add_ranking_column(table) {
		// Enable ranking column
		table.on('order.dt search.dt', function() {
			const rows = table.rows({ order: 'applied', search: 'applied' }).nodes();
			rows.each(function(row, index) {
				const rank = table.order()[0][1] === 'desc' ? index + 1 : rows.length - index;
				$(row).find('td:first').text(rank);
			});
		}).draw();
	}

    initialise_leaderboard();

});