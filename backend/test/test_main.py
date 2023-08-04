import unittest
from server.main import say_hello


class TestMain(unittest.TestCase):
    def test_upper(self):
        self.assertEqual(say_hello(), "Hello, world!")


if __name__ == "__main__":
    unittest.main()
