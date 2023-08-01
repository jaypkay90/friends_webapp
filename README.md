# Friends Forever
## Video Demo: https://youtu.be/pSK4GcTOXXA

## Description

Friends Forever is a Flask Webapp dedicated to the fans of the popular sitcom "Friends".

The programming languages used to create the app are Python, Jinja and JavaScript. The whole webapp is device-responsive.

For users who are not logged in, the app looks mostly like a static website with information about the sitcom, except the "/quiz"-route. Every route in the app has the same header and footer. Both were integrated into the standard template (layout.html), on which all other templates build up on.

### The following routes of the app can be accessed without being logged in:

#### "/" (index.html)

The main route shows a carousel with pictures of the show's main characters on the top of the page. The carousel was integrated with the help of Bootstrap.
Below the carousel is a text paragraph with basic information about the show and a grid of cards. Each card contains a picture of one of the main characters and a link to a page with a character description. The information about the characters were stored in a database called. Python reads the information about every character from the database once someone reaches out via GET. The information are than stored in a list of dictionaries and ultimately passed to the Jinja template. I initialized a for-loop in the Jinja template, which loops through the list of characters and creates one card for every character in the list.

```python
 # Get character information from characters table
characters = db.execute("SELECT * FROM characters")
return render_template("index.html", characters=characters)
```

```jinja
{% for character in characters %}
	...
{% endfor %}
```

In some routes, which are not behind the login wall - including the "/"-route -, a pop up modal is integrated. This modal leads the user to the "/quiz"-route and pops up once every 24 hours per browser. Whenever the modal pops up, a timestamp is stored in the local storage of the browser. Once 24 hours have past and the user reaches out to the website again, the modal will pop up again.

#### "/character/<name>" (character.html)

Every main character has a page with information about that specific character. The pages of the different characters are similar in terms of style. I used one template called "character.html" to create that style. The information about the characters are dynamically loaded into the Jinja template depending on the name of the character.
On top of the page, one can see a big card with basic information about the character. These information were stored in a database and are passed from Python to the template.

```python
# Get basic information about the character from the charcters table to display in infobox
details = db.execute("SELECT * FROM characters WHERE first_name = ?", name.capitalize())[0]
```

Below the card with basic information comes a detailed character description. The descriptive texts are stored in seperate txt-files, named after the characters (i.e. "chandler.txt"). Once someone reaches out to one of the character-pages via GET the information about that specific character are read by Python from the database and the txt-files and are than passed to the "character.html"-template.

```python
 file_path = os.path.join(app.root_path, 'static', 'data', f'{name}.txt')
    with open(file_path, 'r') as file:
        character_info = file.read().split('\n\n')
```

The text paragraphs also contain a device-responsive picture from the specific character. The pictures are named like this: "charactername-action.format". When a user visits the page of a certain character, the Python code checks wether a picture of that specific character with the name-structure mentioned above exists on the server. Since the file-formats of the pictures are different, Python loops through a list of multiple formats and searches for a picture of the character. Once a picture is found, Python breaks out of the loop. To prevent internal server error if no picture is found, I used a backup picture, which is shown in that case.

```python
for format in image_formats:
    action_img_path = f"static/img/{name}-action.{format}"
    # If the image path above exists, we found the image and can break out of the loop
    if os.path.exists(action_img_path):
        action_img_file = action_img_path
        break

 # If we found an action-image of the character, remove "static" from the image path, so Jinja's url_for function can work with it
if action_img_file != None:
    action_img_file = action_img_file.replace("static/", "")
# If we found no action-image of the character, set a backup image
else:
    action_img_file = f"img/friends_pic07.webp"
```

#### "/seasons" (seasons.html)

The seasons-route contains a summary text as well as an image of the DVD cover of each season of "Friends". Moreover, there are links to either buy or stream the specific season on Amazon.com.
The information about the seasons are stored in a json file called "seasons_data.json". Once a user reaches out to the seasons-route via GET, Python reads the json-file and passes the information to the template.

```python
# Read information about the different seasons from JSON file to display in seasons.html template
with open('static/data/seasons_data.json') as file:
    seasons_data = json.load(file)

return render_template("seasons.html", seasons=seasons_data["seasons"])
```

Inside the Jinja template, I simply looped through the seasons and created one paragraph with a picture and a summary text of every season, displayed in a row with two columns on larger devices and in one column on smaller devices. Depending on wether the season number is equal or odd, the order of the the columns change on larger devices. This simply means, that the picture and the text swap places. That way, the page looks a bit more interesting.

