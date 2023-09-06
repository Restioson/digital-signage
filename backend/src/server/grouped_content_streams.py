from server.free_form_content.content_stream import ContentStream


class GroupedContentStreams:
    """A grouping of content streams into three main buckets:
    - Public streams
    - Streams by their department
    - Streams by their display group

    Each stream is in one and only one bucket.
    """

    def __init__(self, streams: list[ContentStream]):
        self.public = []
        self.by_display_group = dict()
        self.by_department = dict()

        for stream in streams:
            if stream.department:
                self.by_department.setdefault(stream.department, []).append(stream)
            elif stream.display_group:
                self.by_display_group.setdefault(stream.display_group, []).append(
                    stream
                )
            else:
                self.public.append(stream)
