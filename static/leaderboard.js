document.addEventListener('DOMContentLoaded', function () {

    function initialise_leaderboard() {
		const table = new DataTable('#leaderboard', {
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