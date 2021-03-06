/****************************************************************************
**
** Copyright (C) 2011 Nokia Corporation and/or its subsidiary(-ies).
** All rights reserved.
** Contact: Nokia Corporation (qt-info@nokia.com)
**
** This file is part of the Qt3D module of the Qt Toolkit.
**
** $QT_BEGIN_LICENSE:LGPL$
** GNU Lesser General Public License Usage
** This file may be used under the terms of the GNU Lesser General Public
** License version 2.1 as published by the Free Software Foundation and
** appearing in the file LICENSE.LGPL included in the packaging of this
** file. Please review the following information to ensure the GNU Lesser
** General Public License version 2.1 requirements will be met:
** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
**
** In addition, as a special exception, Nokia gives you certain additional
** rights. These rights are described in the Nokia Qt LGPL Exception
** version 1.1, included in the file LGPL_EXCEPTION.txt in this package.
**
** GNU General Public License Usage
** Alternatively, this file may be used under the terms of the GNU General
** Public License version 3.0 as published by the Free Software Foundation
** and appearing in the file LICENSE.GPL included in the packaging of this
** file. Please review the following information to ensure the GNU General
** Public License version 3.0 requirements will be met:
** http://www.gnu.org/copyleft/gpl.html.
**
** Other Usage
** Alternatively, this file may be used in accordance with the terms and
** conditions contained in a signed written agreement between you and Nokia.
**
**
**
**
**
** $QT_END_LICENSE$
**
****************************************************************************/

.pragma library

// We need a global place to store the results that can be
// shared between multiple TestCase instances.  Because QML
// creates a separate scope for every inclusion of this file,
// we hijack the global "Qt" object to store our data.
function log_init_results()
{
    if (!Qt.testResults) {
        Qt.testResults = {
            suiteName: "",
            reportedStart: false,
            numPassed: 0,
            numFailed: 0,
            numSkipped: 0,
            nextId: 0,
            testCases: [],
            reporter: null
        }
    }
}

function log_fail(testcase, msg)
{
    if (!msg)
        msg = ""
    Qt.testResults.reporter.log_fail(testcase, msg);
    ++Qt.testResults.numFailed
}

function log_expect_fail(testcase, expectmsg, msg)
{
    if (!msg)
        msg = ""
    if (expectmsg)
        Qt.testResults.reporter.log_expect_fail(testcase, expectmsg + " " + msg);
    else
        Qt.testResults.reporter.log_expect_fail(testcase, msg);
    ++Qt.testResults.numPassed
}

function log_expect_fail_pass(testcase)
{
    Qt.testResults.reporter.log_expect_fail_pass(testcase);
    ++Qt.testResults.numFailed
}

function log_skip(testcase, msg)
{
    if (!msg)
        msg = ""
    Qt.testResults.reporter.log_skip(testcase, msg);
    ++Qt.testResults.numSkipped
}

function log_pass(testcase)
{
    Qt.testResults.reporter.log_pass(testcase);
    ++Qt.testResults.numPassed
}

function log_message(msg)
{
    Qt.testResults.reporter.log_message(msg);
}

function log_register_test(name)
{
    log_init_results()
    if (name && !Qt.testResults.suiteName)
        Qt.testResults.suiteName = name
    var testId = Qt.testResults.nextId++
    Qt.testResults.testCases.push(testId)
    return testId
}

function log_optional_test(testId)
{
    log_init_results()
    var index = Qt.testResults.testCases.indexOf(testId)
    if (index >= 0)
        Qt.testResults.testCases.splice(index, 1)
}

function log_mandatory_test(testId)
{
    log_init_results()
    var index = Qt.testResults.testCases.indexOf(testId)
    if (index == -1)
        Qt.testResults.testCases.push(testId)
}

function log_start_test(reporter)
{
    log_init_results()
    Qt.testResults.reporter = reporter
    if (Qt.testResults.reportedStart)
        return
    Qt.testResults.reportedStart = true
}

function log_complete_test(testId, reporter)
{
    var index = Qt.testResults.testCases.indexOf(testId)
    if (index >= 0)
        Qt.testResults.testCases.splice(index, 1)
    if (!Qt.testResults.testCases.length) {
        reporter.report(Qt.testResults.numPassed,
                        Qt.testResults.numFailed,
                        Qt.testResults.numSkipped)
        Qt.quit()
    }
}

function log_prefixed_name(name, funcname)
{
    if (!name)
        name = Qt.testResults.suiteName
    if (name)
        return name + "::" + funcname + "()"
    else
        return funcname + "()"
}
