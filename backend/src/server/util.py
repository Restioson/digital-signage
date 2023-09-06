def combine(obj1: dict, obj2: dict) -> dict:
    """Combine two disjoint dictionaries and return it.
    This is a simple helper method for a common pattern
    """

    assert obj1.keys().isdisjoint(obj2), "dicts passed to combine() must be disjoint"
    combined = obj1.copy()
    combined.update(obj2)
    return combined