```jinja
{% for season in seasons %}
	<div class="row row-cols-1 row-cols-sm-2">

		<!-- If season number is even (2, 4, ...), display image on the right... -->
        <div class="col col-sm-5 {% if season.number % 2 == 0 %} order-sm-2 {% endif %} text-center">
            ...
        </div>

        <!-- ...and text on the left -->
        <div class="col col-sm-7 {% if season.number % 2 == 0 %} order-sm-1 {% endif %}">
            ...
        </div>
    </div>			
	...
{% endfor %}
```

#### "/quiz" (quiz.html)

The quiz route leads the user through a quiz with five questions about the sitcom. The questions, as well as the answers to the questions were (once again) stored in a json-file called "mini_quiz.json". Once the user reaches out to the quiz-route via GET, Python reads the data from the file. It is than passed to the Jinja template and stored in a JS-variable.

```jinja
{% block additional_js %}
    <script>
        const questions = {{ questions | tojson | safe }};
    </script>
    <script src="{{ url_for('static', filename='quiz.js') }}"></script>
{% endblock %}
```

The rest of the quiz is programmed with JavaScript. Once the user clicks the "Start Quiz"-button, the first question and four possible answers appear on the screen. The user has to choose one of the answers before moving on to the next question. Once he did that, the background of the answer element he clicked on changes it's color either to green or to red, depending on wether the user answered the question correctly or not. If the answer war not correct, the background of the element with the correct answer turns green. Further more (undependent on wether the user answered correctly or not) a short text about the correct answer to the question appears on screen.

```JavaScript
// If user selected correct answer, make button green and update score
if (button.innerHTML === questions[qnr].correct) {
    button.classList.add("bg-success");
    ...
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
```

After the user selected an answer, he can't click the answer-buttons again. He is only able to click on the "Next"-button to show the next question.
Once the user answered all questions, the appearence of the page changes once again, now showing the user's result. It is shown, how many points the user scored as well as a short text evaluating the user's score. Below this text, the user has the ability to click one out of two buttons. He can either play the quiz again or sign up to play more games related to the "Friends-universe".

```JavaScript
nextBtn.innerHTML = "Play again";
...
// Show register button and make nextBtn grey
nextBtn.classList.remove("bg-success");
registerBtn.style.display = "inline-block";
```

#### "/login" (login.html):

The login route is a simple form with a "username" and a "password" field. Python handles the usual objections, when the user inputs the username and the password. For example, it is checked if both fields were filled out and if the username and password are correct. If one or more objections are found, error-messages describing the problem(s) appear on screen.
Once the user submitted the form successfully by providing a valid username and password, the user is being logged in and than redirected to the "/membersarea" route.
If a user who is not a member yet, reaches out to the login route via GET, he has the ability to sign up by clicking on a link, which redirects him to the "/register" route.

#### "/register" (register.html):

This route looks quite similar to the "/login"-route. The user has to fill out a form, in which he has to provide a username, a password containing a least four characters and a password confirmation. Once the user submits the form via POST, Python once again handles the typical objections. When problems occur, they are shown on screen.
Once the user provided a valid username and a valid password (and confirmed it), the username and a hash of the password are stored in a database table. The user is than automatically signed in and redirected to the "/membersarea" route.


### The following routes are only accessible for logged in users:

#### "/membersarea" (membersarea.html)

Behind the login wall, the user has access to mini games. The user can play these games (I integrated two games, more games can be added), win badges, improve his highscore and measure his accomplishments with those of all other app users.

On top of the "/membersarea"-route, the user sees a grid with his name and his accomplishments. The user's accomplishments are stored in different databases (one database per game). Once the user reaches out to the "/membersarea"-route via GET, Python executes mulitple SQLite queries by calling a function called "get_gamedata" for every available game. The data is collected in a list called "gamedata", which is ultimately passed to the template.

```python
# Get username from users table
username = db.execute("SELECT username FROM users WHERE id = ?", session["user_id"])[0]["username"]

# Create an initally empty list to store the game data
gamedata=[]

# Loop through the list of games
for game in games:
    # Get gamedata for current game and add the dictionary with the data to the gamedata list
    gamedata.append(get_gamedata(game))
```

On the page, for every game, the user sees his current highscore and all badges he already won. To display everything correctly I used two for-loops in the Jinja-template: An outer for-loop, which loops through all the games and an inner for-loop, which makes sure, that the user's badges show up correctly.

