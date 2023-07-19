import os
import json
import random

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session, url_for
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime
from functools import wraps

# Configure application
app = Flask(__name__)

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure usability of SQLite database
db = SQL("sqlite:///friends_webapp.db")


@app.after_request
def after_request(response):
    # Ensure responses aren't cached
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


# Function to check if user is logged in when he reaches a protected route
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        # If user is not logged in, redirect to login page
        if 'user_id' not in session:            
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function


@app.route('/')
def index():
    # Get character information from characters table
    characters = db.execute("SELECT * FROM characters")
    return render_template("index.html", characters=characters)


@app.route('/characters/<name>')
def character_details(name):
    # Get basic information about the character from the charcters table to display in infobox
    details = db.execute("SELECT * FROM characters WHERE first_name = ?", name.capitalize())[0]

    # Read long infotext about the character from txt-file
    file_path = os.path.join(app.root_path, 'static', 'data', f'{name}.txt')
    with open(file_path, 'r') as file:
        character_info = file.read().split('\n\n')
    
    # Get image to be displayed inside the text-block
    # Name format of the images: charactername-action.format, charactername and format are different for every character
    # Create list of possible image formats
    image_formats = ['png', 'jpeg', 'jpg', 'webp', 'avif', 'bmp']

    # Set path of the action-image initially to none and loop through the image formats
    action_img_file = None
    for format in image_formats:
        action_img_path = f"static/img/{name}-action.{format}"
        # If the image path above exists, we found the image and can break out of the loop
        if os.path.exists(action_img_path):
            action_img_file = action_img_path
            break
    
    # If we found an action-image of the character, remove "static" from the image path, so Jinja's url for function can work with it
    if action_img_file != None:
        action_img_file = action_img_file.replace("static/", "")
    # If we found no action-image of the character, set a backup image
    else:
        action_img_file = f"img/friends_pic07.webp"
    
    return render_template("character.html", details=details, character_info=character_info, action_img_file=action_img_file)


@app.route('/seasons')
def seasons():
    # Read information about the different seasons from JSON file to display in seasons.html template
    with open('static/data/seasons_data.json') as file:
        seasons_data = json.load(file)

    return render_template("seasons.html", seasons=seasons_data["seasons"])


@app.route('/quiz')
def quiz():
    # Read quiz questions (and solutions) from JSON file to display in quiz.html template
    with open('static/data/mini_quiz.json') as file:
        questions = json.load(file)
        
    questions = questions["questions"]
    return render_template("quiz.html", questions=questions)


@app.route('/login', methods=['GET', 'POST'])
def login():
    # Log user in
    # Forget any user_id
    session.clear()

    # User reached route via POST (by submitting login form via POST)
    if request.method == "POST":
        # Get username and password from form
        username = request.form.get("username")
        password = request.form.get("password")
        errors = {}

        # Ensure username and password were submitted, if not show an error
        if not username:
            errors["username_error"] = "Username required"
        if not password:
            errors["password_error"] =  "Password required"

        # If at least one error detected...
        if len(errors) != 0:
            return render_template("login.html", username=username, errors=errors)

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = ?", username)

        # Ensure username exists and password is correct, show error if not
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], password):
            errors["password_error"] =  "Incorrect username and/or password"
            return render_template("login.html", errors=errors)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to Members Area
        return redirect("/membersarea")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html", errors={})


@app.route('/logout')
def logout():
    # Log user out
    # Forget any user_id
    session.clear()

    # Redirect user to home
    return redirect("/")


@app.route('/register', methods=['GET', 'POST'])
def register():
    # Register user

    # User reached route via POST (by submitting the form via POST)
    if request.method == "POST":
        # Get username, password and password confirmation from form
        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")
        errors = {}

        # Ensure user filled out all fields in form, show error(s) if not
        if not username:
            errors["username_error"] = "Username required"
        if not password:
            errors["password_error"] =  "Password required"
        if not confirmation:
            errors["confirmation_error"] = "Confirmation required"

        # If at least one error detected...
        if len(errors) != 0:
            return render_template("register.html", username=username, errors=errors)
        
        # Check if username is already taken
        # If the list returned by db.execute has a length greater than 0, the username is already taken
        # In that case, show error
        if len(db.execute("SELECT * FROM users WHERE username = ?", username)) > 0:
            errors["username_error"] = "Username already taken"
            return render_template("register.html", username=username, errors=errors)
        
        # Ensure password has at least 4 characters, show error if not
        if len(password) < 4:
            errors["password_error"] =  "Password must have at least 4 characters"
            return render_template("register.html", username=username, errors=errors)

        # Check if password and password confirmation match, show error if not
        if password != confirmation:
            errors["confirmation_error"] = "Confirmation and password do not match"
            return render_template("register.html", username=username, errors=errors)
        
        # If we passed all those tests, we can generate a password hash and add the user to the db
        pw_hashed = generate_password_hash(password)
        db.execute("INSERT INTO users (username, hash) VALUES (?, ?)", username, pw_hashed)

        # Get user_id and log user in
        user_id = db.execute("SELECT id FROM users WHERE username = ?", username)
        session["user_id"] = user_id[0]["id"]
        
        # Redirect to Members Area
        return redirect("/membersarea")

    else:
        return render_template("register.html", errors={})


