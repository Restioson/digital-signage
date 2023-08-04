python := "./venv/bin/python"
pip := "./venv/bin/python -m pip"
ruff := "./venv/bin/ruff"

clean:
    rm -rf venv

venv:
    @[ -d venv ] || (python3 -m venv --without-pip venv/ && curl https://bootstrap.pypa.io/get-pip.py | {{ python }})

setup: venv
    {{ pip }} install black
    {{ pip }} install -r backend/requirements.txt

alias fmt := format

format:
    dprint fmt
