from flask import Flask, jsonify, render_template, url_for, flash, redirect, request, session
from forms import RegistrationForm, LogInForm
from flask_sqlalchemy import SQLAlchemy
import requests
from datetime import date
import os
from dotenv import load_dotenv

# Read the .env file and put its values into environment variables.
load_dotenv()



app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
db = SQLAlchemy(app)

# Comes from .env locally, or the host's environment settings when deployed.
# Never write the actual key in code - this file is public on GitHub.
app.config['SECRET_KEY'] = os.environ['SECRET_KEY']

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(
        db.String(20),
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String(50),
        nullable=False
    )

class Results(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(
        db.String(20),
        nullable=False
    )

    attempts = db.Column(
        db.Integer,
        nullable=False
    )

    play_date = db.Column(
        db.String(10),
        nullable=False
    )

    won = db.Column(
        db.Boolean,
        nullable=False
    )

@app.route("/")
def home():
    return redirect("/start")

@app.route("/api/result", methods=['POST'])
def api_result():

    existing = Results.query.filter_by(
        username=session['username'],
        play_date=str(date.today())
    ).first()
    
    if existing:
        return jsonify({"status": "error", "message": "Result already submitted for today"}), 401


    elif 'username' not in session:
        return jsonify({"status": "error", "message": "User not logged in"}), 400

    data = request.get_json()

    result = Results(
        username=session['username'],
        attempts=data.get('attempts'),
        play_date=str(date.today()),
        won=data.get('won')
    )

    db.session.add(result)
    db.session.commit()

    return jsonify({"status": "success"})

@app.route("/register", methods=['GET', 'POST'])
def register():
    form = RegistrationForm()

    if form.validate_on_submit():
        check_user = User.query.filter_by(username=form.username.data
        ).first()
        
        if check_user:
           flash("Username already taken, please try again", 'danger')
           return render_template('register.html', form=form)
       
        user = User(
            username=form.username.data,
            password=form.password.data
        )

        db.session.add(user)
        db.session.commit()
        flash(f'Account created for {form.username.data}!', 'success')
        return redirect("/start")
    return render_template('register.html', title='Register', form=form)

@app.route("/login", methods=['GET', 'POST'])
def login():
    form = LogInForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data
        ).first()
        if user and user.password == form.password.data:
            flash(f'Welcome back, {form.username.data}!', 'success')
            session['username'] = form.username.data
            return redirect("/start")
        else:
            flash("Incorrect login information, please try again!", 'danger')
    return render_template('login.html', title='Login', form=form)

@app.route("/start")
def start():
    if 'username' in session:
        return render_template("start.html", username=session['username'])
    return redirect("/login")

@app.route("/index")
def index():
    return render_template("index.html")

@app.route("/leaderboard")
def leaderboard():
    results = db.session.query(Results).filter_by(play_date=str(date.today())).order_by(Results.attempts.asc()).all()

    
    return render_template("leaderboard.html", results=results)

# The browser can't call api.deezer.com directly (CORS blocks it), so the
# frontend calls /api/deezer/... and this route forwards it to Deezer.
# Example: /api/deezer/search?q=daft -> https://api.deezer.com/search?q=daft
@app.route("/api/deezer/<path:subpath>")
def deezer_proxy(subpath):
    response = requests.get(
        f"https://api.deezer.com/{subpath}",
        params=request.args
    )
    return response.json()

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)