@app.route('/membersarea')
@login_required
def membersarea():
    # Get username from users table
    username = db.execute("SELECT username FROM users WHERE id = ?", session["user_id"])[0]["username"]

    # Get memory gamedata from memory table
    memory_data = db.execute("SELECT highscore, current_badge FROM memory WHERE user_id = ?", session["user_id"])

    # If user never played memory before, set highscore to 0 and make list of badges empty
    if len(memory_data) != 1:
        memory_highscore = 0
        memory_badges = []

    # If user played before...
    else:
        # Take highscore from database
        memory_highscore = memory_data[0]["highscore"]

        # "Calc" badges
        best_badge = memory_data[0]["current_badge"]
        if best_badge == "None":
            memory_badges = []
        if best_badge == "Bronze":
            memory_badges = ["Bronze"]
        elif best_badge == "Silver":
            memory_badges = ["Bronze", "Silver"]
        elif best_badge == "Gold":
            memory_badges = ["Bronze", "Silver", "Gold"]
        
    # Store links to medal images in list to pass the list to the template
    medal_pics = ["bronze_medal_tiny.png", "silver_medal_tiny.png", "gold_medal_tiny.png"]

    return render_template("membersarea.html", username=username, memory_highscore=memory_highscore, memory_badges=memory_badges, medal_pics=medal_pics)


@app.route('/memory', methods=['GET', 'POST'])
@login_required
def memory():
    # If user reached out via POST (by submitting his score and times played via form)
    if request.method == "POST":

        # Get user's score and times_played from form
        score = int(request.form.get("score"))
        times_played = int(request.form.get("timesPlayed"))

        # Calc current badge
        if (times_played < 2):
            current_badge = "None"
        elif (times_played < 5):
            current_badge = "Bronze"
        elif (times_played < 10):
            current_badge = "Silver"
        else:
            current_badge = "Gold"

        # Check if user that is currently logged in already played memory
        user_gamedata = db.execute("SELECT * FROM memory WHERE user_id = ?", session["user_id"])

        # If user never played before, insert stats of game into memory table
        if len(user_gamedata) != 1:
            db.execute("INSERT INTO memory (user_id, highscore, times_played, current_badge) SELECT users.id, ?, ?, ? FROM users WHERE users.id = ?", score, times_played, current_badge, session["user_id"])

        # If user played before, update data
        else:
            # If user produced new highscore, update data and insert score into highscore column
            if (user_gamedata[0]["highscore"]) <= score:
                db.execute("UPDATE memory SET highscore = ?, times_played = ?, current_badge = ? WHERE user_id = (SELECT id FROM users WHERE id = ?)", score, times_played, current_badge, session["user_id"])

            # If no new highscore, update data, but leave highscore column as it is    
            else:
                db.execute("UPDATE memory SET times_played = ?, current_badge = ? WHERE user_id = (SELECT id FROM users WHERE id = ?)", times_played, current_badge, session["user_id"])

        # Redirect to members area
        return redirect("/membersarea")
    
    # If user reached out via Get
    else:
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

        # Get current highscore and times_played of user from db
        user_gamedata = db.execute("SELECT highscore, times_played FROM memory WHERE user_id = ?", session["user_id"])
        
        # If user never played before, set highscore and times_played to 0
        if len(user_gamedata) != 1:
            highscore = 0
            times_played = 0
        
        # If user played before, take data from dictionary of table data
        else:
            highscore = user_gamedata[0]["highscore"]
            times_played = user_gamedata[0]["times_played"]

        return render_template("memory.html", cards=cards, highscore=highscore, times_played=times_played)
    

@app.route('/leaderboard')
@login_required
def leaderboard():
    # Get username and gamedata from every registered user
    memory_data = db.execute("SELECT users.username, memory.highscore, memory.times_played, memory.current_badge FROM users JOIN memory ON users.id = memory.user_id")

    # Calculate number of badges for every user and add the data
    for dict in memory_data:
        if dict["current_badge"] == "None":
            dict["number_badges"] = 0
        elif dict["current_badge"] == "Bronze":
            dict["number_badges"] = 1
        elif dict["current_badge"] == "Silver":
            dict["number_badges"] = 2
        # If user already won the Gold badge...    
        else:
            dict["number_badges"] = 3

    return render_template("leaderboard.html", memory_data=memory_data)

#SELECT users.username, memory.highscore, memory.times_played, memory.current_badge FROM users JOIN memory ON users.id = memory.user_id;
#INSERT INTO characters (first_name, char_picture, full_name, birthday, gender, spouses, main_job, portrayed_by)
#VALUES ("Ross", "ross-free.png", "Ross Geller", "October 18, 1967", "Male", "Carol Willick (1989 - 1994), Emily Waltham (1998 - 1999), Rachel Green (1999 - 1999)", "Paleontologist", "David Schwimmer");