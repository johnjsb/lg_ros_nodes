#! /usr/bin/env python

import json
import rospy

from sensor_msgs.msg import Joy
from geometry_msgs.msg import Twist
import SpacenavRemote

NODE_NAME = 'spacenav_remote'

def main():
    rospy.init_node(NODE_NAME)
    topic = rospy.get_param('~topic', '/spacenav')
    port = rospy.get_param('~listen_port', 6564)

    joy_pub = rospy.Publisher(topic + '/joy', Joy, queue_size=10)
    twist_pub = rospy.Publisher(topic + '/twist', Twist, queue_size=10)

    def handler(data):
        recived = json.load(data)
        # Send joystic data
        joy = Joy()
        joy.axes = recived.trans
        joy_pub.publish(joy)
        # Send twists data
        twist = Twist()
        twist.angular = recived.rot
        twist.linear = recived.trans
        twist_pub.publish(twist)

    server = SpacenavRemote(handler=handler, port=port)

    rospy.spin()

if __name__ == "__main__":
    main()