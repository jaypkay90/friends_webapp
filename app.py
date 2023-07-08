import os
import json
import random

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime

#from helpers import apology, login_required, lookup, usd

# Configure application
app = Flask(__name__)

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///friends_webapp.db")


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route('/')
def index():
    characters = db.execute("SELECT * FROM characters")
    return render_template("index.html", characters=characters)


@app.route('/characters/<name>')
def character_details(name):
    details = db.execute("SELECT * FROM characters WHERE first_name = ?", name.capitalize())[0]
    file_path = os.path.join(app.root_path, 'static', 'data', f'{name}.txt')
    with open(file_path, 'r') as file:
        character_info = file.read().split('\n\n')
    
    image_formats = ['png', 'jpeg', 'jpg', 'webp', 'avif', 'bmp']
    action_img_file = None
    for format in image_formats:
        action_img_path = f"static/img/{name}-action.{format}"
        if os.path.exists(action_img_path):
            action_img_file = action_img_path
            break

    action_img_file = action_img_file.replace("static/", "")
    
    return render_template("character.html", details=details, character_info=character_info, action_img_file=action_img_file)


@app.route('/seasons')
def seasons():
    with open('static/data/seasons_data.json') as file:
        seasons_data = json.load(file)

    return render_template("seasons.html", seasons=seasons_data["seasons"])


@app.route('/quiz')
def quiz():
    with open('static/data/mini_quiz.json') as file:
        questions = json.load(file)
        
    questions = questions["questions"]
    return render_template("quiz.html", questions=questions)


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (by submitting login form via POST)
    if request.method == "POST":

        username = request.form.get("username")
        password = request.form.get("password")
        errors = {}

        # Ensure username and password were submitted
        if not username:
            errors["username_error"] = "Username required"
        if not password:
            errors["password_error"] =  "Password required"

        # If at least one error detected...
        if len(errors) != 0:
            return render_template("login.html", username=username, errors=errors)

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = ?", username)

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], password):
            errors["password_error"] =  "Incorrect username and/or password"
            return render_template("login.html", errors=errors)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html", errors={})


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""
    # User reached route via POST (by submitting the form via POST)
    if request.method == "POST":

        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")
        errors = {}

        # Ensure user filled out all fields in form
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
        # If the dict returned by db.execute has a length greater than 0, the username exists
        if len(db.execute("SELECT * FROM users WHERE username = ?", username)) > 0:
            errors["username_error"] = "Username already taken"
            return render_template("register.html", username=username, errors=errors)
        
        # Ensure password has at least 4 characters
        if len(password) < 4:
            errors["password_error"] =  "Password must have at least 4 characters"
            return render_template("register.html", username=username, errors=errors)

        # Check if password and password confirmation match
        if password != confirmation:
            errors["confirmation_error"] = "Confirmation and password do not match"
            return render_template("register.html", username=username, errors=errors)
        
        # If we passed all those tests, we can generate a password hash and add the user to the db
        pw_hashed = generate_password_hash(password)
        db.execute("INSERT INTO users (username, hash) VALUES (?, ?)", username, pw_hashed)

        # Get user_id and log user in
        user_id = db.execute("SELECT id FROM users WHERE username = ?", username)
        session["user_id"] = user_id[0]["id"]
        
        return redirect("/")

    else:
        return render_template("register.html", errors={})


@app.route("/memory")
def memory():
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

    return render_template("memory.html", cards=cards)

#INSERT INTO characters (first_name, char_picture, full_name, birthday, gender, spouses, main_job, portrayed_by)
#VALUES ("Ross", "ross-free.png", "Ross Geller", "October 18, 1967", "Male", "Carol Willick (1989 - 1994), Emily Waltham (1998 - 1999), Rachel Green (1999 - 1999)", "Paleontologist", "David Schwimmer");