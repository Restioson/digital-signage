python := "./venv/bin/python"
pip := "./venv/bin/python -m pip"
ruff := "./venv/bin/ruff"
flake8 := "./venv/bin/flake8"

clean:
    rm -rf venv
    rm -rf backend/build
    rm -rf backend/static/campusign_server.egg-info

venv:
    [ -d venv ] || (python3 -m venv --without-pip venv/ && curl https://bootstrap.pypa.io/get-pip.py | {{ python }})

setup: venv
    npm install
    {{ pip }} install -e ./backend[test]

alias fmt := format

test: test-backend test-frontend

test-backend:
    ./venv/bin/pytest -W ignore::DeprecationWarning

test-frontend:
    cd frontend && npx mocha

format:
    dprint fmt

lint: lint-backend lint-frontend

lint-backend:
    {{ flake8 }} backend

lint-frontend:
    npx stylelint "frontend/**/*.css"
    npx standard
    npx html-validate "frontend/**/*.j2"

server:
    ./venv/bin/flask --app server.main run --debug
