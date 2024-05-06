from flask import render_template, redirect, session, url_for, request
from functools import wraps

# Authentication required to view the page
def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth = request.authorization
        if auth and auth.username == "user" and auth.password == "pass":
            return f(*args, **kwargs)
        return render_template('access_denied.html'), 401, {'WWW-Authenticate': 'Basic realm="Login required!"'}
    return decorated_function


# Function to check if user is logged in when he reaches a protected route
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        # If user is not logged in, redirect to login page
        if 'user_id' not in session:            
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function