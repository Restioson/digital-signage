"""
This is taken directly from Django:
https://docs.djangoproject.com/en/4.2/_modules/django/utils/http/

Licensed under BSD-3 clause (see https://github.com/django/django/blob/main/LICENSE):

    Copyright (c) Django Software Foundation and individual contributors.
    All rights reserved.

    Redistribution and use in source and binary forms, with or without modification,
    are permitted provided that the following conditions are met:

        1. Redistributions of source code must retain the above copyright notice,
           this list of conditions and the following disclaimer.

        2. Redistributions in binary form must reproduce the above copyright
           notice, this list of conditions and the following disclaimer in the
           documentation and/or other materials provided with the distribution.

        3. Neither the name of Django nor the names of its contributors may be used
           to endorse or promote products derived from this software without
           specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
    ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
    ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
    ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
"""
from urllib.parse import (
    _coerce_args,
    uses_params,
    _splitparams,
    ParseResult,
    _splitnetloc,
    scheme_chars,
    SplitResult,
)


# Copied from urllib.parse.urlparse() but uses fixed urlsplit() function.
def _urlparse(url, scheme="", allow_fragments=True):
    """Parse a URL into 6 components:
    <scheme>://<netloc>/<path>;<params>?<query>#<fragment>
    Return a 6-tuple: (scheme, netloc, path, params, query, fragment).
    Note that we don't break the components up in smaller bits
    (e.g. netloc is a single string) and we don't expand % escapes."""
    url, scheme, _coerce_result = _coerce_args(url, scheme)
    splitresult = _urlsplit(url, scheme, allow_fragments)
    scheme, netloc, url, query, fragment = splitresult
    if scheme in uses_params and ";" in url:
        url, params = _splitparams(url)
    else:
        params = ""
    result = ParseResult(scheme, netloc, url, params, query, fragment)
    return _coerce_result(result)


# Backport of urllib.parse.urlsplit() from Python 3.9.
def _urlsplit(url, scheme="", allow_fragments=True):
    """Parse a URL into 5 components:
    <scheme>://<netloc>/<path>?<query>#<fragment>
    Return a 5-tuple: (scheme, netloc, path, query, fragment).
    Note that we don't break the components up in smaller bits
    (e.g. netloc is a single string) and we don't expand % escapes."""
    url, scheme, _coerce_result = _coerce_args(url, scheme)
    url = _remove_unsafe_bytes_from_url(url)
    scheme = _remove_unsafe_bytes_from_url(scheme)

    netloc = query = fragment = ""
    i = url.find(":")
    if i > 0:
        for c in url[:i]:
            if c not in scheme_chars:
                break
        else:
            scheme, url = url[:i].lower(), url[i + 1 :]

    if url[:2] == "//":
        netloc, url = _splitnetloc(url, 2)
        if ("[" in netloc and "]" not in netloc) or (
            "]" in netloc and "[" not in netloc
        ):
            raise ValueError("Invalid IPv6 URL")
    if allow_fragments and "#" in url:
        url, fragment = url.split("#", 1)
    if "?" in url:
        url, query = url.split("?", 1)
    v = SplitResult(scheme, netloc, url, query, fragment)
    return _coerce_result(v)


_UNSAFE_URL_BYTES_TO_REMOVE = ["\t", "\r", "\n"]


def _remove_unsafe_bytes_from_url(url):
    for b in _UNSAFE_URL_BYTES_TO_REMOVE:
        url = url.replace(b, "")
    return url
