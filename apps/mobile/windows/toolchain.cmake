# CMake toolchain for VS2022
set(CMAKE_C_COMPILER "C:/Program Files/Microsoft Visual Studio/2022/Community/VC/Tools/MSVC/14.44.35207/bin/Hostx64/x64/cl.exe")
set(CMAKE_CXX_COMPILER "C:/Program Files/Microsoft Visual Studio/2022/Community/VC/Tools/MSVC/14.44.35207/bin/Hostx64/x64/cl.exe")
set(CMAKE_LINKER "C:/Program Files/Microsoft Visual Studio/2022/Community/VC/Tools/MSVC/14.44.35207/bin/Hostx64/x64/link.exe")
set(CMAKE_RC_COMPILER "C:/Program Files/Microsoft Visual Studio/2022/Community/VC/Tools/MSVC/14.44.35207/bin/Hostx64/x64/rc.exe")

# Windows SDK
set(CMAKE_SYSTEM_VERSION 10.0.26100.0)

# VS paths
set(CMAKE_USE_WIN32_THREADS ON)
set(CMAKE_FIND_WIN32_WINRT OFF)