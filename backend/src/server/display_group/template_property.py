class TemplateProperty:
    def __init__(self, variable_name, pretty_name, property_type, default=None):
        self.variable_name = variable_name
        self.pretty_name = pretty_name
        self.type = property_type
        self.default = default