```jinja
<!-- Loop through the gamedata list, which is a list of dicts -->
{% for game in gamedata %}
    {% if loop.last %}
        {% set last_game = true %}
    {% endif %}
    <div class="row">
        <div class="col-3 d-flex align-items-center justify-content-center py-2 border border-start-0 {% if last_game %} border-bottom-0 {% endif %}">{{ game["name"] }}</div>
        <div class="col-3 d-flex align-items-center justify-content-center py-2 border {% if last_game %} border-bottom-0 {% endif %}">{{ game["highscore"] }}</div>
        
        <!-- Make three div-elements (for-loop) -->
        {% for i in range(3) %}
            <div class="col-2 d-flex align-items-center justify-content-center py-2 border {% if last_game %} border-bottom-0 {% endif %} {% if loop.last %} border-end-0 {% endif %}">
                <!-- If we have not come to the end of the user's badges list, show picture of badge item in the i'th position -->
                {% if i < game["badges"]|length %}
                    <img src="{{ url_for('static', filename='img/' ~ medal_pics[i]) }}" alt="Image of {{ game['badges'][i] }} Medal" class="img-fluid">
                <!-- If we are at the end of the user's badges list, show "Missing Lettering", because the user hasn't won the badge -->
                {% else %}
                    <img src="{{ url_for('static', filename='img/missing.png') }}" alt="Missing Lettering" class="img-fluid">
                {% endif %}
            </div>
        {% endfor %}

    </div>
{% endfor %}
```

Below the grid with the user's accomplishments, an overview of all available games as well as a link to the leaderboard are displayed in a grid of cards. Every card contains a picture of the particular game as well as a link to that game. To achieve this, I simply looped through the list of games and created one card per game.

#### "/leaderboard" (leaderboard.html):

The "/leaderboard"-route shows multiple device-responsive data-tables: One overall table with the accumulated accomplishments from every single user as well as one table for every available game.
Inide each game table, the data of every user who already played that specific game shows up in one single row. The tables are initially sorted by "Highscore", meaning the user with the highest "Highscore" is displayed on top of the table and the other users follow in descending oder depending on their current highscore.
The user is also able to sort the tables by other columns, i.e. by "Badges" or "Times played". To do this, he just needs to click either an arrow-up- or an arrow-down-indicator on the right side of the column he wants to sort the data by.
I took the basic structure for the data-tables from "datatables.net" and used their documentation to enable and disable certain table-features and to adjust the style of the tables. I also added a table heading to every table with Java Script. Since the tables are created dynamically with JS, I had to use JS to create these table headings.

```JavaScript
function add_table_heading(gamename) {
    // Put a heading with the game name above the table
    // Create an h3 element
    const table_heading = document.createElement('h3');
    table_heading.classList.add('friends-font', 'margin-bottom-20')

    // Capitalize the first letter of the game name
    // game.charAt(0).toUpperCase(): Convert first letter of game name to uppercase
    // game.slice(1): Take the game name and slice of the first letter
    game_first_cap = gamename.charAt(0).toUpperCase() + gamename.slice(1);

    // Put capitalized game name into h3-Element
    table_heading.textContent = game_first_cap;

    // Append the h3 element before the table
    const table_wrapper = document.getElementById(`${gamename}_wrapper`);
    table_wrapper.parentNode.insertBefore(table_heading, table_wrapper);
}
```

The data displayed in the tables is passed to the Jinja template by Python. In app.py, the data which ultimately shows up in the tables, is "collected" by executing SELECT queries on the database. The data, which shows up in the overall table on top of the page is generated in a seperate function called "generate_overall_table".

#### "/memory" (memory.html)

When the user reaches out to the "/memory"-route via GET, he is able to play a simple memory game with 12 cards. The back of the cards show the "Friends"-logo, while the front show images of the main characters. All of these images are stored on the server. Once the user reaches out to the "/memory"-route via GET, a list of dictionaries is created. Every dictionary represents one memory card and contains two keys: A "front"-key, which's value is a link to the picture shown on the front of the card; and a "back"-key, which's value is a link to the picture shown on the back of the card. This list of dictionaries is than "shuffeled" and passed to the Jinja template.

```python
# List of dicts with memory cards
cards = [
    {"front": "chandler.png", "back": "back.png"},
    {"front": "joey.png", "back": "back.png"},
    {"front": "monica.png", "back": "back.png"},
    {"front": "phoebe.png", "back": "back.png"},
    {"front": "rachel.png", "back": "back.png"},
    {"front": "ross.png", "back": "back.png"},
]

# Double the cards to create pairs
cards += cards

# Put cards in random order
random.shuffle(cards)
```

