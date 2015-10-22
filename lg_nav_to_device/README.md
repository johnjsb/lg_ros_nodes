# lg_nav_to_device

Ros node that will replay space navigator input events to a
`/dev/input/v_spacenav` device

## Software requirements

* spacenav node ROS node running somewhere in the network with
  spacenavigator attached to the machine it's running on

## Hardware requirements

* space navigator

## scripts

### device_writer.py

#### parameters

* `~scale` [int] - space navigator scale

#### published topics

None

#### subscribed topics

* `/spacenav/twist` - this script needs to subscribe to space navigator
  data flowing on this topic