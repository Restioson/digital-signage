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
    {{ pip }} install -e ./backend[test] --quiet

alias fmt := format

test:
    ./venv/bin/pytest

format:
    dprint fmt

lint:
    ./venv/bin/flake8 backend

server:
    flask --app server.main run