The HTML template for each available game build up on a template called "layout_game.html", because all games share certain styling elements and features to ensure consistency in terms of style and usability. On top of each game page, one can see a horizontal row with a "timer", a "score" and a "moves" column.

When the user reaches out to the memory route via GET, the timer immediately starts at "00:00" and updates every second, until the user fiends two matching cards. Once he does, the timer starts again. Depending on how long it took the user to find two matching cards, his score is either "better" or "worse". The score is calculated as follows: For every match the user gets 50 "base points". If he needs less than a minute to make a match, the remaining seconds left to one minute are added to his score. The "moves" column also affects the user's score. It simply tracks how many cards the user turned over. It starts at 0 and is reset back to 0 whenever the user makes a match. Obviously the "moves" variable is also a good indicator of how good of a memory player the user is. A player who needs ten moves on average to make a match is "worse" than a player who needs only two moves on average two make a match. Two moves is the best possible outcome. If the user needed only two moves to make a match, he just turned over two cards and those two cards matched. With this in mind, I decided to subtract the difference between the number of moves a player needed to make a match and 2 from his base score.

Let's look at an example to see how the points are calculated:
Let's say the user needed 30 seconds and 12 moves to make a match.
Base Score for making a match: 50 points
Bonus points: 30 (60 seconds - 30 seconds)
Points to be subtracted: 10 (12 moves - 2 moves)
Total score for that match: 70 points (50 + 30 - 10)

For every match, the user makes, the score for that particular match is calculated with JavaScript and than added to the total score, which is displayed as "Score" on the sreen.

```JavaScript
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

    // The user always gets at least one point for every match
    if (points <= 0) {
        points = 1;
    }

    // UPDATE TOTAL POINTS
    total_points += points;
    points_element.innerHTML = total_points;
}
```

Below the grid with the game statistics, a device-responsive grid with the 12 memory cards is displayed. The cards are all turned face-down initially (meaning: The value of the key "back", which is a link to a picture, of every dictionary is shown).
The whole game is programmed with JavaScript. First, and eventListener is added to every card. The user is than able to turn over two different cards. He can't turn over the same card twice. After two cards were turned over, a function called "check_match()" is being called to check if the user found two matching cards or not. If he did, the border of these two cards turns green for a few moments and the timer and move variables are reset back to 0. The user now has access to the gameboard again and is able to click on the next two cards.
If the user found no match, the cards will be turned facedown again and the user is than able to select two new cards.

Another similarity in terms of style and usability of the different games within the app is the process that the user is led through at the end of a game. Once the game ends (In the memory game that means specifically: Once the user found all matches), a function called "end_game()" is executed. A modal pops up on the screen, which shows how many times the user has to play the game to win the next badge. Once the user closes that modal, another modal pops up. This modal shows the user's score. If the user scored a new highscore, a picture and a short texts "congratualte" him for his achievement. Integrated into this second modal is a hidden form with two fields. The values of these two fields ("score" and "timesPlayed") are "filled out" by JavaScript. Once the user closes the modal, the data is submitted to the route of the game via POST and than stored in a database.

```jinja
<!-- Form for submitting user score and times played, value attributes of input tags are filled by JS -->
<form action="/{{ game }}" method="post">
    <input type="hidden" id="scoreInput" name="score" value="" />
    <input type="hidden" id="timesPlayedInput" name="timesPlayed" value="" />
    <button type="submit" class="my-auto close-button" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
</form>
```

```JavaScript
// Put user score and times_played in form value fields for submission
score_input.value = total_points;
times_played_input.value = times_played;
```

#### "/puzzle" (puzzle.html)

The second game, which is integrated into the app, is a sliding puzzle game with nine tiles. The task of the user is to bring the initally jumbled tiles back in the correct order. The solved puzzle shows a picture of the main characters of the show. To create the sliding puzzle, I took that picture and cut it into 9 even sized "tiles", which are stored on the server as png-images.
In app.py, the "puzzle-tiles", which are initially stored in a list, are "mixed up" and than passed to the Jinja template. In the "mix up process" it is important to make sure that a "solvable mix" is created. A sliding puzzle with an odd number of tiles is only solvable, if the number of inversions in the tiles is even. Let's look at an example:

