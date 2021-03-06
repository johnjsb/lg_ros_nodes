#!/usr/bin/env python

from functools import partial
import rospy
import sys

from lg_mirror.touch_router import TouchRouter
from lg_common.helpers import on_new_scene, load_director_message
from lg_common.msg import StringArray
from lg_common.helpers import handle_initial_state
from lg_mirror.touch_router import SubscribeListener
from lg_mirror.srv import TouchRoutes
from lg_common.helpers import run_with_influx_exception_handler


NODE_NAME = 'lg_mirror_router'


def main():
    rospy.init_node(NODE_NAME)

    default_viewport = rospy.get_param('~default_viewport', None)
    device_id = rospy.get_param('~device_id', 'default')
    router = TouchRouter(default_viewport)
    route_topic = '/lg_mirror/{}/active_routes'.format(device_id)

    def publish_active_routes(routes):
        routes_pub.publish(StringArray(routes))

    new_listener_cb = partial(router.handle_new_listener, publish_active_routes)

    routes_pub = rospy.Publisher(
        route_topic,
        StringArray,
        queue_size=10,
        subscriber_listener=SubscribeListener(new_listener_cb)
    )

    # Hacky callback to parse the initial scene.
    def handle_initial_scene_msg(msg):
        d = load_director_message(msg)
        router.handle_scene(publish_active_routes, d)

    handle_initial_state(handle_initial_scene_msg)

    rospy.Service(route_topic, TouchRoutes, router.handle_service_request)

    scene_cb = partial(router.handle_scene, publish_active_routes)

    on_new_scene(scene_cb)

    rospy.spin()


if __name__ == '__main__':
    run_with_influx_exception_handler(main, NODE_NAME)
