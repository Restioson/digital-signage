from datetime import datetime
from abc import abstractmethod, ABC
from typing import Optional

from server.util import combine


class FreeFormContent(ABC):
    """A piece of 'free-form' content posted to a sign. In this case,
    'free-form' means that the user directly submitted the data for
    this post to the sign, as opposed to referring to it via an external source,
    such as through a calendar widget.
    """

    def __init__(
        self, stream: int, content_id: Optional[int], posted: Optional[datetime]
    ):
        self.stream = stream
        self.id = content_id
        self.posted = posted

    @abstractmethod
    def to_db_json(self) -> dict:
        """Convert this content to JSON in order to be serialized to the database"""
        raise NotImplementedError

    @abstractmethod
    def type(self) -> str:
        """The type of this content. One of 'link', 'text', 'local_image',
        or 'remote_image'
        """
        raise NotImplementedError

    def to_http_json(self) -> dict:
        """Convert this content to JSON in order to be sent over HTTP"""

        assert self.id is not None, "ID must be present when serializing to HTTP json"
        assert (
            self.posted is not None
        ), "Post timestamp must be present when serializing to HTTP json"

        return combine(
            self.to_db_json(),
            {
                "type": self.type(),
                "id": self.id,
                "posted": int(self.posted.timestamp()),
            },
        )