For this example we assume, that the correct order of the pieces is [1, 2, 3, 4, 5, 6, 7, 8, 9].
An inversion occurs everytime, a tile shows up "behind" another tile, even though it is supposed to appear "in front" of that other tile. Let's look at the following order: [1, 2, 3, 4, 6, 8, 5, 7]. In this list, the tiles 1, 2, 3 and 4 are already in the correct order, which means: No inversions. Let's focus on the rest of the list: [6, 8, 5, 7]. The "5" is the smallest number in that list. It shows up "behind" the "6", even though it's supposed to show up "in front" of the "6". This means: 6-5 is an inversion! 5 is also greater than 8, which means that we have a second inversion: 8-5. The third and last inversion in our list is 8-7. The number "7" appears after the "8" in our list, even though it is supposed to appear "in front of" the "8". Because a sliding puzzle with an odd number of tiles is only solvable, if the number of inversions is even, the order we created for the puzzle tiles would essentialy create an unsolvable sliding puzzle.

To make sure that the puzzle the user eventually has to solve is solvable, I used the following while-loop in app.py:

```python
 # "Shuffle" pieces in a solvable way
''' https://www.cs.princeton.edu/courses/archive/spring21/cos226/assignments/8puzzle/specification.php
"Given a board, an inversion is any pair of tiles i and j where i < j but i appears after j [on the board]"
Puzzle with odd number of pieces (we have 9 pieces): Puzzle is solvable when number of inversions is even'''
blank_piece = 9
is_solvable = False

# While puzzle unsolvable
while is_solvable == False:
    # Set number of inversions to 0
    inversions = 0

    # "Shuffle" pieces and check if solvable
    random.shuffle(pieces)

    # Compare pieces with one another
    for i in range(len(pieces)):
        for j in range(i + 1, len(pieces)):
            # The two for-loops make sure, that i is always < j
            # If the number at position i is greater than the number at position j, we have an inversion
            # When counting inversions, we have to ignore the blank tile (piece 9 in our example)
            if pieces[j] != blank_piece and pieces[i] != blank_piece and pieces[i] > pieces[j]:
                inversions += 1

    # After we compared the pieces with one another:
    # If the number of inversions is even, the puzzle is solvable
    if inversions % 2 == 0:
        is_solvable = True
```

Once the puzzle tiles are in a solvable order, the list with the tiles is passed to the Jinja template for the page. The puzzle game itself was coded with JavaScript. To track dragging events of the puzzle tiles, an event listener for each possible dragging event is added to every puzzle piece at the beginning of the game.

```JavaScript
puzzle_pieces.forEach(piece => {
    piece.addEventListener('dragstart', start);
    piece.addEventListener('dragover', over);
    piece.addEventListener('dragenter', enter);
    piece.addEventListener('dragleave', leave);
    piece.addEventListener('drop', drop);
    piece.addEventListener('dragend', end);
});
```

Once the user starts dragging a tile, the dragged piece is stored in a variable called "dragged_piece". If the user tries to drop the dragged piece onto another puzzle-piece, this piece is also stored in a variable called "swapped_piece".

The most important eventlistener is the dragend eventlistener. The function "end" specifies what happens when the dragend event is fired, which means: This function specifies what happens after the user drops the dragged tile onto another tile. "Swapping" two tiles in a sliding puzzle game is only allowed under the following circumstances:

1. The dragged piece can only be swapped, if the swapped piece is the blank piece! In our case, the blank piece of the puzzle is called "piece-09". "Piece-09" is just a completely grey png-picture.
2. The dragged piece can only be swapped with the blank piece, if the blank piece is either directly above, below, to the left or to the right of the dragged piece.

In the "end"-function I made sure that both conditions are always fulfilled, when the user tries to swap two tiles.

Whenever the user swaps two puzzle tiles successfully, a function called "check_order" is executed. This function checks if all tiles of the puzzle are in the correct order. If they are, the user solved the puzzle and the game ends.

As in the memory-game two modals displaying the user's accompishments show up at the end of the game. By closing the second modal, the user submits the game data via POST to the server. That data is than stored in a database table.

## Installation:
1. Download the files
2. Install Flask from the terminal

```bash
pip install Flask
```

3. Extract the download folder and open the extracted folder
4. Install all needed libraries (which you can see on top of app.py) from the terminal
5. Run the app with the command "flask run"

```bash
flask run
```

# License
[GNU GPLv3](https://choosealicense.com/licenses/gpl-3.0/#)