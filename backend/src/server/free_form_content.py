from abc import abstractmethod, ABC
from typing import Optional


class FreeFormContent(ABC):
    def __init__(self, content_id: Optional[int]):
        self.id = content_id

    @abstractmethod
    def to_json(self) -> dict:
        pass


def from_form(form: dict) -> FreeFormContent:
    """Parse the given Flask form data and return the appropriate content type.
    Throws UnknownContentError if the content type is not 'text'"""
    if form["type"] == "text":
        return Text(None, form["title"], form["body"])
    else:
        raise UnknownContentError("Unknown content type", form["type"])


class UnknownContentError(Exception):
    """The type of content passed to `from_form` was unknown"""

    def __init__(self, message, unk_type):
        super().__init__(message)
        self.unk_type = unk_type


class Text(FreeFormContent):
    def to_json(self) -> dict:
        return self.__dict__

    def __init__(self, content_id: Optional[int], title: str, body: str):
        super().__init__(content_id)
        self.title = title
        self.body = body
