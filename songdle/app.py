from flask import Flask, render_template, url_for, flash, redirect
from forms import RegistrationForm, LogInForm
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
db = SQLAlchemy(app)

app.config['SECRET_KEY'] = 'fa9daa2095a9ec8ad6e2a3f312eb87ef'

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
            return redirect("/start")
        else:
            flash("Incorrect login information, please try again!", 'danger')
    return render_template('login.html', title='Login', form=form)

@app.route("/start")
def start():
    return render_template("start.html")

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)