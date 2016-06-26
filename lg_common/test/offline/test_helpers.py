"""
Test module for all helper functions from the helpers.py module

"""


import os

import pytest
import rospy
import rospkg
import rostopic

from interactivespaces_msgs.msg import GenericMessage
from lg_common.helpers import extract_first_asset_from_director_message
from lg_common.helpers import load_director_message


DIRECTOR_MESSAGE_ACTIVITY_CONFIG_NOT_PRESENT = """
    {
            "description": "bogus",
            "duration": 0,
            "name": "test whatever",
            "resource_uri": "bogus",
            "slug": "test message",
            "windows": [
            {
                "activity": "video",
                "assets": [
                    "whatever"
                ],
                "height": 1080,
                "presentation_viewport": "center",
                "width": 1920,
                "x_coord": 0,
                "y_coord": 0
            }
            ]
    }"""

DIRECTOR_MESSAGE_ACTIVITY_CONFIG_EMPTY = """
    {
            "description": "bogus",
            "duration": 0,
            "name": "test whatever",
            "resource_uri": "bogus",
            "slug": "test message",
            "windows": [
            {
                "activity": "video",
                "assets": [
                    "whatever"
                ],
                "height": 1080,
                "presentation_viewport": "center",
                "width": 1920,
                "x_coord": 0,
                "y_coord": 0,
                "activity_config": {}
            }
            ]
    }"""

DIRECTOR_MESSAGE_ACTIVITY_CONFIG_LOOP = """
    {
            "description": "bogus",
            "duration": 0,
            "name": "test whatever",
            "resource_uri": "bogus",
            "slug": "test message",
            "windows": [
            {
                "activity": "video",
                "assets": [
                    "whatever"
                ],
                "height": 1080,
                "presentation_viewport": "center",
                "width": 1920,
                "x_coord": 0,
                "y_coord": 0,
                "activity_config": {
                    "onFinish": "loop"
                }
            }
            ]
    }"""

DIRECTOR_MESSAGE_ACTIVITY_CONFIG_CLOSE = """
    {
            "description": "bogus",
            "duration": 0,
            "name": "test whatever",
            "resource_uri": "bogus",
            "slug": "test message",
            "windows": [
            {
                "activity": "video",
                "assets": [
                    "whatever"
                ],
                "height": 1080,
                "presentation_viewport": "center",
                "width": 1920,
                "x_coord": 0,
                "y_coord": 0,
                "activity_config": {
                    "onFinish": "close"
                }
            }
            ]
    }"""

DIRECTOR_MESSAGE_ACTIVITY_CONFIG_NOTHING = """
    {
            "description": "bogus",
            "duration": 0,
            "name": "test whatever",
            "resource_uri": "bogus",
            "slug": "test message",
            "windows": [
            {
                "activity": "video",
                "assets": [
                    "whatever"
                ],
                "height": 1080,
                "presentation_viewport": "center",
                "width": 1920,
                "x_coord": 0,
                "y_coord": 0,
                "activity_config": {
                    "onFinish": "nothing"
                }
            }
            ]
    }"""


class TestHelpers(object):

    @classmethod
    def setup_class(cls):
        pass

    @classmethod
    def teardown_class(cls):
        pass

    def setup_method(self, method):
        self.msg = GenericMessage()
        self.msg.type = "json"

    def teardown_method(self, _):
        pass

    def test_load_director_message_wrong_json(self):
        self.msg.message = "wrong json"
        pytest.raises(ValueError, load_director_message, self.msg)

    def test_load_director(self):
        self.msg.message = DIRECTOR_MESSAGE_ACTIVITY_CONFIG_NOTHING
        d = load_director_message(self.msg)
        assert isinstance(d, dict)
        assert d["windows"][0]["activity_config"]["onFinish"] == "nothing"

    def test_extract_first_asset_from_director_message_return_empty_list(self):
        self.msg.message = DIRECTOR_MESSAGE_ACTIVITY_CONFIG_NOTHING
        r = extract_first_asset_from_director_message(self.msg, "something", "center")
        # get empty list since activity type does not match
        assert r == []
        r = extract_first_asset_from_director_message(self.msg, "video", "somewhereelse")
        # get empty list since viewport does not match
        assert r == []
        r = extract_first_asset_from_director_message(self.msg, "something", "somewhereelse")
        assert r == []

    def test_extract_first_asset_from_director_message_general(self):
        self.msg.message = DIRECTOR_MESSAGE_ACTIVITY_CONFIG_NOTHING
        #extract_first_asset_from_director_message(message, activity_type, viewport)
        r = extract_first_asset_from_director_message(self.msg, "video", "center")
        assert r[0]["x_coord"] == 0
        assert r[0]["y_coord"] == 0
        assert r[0]["height"] == 1080
        assert r[0]["width"] == 1920

    def test_extract_first_asset_from_director_message_activity_config_options(self):
        # no activity_config attribute present
        self.msg.message = DIRECTOR_MESSAGE_ACTIVITY_CONFIG_NOT_PRESENT
        r = extract_first_asset_from_director_message(self.msg, "video", "center")
        assert not hasattr(r[0], "on_finish")
        # activity_config present but empty
        self.msg.message = DIRECTOR_MESSAGE_ACTIVITY_CONFIG_EMPTY
        r = extract_first_asset_from_director_message(self.msg, "video", "center")
        assert not hasattr(r[0], "on_finish")
        # activity_config present, onFinish close, loop, nothing
        for m, on_finish in ((DIRECTOR_MESSAGE_ACTIVITY_CONFIG_LOOP, "loop"),
                             (DIRECTOR_MESSAGE_ACTIVITY_CONFIG_CLOSE, "close"),
                             (DIRECTOR_MESSAGE_ACTIVITY_CONFIG_NOTHING, "nothing")):
            self.msg.message = m
            r = extract_first_asset_from_director_message(self.msg, "video", "center")
            assert r[0]["on_finish"] == on_finish

if __name__ == "__main__":
    test_pkg = "lg_common"
    test_name = "test_helpers"
    test_dir = os.path.join(rospkg.get_test_results_dir(env=None), test_pkg)
    pytest_result_path = os.path.join(test_dir, "rosunit-%s.xml" % test_name)
    # run only itself
    test_path = os.path.abspath(os.path.abspath(__file__))
    # output is unfortunately handled / controlled by above layer of rostest (-s has no effect)
    pytest.main("%s -s -v --junit-xml=%s" % (test_path, pytest_result_path))