from server.free_form_content.content_stream import ContentStream


class GroupedContentStreams:
    """A grouping of content streams into two buckets:
    - Public streams
    - Streams by their department

    Each stream is in one and only one bucket.
    """

    def __init__(self, streams: list[ContentStream]):
        self.public = []
        self.by_department = dict()

        for stream in streams:
            if stream.department:
                self.by_department.setdefault(stream.department, []).append(stream)
            else:
                self.public.append(stream)

    def filter_to_department(self, dept_id: int):
        """Filter this collection to only the content streams accessible by a new
        display group in the given department. This modifies this object."""

        for_dept = self.by_department.get(dept_id)
        self.by_department = {dept_id: for_dept} if for_dept else dict()
        return self
