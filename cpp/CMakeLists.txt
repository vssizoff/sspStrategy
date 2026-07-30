cmake_minimum_required(VERSION 3.16)
project(strategyGamePlayer LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_executable(strategyGamePlayer
    main.cpp
    lib/strategy.cpp
    lib/easywsclient.cpp
)

target_include_directories(strategyGamePlayer PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/lib
)
