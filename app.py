import os
import json

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
db = SQL("sqlite:///friends_characters.db")


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
    
    image_formats = ['png', 'jpeg', 'jpg', 'webp', 'avif']
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

#INSERT INTO characters (first_name, char_picture, full_name, birthday, gender, spouses, main_job, portrayed_by)
#VALUES ("Ross", "ross-free.png", "Ross Geller", "October 18, 1967", "Male", "Carol Willick (1989 - 1994), Emily Waltham (1998 - 1999), Rachel Green (1999 - 1999)", "Paleontologist", "David Schwimmer");