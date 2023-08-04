python := "./venv/bin/python"
pip := "./venv/bin/python -m pip"
ruff := "./venv/bin/ruff"

clean:
    rm -rf venv
    rm -rf backend/build
    rm -rf backend/src/campusign_server.egg-info

venv:
    [ -d venv ] || (python3 -m venv --without-pip venv/ && curl https://bootstrap.pypa.io/get-pip.py | {{ python }})

setup: venv
    {{ pip }} install ./backend[test] --quiet

alias fmt := format

test: setup
    {{ python }} -m unittest discover --start-directory backend

format:
    dprint fmt

lint:
    ./venv/bin/flake8 backend
