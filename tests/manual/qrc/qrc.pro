TEMPLATE = app
TARGET = tst_qrc
CONFIG += qt warn_on

!package: CONFIG += qt3dquick

SOURCES += main.cpp

include(../../../qt3dquick_pkg_dep.pri)
include(../../../qml_pkg.pri)

OTHER_FILES += \
    qml/tst_model3ds.qml

RESOURCES += \
    qrc.qrc
