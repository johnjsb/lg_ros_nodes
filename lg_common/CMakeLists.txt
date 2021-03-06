cmake_minimum_required(VERSION 2.8.3)
project(lg_common)

find_package(catkin REQUIRED COMPONENTS
  rospy
  message_generation
)

catkin_python_setup()

add_service_files(
  FILES
  NodeReady.srv
  BrowserPool.srv
  USCSMessage.srv
  InitialUSCS.srv
)

add_message_files(
  FILES
  ApplicationState.msg
  WindowGeometry.msg
  AdhocBrowser.msg
  AdhocBrowsers.msg
  BrowserExtension.msg
  BrowserCmdArg.msg
  StringArray.msg
  Ready.msg
  BrowserURL.msg
)
generate_messages()

catkin_package(
  CATKIN_DEPENDS message_runtime
)

catkin_install_python(PROGRAMS
  scripts/dev_webserver.py
  scripts/static_browser.py
  scripts/adhoc_browser.py
  scripts/state_setter.py
  scripts/touchscreen.py
  scripts/uscs_service.py
  scripts/dev_webserver
  scripts/static_browser
  scripts/adhoc_browser
  scripts/state_setter
  scripts/touchscreen
  scripts/command_handler_node.py
  scripts/command_handler_node
  scripts/readiness.py
  scripts/readiness
  scripts/uscs_service
  DESTINATION ${CATKIN_PACKAGE_BIN_DESTINATION}
)

install(
  DIRECTORY webapps/
  DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}/webapps
)

install(
  DIRECTORY launch/
  DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}/launch
)

if (CATKIN_ENABLE_TESTING)
  find_package(rostest REQUIRED)
  catkin_add_nosetests(test/offline/test_helpers.py)
  catkin_add_nosetests(test/offline/test_managed_adhoc_browser.py)
  catkin_add_nosetests(test/offline/test_managed_application.py)
  catkin_add_nosetests(test/offline/test_tcp_relay.py)
  catkin_add_nosetests(test/offline/test_uscs_service.py)
  add_rostest(test/online/test_managed_adhoc_browser_director_bridge.test)
  add_rostest(test/online/test_managed_adhoc_browser.test)
  add_rostest(test/online/required_param.test)
  add_rostest(test/online/state_changer.test)
  add_rostest(test/online/uscs_service.test)
  add_rostest(test/online/uscs_initial_state_adhoc_browser.test)
  #add_rostest(test/online/test_adhoc_browser_pool_rosbridge_params.test)
  add_rostest(test/online/test_adhoc_browser_url_monitor.test)
endif()
