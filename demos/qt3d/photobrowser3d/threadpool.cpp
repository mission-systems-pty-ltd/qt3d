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

#include "threadpool.h"
#include "imageloader.h"
#include "imagemanager.h"

#include <QSemaphore>

ThreadPool::ThreadPool()
{
    m_threadPoolSize = QThread::idealThreadCount();
    if (m_threadPoolSize < 2)
        m_threadPoolSize = 2;
    m_stop = 0;
}

ThreadPool::~ThreadPool()
{
    Q_ASSERT(m_allWorkers.size() == 0);
}

void ThreadPool::deployLoader(const ThumbnailableImage &image)
{
    // INVARIANT: this critical section is only ever executed from its
    // own thread via queued signals - thus access to it is serialized
    Q_ASSERT(QThread::currentThread() == thread());

    if (m_stop)
        return;

    ImageManager *manager = qobject_cast<ImageManager*>(sender());
    Q_ASSERT(manager);

    ImageLoader *loader = 0;
    if (m_freeWorkers.size() > 0)
        loader = m_freeWorkers.takeFirst();

    if (loader)
    {
        loader->setImage(image);
    }
    else
    {
        if (m_allWorkers.size() < m_threadPoolSize)
        {
            loader = new ImageLoader;
            m_allWorkers.append(loader);
            loader->setImage(image);
            connect(loader, SIGNAL(imageLoaded(ThumbnailableImage)), manager,
                    SIGNAL(imageReady(ThumbnailableImage)));
            connect(loader, SIGNAL(imageLoaded(ThumbnailableImage)), this,
                    SLOT(retrieveLoader()));
            connect(loader, SIGNAL(finished()), this, SLOT(closeLoader()));
            connect(this, SIGNAL(stopAll()), loader, SLOT(stop()));
            loader->start();
        }
        else
        {
            m_workList.append(image);
        }
    }
}

void ThreadPool::retrieveLoader()
{
    ImageLoader *loader = qobject_cast<ImageLoader*>(sender());
    Q_ASSERT(loader);
    if (!m_stop)
    {
        if (!m_workList.isEmpty())
            loader->setImage(m_workList.takeFirst());
        else
            m_freeWorkers.append(loader);
    }
}

void ThreadPool::stop()
{
    m_stop.ref();
    if (m_allWorkers.isEmpty())
        emit stopped();
    else
        emit stopAll();
}

void ThreadPool::closeLoader()
{
    ImageLoader *loader = qobject_cast<ImageLoader*>(sender());
    Q_ASSERT(loader);
    m_allWorkers.removeOne(loader);
    loader->deleteLater();
    if (m_allWorkers.isEmpty() && m_stop)
    {
        emit stopped();
    }
}
